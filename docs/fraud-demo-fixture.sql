-- Configuración reproducible para demostrar una transacción marcada como fraude.
-- Ejecutar una sola vez en PostgreSQL de Azure antes de repetir la prueba.

INSERT INTO fraud_settings (
  setting_key,
  setting_value,
  description
)
VALUES
  ('scoreThreshold', '60'::jsonb, 'Umbral de demostración.'),
  ('velocityWindowMinutes', '3'::jsonb, 'Ventana de velocidad.'),
  ('velocityMaxTransactions', '8'::jsonb, 'Máximo de transacciones.'),
  ('atypicalAmountMultiplier', '10'::jsonb, 'Multiplicador de monto atípico.'),
  ('atypicalAmountMinimumSamples', '3'::jsonb, 'Muestras históricas mínimas.'),
  ('impossibleTravelMaxKmh', '900'::jsonb, 'Velocidad máxima plausible.'),
  ('riskyMerchantDefaultPoints', '35'::jsonb, 'Puntaje por comercio de riesgo.')
ON CONFLICT (setting_key) DO UPDATE
SET
  setting_value = EXCLUDED.setting_value,
  description = EXCLUDED.description,
  updated_at = NOW();

INSERT INTO risk_merchants (
  merchant_id,
  merchant_name,
  category_code,
  risk_points,
  reason,
  active
)
VALUES (
  'merchant-final-risk',
  'Compra Internacional',
  '7995',
  35,
  'Comercio de riesgo configurado para la prueba de fraude.',
  true
)
ON CONFLICT (merchant_id) DO UPDATE
SET
  merchant_name = EXCLUDED.merchant_name,
  category_code = EXCLUDED.category_code,
  risk_points = EXCLUDED.risk_points,
  reason = EXCLUDED.reason,
  active = true,
  updated_at = NOW();
