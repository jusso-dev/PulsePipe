type LogLevel = "info" | "warn" | "error";

export function log(level: LogLevel, message: string, fields: Record<string, unknown> = {}) {
  const entry = {
    level,
    message,
    time: new Date().toISOString(),
    ...fields
  };
  const writer = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  writer(JSON.stringify(entry));
}

export function getRequestId(request: Request) {
  return request.headers.get("x-request-id") ?? crypto.randomUUID();
}
