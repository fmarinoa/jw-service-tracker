import { describe, it, expect } from 'vitest';
import {
  timeToMinutes,
  minutesToTime,
  sumEntries,
  formatDuration,
  PreachingEntry,
} from './index';

describe('Shared Utilities - Time & Hours Math', () => {
  describe('timeToMinutes', () => {
    it('should convert hours and minutes to total minutes correctly', () => {
      expect(timeToMinutes(1, 30)).toBe(90);
      expect(timeToMinutes(0, 45)).toBe(45);
      expect(timeToMinutes(2, 0)).toBe(120);
      expect(timeToMinutes(0, 0)).toBe(0);
    });
  });

  describe('minutesToTime', () => {
    it('should convert total minutes back to hours and minutes correctly', () => {
      expect(minutesToTime(90)).toEqual({ hours: 1, minutes: 30 });
      expect(minutesToTime(45)).toEqual({ hours: 0, minutes: 45 });
      expect(minutesToTime(120)).toEqual({ hours: 2, minutes: 0 });
      expect(minutesToTime(0)).toEqual({ hours: 0, minutes: 0 });
    });
  });

  describe('sumEntries', () => {
    it('should sum all preaching metrics and aggregate time accurately', () => {
      const entries: PreachingEntry[] = [
        {
          id: '1',
          userId: 'user-1',
          preachingDate: 1717545600000,
          hours: 1,
          minutes: 45,
          type: 'house_to_house',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        {
          id: '2',
          userId: 'user-1',
          preachingDate: 1717545600000 + 86400000,
          hours: 2,
          minutes: 20,
          type: 'revisits',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];

      const result = sumEntries(entries);

      expect(result.hours).toBe(4);
      expect(result.minutes).toBe(5);
      expect(result.totalMinutes).toBe(245);
      expect(result.byType).toEqual({
        house_to_house: 105,
        revisits: 140,
        bible_study: 0,
        other: 0,
      });
    });
  });

  describe('formatDuration', () => {
    it('should format minutes to readable string', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(125)).toBe('2h 05m');
      expect(formatDuration(0)).toBe('0m');
    });
  });
});
