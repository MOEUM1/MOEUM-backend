// 레벨 공식

// 0 ~ 15레벨: 2 × 현재 레벨 + 7
// 16 ~ 30레벨: 5 × 현재 레벨 - 38
// 31레벨 이상: 9 × 현재 레벨 - 158

// 캐릭터 생성 시 시작 레벨 (character.service.ts 참고)
const START_LEVEL = 1;

/**
 * 현재 레벨에서 다음 레벨로 올라가는 데 필요한 경험치
 */
export const expToNextLevel = (level: number): number => {
    if (level <= 15) return 2 * level + 7;
    if (level <= 30) return 5 * level - 38;
    return 9 * level - 158;
};

/**
 * 누적 경험치(totalExp)를 레벨과 현재 레벨에서의 경험치(exp)로 변환
 *
 * ex) totalExp = 20 -> level 1에서 9 소모, level 2에서 11 소모 -> { level: 3, exp: 0 }
 */
export const TotalExpForLevel = (totalExp: number): { level: number; exp: number } => {
    let level = START_LEVEL;
    let exp = Math.max(0, Math.floor(totalExp));

    let need = expToNextLevel(level);
    while (exp >= need) {
        exp -= need;
        level += 1;
        need = expToNextLevel(level);
    }

    return { level, exp };
};

/**
 * 레벨/경험치를 누적 경험치로 변환 (TotalExpToLevel의 역함수)
 */
export const levelToTotalExp = (level: number, exp: number = 0): number => {
    let totalExp = exp;
    for (let l = START_LEVEL; l < level; l++) {
        totalExp += expToNextLevel(l);
    }
    return totalExp;
};
