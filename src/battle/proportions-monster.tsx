import { memo, useId } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Circle, Defs, Ellipse, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { monsterMoodLabels } from '@/ui/monster-motion';
import { Art, Limb, useArticulatedMonster, articulatedStyles as styles, type ArticulatedMonsterProps } from './articulated-monster';

const outline = '#382055';
const line = { stroke: outline, strokeWidth: 3.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

export const ProportionsMonster = memo(function ProportionsMonster({ size = 190, mood = 'calm', reaction, active = true, evolved = false, studyRunning = false, feedback }: ArticulatedMonsterProps) {
  const { pose, root, torso, gaze, eyes, leftBrow, rightBrow, smile, grin, surprise } = useArticulatedMonster('proportions', { size, mood, reaction, active, studyRunning, feedback });
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const bodyPaint = `proportions-${id}-body`;
  const greenPaint = `proportions-${id}-green`;

  return <View testID="proportions-monster" accessible accessibilityRole="image" accessibilityLabel={`Monstro de Razões e proporções${evolved ? ', segunda forma' : ''}, ${studyRunning ? 'acompanhando seu estudo' : monsterMoodLabels[mood]}`} pointerEvents="none" style={{ width: size, height: size }}>
    <Animated.View style={[styles.piece, { width: size, height: size, transformOrigin: [size / 2, size * .85, 0] }, root]}>
      <View style={styles.piece}><Art size={size}>
        <Defs><LinearGradient id={greenPaint} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#A3DB70" /><Stop offset="1" stopColor="#4C9B64" /></LinearGradient></Defs>
        <Rect x="36" y="101" width={evolved ? 70 : 54} height="94" rx="22" fill={`url(#${greenPaint})`} {...line} />
        <Path d="M44 122 Q31 145 42 174" fill="none" stroke="#C4EAA1" strokeWidth="5" strokeLinecap="round" />
        {evolved && <><Rect x="32" y="127" width="26" height="31" rx="8" fill="#66AB66" {...line} /><Rect x="31" y="161" width="27" height="29" rx="8" fill="#66AB66" {...line} /><Path d="M37 146 L44 135 L51 146 Z M37 179 L44 169 L51 179 Z" fill="#FFF0C5" /></>}
      </Art></View>
      <Limb monsterId="proportions" size={size} pose={pose} channel="leftLeg" pivot={[92, 170]} lift="leftFootY"><Art size={size}>
        <Path d="M76 162 Q68 173 69 194 L60 211 Q57 224 71 226 L97 226 Q108 224 104 212 L109 174 Z" fill="#7950C2" {...line} />
        <Path d="M71 214 Q78 218 92 215" fill="none" stroke="#AA7EE2" strokeWidth="5" strokeLinecap="round" />
      </Art></Limb>
      <Limb monsterId="proportions" size={size} pose={pose} channel="rightLeg" pivot={[145, 170]} lift="rightFootY"><Art size={size}>
        <Path d="M131 173 L135 211 Q131 224 145 226 L171 226 Q185 224 178 212 L166 192 L163 163 Z" fill="#7141B5" {...line} />
        <Path d="M146 215 Q156 219 168 216" fill="none" stroke="#A776DA" strokeWidth="5" strokeLinecap="round" />
      </Art></Limb>
      <Animated.View style={[styles.piece, { width: size, height: size, transformOrigin: [size / 2, size * .8, 0] }, torso]}>
        <View style={styles.piece}><Art size={size}>
          <Defs><LinearGradient id={bodyPaint} x1="0" y1="0" x2="1" y2="1"><Stop offset="0" stopColor="#AC79EA" /><Stop offset={0.48} stopColor="#8750D1" /><Stop offset="1" stopColor="#6030A1" /></LinearGradient></Defs>
          <Path d="M67 111 Q52 143 62 183 Q64 201 91 202 L149 202 Q178 200 179 176 Q181 143 168 112 Z" fill={`url(#${bodyPaint})`} {...line} />
          <Ellipse cx="122" cy="164" rx="30" ry="23" fill="#B58CE8" opacity=".23" />
          <Path d={evolved ? 'M70 65 Q44 32 61 11 Q63 42 89 48 M153 47 Q179 44 181 13 Q198 35 177 68' : 'M72 65 Q51 48 61 30 Q65 50 88 53 M154 52 Q172 50 178 33 Q189 49 175 67'} fill="#7546B8" {...line} />
          <Path d="M59 93 Q61 51 102 49 Q153 40 177 73 Q192 94 178 119 Q169 136 126 138 Q81 139 64 121 Q55 110 59 93 Z" fill={`url(#${bodyPaint})`} {...line} />
          <Path d="M72 79 Q79 60 104 59" fill="none" stroke="#C09AEF" strokeWidth="7" strokeLinecap="round" opacity=".8" />
          <Ellipse cx="81" cy="115" rx="8" ry="4" fill="#D896CF" opacity=".6" /><Ellipse cx="162" cy="115" rx="8" ry="4" fill="#D896CF" opacity=".6" />
          <Path d="M73 137 L69 161 M160 137 L166 161" fill="none" stroke="#3E704D" strokeWidth="9" strokeLinecap="round" />
          <Path d="M73 136 L69 157 M160 137 L166 157" fill="none" stroke="#A5D97E" strokeWidth="5" strokeLinecap="round" />
          {evolved && <><Rect x="64" y="147" width="12" height="10" rx="3" fill="#FFEAC0" stroke={outline} strokeWidth="2" /><Rect x="158" y="147" width="12" height="10" rx="3" fill="#FFEAC0" stroke={outline} strokeWidth="2" /><Path d="M116 179 L123 168 L130 179 Z" fill="#FFEAC0" /></>}
        </Art></View>
        <Limb monsterId="proportions" size={size} pose={pose} channel="leftArm" pivot={[65, 128]}>
          <Art size={size}><Path d="M66 116 Q48 113 37 133 L33 149 Q38 159 50 153 L74 136 Z" fill="#9866D8" {...line} /></Art>
          <Limb monsterId="proportions" size={size} pose={pose} channel="leftElbow" pivot={[42, 145]}><Art size={size}>
            <Path d="M32 138 Q46 133 52 146 L52 160 Q62 172 51 181 Q38 190 27 177 Q22 169 27 158 L25 149 Q25 141 32 138 Z" fill="#9560D6" {...line} />
            <Path d="M32 171 L35 177 M39 171 L42 178" stroke="#66409D" strokeWidth="2.5" strokeLinecap="round" />
            <Path d="M33 145 Q31 151 33 156" fill="none" stroke="#BD92EB" strokeWidth="4" strokeLinecap="round" />
          </Art></Limb>
        </Limb>
        <Limb monsterId="proportions" size={size} pose={pose} channel="rightArm" pivot={[174, 128]}>
          <Art size={size}><Path d="M173 117 Q190 116 200 132 L205 147 Q203 159 190 153 L167 137 Z" fill="#7946BE" {...line} /></Art>
          <Limb monsterId="proportions" size={size} pose={pose} channel="rightElbow" pivot={[195, 145]}><Art size={size}>
            <Path d="M190 138 Q204 134 209 145 L211 160 Q219 172 208 182 Q195 188 187 176 Q182 169 189 158 L184 150 Q184 142 190 138 Z" fill="#8150C5" {...line} />
            <Path d="M197 174 L198 179 M204 172 L205 177" stroke="#57328D" strokeWidth="2.5" strokeLinecap="round" />
          </Art></Limb>
        </Limb>
        <Animated.View style={[styles.piece, { width: size, height: size, transformOrigin: [size / 2, 98 * size / 240, 0] }, eyes]}>
          <Art size={size}><Ellipse cx="100" cy="98" rx="13" ry="19" fill="#FFF2D7" stroke={outline} strokeWidth="2.5" /><Ellipse cx="144" cy="98" rx="13" ry="19" fill="#FFF2D7" stroke={outline} strokeWidth="2.5" /></Art>
          <Animated.View style={[styles.piece, gaze]}><Art size={size}><Ellipse cx="102" cy="101" rx="6" ry="10" fill={outline} /><Ellipse cx="143" cy="101" rx="6" ry="10" fill={outline} /><Circle cx="104" cy="97" r="2.5" fill="#FFF" /><Circle cx="145" cy="97" r="2.5" fill="#FFF" /></Art></Animated.View>
        </Animated.View>
        <Animated.View style={[styles.piece, { transformOrigin: [100 * size / 240, 74 * size / 240, 0], width: size, height: size }, leftBrow]}><Art size={size}><Path d="M90 74 Q99 70 108 73" fill="none" {...line} /></Art></Animated.View>
        <Animated.View style={[styles.piece, { transformOrigin: [144 * size / 240, 74 * size / 240, 0], width: size, height: size }, rightBrow]}><Art size={size}><Path d="M135 73 Q144 70 153 74" fill="none" {...line} /></Art></Animated.View>
        <Animated.View style={[styles.piece, { transformOrigin: [122 * size / 240, 120 * size / 240, 0], width: size, height: size }, smile]}><Art size={size}><Path d="M111 119 Q122 133 133 119" fill="none" {...line} /></Art></Animated.View>
        <Animated.View style={[styles.piece, grin]}><Art size={size}><Path d="M110 119 Q122 123 134 119 Q132 133 122 133 Q112 133 110 119 Z" fill={outline} /><Path d="M114 121 Q122 124 130 121 L128 125 L116 125 Z" fill="#FFF2D7" /><Ellipse cx="122" cy="130" rx="5" ry="2" fill="#ED91BE" /></Art></Animated.View>
        <Animated.View style={[styles.piece, surprise]}><Art size={size}><Ellipse cx="122" cy="123" rx="6" ry="8" fill={outline} /><Ellipse cx="122" cy="127" rx="3" ry="2" fill="#ED91BE" /></Art></Animated.View>
      </Animated.View>
    </Animated.View>
  </View>;
});
