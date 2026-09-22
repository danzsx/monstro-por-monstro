import { Share } from 'react-native';
export async function exportProgress(value: unknown) { await Share.share({ title: 'Minha jornada — Monstro por Monstro', message: JSON.stringify(value, null, 2) }); }
