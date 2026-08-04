import type { GameType } from "../generated/prisma/enums.js";

// 판당 평균 약 11exp. 레벨 40(누적 2,913exp)까지 약 265판이 걸린다.
export const GAME_EXP: Record<GameType, { base: number; accuracyBonus: number }> = {
    CARD: { base: 6, accuracyBonus: 6 },
    QUIZ: { base: 8, accuracyBonus: 7 },
    CHAT: { base: 12, accuracyBonus: 0 },
};


/** @param accuracy 0~1 정답률. 지표가 없는 게임(CHAT)은 생략한다. */
export const calcGameExp = (type: GameType, accuracy: number = 0): number => {
    const { base, accuracyBonus } = GAME_EXP[type];
    const clamped = Math.min(1, Math.max(0, Number.isFinite(accuracy) ? accuracy : 0));
    return base + Math.round(accuracyBonus * clamped);
};
