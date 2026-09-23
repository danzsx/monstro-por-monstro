import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Minus, Plus, Scan, Move } from 'lucide-react-native';
import { Txt } from '@/ui/primitives';
import { colors as c } from '@/ui/theme';
import { fitCamera, zoomCamera } from './layout';
import type { Point } from './types';
import { WheelSurface } from './wheel-surface';

export function MapCanvas({ children, sceneWidth, sceneHeight, sceneKey, focus, onExploreZoom }: PropsWithChildren<{
  sceneWidth: number; sceneHeight: number; sceneKey: string; focus?: Point;
  onExploreZoom?: (point: Point) => void;
}>) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const scale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const start = useSharedValue({ x: 0, y: 0, scale: 1, focalX: 0, focalY: 0 });
  const fit = useMemo(() => fitCamera(size, { width: sceneWidth, height: sceneHeight }), [size, sceneWidth, sceneHeight]);
  const minScale = fit.scale * .75;
  const reset = useCallback(() => { scale.set(fit.scale); x.set(fit.x); y.set(fit.y); }, [fit, scale, x, y]);
  useEffect(() => { reset(); }, [reset, sceneKey]);
  const focusX = focus?.x;
  const focusY = focus?.y;
  useEffect(() => {
    if (focusX === undefined || focusY === undefined || !size.width) return;
    const focusedScale = Math.max(fit.scale, Math.min(.95, size.width / 560));
    scale.set(focusedScale);
    x.set(size.width / 2 - focusX * focusedScale);
    y.set(size.height / 2 - focusY * focusedScale);
  }, [focusX, focusY, size.width, size.height, fit.scale, scale, x, y]);

  const zoom = useCallback((factor: number, anchor?: Point) => {
    const point = anchor ?? { x: size.width / 2, y: size.height / 2 };
    const next = zoomCamera({ x: x.value, y: y.value, scale: scale.value }, factor, point, minScale, 2.5);
    x.set(next.x); y.set(next.y); scale.set(next.scale);
    if (onExploreZoom && next.scale > Math.max(fit.scale * 2.3, .95)) {
      onExploreZoom({ x: (point.x - next.x) / next.scale, y: (point.y - next.y) / next.scale });
    }
  }, [size, minScale, fit.scale, scale, x, y, onExploreZoom]);

  const pan = Gesture.Pan().maxPointers(1).minDistance(6).onStart(() => {
    start.set({ ...start.value, x: x.value, y: y.value });
  }).onUpdate(event => {
    x.set(Math.max(-sceneWidth * scale.value + 70, Math.min(size.width - 70, start.value.x + event.translationX)));
    y.set(Math.max(-sceneHeight * scale.value + 70, Math.min(size.height - 70, start.value.y + event.translationY)));
  });
  const pinch = Gesture.Pinch().onStart(event => {
    start.set({ x: x.value, y: y.value, scale: scale.value, focalX: event.focalX, focalY: event.focalY });
  }).onUpdate(event => {
    const next = Math.max(minScale, Math.min(2.5, start.value.scale * event.scale));
    const ratio = next / start.value.scale;
    x.set(event.focalX - (start.value.focalX - start.value.x) * ratio);
    y.set(event.focalY - (start.value.focalY - start.value.y) * ratio);
    scale.set(next);
  }).onEnd(event => {
    if (onExploreZoom && scale.value > Math.max(fit.scale * 2.3, .95)) {
      scheduleOnRN(onExploreZoom, { x: (event.focalX - x.value) / scale.value, y: (event.focalY - y.value) / scale.value });
    }
  });
  const planeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }] }));

  return <View testID="map-viewport" onLayout={e => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })} style={{ flex: 1, minHeight: 300, overflow: 'hidden', backgroundColor: '#F6F2EA' }}>
    <WheelSurface onZoom={zoom}>
      <GestureDetector gesture={Gesture.Race(pinch, pan)}>
        <View style={{ flex: 1 }} collapsable={false}>
          <Animated.View testID="map-plane" style={[{ position: 'absolute', left: 0, top: 0, width: sceneWidth, height: sceneHeight, transformOrigin: [0, 0, 0] }, planeStyle]}>{children}</Animated.View>
        </View>
      </GestureDetector>
    </WheelSurface>
    <View style={{ position: 'absolute', left: 14, bottom: 14, flexDirection: 'row', alignItems: 'center', gap: 6, padding: 9, borderRadius: 10, backgroundColor: '#FFFCF5E8', pointerEvents: 'none' }}><Move size={13} color={c.muted} /><Txt size={10} color={c.muted}>Arraste para explorar</Txt></View>
    <View style={{ position: 'absolute', bottom: 14, right: 14, flexDirection: 'row', backgroundColor: c.surface, borderRadius: 14, borderWidth: 1, borderColor: c.line, boxShadow: '0 3px 12px #28125512' }}>
      {[{ label: 'Diminuir mapa', Icon: Minus, action: () => zoom(1 / 1.45) }, { label: 'Enquadrar mapa', Icon: Scan, action: reset }, { label: 'Ampliar mapa', Icon: Plus, action: () => zoom(1.45) }].map(({ label, Icon, action }) => <Pressable key={label} accessibilityRole="button" accessibilityLabel={label} onPress={action} style={({ pressed, hovered }) => ({ width: 46, height: 46, alignItems: 'center', justifyContent: 'center', opacity: pressed ? .6 : 1, backgroundColor: hovered ? c.lavender : 'transparent', borderRadius: 13 })}><Icon size={19} color={c.purple} /></Pressable>)}
    </View>
  </View>;
}
