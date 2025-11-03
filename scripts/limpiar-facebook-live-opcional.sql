-- ============================================
-- LIMPIEZA OPCIONAL: Facebook Live en Supabase
-- ============================================
-- 
-- IMPORTANTE: Este script es OPCIONAL.
-- Solo ejecútalo si quieres eliminar completamente
-- los datos de Facebook Live de tu base de datos.
--
-- Si planeas usar Facebook Live en el futuro,
-- puedes dejar los datos y simplemente no mostrarlos.
-- ============================================

-- Opción 1: Solo vaciar los valores (recomendado)
-- Los campos siguen existiendo pero vacíos
UPDATE site_config 
SET value = '' 
WHERE key IN ('facebook_live_embed', 'facebook_live_post_url');

-- Verificar
SELECT key, value FROM site_config 
WHERE key LIKE 'facebook%';


-- ============================================
-- Opción 2: Eliminar completamente los registros
-- ============================================
-- ⚠️ Solo descomenta esto si estás seguro de que
-- nunca volverás a usar Facebook Live

-- DELETE FROM site_config 
-- WHERE key IN ('facebook_live_embed', 'facebook_live_post_url');

-- Verificar
-- SELECT key, value FROM site_config 
-- WHERE key LIKE 'facebook%';
