const MAX_ENTRIES = 50;

interface LogEntry {
  timestamp: string;
  context: string;
  message: string;
  stack?: string;
}

const errors: LogEntry[] = [];

export function logError(context: string, error: unknown): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    context,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  };
  errors.unshift(entry);
  if (errors.length > MAX_ENTRIES) {
    errors.pop();
  }
  console.error(`[${context}]`, error);
}

export function getErrors(): string[] {
  return errors.map(
    (e) =>
      `[${e.timestamp}] ${e.context}: ${e.message}${e.stack ? '\n' + e.stack : ''}`
  );
}

export function clearErrors(): void {
  errors.length = 0;
}
