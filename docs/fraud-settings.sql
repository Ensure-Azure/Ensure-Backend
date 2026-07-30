-- Configuración inicial del motor de scoring.
-- Es idempotente: conserva valores que ya hayan sido ajustados por un administrador.

INSERT INTO fraud_settings (
  setting_key,
  setting_value,
  description
)
VALUES
  (
    'scoreThreshold',
    '60'::jsonb,
    'Puntaje mínimo para marcar una transacción como fraude.'
  ),
  (
    'velocityWindowMinutes',
    '3'::jsonb,
    'Ventana de tiempo para evaluar velocidad transaccional.'
  ),
  (
    'velocityMaxTransactions',
    '8'::jsonb,
    'Cantidad de transacciones que activa la regla de velocidad.'
  ),
  (
    'atypicalAmountMultiplier',
    '10'::jsonb,
    'Multiplicador del promedio histórico para monto atípico.'
  ),
  (
    'atypicalAmountMinimumSamples',
    '3'::jsonb,
    'Mínimo de transacciones históricas requeridas.'
  ),
  (
    'impossibleTravelMaxKmh',
    '900'::jsonb,
    'Velocidad máxima plausible para la regla geográfica.'
  ),
  (
    'riskyMerchantDefaultPoints',
    '20'::jsonb,
    'Puntos para un comercio de riesgo sin puntaje específico.'
  )
ON CONFLICT (setting_key) DO NOTHING;
