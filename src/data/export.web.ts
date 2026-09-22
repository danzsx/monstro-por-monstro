export async function exportProgress(value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'minha-jornada-monstro.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
