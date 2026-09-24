export type Tonicity = 'hypo' | 'iso' | 'hyper';
export type CellKind = 'animal' | 'plant';

export function describeOsmosis(tonicity: Tonicity, cell: CellKind) {
  if (tonicity === 'iso') return { direction: '↔', label: 'Sem fluxo líquido de água', result: 'A célula mantém aproximadamente seu volume.' };
  if (tonicity === 'hypo') return cell === 'plant'
    ? { direction: '→', label: 'Água entra', result: 'A célula vegetal fica túrgida; a parede limita a expansão.' }
    : { direction: '→', label: 'Água entra', result: 'A célula animal incha; em condição extrema, pode romper.' };
  return cell === 'plant'
    ? { direction: '←', label: 'Água sai', result: 'O conteúdo celular retrai; pode ocorrer plasmólise.' }
    : { direction: '←', label: 'Água sai', result: 'A célula animal perde volume e enruga.' };
}
