/**
 * Exam Service - API calls for Smart Examination Platform
 * Uses Supabase as the backend
 */

import { supabase } from '../lib/supabase';
import {
  Exam,
  Question,
  QuestionOption,
  ExamClass,
  ClassMember,
  ClassExamAssignment,
  ExamAttempt,
  StudentAnswer,
  AntiCheatViolation,
  ExamResult,
  ClassStatistics,
  CreateExamRequest,
  CreateQuestionRequest,
  CreateClassRequest,
  AddStudentRequest,
  SubmitAnswerRequest,
  ReportViolationRequest,
  QuestionType,
} from '../types/exam';

class ExamService {
  // ==================== EXAM MANAGEMENT ====================

  /**
   * Get all exams for the current instructor
   */
  async getMyExams(): Promise<Exam[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        questions:exam_questions(
          *,
          options:question_options(*)
        )
      `)
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(exam => ({
      ...exam,
      questions: exam.questions || [],
      question_count: exam.questions?.length || 0,
    }));
  }

  /**
   * Get exam by ID
   */
  async getExamById(examId: string): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .select(`
        *,
        questions:exam_questions(
          *,
          options:question_options(*)
        )
      `)
      .eq('id', examId)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      questions: (data.questions || []).sort((a: Question, b: Question) => a.position - b.position),
      question_count: data.questions?.length || 0,
    };
  }

  /**
   * Create a new exam
   */
  async createExam(examData: CreateExamRequest): Promise<Exam> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('exams')
      .insert({
        title: examData.title,
        description: examData.description,
        instructor_id: user.id,
        duration_minutes: examData.duration_minutes,
        total_points: 0,
        passing_score: examData.passing_score || 50,
        shuffle_questions: examData.shuffle_questions || false,
        shuffle_answers: examData.shuffle_answers || false,
        show_results: examData.show_results ?? true,
        allow_review: examData.allow_review ?? true,
        max_attempts: examData.max_attempts || 1,
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;
    
    return { ...data, questions: [], question_count: 0 };
  }

  /**
   * Update an exam
   */
  async updateExam(examId: string, examData: Partial<CreateExamRequest>): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .update({
        ...examData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', examId)
      .select()
      .single();

    if (error) throw error;
    return this.getExamById(examId);
  }

  /**
   * Delete an exam
   */
  async deleteExam(examId: string): Promise<void> {
    // Delete questions first (cascading delete should handle options)
    await supabase.from('exam_questions').delete().eq('exam_id', examId);
    
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) throw error;
  }

  /**
   * Publish/Unpublish an exam
   */
  async setExamStatus(examId: string, status: 'draft' | 'published' | 'archived'): Promise<void> {
    const { error } = await supabase
      .from('exams')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', examId);

    if (error) throw error;
  }

  // ==================== QUESTION MANAGEMENT ====================

  /**
   * Add a question to an exam
   */
  async addQuestion(questionData: CreateQuestionRequest): Promise<Question> {
    // Get current max position
    const { data: existingQuestions } = await supabase
      .from('exam_questions')
      .select('position')
      .eq('exam_id', questionData.exam_id)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existingQuestions && existingQuestions.length > 0 
      ? existingQuestions[0].position + 1 
      : 1;

    // Insert question
    const { data: question, error: questionError } = await supabase
      .from('exam_questions')
      .insert({
        exam_id: questionData.exam_id,
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        correct_answer: questionData.correct_answer,
        points: questionData.points,
        explanation: questionData.explanation,
        position: nextPosition,
      })
      .select()
      .single();

    if (questionError) throw questionError;

    // Insert options if provided (for multiple choice)
    let options: QuestionOption[] = [];
    if (questionData.options && questionData.options.length > 0) {
      const optionsToInsert = questionData.options.map((opt, index) => ({
        question_id: question.id,
        text: opt.text,
        is_correct: opt.isCorrect,
        position: index + 1,
      }));

      const { data: insertedOptions, error: optionsError } = await supabase
        .from('question_options')
        .insert(optionsToInsert)
        .select();

      if (optionsError) throw optionsError;
      options = insertedOptions || [];
    }

    // Update exam total points
    await this.recalculateExamPoints(questionData.exam_id);

    return { ...question, options };
  }

  /**
   * Update a question
   */
  async updateQuestion(questionId: string, questionData: Partial<CreateQuestionRequest>): Promise<Question> {
    const { data: question, error } = await supabase
      .from('exam_questions')
      .update({
        question_text: questionData.question_text,
        question_type: questionData.question_type,
        correct_answer: questionData.correct_answer,
        points: questionData.points,
        explanation: questionData.explanation,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) throw error;

    // Update options if provided
    if (questionData.options) {
      // Delete existing options
      await supabase.from('question_options').delete().eq('question_id', questionId);

      // Insert new options
      const optionsToInsert = questionData.options.map((opt, index) => ({
        question_id: questionId,
        text: opt.text,
        is_correct: opt.isCorrect,
        position: index + 1,
      }));

      await supabase.from('question_options').insert(optionsToInsert);
    }

    // Update exam total points
    if (question.exam_id) {
      await this.recalculateExamPoints(question.exam_id);
    }

    return this.getQuestionById(questionId);
  }

  /**
   * Get question by ID
   */
  async getQuestionById(questionId: string): Promise<Question> {
    const { data, error } = await supabase
      .from('exam_questions')
      .select(`
        *,
        options:question_options(*)
      `)
      .eq('id', questionId)
      .single();

    if (error) throw error;
    return {
      ...data,
      options: (data.options || []).sort((a: QuestionOption, b: QuestionOption) => a.position - b.position),
    };
  }

  /**
   * Delete a question
   */
  async deleteQuestion(questionId: string): Promise<void> {
    // Get exam_id first
    const { data: question } = await supabase
      .from('exam_questions')
      .select('exam_id')
      .eq('id', questionId)
      .single();

    // Delete options first
    await supabase.from('question_options').delete().eq('question_id', questionId);
    
    const { error } = await supabase
      .from('exam_questions')
      .delete()
      .eq('id', questionId);

    if (error) throw error;

    // Update exam total points
    if (question?.exam_id) {
      await this.recalculateExamPoints(question.exam_id);
    }
  }

  /**
   * Recalculate total points for an exam
   */
  private async recalculateExamPoints(examId: string): Promise<void> {
    const { data: questions } = await supabase
      .from('exam_questions')
      .select('points')
      .eq('exam_id', examId);

    const totalPoints = (questions || []).reduce((sum, q) => sum + (q.points || 0), 0);

    await supabase
      .from('exams')
      .update({ total_points: totalPoints })
      .eq('id', examId);
  }

  // ==================== CLASS MANAGEMENT ====================

  /**
   * Get all classes for the current user
   */
  async getMyClasses(): Promise<ExamClass[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('exam_classes')
      .select('*')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get class by ID with members
   */
  async getClassById(classId: string): Promise<ExamClass & { members: ClassMember[] }> {
    const { data: classData, error: classError } = await supabase
      .from('exam_classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError) throw classError;

    const { data: members, error: membersError } = await supabase
      .from('class_members')
      .select('*')
      .eq('class_id', classId)
      .order('joined_at', { ascending: false });

    if (membersError) throw membersError;

    return {
      ...classData,
      members: members || [],
      student_count: (members || []).filter(m => m.role === 'student').length,
    };
  }

  /**
   * Create a new class
   */
  async createClass(classData: CreateClassRequest): Promise<ExamClass> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    // Generate invite code
    const inviteCode = this.generateInviteCode();

    const { data, error } = await supabase
      .from('exam_classes')
      .insert({
        name: classData.name,
        code: classData.code,
        description: classData.description,
        instructor_id: user.id,
        invite_code: inviteCode,
        student_count: 0,
        exam_count: 0,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update a class
   */
  async updateClass(classId: string, classData: Partial<CreateClassRequest>): Promise<ExamClass> {
    const { data, error } = await supabase
      .from('exam_classes')
      .update({
        ...classData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', classId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete a class
   */
  async deleteClass(classId: string): Promise<void> {
    // Remove all members first
    await supabase.from('class_members').delete().eq('class_id', classId);
    
    const { error } = await supabase
      .from('exam_classes')
      .delete()
      .eq('id', classId);

    if (error) throw error;
  }

  /**
   * Generate a new invite code
   */
  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // ==================== STUDENT MANAGEMENT ====================

  /**
   * Add student to class by email
   */
  async addStudentToClass(classId: string, email: string): Promise<ClassMember> {
    // First, find user by email from auth
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, username, name, email, avatar')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (userError) throw userError;
    
    if (!users || users.length === 0) {
      throw new Error('STUDENT_NOT_FOUND');
    }

    const user = users[0];

    // Check if already in class
    const { data: existingMember } = await supabase
      .from('class_members')
      .select('id')
      .eq('class_id', classId)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      throw new Error('STUDENT_ALREADY_IN_CLASS');
    }

    // Add student to class
    const { data: member, error: memberError } = await supabase
      .from('class_members')
      .insert({
        class_id: classId,
        user_id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: 'student',
      })
      .select()
      .single();

    if (memberError) throw memberError;

    // Update student count
    await this.updateClassStudentCount(classId);

    return member;
  }

  /**
   * Remove student from class
   */
  async removeStudentFromClass(classId: string, memberId: string): Promise<void> {
    const { error } = await supabase
      .from('class_members')
      .delete()
      .eq('id', memberId)
      .eq('class_id', classId);

    if (error) throw error;

    // Update student count
    await this.updateClassStudentCount(classId);
  }

  /**
   * Get students in a class
   */
  async getClassStudents(classId: string): Promise<ClassMember[]> {
    const { data, error } = await supabase
      .from('class_members')
      .select('*')
      .eq('class_id', classId)
      .eq('role', 'student')
      .order('joined_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Update class student count
   */
  private async updateClassStudentCount(classId: string): Promise<void> {
    const { data: members } = await supabase
      .from('class_members')
      .select('id')
      .eq('class_id', classId)
      .eq('role', 'student');

    const count = members?.length || 0;

    await supabase
      .from('exam_classes')
      .update({ student_count: count })
      .eq('id', classId);
  }

  // ==================== EXAM TAKING ====================

  /**
   * Start an exam attempt
   */
  async startExamAttempt(examId: string, classId?: string): Promise<ExamAttempt> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        exam_id: examId,
        student_id: user.id,
        class_id: classId,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return { ...data, answers: [], violations: [] };
  }

  /**
   * Submit an answer
   */
  async submitAnswer(answerData: SubmitAnswerRequest): Promise<StudentAnswer> {
    const { data, error } = await supabase
      .from('student_answers')
      .upsert({
        attempt_id: answerData.attempt_id,
        question_id: answerData.question_id,
        selected_option_id: answerData.selected_option_id,
        answer_text: answerData.answer_text,
        answered_at: new Date().toISOString(),
      }, {
        onConflict: 'attempt_id,question_id',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Submit exam and calculate score
   */
  async submitExam(attemptId: string): Promise<ExamResult> {
    // Get attempt with answers and exam questions
    const { data: attempt, error: attemptError } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        exam:exams(*, questions:exam_questions(*, options:question_options(*))),
        answers:student_answers(*)
      `)
      .eq('id', attemptId)
      .single();

