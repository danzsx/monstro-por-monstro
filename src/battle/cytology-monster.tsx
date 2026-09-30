import { memo, useId } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Circle, Defs, Ellipse, LinearGradient, Path, Stop } from 'react-native-svg';
import { monsterMoodLabels } from '@/ui/monster-motion';
import { Art, Limb, useArticulatedMonster, articulatedStyles as styles, type ArticulatedMonsterProps } from './articulated-monster';

const line = { stroke: '#985369', strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
const faceLine = { ...line, stroke: '#482850' };

export const CytologyMonster = memo(function CytologyMonster({ size = 190, mood = 'calm', reaction, active = true, evolved = false, studyRunning = false, feedback }: ArticulatedMonsterProps) {
  const { pose, root, torso, gaze, eyes, leftBrow, smile, grin, surprise } = useArticulatedMonster('cytology', { size, mood, reaction, active, studyRunning, feedback });
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const membrane = `cytology-${id}-membrane`;
  const nucleus = `cytology-${id}-nucleus`;

  return <View testID="cytology-monster" accessible accessibilityRole="image" accessibilityLabel={`Monstro de Citologia${evolved ? ', segunda forma' : ''}, ${studyRunning ? 'acompanhando seu estudo' : monsterMoodLabels[mood]}`} pointerEvents="none" style={{ width: size, height: size }}>
    <Animated.View style={[styles.piece, { width: size, height: size, transformOrigin: [size / 2, size * .85, 0] }, root]}>
      <Limb monsterId="cytology" size={size} pose={pose} channel="leftLeg" pivot={[92, 170]} lift="leftFootY"><Art size={size}>
        <Path d="M76 163 Q69 179 72 194 L60 211 Q57 225 72 226 L97 226 Q109 224 104 212 L107 174 Z" fill="#E9A7A5" {...line} />
        <Path d="M70 212 Q79 219 94 215 M73 224 L75 219 M83 225 L84 220" fill="none" stroke="#FCD5BE" strokeWidth="4" strokeLinecap="round" />
      </Art></Limb>
      <Limb monsterId="cytology" size={size} pose={pose} channel="rightLeg" pivot={[145, 170]} lift="rightFootY"><Art size={size}>
        <Path d="M131 173 L135 211 Q131 224 145 226 L171 226 Q185 224 178 212 L166 192 L163 163 Z" fill="#DE929F" {...line} />
        <Path d="M144 213 Q154 219 169 216 M151 225 L151 220 M161 225 L161 220" fill="none" stroke="#F6C2B5" strokeWidth="4" strokeLinecap="round" />
      </Art></Limb>
      <Animated.View style={[styles.piece, { width: size, height: size, transformOrigin: [size / 2, size * .8, 0] }, torso]}>
        <View style={styles.piece}><Art size={size}>
          <Defs>
            <LinearGradient id={membrane} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#FFE0C8" /><Stop offset={0.5} stopColor="#F1B7AE" /><Stop offset="1" stopColor="#D985A0" /></LinearGradient>
            <LinearGradient id={nucleus} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#B586D8" /><Stop offset="1" stopColor="#754799" /></LinearGradient>
          </Defs>
          {evolved && <>
            <Path d="M60 58 Q44 45 62 30 Q76 22 89 35 Q106 16 123 32 Q150 17 164 38 Q188 31 193 54 Q212 66 195 87 Q207 109 193 128 Q208 150 188 164 Q193 190 170 194 Q162 216 140 200 Q119 214 101 201 Q80 213 70 193 Q45 192 49 171 Q28 158 45 137 Q29 120 43 101 Q27 78 49 72 Z" fill={`url(#${membrane})`} {...line} />
            <Path d="M62 44 Q77 55 84 41 M97 34 Q109 50 122 37 M143 35 Q147 55 168 48 M187 64 Q168 73 189 86 M193 105 Q174 115 189 132 M182 160 Q161 158 174 181 M143 197 Q139 179 123 195 M81 192 Q96 177 74 173 M48 150 Q68 143 50 126 M46 98 Q66 87 51 79" fill="none" stroke="#C87F9B" strokeWidth="4" strokeLinecap="round" />
          </>}
          <Path d="M70 57 Q60 37 83 36 Q99 35 106 46 Q126 26 144 45 Q165 34 180 52 Q187 63 178 75 Q198 86 184 104 Q196 123 179 137 Q190 156 172 171 Q184 190 161 196 Q145 207 132 195 Q112 208 98 193 Q78 203 67 185 Q48 176 61 158 Q43 139 60 126 Q46 105 61 92 Q46 72 70 57 Z" fill={`url(#${membrane})`} {...line} />
          <Path d="M77 51 Q91 66 102 53 M127 45 Q137 65 153 54 M170 67 Q152 80 174 90 M175 113 Q156 125 172 140 M165 168 Q145 164 151 184 M125 191 Q126 171 109 183 M77 174 Q96 159 74 150 M67 119 Q86 109 68 99 M67 80 Q82 80 78 66" fill="none" stroke="#D38B9D" strokeWidth="4" strokeLinecap="round" />
          <Path d="M73 49 Q81 44 89 49 M112 47 Q125 37 137 46 M168 54 Q174 58 172 65 M65 142 Q60 150 66 154 M158 190 Q167 188 167 181" fill="none" stroke="#FFE8D3" strokeWidth="5" strokeLinecap="round" />
          <Ellipse cx="120" cy="110" rx="47" ry="51" fill={`url(#${nucleus})`} {...faceLine} />
          <Path d="M86 87 Q90 69 111 67" fill="none" stroke="#D2ADEB" strokeWidth="6" strokeLinecap="round" />
          <Ellipse cx="89" cy="126" rx="7" ry="4" fill="#E9A2B9" opacity=".7" /><Ellipse cx="151" cy="126" rx="7" ry="4" fill="#E9A2B9" opacity=".7" />
          <Ellipse cx="76" cy="136" rx="9" ry="12" fill="#A574BB" stroke="#795082" strokeWidth="2" />
          <Ellipse cx="161" cy="155" rx="12" ry="8" fill="#AB7BC0" stroke="#795082" strokeWidth="2" />
          {evolved && <>
            <Circle cx="52" cy="91" r="10" fill="#A477BC" {...faceLine} /><Circle cx="188" cy="110" r="10" fill="#A477BC" {...faceLine} />
            <Circle cx="65" cy="158" r="7" fill="#BE8DCF" /><Circle cx="175" cy="72" r="7" fill="#BE8DCF" />
            <Path d="M53 89 L57 85 M187 107 L190 104 M82 183 Q102 174 112 185 M144 173 Q157 184 169 176" fill="none" stroke="#E2C0E8" strokeWidth="3" strokeLinecap="round" />
          </>}
        </Art></View>
        <Limb monsterId="cytology" size={size} pose={pose} channel="leftArm" pivot={[65, 128]}>
          <Art size={size}><Path d="M66 117 Q49 114 38 134 L32 149 Q38 161 50 154 L75 137 Z" fill="#F3BCB0" {...line} /><Path d="M57 125 Q47 128 44 139" fill="none" stroke="#FFE4CF" strokeWidth="5" strokeLinecap="round" /></Art>
          <Limb monsterId="cytology" size={size} pose={pose} channel="leftElbow" pivot={[42, 145]}><Art size={size}>
            <Path d="M32 138 Q46 133 52 146 L52 160 Q62 172 51 181 Q38 190 27 177 Q22 169 27 158 L25 149 Q25 141 32 138 Z" fill="#F3BCB0" {...line} />
            <Path d="M32 171 L35 177 M39 171 L42 178" fill="none" stroke="#BB7886" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M33 145 Q31 151 33 156" fill="none" stroke="#FFE4CF" strokeWidth="4" strokeLinecap="round" />
          </Art></Limb>
        </Limb>
        <Limb monsterId="cytology" size={size} pose={pose} channel="rightArm" pivot={[174, 128]}>
          <Art size={size}><Path d="M173 117 Q190 116 200 132 L205 147 Q203 159 190 153 L167 137 Z" fill="#E7A1A5" {...line} /></Art>
          <Limb monsterId="cytology" size={size} pose={pose} channel="rightElbow" pivot={[195, 145]}><Art size={size}>
            <Path d="M190 138 Q204 134 209 145 L211 160 Q219 172 208 182 Q195 188 187 176 Q182 169 189 158 L184 150 Q184 142 190 138 Z" fill="#E7A1A5" {...line} />
            <Path d="M197 174 L198 179 M204 172 L205 177" fill="none" stroke="#BB7886" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M194 145 Q199 145 201 151" fill="none" stroke="#FAD0BC" strokeWidth="4" strokeLinecap="round" />
          </Art></Limb>
        </Limb>
        <Animated.View testID="cytology-eye" style={[styles.piece, { width: size, height: size, transformOrigin: [size / 2, 103 * size / 240, 0] }, eyes]}>
          <Art size={size}><Ellipse cx="120" cy="103" rx="19" ry="25" fill="#FFF0CE" {...faceLine} /></Art>
          <Animated.View style={[styles.piece, gaze]}><Art size={size}><Ellipse cx="121" cy="106" rx="9" ry="14" fill="#482850" /><Circle cx="124" cy="101" r="4" fill="#FFF" /><Circle cx="118" cy="112" r="2" fill="#AE81C1" /></Art></Animated.View>
        </Animated.View>
        <Animated.View style={[styles.piece, { width: size, height: size, transformOrigin: [120 * size / 240, 74 * size / 240, 0] }, leftBrow]}><Art size={size}><Path d="M105 74 Q119 66 135 73" fill="none" {...faceLine} /></Art></Animated.View>
        <Animated.View style={[styles.piece, { width: size, height: size, transformOrigin: [120 * size / 240, 137 * size / 240, 0] }, smile]}><Art size={size}><Path d="M109 135 Q120 148 131 135" fill="none" {...faceLine} /></Art></Animated.View>
        <Animated.View style={[styles.piece, grin]}><Art size={size}><Path d="M107 134 Q120 140 133 134 Q131 149 120 149 Q109 149 107 134 Z" fill="#482850" /><Path d="M111 137 Q120 141 129 137 L127 141 L113 141 Z" fill="#FFF0CE" /><Ellipse cx="120" cy="146" rx="5" ry="2" fill="#F1A3BF" /></Art></Animated.View>
        <Animated.View style={[styles.piece, surprise]}><Art size={size}><Ellipse cx="120" cy="139" rx="6" ry="8" fill="#482850" /><Ellipse cx="120" cy="143" rx="3" ry="2" fill="#F1A3BF" /></Art></Animated.View>
      </Animated.View>
    </Animated.View>
  </View>;
});
