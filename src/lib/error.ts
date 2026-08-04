

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code:string, message?: string) {
    super(message || code);
    this.status = status;
    this.code = code;
  }
}


export class UNAUTHORIZED extends HttpError {
  constructor(message?: string) {
    super(401, "UNAUTHORIZED", message);
  }
}

export class CONFLICT extends HttpError {
  constructor(message?: string) {
    super(409, "CONFLICT", message);
  }
}

export class INVALID_CREDENTIALS extends HttpError {
  constructor(message?: string) {
    super(401, "INVALID_CREDENTIALS", message);
  }
}