    if (attemptError) throw attemptError;

    // Calculate score
    const questions = attempt.exam.questions || [];
    const answers = attempt.answers || [];
    let correctCount = 0;
    let totalScore = 0;

    for (const question of questions) {
      const answer = answers.find((a: StudentAnswer) => a.question_id === question.id);
      if (!answer) continue;

      let isCorrect = false;

      if (question.question_type === 'multiple_choice') {
        const correctOption = question.options?.find((o: QuestionOption) => o.isCorrect);
        isCorrect = answer.selected_option_id === correctOption?.id;
      } else if (question.question_type === 'true_false') {
        isCorrect = answer.answer_text?.toLowerCase() === question.correct_answer?.toLowerCase();
      }
      // Short answer and essay need manual grading

      if (isCorrect) {
        correctCount++;
        totalScore += question.points;
      }

      // Update answer with correctness
      await supabase
        .from('student_answers')
        .update({
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : 0,
        })
        .eq('id', answer.id);
    }

    const submittedAt = new Date().toISOString();
    const timeSpent = Math.floor((new Date(submittedAt).getTime() - new Date(attempt.started_at).getTime()) / 1000);
    const percentage = attempt.exam.total_points > 0 ? (totalScore / attempt.exam.total_points) * 100 : 0;
    const isPassed = percentage >= (attempt.exam.passing_score || 50);

