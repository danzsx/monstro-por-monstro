import { BattleState } from '@/battle/machine';
import { emptyMasteries } from '@/learning/engine';
import { AnalyticsEvent, AffectiveCheckIn, AttemptEvent, CompletedStudySession, ConfidenceRating, Masteries, StudentModel, TopicId } from '@/learning/types';
export interface AppState {
  version: 1; student: StudentModel | null; diagnosticCompletedAt?: string;
  diagnosticAttempts: AttemptEvent[]; attempts: AttemptEvent[]; masteries: Masteries;
  activeBattle: BattleState | null; checkIns: AffectiveCheckIn[]; analytics: AnalyticsEvent[];
  completedBattles: string[]; lastTopic?: TopicId; lastDeferredAt?: string;
  completedSessions?: CompletedStudySession[]; confidenceRatings?: ConfidenceRating[];
  firstBattleCompletedAt?: string; lastSeenAt?: string; createdAt: string;
}
export function initialState(now = new Date().toISOString()): AppState {
  return { version: 1, student: null, diagnosticAttempts: [], attempts: [], masteries: emptyMasteries(), activeBattle: null,
    checkIns: [], analytics: [], completedBattles: [], completedSessions: [], confidenceRatings: [], createdAt: now };
}
export interface SyncEvent { id: string; kind: 'attempt' | 'affective' | 'analytics'; at: string; payload: unknown }
export interface PendingOperation { id: string; snapshot: AppState; events: SyncEvent[] }
export interface LocalEnvelope { version: 1; ownerId: string | null; revision: number; state: AppState; pending: PendingOperation[]; lastSyncAt?: string }
export function initialEnvelope(): LocalEnvelope { return { version: 1, ownerId: null, revision: 0, state: initialState(), pending: [] }; }
