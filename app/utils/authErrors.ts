interface AuthErrorLike {
  message?: unknown;
  details?: unknown;
  statusText?: unknown;
}

function toNonEmptyString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function getBodyMessage(details: unknown): string | undefined {
  if (!details || typeof details !== "object") return undefined;
  const body = (details as { body?: unknown }).body;
  if (!body || typeof body !== "object") return undefined;
  return toNonEmptyString((body as { message?: unknown }).message);
}

function extractMessage(error: unknown): string | undefined {
  if (!error) return undefined;
  if (error instanceof Error) return toNonEmptyString(error.message);
  if (typeof error === "string") return toNonEmptyString(error);
  if (typeof error !== "object") return undefined;

  const authError = error as AuthErrorLike;
  return (
    toNonEmptyString(authError.message) ||
    getBodyMessage(authError.details) ||
    toNonEmptyString(authError.statusText)
  );
}

function matches(message: string, patterns: string[]): boolean {
  const normalized = message.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

export function getLoginErrorMessage(error: unknown): string {
  const message = extractMessage(error);
  if (!message) return "Unable to log in. Please try again.";

  if (
    matches(message, [
      "invalid credentials",
      "invalid email or password",
      "email or password",
      "wrong password",
    ])
  ) {
    return "Invalid email or password.";
  }

  if (matches(message, ["too many requests", "rate limit"])) {
    return "Too many login attempts. Please wait and try again.";
  }

  return message;
}

export function getRegisterErrorMessage(error: unknown): string {
  const message = extractMessage(error);
  if (!message) return "Unable to register right now. Please try again.";

  if (
    matches(message, [
      "user already exists",
      "account already exists",
      "email already exists",
      "already in use",
    ])
  ) {
    return "An account with this email already exists.";
  }

  if (matches(message, ["registration is closed"])) {
    return "Registration is currently closed.";
  }

  if (
    matches(message, [
      "at least 6",
      "minimum password length",
      "password must be at least",
    ])
  ) {
    return "Password must be at least 6 characters.";
  }

  if (matches(message, ["too many requests", "rate limit"])) {
    return "Too many registration attempts. Please wait and try again.";
  }

  return message;
}
