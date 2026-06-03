import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { updateGlicko, newRated, DEFAULT_RATING, DEFAULT_RD, DEFAULT_SIGMA } from '@/engine/rating';
import type { Rated } from '@/engine/types';
import {
  ACHIEVEMENTS,
  BELTS,
  beltFor,
  type Belt,
  type TimeControl,
  type AchievementDef,
  FREE_DAILY_RATED,
} from '@/lib/constants';
import { audio } from '@/audio/engine';

type ControlRatings = Record<TimeControl, Rated>;

interface RatingPoint {
  date: string;
  rating: number;
}

export interface SolveInput {
  mode: 'rated' | 'zen';
  control: TimeControl | null;
  won: boolean;
  puzzle: Rated;
  timeSeconds: number;
  mistakes: number;
  hintsUsed: number;
}

export interface SolveOutcome {
  ratingBefore: number;
  ratingAfter: number;
  ratingDelta: number;
  beltAdvanced: Belt | null;
  newAchievements: AchievementDef[];
}

interface PlayerStore {
  userId: string | null;
  nickname: string;
  rating: number;
  rd: number;
  sigma: number;
  ratingByControl: ControlRatings;
  beltKey: Belt['key'];
  puzzlesSolved: number;
  gamesPlayed: number;
  wins: number;
  totalSolveTime: number;
  dailyStreak: number;
  bestStreak: number;
  lastSolvedDate: string | null;
  achievements: string[];
  ratingHistory: RatingPoint[];
  isPremium: boolean;
  dailyRatedDate: string | null;
  dailyRatedUsed: number;
  onboarded: boolean;

  // derived helpers
  belt: () => Belt;
  ratedRemainingToday: () => number;
  canPlayRated: () => boolean;

  // actions
  setNickname: (n: string) => void;
  setUserId: (id: string | null) => void;
  setPremium: (p: boolean) => void;
  completeOnboarding: (nickname: string, seedRating: number) => void;
  hydrateFrom: (partial: Partial<PlayerStore>) => void;
  startRated: () => void;
  commitResult: (input: SolveInput) => SolveOutcome;
  reset: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

const initialControls = (): ControlRatings => ({
  bullet: newRated(),
  blitz: newRated(),
  rapid: newRated(),
});

const INITIAL = {
  userId: null,
  nickname: 'Deshi',
  rating: DEFAULT_RATING,
  rd: DEFAULT_RD,
  sigma: DEFAULT_SIGMA,
  ratingByControl: initialControls(),
  beltKey: 'white' as Belt['key'],
  puzzlesSolved: 0,
  gamesPlayed: 0,
  wins: 0,
  totalSolveTime: 0,
  dailyStreak: 0,
  bestStreak: 0,
  lastSolvedDate: null,
  achievements: [] as string[],
  ratingHistory: [] as RatingPoint[],
  isPremium: false,
  dailyRatedDate: null,
  dailyRatedUsed: 0,
  onboarded: false,
};

export const usePlayer = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...INITIAL,

      belt: () => BELTS.find((b) => b.key === get().beltKey) ?? BELTS[0],
      ratedRemainingToday: () => {
        const s = get();
        if (s.isPremium) return Infinity;
        const used = s.dailyRatedDate === today() ? s.dailyRatedUsed : 0;
        return Math.max(0, FREE_DAILY_RATED - used);
      },
      canPlayRated: () => get().ratedRemainingToday() > 0,

      setNickname: (n) => set({ nickname: n.slice(0, 20) }),
      setUserId: (id) => set({ userId: id }),
      setPremium: (p) => set({ isPremium: p }),
      completeOnboarding: (nickname, seedRating) => {
        const ratingByControl: ControlRatings = {
          bullet: newRated(seedRating),
          blitz: newRated(seedRating),
          rapid: newRated(seedRating),
        };
        set({
          nickname: nickname.slice(0, 20) || 'Deshi',
          onboarded: true,
          rating: seedRating,
          ratingByControl,
          beltKey: beltFor(seedRating, 0).key,
        });
      },
      hydrateFrom: (partial) => set(partial),

