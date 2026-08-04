// 분석 총평은 계속 길어지므로 프롬프트에 싣기 전에 자른다.
export const MAX_CONTEXT_CHARS = 2000;


export const trimContext = (context: string): string => {
    const trimmed = context.trim();
    return trimmed.length <= MAX_CONTEXT_CHARS ? trimmed : trimmed.slice(0, MAX_CONTEXT_CHARS) + "...";
};


/** 문제 생성 프롬프트 앞에 학습 맥락을 붙인다. 맥락이 없으면 원본을 그대로 반환한다. */
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
