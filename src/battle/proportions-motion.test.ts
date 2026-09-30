import { proportionsPose } from './proportions-motion';

test('o ciclo de estudo fecha suavemente e articula membros e rosto', () => {
  const start = proportionsPose(0, 'calm', true);
  const end = proportionsPose(12, 'calm', true);
  for (const key of Object.keys(start) as (keyof typeof start)[]) expect(end[key]).toBeCloseTo(start[key], 6);
  const step = proportionsPose(1.25, 'calm', true);
  expect(step.leftLeg).toBeGreaterThan(10);
  expect(step.rightLeg).toBeLessThan(-10);
  expect(step.leftFootY).toBeLessThan(0);
  expect(step.rightFootY).toBeCloseTo(0);
  const wave = proportionsPose(4.1, 'calm', true);
  expect(wave.leftArm).toBeGreaterThan(90);
  expect(wave.rightArm).toBeCloseTo(0);
  expect(proportionsPose(8, 'calm', true).rightArm).toBeLessThan(-120);
  expect(proportionsPose(1.95, 'calm', true).eyes).toBeCloseTo(.08);
  expect(proportionsPose(6.4, 'calm', true).gaze).toBeLessThan(-3);
});

test('reações substituem o ciclo e diferenciam golpe, recuo e comemoração', () => {
  const attack = proportionsPose(4, 'ready', false, undefined, 'attack', .43);
  const recoil = proportionsPose(4, 'ready', false, 'correct', 'recoil', .43);
  const celebrate = proportionsPose(4, 'friendly', false, undefined, 'celebrate', .45);
  expect(attack.x).toBeLessThan(0);
  expect(attack.leftArm).toBeGreaterThan(90);
  expect(recoil.x).toBeGreaterThan(0);
  expect(recoil.surprise).toBe(1);
  expect(celebrate.y).toBeCloseTo(-14);
  expect(celebrate.leftArm).toBeCloseTo(145);
  expect(celebrate.rightArm).toBeCloseTo(-145);
  expect(celebrate.smile).toBe(1);
  expect(proportionsPose(8, 'ready', false, undefined, 'attack', .43)).toEqual(attack);
});

test('a expressão reconhece acerto e erro e não depende do movimento', () => {
  expect(proportionsPose(0, 'ready', false, 'correct').smile).toBe(1);
  expect(proportionsPose(0, 'ready', false, 'incorrect').brows).toBeLessThan(0);
  expect(proportionsPose(0, 'calm', false).leftLeg).toBe(0);
  expect(proportionsPose(0, 'calm', false).eyes).toBe(1);
});
