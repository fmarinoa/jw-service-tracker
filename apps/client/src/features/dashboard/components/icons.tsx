import type { SessionType } from '@jw-tracker/shared';
import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const CATEGORY_PATHS: Record<SessionType, string> = {
  house_to_house: 'M3 11L12 3L21 11 M5 10V21H19V10',
  revisits:
    'M4 12A8 8 0 0 1 18.5 7.5 M18.5 7.5L18.5 3 M18.5 7.5L14.5 7.5 M20 12A8 8 0 0 1 5.5 16.5 M5.5 16.5L5.5 21 M5.5 16.5L9.5 16.5',
  bible_study:
    'M12 6C10.5 4.5 8 4 5 4V17C8 17 10.5 17.5 12 19C13.5 17.5 16 17 19 17V4C16 4 13.5 4.5 12 6Z M12 6V19',
  other:
    'M21 11.5C21 16.19 16.97 20 12 20C10.5 20 9.08 19.64 7.83 19L3 20L4.5 15.5C3.55 14.15 3 12.87 3 11.5C3 6.81 7.03 3 12 3C16.97 3 21 6.81 21 11.5Z',
};

interface CategoryIconProps {
  type: SessionType;
  size?: number;
  color?: string;
}

export function CategoryIcon({
  type,
  size = 16,
  color = '#b86a3d',
}: CategoryIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={CATEGORY_PATHS[type]}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

interface TabIconProps {
  size?: number;
  color: string;
}

export function HomeIcon({ size = 21, color }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11L12 3L21 11 M5 10V21H19V10"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HistoryIcon({ size = 21, color }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Line
        x1="8"
        y1="6"
        x2="21"
        y2="6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="8"
        y1="12"
        x2="21"
        y2="12"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Line
        x1="8"
        y1="18"
        x2="21"
        y2="18"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx="3.5" cy="6" r="1.4" fill={color} />
      <Circle cx="3.5" cy="12" r="1.4" fill={color} />
      <Circle cx="3.5" cy="18" r="1.4" fill={color} />
    </Svg>
  );
}

export function AccountIcon({ size = 21, color }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} />
      <Path
        d="M4 21c0-4 4-6 8-6s8 2 8 6"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
