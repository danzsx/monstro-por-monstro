export type TopicId =
  | 'proportions'
  | 'rule-of-three'
  | 'cytology'
  | 'genetics'
  | 'kinematics'
  | 'newton-laws'
  | 'calorimetry'
  | 'stoichiometry'
  | 'solutions'
  | 'ecology'
  | 'language-functions'
  | (string & {});
export type Feeling = 'confident' | 'insecure' | 'anxious' | 'avoid';
export type Barrier = 'difficulty' | 'tired' | 'relevance' | 'history';
export interface StudentModel {
  name: string; exam: 'ENEM'; goal: string; ageConfirmed: boolean;
  weeklyHours?: number; perception?: Feeling;
}
export interface AffectiveCheckIn { topicId: TopicId; feeling: Feeling; barrier?: Barrier; at: string }
export type ConfidenceLevel = 'low' | 'medium' | 'high';
export interface ConfidenceRating { id: string; topicId: TopicId; level: ConfidenceLevel; at: string; battleId?: string }
export interface CompletedStudySession {
  id: string; topicId: TopicId; startedAt: string; completedAt: string;
  activeMs: number; mode: BattlePlan['mode']; stageAtCompletion: TopicMastery['stage'];
  sessionVersion?: 1 | 2; contentVersion?: number; plannedMinutes?: number;
  acquisition?: AcquisitionRecord; recall?: RecallRecord; pauseCount?: number;
  evolutionVersion?: 1; firstClearEarned?: boolean;
}
export type ChecklistItem = 'source_studied' | 'recalled_without_help' | 'explained_in_words' | 'solved_without_help' | 'checked_explanation' | 'noted_review';
export interface TopicChecklist { version: 1; checked: Partial<Record<ChecklistItem, boolean>>; theoryUnderstood: boolean; updatedAt: string }
export interface ExternalQuestionLog {
  id: string; version: 1; topicId: TopicId; source: string; locator: string; url?: string;
  studiedAt: string; result: 'correct' | 'incorrect' | 'unanswered'; comment: string; updatedAt: string;
}
export interface AcquisitionRecord { source: 'internal' | 'external' | 'interactive'; label: string; selectedAt: string; completedAt?: string; url?: string; materialText?: string; sectionIndex?: number }
export interface RecallRecord { report: 'clear' | 'partial' | 'not_yet'; at: string; activeMs: number; text?: string }
export interface StudySessionEvent {
  id: string; sessionId: string; topicId: TopicId; at: string; sessionVersion: 2; contentVersion: number;
  name: 'acquisition_selected' | 'acquisition_completed' | 'recall_reported' | 'session_paused' | 'session_resumed' | 'session_completed';
  acquisition?: AcquisitionRecord; recall?: RecallRecord; phase?: string; activeMs?: number; mode?: BattlePlan['mode'];
}
export interface AttemptEvent {
  id: string; questionId: string; topicId: TopicId; answer: number; correct: boolean | null;
  assisted: boolean; at: string; source: 'diagnostic' | 'entry' | 'practice' | 'review'; battleId?: string;
  itemVersion?: number;
  signal?: 'self_report' | 'question';
  repaired?: boolean; repairAttemptId?: string;
}
export interface TopicMastery {
  topicId: TopicId; score: number; evidence: number; encountered: boolean;
  stage: 'unseen' | 'learning' | 'consolidating' | 'mastered' | 'review';
  lastPracticedAt?: string; immediatePassedAt?: string; nextReviewAt?: string;
  reviewLevel: number; deferredAt?: string;
  assessmentEvidence?: AttemptEvent[];
  retention?: number;
  firstClearedAt?: string; evolvedAt?: string; evolutionOrigin?: 'earned' | 'legacy'; examPracticedAt?: string;
}
export type Masteries = Record<string, TopicMastery>;
export interface RepairCheck {
  prompt: string;
  options: string[];
  answer: number;
  insight: string;
}
export interface EnemMetadata {
  exam: string;
  year: number;
  color?: string;
  questionNumber?: number;
  competency?: string;
  ability?: string;
  label?: string;
}
export interface Question {
  id: string; topicId: TopicId; difficulty: 1 | 2 | 3; purpose: 'diagnostic' | 'practice' | 'review' | 'exam';
  version?: number;
  prompt: string; options: string[]; answer: number; explanation: string;
  repairCheck?: RepairCheck;
  enemMetadata?: EnemMetadata;
  rightsEvidence?: { holder: string; authorizationReference: string; permittedUse: string; verifiedAt: string; includesEmbeddedMedia: boolean };
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
  id: TopicId; name: string; discipline: 'Matemática' | 'Biologia' | 'Física' | 'Química' | 'Linguagens' | (string & {}); subtitle: string;
  description: string; relevance: string; prerequisiteIds: TopicId[]; priority: number;
  version: number; lessons: LessonBlock[]; questions: Question[];
  learningContext?: LearningContext;
  enemGuidance?: EnemGuidance;
  curatedSources?: { title: string; url: string; publisher: string; rightsBasis: 'link_only' | 'licensed'; licenseNote: string; fallbackInstructions: string; checkedAt: string; reviewedAt: string }[];
}
export interface BattlePlan {
  id: string; topicId: TopicId; mode: 'learn' | 'review' | 'micro' | 'exam'; estimatedMinutes: number;
  blocks: LessonBlock[]; questionIds: string[]; criteria: string;
  version?: 2; contentVersion?: number; recallPrompt?: Pick<LessonBlock, 'title' | 'text' | 'reveal'>;
  questionSnapshots?: Question[];
  miniReview?: LessonBlock[];
  evolutionVersion?: 1;
}
export interface NextMonsterDecision {
  topicId: TopicId; reasons: string[]; review: boolean; score: number;
  policyVersion?: string; suggestedMode?: BattlePlan['mode'];
  signals?: { independentItems: number; correctItems: number; dueAt?: string; recentErrorAt?: string; availableMinutes: number; returning: boolean };
}
export interface AnalyticsEvent { id: string; name: 'entry_opened' | 'entry_question_answered' | 'diagnostic_completed' | 'battle_started' | 'battle_completed' | 'returned_within_7_days'; at: string; topicId?: TopicId }
