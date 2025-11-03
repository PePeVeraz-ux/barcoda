-- ============================================
-- Actualizar imágenes de hero por categoría
-- ============================================

-- Ver las categorías actuales primero
SELECT id, name, slug, hero_image FROM categories ORDER BY name;

-- Actualizar cada categoría con su imagen correspondiente
-- Ajusta los slugs según tus categorías reales

-- Anime
UPDATE categories
SET hero_image = '/heroes/anime.png'
WHERE slug = 'anime';

-- Marvel
UPDATE categories
SET hero_image = '/heroes/marvel.png'
WHERE slug = 'marvel';

-- Star Wars
UPDATE categories
SET hero_image = '/heroes/star-wars.png'
WHERE slug = 'star-wars';

-- Transformers
UPDATE categories
SET hero_image = '/heroes/transformers.png'
WHERE slug = 'transformers';

-- Video Games
UPDATE categories
SET hero_image = '/heroes/video-games.png'
WHERE slug = 'video-games' OR slug = 'videogames';

-- Categoría por defecto (si tienes otras categorías sin imagen específica)
-- UPDATE categories
-- SET hero_image = '/heroes/default.jpg'
-- WHERE hero_image IS NULL OR hero_image = '/wallp.jpg';

-- Verificar los cambios
SELECT id, name, slug, hero_image FROM categories ORDER BY name;
