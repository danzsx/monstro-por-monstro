import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { ArrowDown, Droplets, Dna, Zap } from 'lucide-react-native';
import { Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import type { FigureId } from '../../shared/interactive-module';
import { describeOsmosis, type CellKind, type Tonicity } from './osmosis';

const hues = { bacteria: '#E5EDCF', animal: '#F3DFD2', plant: '#DDEFD9' };

function Switches<T extends string>({ choices, value, onChange }: { choices: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }} accessibilityRole="tablist">{choices.map(choice => <Pressable key={choice.value} accessibilityRole="tab" accessibilityLabel={choice.label} accessibilityState={{ selected: value === choice.value }} onPress={() => onChange(choice.value)} style={{ minHeight: 44, justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: value === choice.value ? c.purple : c.line, backgroundColor: value === choice.value ? c.lavender : c.surface, paddingHorizontal: 13 }}><Txt size={12} weight="bold" color={c.purple}>{choice.label}</Txt></Pressable>)}</View>;
}

function CellTypes() {
  const [kind, setKind] = useState<'bacteria' | 'animal' | 'plant'>('bacteria');
  const detail = {
    bacteria: { label: 'Bactéria', notes: ['DNA em nucleoide, sem núcleo delimitado', 'Ribossomos, membrana e citoplasma', 'Parede celular na maioria das bactérias'], shape: 'A organização é procariótica.' },
    animal: { label: 'Célula animal', notes: ['Núcleo com DNA', 'Organelas como mitocôndrias e Golgi', 'Sem parede celular'], shape: 'A organização é eucariótica.' },
    plant: { label: 'Célula vegetal', notes: ['Núcleo e organelas', 'Parede celular, cloroplastos e vacúolo central', 'Também possui mitocôndrias'], shape: 'A organização é eucariótica.' },
  }[kind];
  return <View style={{ gap: 16 }}>
    <Switches choices={[{ value: 'bacteria', label: 'Bactéria' }, { value: 'animal', label: 'Animal' }, { value: 'plant', label: 'Vegetal' }]} value={kind} onChange={setKind} />
    <View accessibilityLabel={`Esquema autoral de ${detail.label}. ${detail.notes.join('. ')}.`} style={{ height: 195, backgroundColor: '#F9F6F2', borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <View accessible={false} style={{ width: kind === 'bacteria' ? 118 : 150, height: kind === 'bacteria' ? 150 : 150, borderRadius: kind === 'plant' ? 22 : 100, borderWidth: kind === 'animal' ? 3 : 9, borderColor: kind === 'animal' ? c.purple : '#669565', backgroundColor: hues[kind], alignItems: 'center', justifyContent: 'center' }}>
        {kind === 'bacteria' ? <View style={{ gap: 5, alignItems: 'center' }}><Dna size={29} color={c.purple} /><Txt size={11} weight="bold" color={c.purple}>DNA livre</Txt></View> : <View style={{ width: 71, height: 71, borderRadius: 40, borderWidth: 3, borderColor: c.purple, backgroundColor: '#FBF8FF', alignItems: 'center', justifyContent: 'center' }}><Dna size={24} color={c.purple} /><Txt size={10} weight="bold" color={c.purple}>núcleo</Txt></View>}
        {kind === 'plant' && <View style={{ position: 'absolute', left: 9, top: 18, width: 23, height: 39, borderRadius: 15, backgroundColor: '#57A867' }} />}
        {kind !== 'bacteria' && <View style={{ position: 'absolute', right: 11, bottom: 18, width: 29, height: 18, borderRadius: 12, backgroundColor: '#D98D62' }} />}
      </View>
    </View>
    <Txt size={13} weight="bold" color={c.purple}>{detail.shape}</Txt>
    <View style={{ gap: 7 }}>{detail.notes.map(note => <Txt size={13} key={note}>• {note}</Txt>)}</View>
  </View>;
}

function MembraneTransport() {
  const [mode, setMode] = useState<'simple' | 'channel' | 'pump'>('simple');
  const content = {
    simple: { label: 'Difusão simples', top: 'mais O₂', bottom: 'menos O₂', middle: 'bicamada', note: 'O₂ atravessa a bicamada a favor do gradiente. Não há gasto direto de ATP.' },
    channel: { label: 'Difusão facilitada', top: 'mais íons', bottom: 'menos íons', middle: 'canal', note: 'O íon usa uma proteína específica e segue o gradiente, sem gasto direto de ATP.' },
    pump: { label: 'Transporte ativo', top: 'menos íons', bottom: 'mais íons', middle: 'bomba + ATP', note: 'A proteína usa energia para manter um gradiente. Aqui, o transporte ocorre contra a tendência de difusão.' },
  }[mode];
  return <View style={{ gap: 15 }}>
    <Switches choices={[{ value: 'simple', label: 'Direto' }, { value: 'channel', label: 'Canal' }, { value: 'pump', label: 'Bomba' }]} value={mode} onChange={setMode} />
    <View accessibilityLabel={`${content.label}: ${content.note}`} style={{ borderRadius: 18, backgroundColor: '#F8F5FB', padding: 18, gap: 12, alignItems: 'center' }}>
      <Txt size={12} weight="bold" color={c.purple}>MEIO EXTERNO · {content.top}</Txt>
      <View accessible={false} style={{ width: '100%', maxWidth: 370, height: 70, borderTopWidth: 10, borderBottomWidth: 10, borderColor: '#9A85B9', justifyContent: 'center', alignItems: 'center', backgroundColor: '#EEE8F6' }}>
        <View style={{ minWidth: 105, height: 51, borderRadius: 12, backgroundColor: mode === 'simple' ? '#EEE8F6' : '#6D4F9E', alignItems: 'center', justifyContent: 'center' }}><ArrowDown size={19} color={mode === 'simple' ? c.purple : '#FFFFFF'} /><Txt size={11} weight="bold" color={mode === 'simple' ? c.purple : '#FFFFFF'}>{content.middle}</Txt></View>
      </View>
      <Txt size={12} weight="bold" color={c.purple}>INTERIOR · {content.bottom}</Txt>
    </View>
    <Txt size={13}>{content.note}</Txt>
  </View>;
}

function Osmosis() {
  const [tonicity, setTonicity] = useState<Tonicity>('iso');
  const [cell, setCell] = useState<CellKind>('animal');
  const result = describeOsmosis(tonicity, cell);
  const size = tonicity === 'hypo' ? 117 : tonicity === 'hyper' ? 78 : 98;
  return <View style={{ gap: 14 }}>
    <Switches choices={[{ value: 'hypo', label: 'Meio hipotônico' }, { value: 'iso', label: 'Isotônico' }, { value: 'hyper', label: 'Hipertônico' }]} value={tonicity} onChange={setTonicity} />
    <Switches choices={[{ value: 'animal', label: 'Célula animal' }, { value: 'plant', label: 'Célula vegetal' }]} value={cell} onChange={setCell} />
    <View accessibilityLabel={`${cell === 'animal' ? 'Célula animal' : 'Célula vegetal'} em meio ${tonicity === 'hypo' ? 'hipotônico' : tonicity === 'iso' ? 'isotônico' : 'hipertônico'}. ${result.label}. ${result.result}`} style={{ height: 175, borderRadius: 18, backgroundColor: '#EAF3F7', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
      <Txt size={11} weight="bold" color={c.purple}>ÁGUA AO REDOR</Txt>
      <View accessible={false} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}><Droplets size={27} color="#397B9F" /><Txt size={28} weight="bold" color="#397B9F">{result.direction}</Txt><View style={{ width: cell === 'plant' ? 124 : size, height: cell === 'plant' ? 124 : size, borderRadius: cell === 'plant' ? 18 : size, borderWidth: cell === 'plant' ? 8 : 3, borderColor: cell === 'plant' ? '#5F8E5D' : c.purple, backgroundColor: cell === 'plant' ? '#D9ECD0' : '#EBDCEF', alignItems: 'center', justifyContent: 'center' }}><View style={{ width: cell === 'plant' ? size - 18 : 21, height: cell === 'plant' ? size - 18 : 21, borderRadius: 40, backgroundColor: cell === 'plant' ? '#ACD5A4' : c.purple }} /></View></View>
    </View>
    <Txt size={13} weight="bold" color={c.purple}>{result.label}</Txt><Txt size={13}>{result.result}</Txt>
  </View>;
}

function CellWorkflow() {
  const [flow, setFlow] = useState<'energy' | 'protein'>('energy');
  const parts = flow === 'energy' ? ['Moléculas orgânicas', 'Respiração celular', 'ATP para atividades'] : ['DNA', 'RNA mensageiro', 'Proteína no ribossomo'];
  return <View style={{ gap: 15 }}>
    <Switches choices={[{ value: 'energy', label: 'Energia' }, { value: 'protein', label: 'Proteínas' }]} value={flow} onChange={setFlow} />
    <View accessibilityLabel={`${flow === 'energy' ? 'Fluxo da energia' : 'Fluxo da informação'}: ${parts.join(' para ')}.`} style={{ backgroundColor: '#F8F5FB', borderRadius: 18, padding: 17, gap: 10, alignItems: 'center' }}>
      {flow === 'energy' ? <Zap color={c.greenDark} size={25} /> : <Dna color={c.purple} size={25} />}
      {parts.map((part, index) => <View key={part} style={{ alignItems: 'center', width: '100%', gap: 8 }}><View style={{ width: '100%', maxWidth: 300, padding: 13, borderRadius: 13, borderWidth: 1, borderColor: c.line, backgroundColor: index === 2 ? c.softGreen : c.surface, alignItems: 'center' }}><Txt size={13} weight="bold" color={c.purple}>{part}</Txt></View>{index < 2 && <ArrowDown size={18} color={c.purple} />}</View>)}
    </View>
    <Txt size={13}>{flow === 'energy' ? 'A glicólise ocorre no citoplasma; em eucariontes, mitocôndrias participam das etapas seguintes.' : 'A transcrição produz RNA; a tradução nos ribossomos monta a cadeia de aminoácidos.'}</Txt>
  </View>;
}

export function ModuleFigure({ id }: { id: FigureId }) {
  switch (id) {
    case 'cell-types': return <CellTypes />;
    case 'membrane-transport': return <MembraneTransport />;
    case 'osmosis': return <Osmosis />;
    case 'cell-workflow': return <CellWorkflow />;
  }
}
