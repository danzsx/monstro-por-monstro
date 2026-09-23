import type { PropsWithChildren } from 'react';
import { View } from 'react-native';
import type { Point } from './types';
export type WheelSurfaceProps = PropsWithChildren<{ onZoom: (factor: number, anchor: Point) => void }>;
export function WheelSurface({ children }: WheelSurfaceProps) {
  return <View style={{ flex: 1 }}>{children}</View>;
}
