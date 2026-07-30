# Security controls for intake and scoring

## Rate limit

`POST /api/transactions` allows up to 60 requests from one origin in one minute. The origin comes from the first value of `X-Forwarded-For`. Azure App Service sets this value when it sends the request to the app. If the origin sends too many requests, the API returns `429 Too Many Requests`. It also returns `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining`.

The limit protects the budget. Each accepted transaction can send an event and start the scoring engine. Sixty requests per minute is enough for a demo load, but it does not allow unlimited traffic. The counter is in the memory of one app instance. So the limit works per App Service instance. If the service uses many instances, use one shared counter before using this as a global limit.

## Required scoring settings

The engine does not use default values. Before it scores a transaction, these values must exist in `fraud_settings`. Each value must be a positive number:

- `scoreThreshold`
- `velocityWindowMinutes`
- `velocityMaxTransactions`
- `atypicalAmountMultiplier`
- `atypicalAmountMinimumSamples`
- `impossibleTravelMaxKmh`
- `riskyMerchantDefaultPoints`

If one value is missing or not valid, the transaction gets the `FAILED` status. The server logs an error, and `POST /api/events/transactions` returns `503`. This helps the team see the problem. It does not leave transactions without analysis in silence.

The first settings are in `docs/fraud-settings.sql`. The script only adds missing keys. It does not replace values changed by an admin.
