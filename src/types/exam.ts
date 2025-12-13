/**
 * Types for Smart Examination Platform
 */

// Question Types
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

// Exam Status
export type ExamStatus = 'draft' | 'published' | 'archived';

// Class Member Role
export type ClassMemberRole = 'teacher' | 'student' | 'assistant';

// Exam Attempt Status
export type AttemptStatus = 'in_progress' | 'submitted' | 'graded' | 'terminated';

// Anti-cheat Violation Type
export type ViolationType = 'no_face' | 'multiple_faces' | 'looking_away' | 'phone_detected' | 'headphones_detected' | 'tab_switch' | 'other';

// Question Option (for multiple choice)
export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  position: number;
}

// Question
export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  options: QuestionOption[];
  correct_answer?: string; // For true/false and short_answer
  points: number;
  explanation?: string;
  position: number;
  created_at: string;
  updated_at?: string;
}

// Exam
export interface Exam {
  id: string;
  title: string;
  description?: string;
  instructor_id: string;
  duration_minutes: number;
  start_time?: string;
  end_time?: string;
  total_points: number;
  passing_score: number;
  shuffle_questions: boolean;
  shuffle_answers: boolean;
  show_results: boolean;
  allow_review: boolean;
  max_attempts: number;
  status: ExamStatus;
  questions: Question[];
  question_count: number;
  created_at: string;
  updated_at?: string;
}

// Class (Classroom)
export interface ExamClass {
  id: string;
  name: string;
  code: string;
  description?: string;
  instructor_id: string;
  instructor_name?: string;
  student_count: number;
  exam_count: number;
  invite_code?: string;
  created_at: string;
  updated_at?: string;
}

// Class Member (Student/Teacher in class)
export interface ClassMember {
  id: string;
  class_id: string;
  user_id: string;
  role: ClassMemberRole;
  username?: string;
  name?: string;
  email?: string;
  avatar?: string;
  joined_at: string;
}

// Class Exam Assignment
export interface ClassExamAssignment {
  id: string;
  class_id: string;
  exam_id: string;
  exam_title?: string;
  start_time?: string;
  end_time?: string;
  is_active: boolean;
  assigned_at: string;
  assigned_by: string;
}

// Student Answer
export interface StudentAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_id?: string;
  answer_text?: string;
  is_correct?: boolean;
  points_earned?: number;
  answered_at: string;
}

// Exam Attempt
export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  class_id?: string;
  status: AttemptStatus;
  started_at: string;
  submitted_at?: string;
  time_spent_seconds?: number;
  total_score?: number;
  percentage?: number;
  correct_count?: number;
  incorrect_count?: number;
  unanswered_count?: number;
  is_passed?: boolean;
  answers: StudentAnswer[];
  violations: AntiCheatViolation[];
}

// Anti-cheat Violation
export interface AntiCheatViolation {
  id: string;
  attempt_id: string;
  violation_type: ViolationType;
  description?: string;
  screenshot_url?: string;
  occurred_at: string;
}

// Exam Result Summary (for displaying results)
export interface ExamResult {
  attempt_id: string;
  exam_id: string;
  exam_title: string;
  student_id: string;
  student_name?: string;
  total_score: number;
  max_score: number;
  percentage: number;
  is_passed: boolean;
  time_spent_seconds: number;
  submitted_at: string;
  correct_count: number;
  incorrect_count: number;
  unanswered_count: number;
  violation_count: number;
}

// Class Statistics
export interface ClassStatistics {
  class_id: string;
  exam_id: string;
  total_students: number;
  submitted_count: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  pass_count: number;
  fail_count: number;
  pass_rate: number;
}

// Student Profile (for exam platform)
export interface StudentProfile {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar?: string;
  student_id?: string; // Internal student ID
  profile_image_url?: string; // For identity verification
  enrolled_classes: number;
  completed_exams: number;
  average_score?: number;
  created_at: string;
  last_active?: string;
}

// Face Verification Data
export interface FaceVerificationData {
  student_id: string;
  reference_image_url: string;
  face_encoding?: string; // Base64 encoded face embedding
  verified_at?: string;
  is_verified: boolean;
}

// Anti-cheat Settings
export interface AntiCheatSettings {
  require_camera: boolean;
  require_face_verification: boolean;
  max_warnings: number;
  detect_phone: boolean;
  detect_headphones: boolean;
  detect_multiple_faces: boolean;
  detect_looking_away: boolean;
  auto_terminate_on_max_warnings: boolean;
  capture_screenshots: boolean;
  screenshot_interval_seconds: number;
}

// Create Exam Request
export interface CreateExamRequest {
  title: string;
  description?: string;
  duration_minutes: number;
  passing_score?: number;
  shuffle_questions?: boolean;
  shuffle_answers?: boolean;
  show_results?: boolean;
  allow_review?: boolean;
  max_attempts?: number;
}

// Create Question Request
export interface CreateQuestionRequest {
  exam_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: Omit<QuestionOption, 'id'>[];
  correct_answer?: string;
  points: number;
  explanation?: string;
}

// Create Class Request
export interface CreateClassRequest {
  name: string;
  code: string;
  description?: string;
}

// Add Student to Class Request
export interface AddStudentRequest {
  class_id: string;
  email?: string;
  student_id?: string;
  user_id?: string;
}

// Submit Answer Request
export interface SubmitAnswerRequest {
  attempt_id: string;
  question_id: string;
  selected_option_id?: string;
  answer_text?: string;
}

// Report Violation Request
export interface ReportViolationRequest {
  attempt_id: string;
  violation_type: ViolationType;
  description?: string;
  screenshot_base64?: string;
}
