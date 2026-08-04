export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message?: string, details?: unknown) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}


// ---------- 400 ----------

export class BAD_REQUEST extends HttpError {
  constructor(message?: string) {
    super(400, "BAD_REQUEST", message ?? "잘못된 요청입니다");
  }
}

export class VALIDATION_ERROR extends HttpError {
  constructor(message?: string, details?: unknown) {
    super(400, "VALIDATION_ERROR", message ?? "요청이 형식에 맞지 않습니다", details);
  }
}

export class NO_CATEGORY extends HttpError {
  constructor(message?: string) {
    super(400, "NO_CATEGORY", message ?? "학습 분야가 설정되어 있지 않습니다");
  }
}

export class NO_HISTORY extends HttpError {
  constructor(message?: string) {
    super(400, "NO_HISTORY", message ?? "분석할 학습 기록이 없습니다");
  }
}


// ---------- 401 ----------

export class UNAUTHORIZED extends HttpError {
  constructor(message?: string) {
    super(401, "UNAUTHORIZED", message ?? "인증이 필요합니다");
  }
}

export class INVALID_CREDENTIALS extends HttpError {
  constructor(message?: string) {
    super(401, "INVALID_CREDENTIALS", message ?? "로그인 실패");
  }
}


// ---------- 403 ----------

export class FORBIDDEN extends HttpError {
  constructor(message?: string) {
    super(403, "FORBIDDEN", message ?? "권한이 없습니다");
  }
}


// ---------- 404 ----------

export class NOT_FOUND extends HttpError {
  constructor(message?: string) {
    super(404, "NOT_FOUND", message ?? "대상을 찾을 수 없습니다");
  }
}

export class NOT_FOUND_USER extends HttpError {
  constructor(message?: string) {
    super(404, "NOT_FOUND_USER", message ?? "사용자를 찾을 수 없습니다");
  }
}

export class NOT_FOUND_CHARACTER extends HttpError {
  constructor(message?: string) {
    super(404, "NOT_FOUND_CHARACTER", message ?? "캐릭터를 찾을 수 없습니다");
  }
}

export class NOT_FOUND_HISTORY extends HttpError {
  constructor(message?: string) {
    super(404, "NOT_FOUND_HISTORY", message ?? "학습 기록을 찾을 수 없습니다");
  }
}


// ---------- 409 ----------

export class CONFLICT extends HttpError {
  constructor(message?: string) {
    super(409, "CONFLICT", message ?? "이미 존재합니다");
  }
}


// ---------- 503 ----------

/** OpenAI 등 외부 API 호출 실패. 서버 내부 오류(500)와 구분한다. */
export class AI_UNAVAILABLE extends HttpError {
  constructor(message?: string) {
    super(503, "AI_UNAVAILABLE", message ?? "AI 서비스를 일시적으로 사용할 수 없습니다");
  }
}
