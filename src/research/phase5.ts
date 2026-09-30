/** Offline research only. None of these outputs may alter the learner recommendation. */
import { createHash } from 'node:crypto';
export interface CodedExamItem {
  number: number;
  reviewerA: { id: string; topicId: string | null };
  reviewerB: { id: string; topicId: string | null };
  adjudication?: { topicId: string | null; note: string };
}
export interface ExamBooklet {
  id: string;
  year: number;
  application: string;
  area: string;
  sourceUrl: string;
  expectedItemCount: number;
  items: CodedExamItem[];
}

const officialUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'download.inep.gov.br' ||
      url.hostname === 'www.gov.br' && url.pathname.startsWith('/inep/'));
  } catch { return false; }
};

export function incidenceByExam(booklets: ExamBooklet[]) {
  const ids = new Set<string>(), applications = new Set<string>();
  return booklets.map(booklet => {
    const applicationKey = `${booklet.year}\u0000${booklet.application}\u0000${booklet.area}`;
    if (!booklet.id || ids.has(booklet.id) || applications.has(applicationKey) || !officialUrl(booklet.sourceUrl) ||
      !Number.isInteger(booklet.expectedItemCount) || booklet.expectedItemCount <= 0 ||
      booklet.items.length !== booklet.expectedItemCount) throw new Error(`Corpus incompleto ou duplicado: ${booklet.id}`);
    ids.add(booklet.id);
    applications.add(applicationKey);
    const numbers = new Set<number>();
    const counts: Record<string, number> = {};
    for (const item of booklet.items) {
      if (!Number.isInteger(item.number) || numbers.has(item.number) || !item.reviewerA.id ||
        !item.reviewerB.id || item.reviewerA.id === item.reviewerB.id) throw new Error(`Codificação inválida: ${booklet.id}`);
      numbers.add(item.number);
      const agreement = item.reviewerA.topicId === item.reviewerB.topicId;
      if (!agreement && (!item.adjudication || !item.adjudication.note.trim()))
        throw new Error(`Divergência sem adjudicação: ${booklet.id}/${item.number}`);
      const topic = agreement ? item.reviewerA.topicId : item.adjudication!.topicId;
      if (topic) counts[topic] = (counts[topic] ?? 0) + 1;
    }
    return { examId: booklet.id, year: booklet.year, application: booklet.application, area: booklet.area,
      sourceUrl: booklet.sourceUrl, denominator: booklet.expectedItemCount,
      topics: Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b))
        .map(([id, count]) => [id, { count, share: count / booklet.expectedItemCount }])),
      unclassified: booklet.expectedItemCount - Object.values(counts).reduce((sum, count) => sum + count, 0) };
  });
}

export interface ResearchAttempt {
  participantId: string; questionId: string; itemVersion: number | null; source: 'diagnostic' | 'entry' | 'practice' | 'review';
  assisted: boolean; correct: boolean | null; at: string;
}

/** First independent exposure per person/item/version, then separated by practice vs review. */
export function aggregateItemErrors(attempts: ResearchAttempt[], minimumParticipants = 30) {
  if (!Number.isInteger(minimumParticipants) || minimumParticipants < 30) throw new Error('Mínimo de participantes abaixo de 30.');
  const missingVersion = attempts.filter(a => (a.source === 'practice' || a.source === 'review') && a.itemVersion == null).length;
  const first = new Map<string, ResearchAttempt>();
  for (const attempt of [...attempts].sort((a, b) => a.at.localeCompare(b.at))) {
    if (!attempt.participantId || !attempt.questionId || !Number.isInteger(attempt.itemVersion) ||
      attempt.itemVersion! <= 0 || attempt.assisted || attempt.correct === null ||
      (attempt.source !== 'practice' && attempt.source !== 'review')) continue;
    const key = `${attempt.participantId}\u0000${attempt.questionId}\u0000${attempt.itemVersion}`;
    if (!first.has(key)) first.set(key, attempt);
  }
  const groups = new Map<string, ResearchAttempt[]>();
  for (const attempt of first.values()) {
    const key = `${attempt.questionId}\u0000${attempt.itemVersion}\u0000${attempt.source}`;
    groups.set(key, [...(groups.get(key) ?? []), attempt]);
  }
  const released = [] as { questionId: string; itemVersion: number; source: 'practice' | 'review'; participants: number; errorRate: number }[];
  let suppressedGroups = 0;
  for (const [key, group] of groups) {
    const errors = group.filter(a => a.correct === false).length;
    if (group.length < minimumParticipants || errors < 5 || group.length - errors < 5) { suppressedGroups++; continue; }
    const [questionId, version, source] = key.split('\u0000');
    released.push({ questionId, itemVersion: Number(version), source: source as 'practice' | 'review',
      participants: group.length, errorRate: errors / group.length });
  }
  return { released: released.sort((a, b) => a.questionId.localeCompare(b.questionId) || a.itemVersion - b.itemVersion),
    suppressedGroups, missingVersion };
}

