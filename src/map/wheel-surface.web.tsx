import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import type { WheelSurfaceProps } from './wheel-surface';

export function WheelSurface({ children, onZoom }: WheelSurfaceProps) {
  const ref = useRef<View>(null);
  useEffect(() => {
    const element = ref.current as unknown as HTMLElement | null;
    if (!element?.addEventListener) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const box = element.getBoundingClientRect();
      onZoom(Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * .004), { x: event.clientX - box.left, y: event.clientY - box.top });
    };
    element.addEventListener('wheel', wheel, { passive: false });
    return () => element.removeEventListener('wheel', wheel);
  }, [onZoom]);
  return <View ref={ref} style={{ flex: 1 }}>{children}</View>;
}
