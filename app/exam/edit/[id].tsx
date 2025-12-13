import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/src/context/LanguageContext';
import ExamService from '@/src/services/examService';
import { Exam, Question, QuestionType } from '@/src/types/exam';

interface QuestionForm {
  question_text: string;
  question_type: QuestionType;
  options: { text: string; isCorrect: boolean }[];
  correct_answer: string;
  points: number;
  explanation: string;
}

const initialQuestionForm: QuestionForm = {
  question_text: '',
  question_type: 'multiple_choice',
  options: [
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ],
  correct_answer: '',
  points: 1,
  explanation: '',
};

export default function EditExamScreen() {
  const { id, addQuestion } = useLocalSearchParams<{ id: string; addQuestion?: string }>();
  const router = useRouter();
  const { t } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'questions'>(
    addQuestion === 'true' ? 'questions' : 'info'
  );

  // Exam form state
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [duration, setDuration] = useState('60');
  const [passingScore, setPassingScore] = useState('50');
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleAnswers, setShuffleAnswers] = useState(false);
  const [showResults, setShowResults] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState('1');

  // Question form state
  const [showQuestionForm, setShowQuestionForm] = useState(addQuestion === 'true');
  const [currentQuestion, setCurrentQuestion] = useState<QuestionForm>(initialQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const loadExam = useCallback(async () => {
    if (!id) return;
    
    try {
      const data = await ExamService.getExamById(id);
      setExam(data);
      
      // Populate form
      setExamTitle(data.title);
      setExamDescription(data.description || '');
      setDuration(data.duration_minutes.toString());
      setPassingScore(data.passing_score.toString());
      setShuffleQuestions(data.shuffle_questions);
      setShuffleAnswers(data.shuffle_answers);
      setShowResults(data.show_results);
      setAllowReview(data.allow_review);
      setMaxAttempts(data.max_attempts.toString());
    } catch (error) {
      console.error('Load exam error:', error);
      Alert.alert(t.common.error, t.exam.loadExamError);
    } finally {
      setIsLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const handleSaveExamInfo = async () => {
    if (!examTitle.trim()) {
      Alert.alert(t.common.error, t.exam.examTitleRequired);
      return;
    }

    setIsSaving(true);
    try {
      await ExamService.updateExam(id!, {
        title: examTitle.trim(),
        description: examDescription.trim() || undefined,
        duration_minutes: parseInt(duration),
        passing_score: parseInt(passingScore) || 50,
        shuffle_questions: shuffleQuestions,
        shuffle_answers: shuffleAnswers,
        show_results: showResults,
        allow_review: allowReview,
        max_attempts: parseInt(maxAttempts) || 1,
      });

      Alert.alert(t.common.success, t.exam.examUpdatedSuccess);
      loadExam();
    } catch (error: any) {
      console.error('Update exam error:', error);
      Alert.alert(t.common.error, error.message || 'Failed to update exam');
    } finally {
      setIsSaving(false);
    }
  };

  const validateQuestion = useCallback(() => {
    if (!currentQuestion.question_text.trim()) {
      Alert.alert(t.common.error, t.exam.enterQuestionText);
      return false;
    }

    if (currentQuestion.question_type === 'multiple_choice') {
      const validOptions = currentQuestion.options.filter(o => o.text.trim());
      if (validOptions.length < 2) {
        Alert.alert(t.common.error, t.exam.minTwoOptions);
        return false;
      }
      if (!currentQuestion.options.some(o => o.isCorrect)) {
        Alert.alert(t.common.error, t.exam.selectCorrectAnswer);
        return false;
      }
    }

    if (currentQuestion.question_type === 'true_false' && !currentQuestion.correct_answer) {
      Alert.alert(t.common.error, t.exam.selectCorrectAnswer);
      return false;
    }

    return true;
  }, [currentQuestion, t]);

  const handleSaveQuestion = async () => {
    if (!validateQuestion()) return;

    setIsSaving(true);
    try {
      if (editingQuestionId) {
        // Update existing question
        await ExamService.updateQuestion(editingQuestionId, {
          question_text: currentQuestion.question_text.trim(),
          question_type: currentQuestion.question_type,
          options: currentQuestion.question_type === 'multiple_choice'
            ? currentQuestion.options.filter(o => o.text.trim()).map((o, i) => ({
                text: o.text.trim(),
                isCorrect: o.isCorrect,
                position: i + 1,
              }))
            : undefined,
          correct_answer: currentQuestion.question_type !== 'multiple_choice'
            ? currentQuestion.correct_answer
            : undefined,
          points: currentQuestion.points,
          explanation: currentQuestion.explanation.trim() || undefined,
        });
        Alert.alert(t.common.success, t.exam.questionUpdatedSuccess);
      } else {
        // Add new question
        await ExamService.addQuestion({
          exam_id: id!,
          question_text: currentQuestion.question_text.trim(),
          question_type: currentQuestion.question_type,
          options: currentQuestion.question_type === 'multiple_choice'
            ? currentQuestion.options.filter(o => o.text.trim()).map((o, i) => ({
                text: o.text.trim(),
                isCorrect: o.isCorrect,
                position: i + 1,
              }))
            : undefined,
          correct_answer: currentQuestion.question_type !== 'multiple_choice'
            ? currentQuestion.correct_answer
            : undefined,
          points: currentQuestion.points,
          explanation: currentQuestion.explanation.trim() || undefined,
        });
        Alert.alert(t.common.success, t.exam.questionAddedSuccess);
      }

      setCurrentQuestion(initialQuestionForm);
      setEditingQuestionId(null);
      setShowQuestionForm(false);
      loadExam();
    } catch (error: any) {
      console.error('Save question error:', error);
      Alert.alert(t.common.error, error.message || 'Failed to save question');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setCurrentQuestion({
      question_text: question.question_text,
      question_type: question.question_type,
      options: question.options?.map(o => ({ text: o.text, isCorrect: o.isCorrect })) || 
        [{ text: '', isCorrect: false }, { text: '', isCorrect: false }],
      correct_answer: question.correct_answer || '',
      points: question.points,
      explanation: question.explanation || '',
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    Alert.alert(
      t.common.confirm,
      t.exam.confirmDeleteQuestion,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await ExamService.deleteQuestion(questionId);
              Alert.alert(t.common.success, t.exam.questionDeletedSuccess);
              loadExam();
            } catch (error) {
              console.error('Delete question error:', error);
              Alert.alert(t.common.error, t.exam.deleteQuestionError);
            }
          },
        },
      ]
    );
  };

  const handleAddOption = () => {
    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { text: '', isCorrect: false }],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (currentQuestion.options.length <= 2) return;
    const newOptions = currentQuestion.options.filter((_, i) => i !== index);
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = { ...newOptions[index], text };
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleCorrectAnswerChange = (index: number) => {
    const newOptions = currentQuestion.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t.exam.editExam }} />
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </SafeAreaView>
      </>
    );
  }

  const renderQuestionForm = () => (
    <View style={styles.questionForm}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {editingQuestionId ? t.exam.editQuestion : t.exam.addQuestion}
        </Text>
        <TouchableOpacity 
          onPress={() => {
            setShowQuestionForm(false);
            setEditingQuestionId(null);
            setCurrentQuestion(initialQuestionForm);
          }}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Question Type */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.exam.questionType}</Text>
        <View style={styles.typeButtons}>
          {(['multiple_choice', 'true_false', 'short_answer', 'essay'] as QuestionType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                currentQuestion.question_type === type && styles.typeButtonActive,
              ]}
              onPress={() => setCurrentQuestion({ ...currentQuestion, question_type: type })}
            >
              <Text style={[
                styles.typeButtonText,
                currentQuestion.question_type === type && styles.typeButtonTextActive,
              ]}>
                {type === 'multiple_choice' && t.exam.multipleChoice}
                {type === 'true_false' && t.exam.trueFalse}
                {type === 'short_answer' && t.exam.shortAnswer}
                {type === 'essay' && t.exam.essay}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Question Text */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.exam.questionText} *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={currentQuestion.question_text}
          onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, question_text: text })}
          placeholder={t.exam.enterQuestionText}
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Multiple Choice Options */}
      {currentQuestion.question_type === 'multiple_choice' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.exam.options}</Text>
          {currentQuestion.options.map((option, index) => (
            <View key={index} style={styles.optionRow}>
              <TouchableOpacity
                style={[styles.radioButton, option.isCorrect && styles.radioButtonActive]}
                onPress={() => handleCorrectAnswerChange(index)}
              >
                {option.isCorrect && <View style={styles.radioInner} />}
              </TouchableOpacity>
              <TextInput
                style={[styles.input, styles.optionInput]}
                value={option.text}
                onChangeText={(text) => handleOptionChange(index, text)}
                placeholder={`${t.exam.options} ${index + 1}`}
                placeholderTextColor="#999"
              />
              {currentQuestion.options.length > 2 && (
                <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveOption(index)}>
                  <Ionicons name="close-circle" size={24} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          ))}
          <TouchableOpacity style={styles.addOptionButton} onPress={handleAddOption}>
            <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
            <Text style={styles.addOptionText}>{t.exam.addOption}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* True/False */}
      {currentQuestion.question_type === 'true_false' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.exam.correctAnswer}</Text>
          <View style={styles.trueFalseButtons}>
            <TouchableOpacity
              style={[
                styles.trueFalseButton,
                currentQuestion.correct_answer === 'true' && styles.trueFalseButtonActive,
              ]}
              onPress={() => setCurrentQuestion({ ...currentQuestion, correct_answer: 'true' })}
            >
              <Text style={[
                styles.trueFalseButtonText,
                currentQuestion.correct_answer === 'true' && styles.trueFalseButtonTextActive,
              ]}>
                {t.common.yes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.trueFalseButton,
                currentQuestion.correct_answer === 'false' && styles.trueFalseButtonActive,
              ]}
              onPress={() => setCurrentQuestion({ ...currentQuestion, correct_answer: 'false' })}
            >
              <Text style={[
                styles.trueFalseButtonText,
                currentQuestion.correct_answer === 'false' && styles.trueFalseButtonTextActive,
              ]}>
                {t.common.no}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Points */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.exam.points}</Text>
        <TextInput
          style={[styles.input, { width: 100 }]}
          value={currentQuestion.points.toString()}
          onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, points: parseInt(text) || 0 })}
          keyboardType="numeric"
        />
      </View>

      {/* Explanation */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.exam.explanation} ({t.common.optional})</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={currentQuestion.explanation}
          onChangeText={(text) => setCurrentQuestion({ ...currentQuestion, explanation: text })}
          placeholder={t.exam.enterExplanation}
          placeholderTextColor="#999"
          multiline
          numberOfLines={2}
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, isSaving && styles.disabledButton]}
        onPress={handleSaveQuestion}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>{t.common.save}</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: t.exam.editExam,
          headerBackTitle: t.common.back,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'info' && styles.tabActive]}
              onPress={() => setActiveTab('info')}
            >
              <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
                {t.exam.examTitle}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'questions' && styles.tabActive]}
              onPress={() => setActiveTab('questions')}
            >
              <Text style={[styles.tabText, activeTab === 'questions' && styles.tabTextActive]}>
                {t.exam.questions} ({exam?.question_count || 0})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {activeTab === 'info' ? (
              // Exam Info Tab
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.exam.examTitle} *</Text>
                  <TextInput
                    style={styles.input}
                    value={examTitle}
                    onChangeText={setExamTitle}
                    placeholder={t.exam.enterExamTitle}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>{t.exam.examDescription}</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={examDescription}
                    onChangeText={setExamDescription}
                    placeholder={t.exam.enterExamDescription}
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>{t.exam.duration} ({t.exam.durationMinutes})</Text>
                    <TextInput
                      style={styles.input}
                      value={duration}
                      onChangeText={setDuration}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>{t.exam.passingScore} (%)</Text>
                    <TextInput
                      style={styles.input}
                      value={passingScore}
                      onChangeText={setPassingScore}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{t.exam.shuffleQuestions}</Text>
                  <Switch value={shuffleQuestions} onValueChange={setShuffleQuestions} />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{t.exam.shuffleAnswers}</Text>
                  <Switch value={shuffleAnswers} onValueChange={setShuffleAnswers} />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{t.exam.showResults}</Text>
                  <Switch value={showResults} onValueChange={setShowResults} />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>{t.exam.allowReview}</Text>
                  <Switch value={allowReview} onValueChange={setAllowReview} />
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, isSaving && styles.disabledButton]}
                  onPress={handleSaveExamInfo}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t.common.save}</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              // Questions Tab
              <View style={styles.questionsContainer}>
                {showQuestionForm ? (
                  renderQuestionForm()
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.addQuestionButton}
                      onPress={() => setShowQuestionForm(true)}
                    >
                      <Ionicons name="add-circle" size={24} color="#007AFF" />
                      <Text style={styles.addQuestionText}>{t.exam.addQuestion}</Text>
                    </TouchableOpacity>

                    {exam?.questions && exam.questions.length > 0 ? (
                      exam.questions.map((question, index) => (
                        <View key={question.id} style={styles.questionCard}>
                          <View style={styles.questionHeader}>
                            <Text style={styles.questionNumber}>
                              {t.exam.questionNumber}{index + 1}
                            </Text>
                            <View style={styles.questionActions}>
                              <TouchableOpacity
                                style={styles.questionAction}
                                onPress={() => handleEditQuestion(question)}
                              >
                                <Ionicons name="create-outline" size={20} color="#007AFF" />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.questionAction}
                                onPress={() => handleDeleteQuestion(question.id)}
                              >
                                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          <Text style={styles.questionText} numberOfLines={2}>
                            {question.question_text}
                          </Text>
                          <View style={styles.questionMeta}>
                            <Text style={styles.questionType}>
                              {question.question_type === 'multiple_choice' && t.exam.multipleChoice}
                              {question.question_type === 'true_false' && t.exam.trueFalse}
                              {question.question_type === 'short_answer' && t.exam.shortAnswer}
                              {question.question_type === 'essay' && t.exam.essay}
                            </Text>
                            <Text style={styles.questionPoints}>{question.points} {t.exam.points}</Text>
                          </View>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>{t.exam.noQuestions}</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  questionsContainer: {
    padding: 16,
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addQuestionText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  questionForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#e8f4fd',
  },
  typeButtonText: {
    fontSize: 13,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonActive: {
    borderColor: '#4CAF50',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  optionInput: {
    flex: 1,
    marginBottom: 0,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  addOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addOptionText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  trueFalseButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  trueFalseButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  trueFalseButtonActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#e8f5e9',
  },
  trueFalseButtonText: {
    fontSize: 16,
    color: '#666',
  },
  trueFalseButtonTextActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  questionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  questionAction: {
    padding: 4,
  },
  questionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  questionMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  questionType: {
    fontSize: 11,
    color: '#999',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionPoints: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
});