    // Update attempt
    const { data: updatedAttempt, error: updateError } = await supabase
      .from('exam_attempts')
      .update({
        status: 'submitted',
        submitted_at: submittedAt,
        time_spent_seconds: timeSpent,
        total_score: totalScore,
        percentage: percentage,
        correct_count: correctCount,
        incorrect_count: questions.length - correctCount - (questions.length - answers.length),
        unanswered_count: questions.length - answers.length,
        is_passed: isPassed,
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (updateError) throw updateError;

    // Get violation count
    const { data: violations } = await supabase
      .from('anticheat_violations')
      .select('id')
      .eq('attempt_id', attemptId);

    return {
      attempt_id: attemptId,
      exam_id: attempt.exam_id,
      exam_title: attempt.exam.title,
      student_id: attempt.student_id,
      total_score: totalScore,
      max_score: attempt.exam.total_points,
      percentage: percentage,
      is_passed: isPassed,
      time_spent_seconds: timeSpent,
      submitted_at: submittedAt,
      correct_count: correctCount,
      incorrect_count: questions.length - correctCount - (questions.length - answers.length),
      unanswered_count: questions.length - answers.length,
      violation_count: violations?.length || 0,
    };
  }

  // ==================== ANTI-CHEAT ====================

  /**
   * Report a violation
   */
  async reportViolation(violationData: ReportViolationRequest): Promise<AntiCheatViolation> {
    const { data, error } = await supabase
      .from('anticheat_violations')
      .insert({
        attempt_id: violationData.attempt_id,
        violation_type: violationData.violation_type,
        description: violationData.description,
        occurred_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Check warning count and auto-terminate if needed
    const { data: violations } = await supabase
      .from('anticheat_violations')
      .select('id')
      .eq('attempt_id', violationData.attempt_id);

    const warningCount = violations?.length || 0;
    
    // Get exam settings (default max warnings = 3)
    if (warningCount >= 3) {
      await this.terminateExam(violationData.attempt_id, 'Max warnings exceeded');
    }

    return data;
  }

  /**
   * Terminate an exam due to violations
   */
  async terminateExam(attemptId: string, reason: string): Promise<void> {
    await supabase
      .from('exam_attempts')
      .update({
        status: 'terminated',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', attemptId);
  }

  /**
   * Get warning count for an attempt
   */
  async getWarningCount(attemptId: string): Promise<number> {
    const { data, error } = await supabase
      .from('anticheat_violations')
      .select('id')
      .eq('attempt_id', attemptId);

    if (error) throw error;
    return data?.length || 0;
  }

  // ==================== RESULTS & STATISTICS ====================

  /**
   * Get exam results for a class
   */
  async getClassExamResults(classId: string, examId: string): Promise<ExamResult[]> {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        student:users(username, name, avatar)
      `)
      .eq('class_id', classId)
      .eq('exam_id', examId)
      .eq('status', 'submitted')
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(attempt => ({
      attempt_id: attempt.id,
      exam_id: attempt.exam_id,
      exam_title: '',
      student_id: attempt.student_id,
      student_name: attempt.student?.name || attempt.student?.username,
      total_score: attempt.total_score || 0,
      max_score: 0,
      percentage: attempt.percentage || 0,
      is_passed: attempt.is_passed || false,
      time_spent_seconds: attempt.time_spent_seconds || 0,
      submitted_at: attempt.submitted_at || '',
      correct_count: attempt.correct_count || 0,
      incorrect_count: attempt.incorrect_count || 0,
      unanswered_count: attempt.unanswered_count || 0,
      violation_count: 0,
    }));
  }

  /**
   * Get class statistics for an exam
   */
  async getClassStatistics(classId: string, examId: string): Promise<ClassStatistics> {
    const results = await this.getClassExamResults(classId, examId);

    if (results.length === 0) {
      return {
        class_id: classId,
        exam_id: examId,
        total_students: 0,
        submitted_count: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        pass_count: 0,
        fail_count: 0,
        pass_rate: 0,
      };
    }

    const scores = results.map(r => r.percentage);
    const passCount = results.filter(r => r.is_passed).length;

    return {
      class_id: classId,
      exam_id: examId,
      total_students: results.length,
      submitted_count: results.length,
      average_score: scores.reduce((a, b) => a + b, 0) / scores.length,
      highest_score: Math.max(...scores),
      lowest_score: Math.min(...scores),
      pass_count: passCount,
      fail_count: results.length - passCount,
      pass_rate: (passCount / results.length) * 100,
    };
  }
}

export default new ExamService();
