import React, { useState, useCallback } from 'react';
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
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/src/context/LanguageContext';
import ExamService from '@/src/services/examService';
import { QuestionType, QuestionOption } from '@/src/types/exam';

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

export default function CreateExamScreen() {
  const router = useRouter();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Exam info, 2: Add questions

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
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionForm>(initialQuestionForm);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Created exam ID
  const [createdExamId, setCreatedExamId] = useState<string | null>(null);

  const validateExamInfo = useCallback(() => {
    if (!examTitle.trim()) {
      Alert.alert(t.common.error, t.exam.examTitleRequired);
      return false;
    }
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      Alert.alert(t.common.error, t.exam.invalidDuration);
      return false;
    }
    return true;
  }, [examTitle, duration, t]);

  const handleCreateExam = async () => {
    if (!validateExamInfo()) return;

    setIsLoading(true);
    try {
      const exam = await ExamService.createExam({
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

      setCreatedExamId(exam.id);
      setStep(2);
      Alert.alert(t.common.success, t.exam.examCreatedSuccess);
    } catch (error: any) {
      console.error('Create exam error:', error);
      Alert.alert(t.common.error, error.message || 'Failed to create exam');
    } finally {
      setIsLoading(false);
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

    if (currentQuestion.question_type === 'true_false') {
      if (!currentQuestion.correct_answer) {
        Alert.alert(t.common.error, t.exam.selectCorrectAnswer);
        return false;
      }
    }

    if (currentQuestion.points <= 0) {
      Alert.alert(t.common.error, t.exam.invalidPoints);
      return false;
    }

    return true;
  }, [currentQuestion, t]);

  const handleAddQuestion = async () => {
    if (!validateQuestion() || !createdExamId) return;

    setIsLoading(true);
    try {
      await ExamService.addQuestion({
        exam_id: createdExamId,
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

      setQuestions([...questions, { ...currentQuestion }]);
      setCurrentQuestion(initialQuestionForm);
      Alert.alert(t.common.success, t.exam.questionAddedSuccess);
    } catch (error: any) {
      console.error('Add question error:', error);
      Alert.alert(t.common.error, error.message || 'Failed to add question');
    } finally {
      setIsLoading(false);
    }
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

  const handleFinish = () => {
    if (questions.length === 0) {
      Alert.alert(
        t.common.confirm,
        t.exam.noQuestions,
        [
          { text: t.common.cancel, style: 'cancel' },
          {
            text: t.common.ok,
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const renderExamInfoStep = () => (
    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
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
          <Text style={styles.label}>{t.exam.duration} ({t.exam.durationMinutes}) *</Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            placeholder="60"
            placeholderTextColor="#999"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>{t.exam.passingScore} (%)</Text>
          <TextInput
            style={styles.input}
            value={passingScore}
            onChangeText={setPassingScore}
            keyboardType="numeric"
            placeholder="50"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{t.exam.maxAttempts}</Text>
        <TextInput
          style={styles.input}
          value={maxAttempts}
          onChangeText={setMaxAttempts}
          keyboardType="numeric"
          placeholder="1"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t.exam.shuffleQuestions}</Text>
        <Switch
          value={shuffleQuestions}
          onValueChange={setShuffleQuestions}
          trackColor={{ false: '#ddd', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t.exam.shuffleAnswers}</Text>
        <Switch
          value={shuffleAnswers}
          onValueChange={setShuffleAnswers}
          trackColor={{ false: '#ddd', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t.exam.showResults}</Text>
        <Switch
          value={showResults}
          onValueChange={setShowResults}
          trackColor={{ false: '#ddd', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchLabel}>{t.exam.allowReview}</Text>
        <Switch
          value={allowReview}
          onValueChange={setAllowReview}
          trackColor={{ false: '#ddd', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleCreateExam}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.primaryButtonText}>{t.common.next}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );

  const renderQuestionForm = () => (
    <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
      {/* Questions summary */}
      {questions.length > 0 && (
        <View style={styles.questionsSummary}>
          <Text style={styles.summaryTitle}>
            {t.exam.questions}: {questions.length}
          </Text>
          {questions.map((q, index) => (
            <View key={index} style={styles.questionItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.questionItemText} numberOfLines={1}>
                {index + 1}. {q.question_text}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>
        {editingQuestionIndex !== null ? t.exam.editQuestion : t.exam.addQuestion}
      </Text>

      {/* Question Type Selection */}
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
              <Text
                style={[
                  styles.typeButtonText,
                  currentQuestion.question_type === type && styles.typeButtonTextActive,
                ]}
              >
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
                style={[
                  styles.radioButton,
                  option.isCorrect && styles.radioButtonActive,
                ]}
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
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveOption(index)}
                >
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

      {/* True/False Answer */}
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
              <Text
                style={[
                  styles.trueFalseButtonText,
                  currentQuestion.correct_answer === 'true' && styles.trueFalseButtonTextActive,
                ]}
              >
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
              <Text
                style={[
                  styles.trueFalseButtonText,
                  currentQuestion.correct_answer === 'false' && styles.trueFalseButtonTextActive,
                ]}
              >
                {t.common.no}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Points */}
      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>{t.exam.points}</Text>
          <TextInput
            style={styles.input}
            value={currentQuestion.points.toString()}
            onChangeText={(text) =>
              setCurrentQuestion({ ...currentQuestion, points: parseInt(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor="#999"
          />
        </View>
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
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={handleAddQuestion}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>{t.exam.addQuestion}</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={handleFinish}>
        <Ionicons name="checkmark" size={20} color="#007AFF" style={{ marginRight: 8 }} />
        <Text style={styles.secondaryButtonText}>
          {questions.length > 0 ? t.common.save : t.common.close}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: step === 1 ? t.exam.createExam : t.exam.addQuestion,
          headerBackTitle: t.common.back,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
              <Text style={[styles.progressText, step >= 1 && styles.progressTextActive]}>1</Text>
            </View>
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
              <Text style={[styles.progressText, step >= 2 && styles.progressTextActive]}>2</Text>
            </View>
          </View>

          {step === 1 ? renderExamInfoStep() : renderQuestionForm()}
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
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressStepActive: {
    backgroundColor: '#007AFF',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  progressTextActive: {
    color: '#fff',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: '#007AFF',
  },
  form: {
    flex: 1,
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
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  primaryButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  secondaryButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  questionsSummary: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  questionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  questionItemText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
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
    backgroundColor: '#fff',
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
});
