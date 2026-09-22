export type TopicId = 'proportions' | 'rule-of-three' | 'cytology' | 'genetics';
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
}
export interface TopicMastery {
  topicId: TopicId; score: number; evidence: number; encountered: boolean;
  stage: 'unseen' | 'learning' | 'consolidating' | 'mastered' | 'review';
  lastPracticedAt?: string; immediatePassedAt?: string; nextReviewAt?: string;
  reviewLevel: number; deferredAt?: string;
  assessmentEvidence?: AttemptEvent[];
}
export type Masteries = Record<TopicId, TopicMastery>;
export interface Question {
  id: string; topicId: TopicId; difficulty: 1 | 2 | 3; purpose: 'diagnostic' | 'practice' | 'review';
  prompt: string; options: string[]; answer: number; explanation: string;
}
export interface LessonBlock { id: string; kind: 'concept' | 'example' | 'recall'; title: string; text: string; reveal?: string; formula?: string }
export interface Topic {
  id: TopicId; name: string; discipline: 'Matemática' | 'Biologia'; subtitle: string;
  description: string; relevance: string; prerequisiteIds: TopicId[]; priority: number;
  version: number; lessons: LessonBlock[]; questions: Question[];
}
export interface BattlePlan {
  id: string; topicId: TopicId; mode: 'learn' | 'review' | 'micro'; estimatedMinutes: number;
  blocks: LessonBlock[]; questionIds: string[]; criteria: string;
}
export interface NextMonsterDecision { topicId: TopicId; reasons: string[]; review: boolean; score: number }
export interface AnalyticsEvent { id: string; name: 'diagnostic_completed' | 'battle_started' | 'battle_completed' | 'returned_within_7_days'; at: string; topicId?: TopicId }
