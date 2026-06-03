import { create } from 'zustand';
import { beltFor, type BeltKey } from '@/lib/constants';

export interface LeaderRow {
  rank: number;
  nickname: string;
  rating: number;
  beltKey: BeltKey;
  weekly: number;
  streak: number;
  isPlayer?: boolean;
}

export type LeaderTab = 'global' | 'friends' | 'difficulty';

interface Entry {
  nickname: string;
  rating: number;
  weekly: number;
  streak: number;
  friend: boolean;
}

// Fictional roster (no real social data). The current player is slotted by
// rating at render time.
const ROSTER: Entry[] = [
  { nickname: 'Hayato', rating: 2010, weekly: 84, streak: 41, friend: false },
  { nickname: 'Yuki', rating: 1920, weekly: 76, streak: 30, friend: true },
  { nickname: 'Kenji', rating: 1845, weekly: 70, streak: 22, friend: false },
  { nickname: 'Mei', rating: 1788, weekly: 65, streak: 18, friend: true },
  { nickname: 'Ren', rating: 1702, weekly: 61, streak: 15, friend: false },
  { nickname: 'Sora', rating: 1655, weekly: 58, streak: 12, friend: false },
  { nickname: 'Aoi', rating: 1590, weekly: 54, streak: 19, friend: true },
  { nickname: 'Takumi', rating: 1521, weekly: 49, streak: 8, friend: false },
  { nickname: 'Nao', rating: 1488, weekly: 47, streak: 11, friend: false },
  { nickname: 'Haru', rating: 1430, weekly: 44, streak: 7, friend: true },
  { nickname: 'Emi', rating: 1377, weekly: 40, streak: 5, friend: false },
  { nickname: 'Riku', rating: 1322, weekly: 37, streak: 9, friend: false },
  { nickname: 'Kaede', rating: 1280, weekly: 33, streak: 4, friend: true },
  { nickname: 'Touma', rating: 1240, weekly: 30, streak: 6, friend: false },
  { nickname: 'Sakura', rating: 1190, weekly: 27, streak: 3, friend: false },
  { nickname: 'Daiki', rating: 1140, weekly: 24, streak: 2, friend: false },
  { nickname: 'Mio', rating: 1095, weekly: 21, streak: 5, friend: true },
  { nickname: 'Yuto', rating: 1040, weekly: 18, streak: 1, friend: false },
  { nickname: 'Hana', rating: 990, weekly: 15, streak: 2, friend: false },
  { nickname: 'Kai', rating: 930, weekly: 12, streak: 1, friend: false },
];

interface LeaderboardStore {
  tab: LeaderTab;
  setTab: (t: LeaderTab) => void;
  rows: (params: {
    playerNickname: string;
    playerRating: number;
    playerWeekly: number;
    playerStreak: number;
    playerPuzzles: number;
    isPremium: boolean;
  }) => { rows: LeaderRow[]; playerRow: LeaderRow | null };
}

export const useLeaderboard = create<LeaderboardStore>((set, get) => ({
  tab: 'global',
  setTab: (t) => set({ tab: t }),
  rows: ({ playerNickname, playerRating, playerWeekly, playerStreak, playerPuzzles, isPremium }) => {
    const tab: LeaderTab = get().tab;
    let pool = ROSTER;
    if (tab === 'friends') pool = ROSTER.filter((e) => e.friend);

    const entries: Entry[] = pool.map((e) => ({ ...e }));
    if (isPremium) {
      entries.push({
        nickname: playerNickname,
        rating: playerRating,
        weekly: playerWeekly,
        streak: playerStreak,
        friend: true,
      });
    }
    entries.sort((a, b) => b.rating - a.rating);

    const rows: LeaderRow[] = entries.map((e, i) => ({
      rank: i + 1,
      nickname: e.nickname,
      rating: e.rating,
      beltKey: beltFor(e.rating, e.nickname === playerNickname ? playerPuzzles : 200).key,
      weekly: e.weekly,
      streak: e.streak,
      isPlayer: isPremium && e.nickname === playerNickname,
    }));

    const playerRow = rows.find((r) => r.isPlayer) ?? null;
    return { rows: rows.slice(0, 20), playerRow };
  },
}));
