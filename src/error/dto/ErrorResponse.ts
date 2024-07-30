export class ErrorResponse {
  readonly timestamp: string;
  readonly error: unknown;

  static fromError(error: unknown, fallbackMessage: string): ErrorResponse {
    const message = typeof error === 'object' && error && 'message' in error ? error.message : fallbackMessage;

    return {
      timestamp: Date.now().toString(),
      error: {
        message,
      },
    };
  }
}