/** Screening only; a positive result still requires a psychometrician and model diagnostics. */
export function calibrationReadiness(attempts: ResearchAttempt[]) {
  const first = new Map<string, ResearchAttempt>();
  for (const attempt of [...attempts].sort((a, b) => a.at.localeCompare(b.at))) {
    if (!attempt.participantId || !attempt.questionId || !Number.isInteger(attempt.itemVersion) ||
      attempt.itemVersion! <= 0 || attempt.assisted || attempt.correct === null ||
      (attempt.source !== 'practice' && attempt.source !== 'review')) continue;
    const key = `${attempt.participantId}\u0000${attempt.questionId}\u0000${attempt.itemVersion}`;
    if (!first.has(key)) first.set(key, attempt);
  }
  const byItem = new Map<string, ResearchAttempt[]>();
  const byPerson = new Map<string, Set<string>>();
  for (const attempt of first.values()) {
    const item = `${attempt.questionId}\u0000${attempt.itemVersion}`;
    byItem.set(item, [...(byItem.get(item) ?? []), attempt]);
    if (!byPerson.has(attempt.participantId)) byPerson.set(attempt.participantId, new Set());
    byPerson.get(attempt.participantId)!.add(attempt.questionId);
  }
  const connectedPeople = [...byPerson.values()].filter(items => items.size >= 5).length;
  const adequatelyObservedItems = [...byItem.values()].filter(group => {
    if (group.length < 200) return false;
    const accuracy = group.filter(attempt => attempt.correct).length / group.length;
    return accuracy >= .05 && accuracy <= .95;
  }).length;
  const reasons: string[] = [];
  if (connectedPeople < 200) reasons.push('Menos de 200 participantes responderam pelo menos cinco itens distintos.');
  if (adequatelyObservedItems < 10) reasons.push('Menos de dez itens versionados têm 200 respostas independentes e variação de acerto.');
  return { readyForExpertReview: reasons.length === 0, connectedPeople, adequatelyObservedItems, reasons };
}

export interface ExperimentParticipant {
  id: string;
  arm: 'baseline' | 'candidate';
  entryOpened: boolean;
  firstSessionCompleted: boolean;
  returnedWithin7Days: boolean | null;
  independentCorrect: number;
  independentTotal: number;
}
export interface ExperimentPlan { id: string; minPerArm: number; maxComprehensionDrop: number; maxReturnDrop: number; }

/** Stable 1:1 assignment for pseudonymous enrollment IDs, before observing outcomes. */
export function assignedArm(experimentId: string, participantId: string): ExperimentParticipant['arm'] {
  if (!experimentId || !participantId) throw new Error('Identificador experimental ausente.');
  const firstByte = createHash('sha256').update(`${experimentId}\u0000${participantId}`).digest()[0];
  return firstByte % 2 === 0 ? 'baseline' : 'candidate';
}

function wilson(successes: number, total: number): [number, number] {
  if (!total) return [0, 1];
  const z = 1.96, p = successes / total, z2 = z * z, d = 1 + z2 / total;
  const middle = (p + z2 / (2 * total)) / d;
  const radius = z * Math.sqrt(p * (1 - p) / total + z2 / (4 * total * total)) / d;
  return [Math.max(0, middle - radius), Math.min(1, middle + radius)];
}

/** Conservative decision: candidate needs clear start gain and no comprehension regression. */
export function evaluatePolicyExperiment(plan: ExperimentPlan, people: ExperimentParticipant[]) {
  if (!plan.id || !Number.isInteger(plan.minPerArm) || plan.minPerArm < 30 ||
    plan.maxComprehensionDrop < 0 || plan.maxComprehensionDrop > .1 ||
    plan.maxReturnDrop < 0 || plan.maxReturnDrop > .1) throw new Error('Plano experimental inválido.');
  if (new Set(people.map(person => person.id)).size !== people.length) throw new Error('Participante duplicado.');
  if (people.some(person => assignedArm(plan.id, person.id) !== person.arm)) throw new Error('Atribuição experimental divergente.');
  const arms = (['baseline', 'candidate'] as const).map(arm => {
    const group = people.filter(person => person.arm === arm && person.entryOpened);
    const completed = group.filter(person => person.firstSessionCompleted).length;
    const observedReturn = group.filter(person => person.returnedWithin7Days !== null);
    if (group.some(person => person.independentCorrect > person.independentTotal || person.independentCorrect < 0 || person.independentTotal < 0))
      throw new Error('Desempenho inválido.');
    const observedComprehension = group.filter(person => person.independentTotal >= 5);
    const comprehensionPassed = observedComprehension.filter(person => person.independentCorrect / person.independentTotal >= .8).length;
    const returned = observedReturn.filter(person => person.returnedWithin7Days).length;
    return { arm, entrants: group.length, completed, startRate: group.length ? completed / group.length : null,
      startInterval: wilson(completed, group.length), returnEligible: observedReturn.length,
      returnRate: observedReturn.length ? returned / observedReturn.length : null,
      returnInterval: wilson(returned, observedReturn.length),
      comprehensionParticipants: observedComprehension.length,
      comprehensionRate: observedComprehension.length ? comprehensionPassed / observedComprehension.length : null,
      comprehensionInterval: wilson(comprehensionPassed, observedComprehension.length) };
  });
  const [baseline, candidate] = arms;
  const ready = arms.every(arm => arm.entrants >= plan.minPerArm && arm.returnEligible >= plan.minPerArm &&
    arm.comprehensionParticipants >= plan.minPerArm);
  const startGainLowerBound = candidate.startInterval[0] - baseline.startInterval[1];
  const comprehensionLowerBound = candidate.comprehensionInterval[0] - baseline.comprehensionInterval[1];
  const returnLowerBound = candidate.returnInterval[0] - baseline.returnInterval[1];
  return { policy: plan.id, arms, ready, startGainLowerBound, comprehensionLowerBound, returnLowerBound,
    decision: ready && startGainLowerBound > 0 && comprehensionLowerBound >= -plan.maxComprehensionDrop && returnLowerBound >= -plan.maxReturnDrop
      ? 'candidate-eligible-for-review' as const : 'keep-baseline' as const };
}
