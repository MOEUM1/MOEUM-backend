import type { GameType } from "../generated/prisma/enums.js";

// 게임 1판당 획득 경험치
//
// lib/level.ts 공식 기준 누적 경험치는 다음과 같다.
//   레벨 10 ->   153
//   레벨 20 ->   543
//   레벨 30 -> 1,388
//   레벨 40 -> 2,913
//
// 판당 평균 약 11exp가 되도록 잡아서 레벨 40까지 대략 265판이 필요하다.
// 레벨 10은 약 14판이면 닿아 초반 성장감은 살리고, 40은 확실히 어렵게 만든 값이다.

export const GAME_EXP: Record<GameType, { base: number; accuracyBonus: number }> = {
    CARD: { base: 6, accuracyBonus: 6 },   // 6 ~ 12
    QUIZ: { base: 8, accuracyBonus: 7 },   // 8 ~ 15
    CHAT: { base: 12, accuracyBonus: 0 },  // 정확도 지표가 없어 고정
};


/**
 * @param accuracy 0~1 사이의 정답률. 지표가 없는 게임은 생략한다.
 */
export const calcGameExp = (type: GameType, accuracy: number = 0): number => {
    const { base, accuracyBonus } = GAME_EXP[type];
    const clamped = Math.min(1, Math.max(0, Number.isFinite(accuracy) ? accuracy : 0));
    return base + Math.round(accuracyBonus * clamped);
};
