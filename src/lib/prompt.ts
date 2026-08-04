// 프롬프트에 실어 보낼 학습 맥락의 최대 길이.
// analyzeGames는 "최소 (게임수 x 200)자 이상"으로 총평을 만들기 때문에
// 그대로 넣으면 매 문제 생성마다 토큰이 계속 불어난다.
export const MAX_CONTEXT_CHARS = 2000;


export const trimContext = (context: string): string => {
    const trimmed = context.trim();
    if (trimmed.length <= MAX_CONTEXT_CHARS) return trimmed;
    return trimmed.slice(0, MAX_CONTEXT_CHARS) + "...";
};


/**
 * 문제 생성 프롬프트 앞에 사용자 학습 맥락을 덧붙인다.
 * 맥락이 없으면(첫 게임) 원본 프롬프트를 그대로 돌려준다.
 */
export const withUserContext = (context: string, prompt: string): string => {
    const trimmed = trimContext(context);
    if (!trimmed) return prompt;

    return [
        "아래는 이 사용자의 지금까지 학습 기록을 분석한 내용이야.",
        "문제를 낼 때 이걸 반영해서, 이미 충분히 아는 건 덜 묻고 약한 부분을 더 깊게 물어봐.",
        "",
        "--- 사용자 학습 분석 ---",
        trimmed,
        "--- 분석 끝 ---",
        "",
        prompt,
    ].join("\n");
};
