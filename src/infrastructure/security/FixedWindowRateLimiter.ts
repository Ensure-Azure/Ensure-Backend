export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
};

type Counter = {
  count: number;
  windowStartedAt: number;
};

export class FixedWindowRateLimiter {
  private readonly counters = new Map<string, Counter>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  check(key: string, now = Date.now()): RateLimitResult {
    this.removeExpiredCounters(now);

    const current = this.counters.get(key);
    const counter =
      !current || now - current.windowStartedAt >= this.windowMs
        ? { count: 0, windowStartedAt: now }
        : current;

    if (counter.count >= this.limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil(
          (counter.windowStartedAt + this.windowMs - now) / 1000,
        ),
      );

      return {
        allowed: false,
        limit: this.limit,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    counter.count += 1;
    this.counters.set(key, counter);

    return {
      allowed: true,
      limit: this.limit,
      remaining: this.limit - counter.count,
      retryAfterSeconds: 0,
    };
  }

  private removeExpiredCounters(now: number): void {
    for (const [key, counter] of this.counters) {
      if (now - counter.windowStartedAt >= this.windowMs) {
        this.counters.delete(key);
      }
    }
  }
}