      startRated: () => {
        const s = get();
        const isToday = s.dailyRatedDate === today();
        set({
          dailyRatedDate: today(),
          dailyRatedUsed: (isToday ? s.dailyRatedUsed : 0) + 1,
          gamesPlayed: s.gamesPlayed + 1,
        });
      },

      commitResult: (input) => {
        const s = get();
        const before = s.rating;

        // Zen never affects rating, streak, or solved stats beyond practice.
        if (input.mode === 'zen') {
          return {
            ratingBefore: before,
            ratingAfter: before,
            ratingDelta: 0,
            beltAdvanced: null,
            newAchievements: [],
          };
        }

        const control = input.control!;
        const prev = s.ratingByControl[control];
        const updated = updateGlicko(prev, input.puzzle, input.won ? 1.0 : 0.0);
        const ratingByControl: ControlRatings = { ...s.ratingByControl, [control]: updated };
        const overall = Math.max(...Object.values(ratingByControl).map((r) => r.rating));

        // Streak + solved counters only move on a win.
        let { puzzlesSolved, dailyStreak, bestStreak, wins, totalSolveTime } = s;
        let lastSolvedDate = s.lastSolvedDate;
        const ratingHistory = s.ratingHistory.slice();

        if (input.won) {
          puzzlesSolved += 1;
          wins += 1;
          totalSolveTime += input.timeSeconds;
          const t = today();
          if (lastSolvedDate === t) {
            // already counted today
          } else if (lastSolvedDate && daysBetween(lastSolvedDate, t) === 1) {
            dailyStreak += 1;
          } else {
            dailyStreak = 1;
          }
          lastSolvedDate = t;
          bestStreak = Math.max(bestStreak, dailyStreak);
          ratingHistory.push({ date: new Date().toISOString(), rating: overall });
          if (ratingHistory.length > 60) ratingHistory.shift();
        } else {
          dailyStreak = 0;
          ratingHistory.push({ date: new Date().toISOString(), rating: overall });
          if (ratingHistory.length > 60) ratingHistory.shift();
        }

        // Belt advancement.
        const newBelt = beltFor(overall, puzzlesSolved);
        const prevBeltIndex = BELTS.findIndex((b) => b.key === s.beltKey);
        const newBeltIndex = BELTS.findIndex((b) => b.key === newBelt.key);
        const beltAdvanced = newBeltIndex > prevBeltIndex ? newBelt : null;

        // Achievements.
        const earned = new Set(s.achievements);
        const newlyEarned: AchievementDef[] = [];
        const award = (key: string): void => {
          if (!earned.has(key)) {
            earned.add(key);
            const def = ACHIEVEMENTS.find((a) => a.key === key);
            if (def) newlyEarned.push(def);
          }
        };
        if (input.won) {
          if (puzzlesSolved >= 1) award('first_solve');
          if (dailyStreak >= 7) award('streak_7');
          if (input.mistakes === 0 && input.hintsUsed === 0) award('perfect_solve');
          if (control === 'bullet' && input.timeSeconds < 90) award('speed_solve');
          if (puzzlesSolved >= 100) award('century');
        }

        set({
          ratingByControl,
          rating: overall,
          rd: updated.rd,
          sigma: updated.sigma,
          beltKey: newBelt.key,
          puzzlesSolved,
          wins,
          totalSolveTime,
          dailyStreak,
          bestStreak,
          lastSolvedDate,
          ratingHistory,
          achievements: [...earned],
        });

        if (beltAdvanced) audio.play('belt');
        if (newlyEarned.length) audio.play('stamp');

        return {
          ratingBefore: before,
          ratingAfter: overall,
          ratingDelta: overall - before,
          beltAdvanced,
          newAchievements: newlyEarned,
        };
      },

      reset: () => set({ ...INITIAL, ratingByControl: initialControls(), ratingHistory: [] }),
    }),
    { name: 'dojo-player' },
  ),
);
