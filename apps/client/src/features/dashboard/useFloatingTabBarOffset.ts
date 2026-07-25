import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const TAB_BAR_CONTENT_HEIGHT = 56;

export function getFloatingTabBarHeight() {
  return Math.max(70, TAB_BAR_CONTENT_HEIGHT + 12);
}

export function getFloatingTabBarBottomOffset(insetBottom: number) {
  return Math.max(24, insetBottom + 8);
}

export function useFloatingTabBarClearance() {
  const insets = useSafeAreaInsets();
  return (
    getFloatingTabBarBottomOffset(insets.bottom) + getFloatingTabBarHeight()
  );
}
