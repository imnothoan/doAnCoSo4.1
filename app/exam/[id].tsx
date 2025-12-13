import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '@/src/context/LanguageContext';
import ExamService from '@/src/services/examService';
import { Exam, Question } from '@/src/types/exam';

export default function ExamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useLanguage();

  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadExam = useCallback(async () => {
    if (!id) return;
    
    try {
      const data = await ExamService.getExamById(id);
      setExam(data);
    } catch (error) {
      console.error('Load exam error:', error);
      Alert.alert(t.common.error, t.exam.loadExamError);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [id, t]);

  useEffect(() => {
    loadExam();
  }, [loadExam]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadExam();
  };

  const handleEdit = () => {
    router.push(`/exam/edit/${id}`);
  };

  const handleDelete = () => {
    Alert.alert(
      t.common.confirm,
      t.exam.confirmDeleteExam,
      [
        { text: t.common.cancel, style: 'cancel' },
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await ExamService.deleteExam(id!);
              Alert.alert(t.common.success, t.exam.examDeletedSuccess);
              router.back();
            } catch (error) {
              console.error('Delete exam error:', error);
              Alert.alert(t.common.error, t.exam.deleteExamError);
            }
          },
        },
      ]
    );
  };

  const handlePublish = async () => {
    if (!exam) return;
    
    try {
      const newStatus = exam.status === 'published' ? 'draft' : 'published';
      await ExamService.setExamStatus(id!, newStatus);
      Alert.alert(t.common.success, newStatus === 'published' ? t.exam.examUpdatedSuccess : t.exam.examUpdatedSuccess);
      loadExam();
    } catch (error) {
      console.error('Publish exam error:', error);
      Alert.alert(t.common.error, t.exam.updateExamError);
    }
  };

  const handleAddQuestion = () => {
    router.push(`/exam/edit/${id}?addQuestion=true`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return '#4CAF50';
      case 'draft':
        return '#FFC107';
      case 'archived':
        return '#9E9E9E';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return t.exam.published;
      case 'draft':
        return t.exam.draft;
      case 'archived':
        return t.exam.archived;
      default:
        return status;
    }
  };

  const renderQuestion = (question: Question, index: number) => (
    <View key={question.id} style={styles.questionCard}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>
          {t.exam.questionNumber}{index + 1}
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
      <Text style={styles.questionText}>{question.question_text}</Text>
      
      {question.question_type === 'multiple_choice' && question.options && (
        <View style={styles.optionsContainer}>
          {question.options.map((option, optIndex) => (
            <View 
              key={option.id} 
              style={[
                styles.optionItem,
                option.isCorrect && styles.correctOption,
              ]}
            >
              <Text style={styles.optionLetter}>
                {String.fromCharCode(65 + optIndex)}.
              </Text>
              <Text style={[
                styles.optionText,
                option.isCorrect && styles.correctOptionText,
              ]}>
                {option.text}
              </Text>
              {option.isCorrect && (
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
              )}
            </View>
          ))}
        </View>
      )}
      
      {question.question_type === 'true_false' && (
        <Text style={styles.correctAnswerText}>
          {t.exam.correctAnswer}: {question.correct_answer === 'true' ? t.common.yes : t.common.no}
        </Text>
      )}
      
      {question.explanation && (
        <View style={styles.explanationContainer}>
          <Text style={styles.explanationLabel}>{t.exam.explanation}:</Text>
          <Text style={styles.explanationText}>{question.explanation}</Text>
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: t.exam.examList }} />
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>{t.common.loading}</Text>
        </SafeAreaView>
      </>
    );
  }

  if (!exam) {
    return (
      <>
        <Stack.Screen options={{ title: t.exam.examList }} />
        <SafeAreaView style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#FF3B30" />
          <Text style={styles.errorText}>Exam not found</Text>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: exam.title,
          headerBackTitle: t.common.back,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
                <Ionicons name="create-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Exam Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.examTitle}>{exam.title}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exam.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(exam.status) }]}>
                  {getStatusLabel(exam.status)}
                </Text>
              </View>
            </View>
            
            {exam.description && (
              <Text style={styles.examDescription}>{exam.description}</Text>
            )}
            
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={20} color="#666" />
                <Text style={styles.statValue}>{exam.duration_minutes}</Text>
                <Text style={styles.statLabel}>{t.exam.durationMinutes}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="help-circle-outline" size={20} color="#666" />
                <Text style={styles.statValue}>{exam.question_count}</Text>
                <Text style={styles.statLabel}>{t.exam.questions}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="ribbon-outline" size={20} color="#666" />
                <Text style={styles.statValue}>{exam.total_points}</Text>
                <Text style={styles.statLabel}>{t.exam.points}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#666" />
                <Text style={styles.statValue}>{exam.passing_score}%</Text>
                <Text style={styles.statLabel}>{t.exam.passingScore}</Text>
              </View>
            </View>

            <View style={styles.settingsRow}>
              <View style={styles.settingItem}>
                <Ionicons 
                  name={exam.shuffle_questions ? 'shuffle' : 'reorder-four'} 
                  size={16} 
                  color={exam.shuffle_questions ? '#4CAF50' : '#999'} 
                />
                <Text style={[styles.settingText, !exam.shuffle_questions && styles.settingDisabled]}>
                  {t.exam.shuffleQuestions}
                </Text>
              </View>
              <View style={styles.settingItem}>
                <Ionicons 
                  name={exam.show_results ? 'eye' : 'eye-off'} 
                  size={16} 
                  color={exam.show_results ? '#4CAF50' : '#999'} 
                />
                <Text style={[styles.settingText, !exam.show_results && styles.settingDisabled]}>
                  {t.exam.showResults}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.publishButton]}
              onPress={handlePublish}
            >
              <Ionicons 
                name={exam.status === 'published' ? 'eye-off' : 'paper-plane'} 
                size={20} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {exam.status === 'published' ? t.exam.unpublishExam : t.exam.publishExam}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.assignButton]}
              onPress={() => Alert.alert('Coming Soon', 'Assign to class feature coming soon')}
            >
              <Ionicons name="school" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>{t.exam.assignToClass}</Text>
            </TouchableOpacity>
          </View>

          {/* Questions Section */}
          <View style={styles.questionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t.exam.questions} ({exam.question_count})</Text>
              <TouchableOpacity style={styles.addQuestionButton} onPress={handleAddQuestion}>
                <Ionicons name="add-circle" size={24} color="#007AFF" />
                <Text style={styles.addQuestionText}>{t.exam.addQuestion}</Text>
              </TouchableOpacity>
            </View>

            {exam.questions && exam.questions.length > 0 ? (
              exam.questions.map((question, index) => renderQuestion(question, index))
            ) : (
              <View style={styles.noQuestionsContainer}>
                <Ionicons name="document-text-outline" size={48} color="#ccc" />
                <Text style={styles.noQuestionsText}>{t.exam.noQuestions}</Text>
                <TouchableOpacity style={styles.addFirstQuestionButton} onPress={handleAddQuestion}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addFirstQuestionText}>{t.exam.addQuestion}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  infoCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  examDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
  },
  settingDisabled: {
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  publishButton: {
    backgroundColor: '#4CAF50',
  },
  assignButton: {
    backgroundColor: '#007AFF',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  questionsSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  addQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addQuestionText: {
    color: '#007AFF',
    fontSize: 14,
    marginLeft: 4,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
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
  questionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  questionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  optionsContainer: {
    marginTop: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 6,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  correctOption: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
    width: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  correctOptionText: {
    color: '#2E7D32',
  },
  correctAnswerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  explanationContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  explanationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  noQuestionsContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  noQuestionsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  addFirstQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  addFirstQuestionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
