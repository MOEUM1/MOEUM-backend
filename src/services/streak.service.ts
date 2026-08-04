import { prisma } from "../lib/prisma.js";


const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** KST 기준 일자 인덱스. 같은 날이면 같은 값. */
export const toKstDayIndex = (date: Date) => Math.floor((date.getTime() + KST_OFFSET_MS) / DAY_MS);


export const getStreakByUserId = async (userId: string) => {
    return await prisma.userStreak.findUnique({ where: { userId } })
}


/** 오늘 이미 기록됐으면 유지, 어제면 +1, 그 외에는 1로 초기화한다. */
export const touchStreak = async (userId: string) => {
    const now = new Date();
    const today = toKstDayIndex(now);

    const streak = await prisma.userStreak.findUnique({ where: { userId } });

    if (!streak) {
        return await prisma.userStreak.create({ data: { userId, count: 1, lastDate: now } })
    }

    const last = streak.lastDate ? toKstDayIndex(streak.lastDate) : null;
    if (last === today) return streak;

    const count = last !== null && today - last === 1 ? streak.count + 1 : 1;

    return await prisma.userStreak.update({
        where: { userId },
        data: { count, lastDate: now },
    })
}


export const isStudiedToday = (lastDate: Date | null) => {
    if (!lastDate) return false;
    return toKstDayIndex(lastDate) === toKstDayIndex(new Date());
}
