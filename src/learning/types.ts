export type TopicId = 'proportions' | 'rule-of-three' | 'cytology' | 'genetics' | (string & {});
export type Feeling = 'confident' | 'insecure' | 'anxious' | 'avoid';
export type Barrier = 'difficulty' | 'tired' | 'relevance' | 'history';
export interface StudentModel {
  name: string; exam: 'ENEM'; weeklyHours: number; goal: string;
  perception: Feeling; ageConfirmed: boolean;
}
export interface AffectiveCheckIn { topicId: TopicId; feeling: Feeling; barrier?: Barrier; at: string }
export interface AttemptEvent {
  id: string; questionId: string; topicId: TopicId; answer: number; correct: boolean;
  assisted: boolean; at: string; source: 'diagnostic' | 'practice' | 'review'; battleId?: string;
  repaired?: boolean; repairAttemptId?: string;
}
export interface TopicMastery {
  topicId: TopicId; score: number; evidence: number; encountered: boolean;
  stage: 'unseen' | 'learning' | 'consolidating' | 'mastered' | 'review';
  lastPracticedAt?: string; immediatePassedAt?: string; nextReviewAt?: string;
  reviewLevel: number; deferredAt?: string;
  assessmentEvidence?: AttemptEvent[];
  retention?: number;
}
export type Masteries = Record<string, TopicMastery>;
export interface RepairCheck {
  prompt: string;
  options: string[];
  answer: number;
  insight: string;
}
export interface Question {
  id: string; topicId: TopicId; difficulty: 1 | 2 | 3; purpose: 'diagnostic' | 'practice' | 'review';
  prompt: string; options: string[]; answer: number; explanation: string;
  repairCheck?: RepairCheck;
}
export interface LessonBlock { id: string; kind: 'concept' | 'example' | 'recall' | 'summary' | 'pitfall' | 'tip' | 'review' | (string & {}); title: string; text: string; reveal?: string; formula?: string }
export interface LearningContext {
  overview: string;
  applications: string[];
  limitations: string;
}
export interface EnemGuidance {
  status: 'pending' | 'reviewed';
  priorities: string[];
  commonPatterns: string[];
  lowerIncidence: string[];
  examsAnalyzed: string;
  sources: string[];
}
export interface Topic {
  id: TopicId; name: string; discipline: 'Matemática' | 'Biologia' | (string & {}); subtitle: string;
  description: string; relevance: string; prerequisiteIds: TopicId[]; priority: number;
  version: number; lessons: LessonBlock[]; questions: Question[];
  learningContext?: LearningContext;
  enemGuidance?: EnemGuidance;
}
export interface BattlePlan {
  id: string; topicId: TopicId; mode: 'learn' | 'review' | 'micro'; estimatedMinutes: number;
  blocks: LessonBlock[]; questionIds: string[]; criteria: string;
}
export interface NextMonsterDecision { topicId: TopicId; reasons: string[]; review: boolean; score: number }
export interface AnalyticsEvent { id: string; name: 'diagnostic_completed' | 'battle_started' | 'battle_completed' | 'returned_within_7_days'; at: string; topicId?: TopicId }
