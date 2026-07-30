# Controles de seguridad de ingesta y scoring

## Límite de tasa

`POST /api/transactions` admite como máximo 60 solicitudes por origen en una ventana fija de un minuto. El origen se obtiene del primer valor de `X-Forwarded-For`, que Azure App Service establece al reenviar la solicitud. Al exceder el límite, la API responde `429 Too Many Requests` e incluye `Retry-After`, `X-RateLimit-Limit` y `X-RateLimit-Remaining`.

El límite protege el presupuesto: cada transacción aceptada puede publicar un evento y activar el motor de scoring. Sesenta solicitudes por minuto permite una carga de demostración sostenida sin permitir ráfagas ilimitadas. El contador reside en memoria de la instancia, por lo que el límite se aplica por instancia de App Service. Si el servicio se escala horizontalmente, debe sustituirse por un contador compartido antes de tratarlo como un límite global.

## Configuración obligatoria de scoring

El motor no usa valores por defecto. Antes de puntuar una transacción, exige que existan en `fraud_settings` y tengan un número positivo los siguientes valores:

- `scoreThreshold`
- `velocityWindowMinutes`
- `velocityMaxTransactions`
- `atypicalAmountMultiplier`
- `atypicalAmountMinimumSamples`
- `impossibleTravelMaxKmh`
- `riskyMerchantDefaultPoints`

Si falta o es inválido alguno, la transacción queda con estado `FAILED`, se registra un error en el servidor y `POST /api/events/transactions` devuelve `503`. Así una configuración incompleta no deja transacciones sin analizar de forma silenciosa.

La configuración inicial está en `docs/fraud-settings.sql`. El script solo inserta claves ausentes y no sobrescribe los valores que un administrador haya ajustado.
