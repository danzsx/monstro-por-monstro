import { randomUUID } from 'expo-crypto';
import { useApp } from '@/data/provider';
import { questionById } from '@/content/catalog';
import { battleReducer, BattleAction, BattleState } from '@/battle/machine';
import { nextDiagnosticQuestion } from '@/diagnostic/engine';
import { AcquisitionRecord, AffectiveCheckIn, AnalyticsEvent, AttemptEvent, ChecklistItem, ConfidenceLevel, ExternalQuestionLog, NextMonsterDecision, RecallRecord, StudentModel, StudySessionEvent, TopicId } from './types';
import { buildBattlePlan, DAY, questionForPlan, updateMastery } from './engine';
import { recommend } from './recommendation';
import { earnsFirstClear, isEvolutionPilot } from './evolution';
import { removeExternalQuestion, upsertExternalQuestion, validateExternalQuestion } from './notebook';
const timestamp = () => new Date().toISOString();
function sessionEvent(battle: BattleState, name: StudySessionEvent['name'], at: string, details: Partial<StudySessionEvent> = {}): StudySessionEvent {
  return { id: randomUUID(), sessionId: battle.plan.id, topicId: battle.plan.topicId, at, sessionVersion: 2, contentVersion: battle.plan.contentVersion ?? 1, name, ...details };
}
export function useActions() {
  const { commit, topics } = useApp();
  return {
    saveStudent: (student: StudentModel) => commit(s => ({ ...s, student })),
    setCloudAgeBand: (band: '16-17' | '18+') => commit(s => ({ ...s, cloudAgeBand: band })),
    setChecklistItem: (topicId: TopicId, item: ChecklistItem, checked: boolean) => commit(s => {
      const previous = s.topicChecklists?.[topicId];
      const next = { version: 1 as const, checked: { ...previous?.checked, [item]: checked }, theoryUnderstood: previous?.theoryUnderstood ?? false, updatedAt: timestamp() };
      return { ...s, topicChecklists: { ...s.topicChecklists, [topicId]: next } };
    }),
    setTheoryUnderstood: (topicId: TopicId, understood: boolean) => commit(s => {
      const previous = s.topicChecklists?.[topicId];
      const next = { version: 1 as const, checked: previous?.checked ?? {}, theoryUnderstood: understood, updatedAt: timestamp() };
      return { ...s, topicChecklists: { ...s.topicChecklists, [topicId]: next } };
    }),
    saveExternalQuestion: (input: Omit<ExternalQuestionLog, 'id' | 'version' | 'updatedAt'> & { id?: string }) => {
      validateExternalQuestion(input);
      const at = timestamp();
      return commit(s => {
        const log: ExternalQuestionLog = { ...input, id: input.id ?? randomUUID(), version: 1, source: input.source.trim(), locator: input.locator.trim(), comment: input.comment.trim(), updatedAt: at };
        const old = s.externalQuestionLogs ?? [];
        return { ...s, externalQuestionLogs: upsertExternalQuestion(old, log, !!input.id) };
      });
    },
    deleteExternalQuestion: (id: string, topicId: TopicId) => commit(s => ({ ...s, externalQuestionLogs: removeExternalQuestion(s.externalQuestionLogs ?? [], id, topicId) })),
    recordEntryOpen: () => { const at = timestamp(); const event: AnalyticsEvent = { id: randomUUID(), name: 'entry_opened', at };
      return commit(s => s.analytics.some(e => e.name === 'entry_opened') ? s : { ...s, analytics: [...s.analytics, event] }); },
    setRemindersEnabled: (enabled: boolean) => commit(s => s.remindersEnabled === enabled ? s : { ...s, remindersEnabled: enabled }),
    answerEntryQuestion: (questionId: string, answer: number) => {
      const question = questionById(questionId); const at = timestamp();
      if (question.purpose !== 'practice' || answer < 0 || answer >= question.options.length) throw new Error('Resposta inválida.');
      return commit(s => {
        if (s.attempts.some(a => a.source === 'entry')) return s;
        const attempt: AttemptEvent = { id: randomUUID(), topicId: question.topicId, questionId, answer, correct: answer === question.answer, assisted: false, at, source: 'entry', signal: 'question', itemVersion: question.version ?? 1 };
        const event: AnalyticsEvent = { id: randomUUID(), name: 'entry_question_answered', at, topicId: question.topicId };
        return { ...s, attempts: [...s.attempts, attempt], analytics: [...s.analytics, event] };
      });
    },
    rateConfidence: (topicId: TopicId, level: ConfidenceLevel, battleId?: string) => commit(s => ({
      ...s, confidenceRatings: [...(s.confidenceRatings ?? []), { id: randomUUID(), topicId, level, at: timestamp(), battleId }],
    })),
    answerDiagnostic: (questionId: string, familiarity: number) => {
      const question = questionById(questionId); const at = timestamp();
      const attempt: AttemptEvent = { id: randomUUID(), topicId: question.topicId, questionId, answer: familiarity, correct: null, assisted: false, at, source: 'diagnostic', signal: 'self_report' };
      return commit(s => {
        if (s.diagnosticCompletedAt || nextDiagnosticQuestion(s.diagnosticAttempts)?.id !== questionId) return s;
        const diagnosticAttempts = [...s.diagnosticAttempts, attempt];
        const done = !nextDiagnosticQuestion(diagnosticAttempts);
        const event: AnalyticsEvent = { id: randomUUID(), name: 'diagnostic_completed', at };
        return { ...s, diagnosticAttempts, ...(done ? { diagnosticCompletedAt: at, analytics: [...s.analytics, event] } : {}) };
      }, [{ id: attempt.id, kind: 'attempt', at, payload: attempt }]);
    },
    startBattle: (decision: NextMonsterDecision, micro = false) => {
      const at = timestamp(); const id = randomUUID();
      const event: AnalyticsEvent = { id: randomUUID(), name: 'battle_started', at, topicId: decision.topicId };
      return commit(s => {
        if (s.activeBattle) return s;
        const selectedTopic = topics.find(topic => topic.id === decision.topicId);
        if (!selectedTopic || selectedTopic.prerequisiteIds.some(id => {
          const prerequisite = s.masteries[id];
          return !prerequisite || (isEvolutionPilot(id) ? !prerequisite.firstClearedAt : prerequisite.evidence < 3 || prerequisite.score < .65);
        })) throw new Error('Conclua os pré-requisitos deste monstro antes de iniciar.');
        const currentMastery = s.masteries[decision.topicId] ?? { topicId: decision.topicId, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
        const plan = buildBattlePlan(id, decision, undefined, micro, s.attempts, topics, !!currentMastery.firstClearedAt);
        if (decision.suggestedMode === 'exam' && (!isEvolutionPilot(decision.topicId) || !currentMastery.evolvedAt || plan.questionIds.length !== 2)) throw new Error('A prática oficial ainda não está disponível para este monstro.');
        if (!plan.questionIds.length) throw new Error('Este tópico ainda não tem questões aptas para a ação escolhida.');
        const battle: BattleState = { decision, plan, phase: plan.mode === 'exam' ? 'question' : 'check-in', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: at };
        return { ...s, activeBattle: battle, masteries: { ...s.masteries, [decision.topicId]: { ...currentMastery, encountered: true, stage: currentMastery.stage === 'unseen' ? 'learning' : currentMastery.stage } }, analytics: [...s.analytics, event] };
      }, [{ id: event.id, kind: 'analytics', at, payload: event }]);
    },
    battleAction: (action: BattleAction) => commit(s => s.activeBattle ? { ...s, activeBattle: battleReducer(s.activeBattle, action) } : s),
    selectStudyTime: (minutes: 5 | 15) => commit(s => {
      const battle = s.activeBattle;
      if (!battle || battle.phase !== 'time-choice') return s;
      const plan = buildBattlePlan(battle.plan.id, battle.decision, battle.checkIn, minutes === 5, s.attempts, topics, !!s.masteries[battle.plan.topicId]?.firstClearedAt);
      return { ...s, activeBattle: battleReducer(battle, { type: 'SELECT_TIME', plan }),
        checkIns: battle.checkIn ? [...s.checkIns, battle.checkIn] : s.checkIns };
    }),
    saveRecallDraft: (text: string) => commit(s => s.activeBattle?.phase === 'recall'
      ? { ...s, activeBattle: { ...s.activeBattle, recallDraft: text.slice(0, 5000) } } : s),
    saveInteractiveStep: (sectionIndex: number) => commit(s => {
      const battle = s.activeBattle;
      if (!battle || battle.phase !== 'acquisition-interactive' || !battle.acquisition || !Number.isInteger(sectionIndex) || sectionIndex < 0) return s;
      return { ...s, activeBattle: { ...battle, acquisition: { ...battle.acquisition, sectionIndex } } };
    }),
    useTextTheory: () => commit(s => {
      const battle = s.activeBattle;
      if (!battle || battle.phase !== 'acquisition-interactive' || !battle.plan.blocks.length || !battle.acquisition) return s;
      return { ...s, activeBattle: { ...battle, phase: 'lesson', acquisition: { ...battle.acquisition, source: 'internal', label: `Teoria do app · ${battle.plan.topicId}` } } };
    }),
    chooseSource: (source: AcquisitionRecord['source'], label: string, material: { url?: string; materialText?: string } = {}) => {
      const url = material.url?.trim();
      if (url && !/^https?:\/\/\S+$/i.test(url)) throw new Error('Use um link que comece com https:// ou http://.');
      const at = timestamp();
      return commit(s => {
        const battle = s.activeBattle;
        if (!battle) return s;
        const next = battleReducer(battle, { type: 'CHOOSE_SOURCE', source, label, at, url, materialText: material.materialText?.trim().slice(0, 20_000) });
        if (next === battle) return s;
        return { ...s, activeBattle: next, sessionEvents: [...(s.sessionEvents ?? []), sessionEvent(next, 'acquisition_selected', at, { acquisition: next.acquisition })] };
      });
    },
    completeAcquisition: () => {
      const at = timestamp();
      return commit(s => {
        const battle = s.activeBattle;
        if (!battle) return s;
        const next = battleReducer(battle, { type: 'COMPLETE_ACQUISITION', at });
        if (next === battle) return s;
        return { ...s, activeBattle: next, sessionEvents: [...(s.sessionEvents ?? []), sessionEvent(next, 'acquisition_completed', at, { acquisition: next.acquisition })] };
      });
    },
    reportRecall: (report: RecallRecord['report']) => {
      const at = timestamp();
      return commit(s => {
        const battle = s.activeBattle;
        if (!battle) return s;
        const next = battleReducer(battle, { type: 'REPORT_RECALL', report, at });
        if (next === battle) return s;
        return { ...s, activeBattle: next, sessionEvents: [...(s.sessionEvents ?? []), sessionEvent(next, 'recall_reported', at, { recall: next.recall })] };
      });
    },
    pauseBattle: () => {
      const at = timestamp();
      return commit(s => {
        const battle = s.activeBattle;
        if (!battle) return s;
        const next = battleReducer(battle, { type: 'PAUSE' });
        if (next === battle) return s;
        return { ...s, activeBattle: next, sessionEvents: battle.plan.version === 2 ? [...(s.sessionEvents ?? []), sessionEvent(next, 'session_paused', at, { phase: battle.phase })] : s.sessionEvents };
      });
    },
    resumeBattle: () => {
      const at = timestamp();
      return commit(s => {
        const battle = s.activeBattle;
        if (!battle) return s;
        const next = battleReducer(battle, { type: 'RESUME' });
        if (next === battle) return s;
        return { ...s, activeBattle: next, sessionEvents: battle.plan.version === 2 ? [...(s.sessionEvents ?? []), sessionEvent(next, 'session_resumed', at, { phase: next.phase })] : s.sessionEvents };
      });
    },
    setIntervention: (checkIn: AffectiveCheckIn) => {
      const id = randomUUID();
      return commit(s => {
        if (!s.activeBattle) return s;
        const plan = buildBattlePlan(s.activeBattle.plan.id, s.activeBattle.decision, checkIn, s.activeBattle.plan.mode === 'micro', s.attempts, topics, !!s.masteries[s.activeBattle.plan.topicId]?.firstClearedAt);
        return { ...s, checkIns: [...s.checkIns, checkIn], activeBattle: battleReducer(s.activeBattle, { type: 'PLAN', checkIn, plan }) };
      }, [{ id, kind: 'affective', at: checkIn.at, payload: checkIn }]);
    },
    answerBattle: (questionId: string, answer: number) => {
      const at = timestamp(); const id = randomUUID();
      return commit(s => {
        const b = s.activeBattle;
        if (!b || b.phase !== 'question' || b.plan.questionIds[b.questionIndex] !== questionId) return s;
        const question = questionForPlan(b.plan, questionId, questionById);
        const attempt: AttemptEvent = { id, questionId, topicId: question.topicId, answer, correct: answer === question.answer, assisted: false, at, battleId: b.plan.id, source: b.decision.review || b.plan.mode === 'exam' ? 'review' : 'practice', itemVersion: question.version ?? b.plan.contentVersion ?? 1 };
        return { ...s, activeBattle: battleReducer(b, { type: 'ANSWER', attempt }) };
      });
    },
    startRepair: () => commit(s => s.activeBattle ? { ...s, activeBattle: battleReducer(s.activeBattle, { type: 'START_REPAIR' }) } : s),
    answerRepair: (correct: boolean, chosenIndex: number) => commit(s => s.activeBattle ? { ...s, activeBattle: battleReducer(s.activeBattle, { type: 'REPAIR_ANSWER', correct, chosenIndex }) } : s),
    finishBattle: () => {
      const at = timestamp();
      return commit(s => {
        const battle = s.activeBattle;
        if (!battle || battle.phase !== 'complete' || s.completedBattles.includes(battle.plan.id)) return s;
        const topicId = battle.plan.topicId;
        const currentMastery = s.masteries[topicId] ?? { topicId, score: 0, evidence: 0, encountered: false, stage: 'unseen', reviewLevel: 0 };
        const event: AnalyticsEvent = { id: randomUUID(), name: 'battle_completed', at, topicId };
        const calculated = updateMastery(currentMastery, battle.attempts, at);
        const firstClearEarned = !currentMastery.firstClearedAt && battle.plan.mode === 'learn' && isEvolutionPilot(topicId)
          && earnsFirstClear(topicId, battle.attempts, s.topicChecklists?.[topicId]);
        const gated = isEvolutionPilot(topicId) && !currentMastery.firstClearedAt && !firstClearEarned
          ? { ...calculated, stage: 'learning' as const, immediatePassedAt: undefined, nextReviewAt: undefined } : calculated;
        const mastery = { ...gated,
          ...(firstClearEarned ? { firstClearedAt: at, evolvedAt: at, evolutionOrigin: 'earned' as const, immediatePassedAt: at, nextReviewAt: new Date(Date.parse(at) + DAY).toISOString(), stage: 'consolidating' as const } : {}),
          ...(battle.plan.mode === 'exam' ? { examPracticedAt: at } : {}),
        };
        return { ...s, masteries: { ...s.masteries, [topicId]: mastery }, attempts: [...s.attempts, ...battle.attempts], completedBattles: [...s.completedBattles, battle.plan.id], completedSessions: [...(s.completedSessions ?? []), { id: battle.plan.id, topicId, startedAt: battle.startedAt, completedAt: at, activeMs: battle.activeMs ?? 0, mode: battle.plan.mode, stageAtCompletion: mastery.stage, sessionVersion: battle.plan.version ?? 1, evolutionVersion: 1, firstClearEarned, contentVersion: battle.plan.contentVersion, plannedMinutes: battle.plan.estimatedMinutes, acquisition: battle.acquisition, recall: battle.recall, pauseCount: battle.pauseCount ?? 0 }], sessionEvents: battle.plan.version === 2 ? [...(s.sessionEvents ?? []), sessionEvent(battle, 'session_completed', at, { activeMs: battle.activeMs ?? 0, mode: battle.plan.mode })] : s.sessionEvents, firstBattleCompletedAt: s.firstBattleCompletedAt ?? at, lastTopic: topicId, activeBattle: null, analytics: [...s.analytics, event] };
      });
    },
    defer: () => {
      const at = timestamp();
      return commit(s => {
        const decision = recommend({ availableMinutes: 5, activeTopicId: s.activeBattle?.plan.topicId, activeMode: s.activeBattle?.plan.mode, lastTopicId: s.lastTopic }, topics,
          { masteries: s.masteries, attempts: s.attempts, completedSessions: s.completedSessions, externalQuestionLogs: s.externalQuestionLogs }, at);
        if (!decision) return s;
        if (s.lastDeferredAt && Date.parse(at) - Date.parse(s.lastDeferredAt) < DAY) {
          if (s.activeBattle && s.activeBattle.phase !== 'check-in') return s;
          const plan = buildBattlePlan(s.activeBattle?.plan.id ?? randomUUID(), decision, undefined, true, s.attempts, topics, !!s.masteries[decision.topicId]?.firstClearedAt);
          return { ...s, activeBattle: { decision, plan, phase: 'check-in', blockIndex: 0, questionIndex: 0, revealed: false, attempts: [], startedAt: at } };
        }
        if (s.activeBattle && s.activeBattle.attempts.length) return s;
        return { ...s, activeBattle: null, lastDeferredAt: at, masteries: { ...s.masteries, [decision.topicId]: { ...s.masteries[decision.topicId], deferredAt: at } } };
      });
    },
    recordReturn: () => {
      const at = timestamp();
      return commit(s => {
        if (s.lastSeenAt && Date.parse(at) - Date.parse(s.lastSeenAt) < 60_000) return s;
        if (!s.firstBattleCompletedAt || s.analytics.some(e => e.name === 'returned_within_7_days')) return { ...s, lastSeenAt: at };
        const elapsed = Date.parse(at) - Date.parse(s.firstBattleCompletedAt);
        if (elapsed < DAY || elapsed > DAY * 7) return { ...s, lastSeenAt: at };
        return { ...s, lastSeenAt: at, analytics: [...s.analytics, { id: randomUUID(), name: 'returned_within_7_days', at }] };
      });
    },
  };
}
