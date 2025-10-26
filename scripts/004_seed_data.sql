-- Insert sample categories
INSERT INTO public.categories (name, slug) VALUES
  ('Marvel', 'marvel'),
  ('DC Comics', 'dc-comics'),
  ('Star Wars', 'star-wars'),
  ('Anime', 'anime'),
  ('Video Games', 'video-games')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, description, price, image_url, category_id, stock) VALUES
  (
    'Spider-Man (Classic)',
    'Figura de acción de Spider-Man con traje clásico. Incluye accesorios y múltiples puntos de articulación.',
    49.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'marvel'),
    15
  ),
  (
    'Iron Man Mark 85',
    'Figura premium de Iron Man con armadura Mark 85. Detalles metálicos y efectos luminosos.',
    89.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'marvel'),
    8
  ),
  (
    'Batman (Dark Knight)',
    'Figura de Batman basada en The Dark Knight. Capa de tela y accesorios incluidos.',
    54.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'dc-comics'),
    12
  ),
  (
    'Darth Vader',
    'Figura coleccionable de Darth Vader con sable de luz y efectos de sonido.',
    69.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'star-wars'),
    10
  ),
  (
    'Goku Super Saiyan',
    'Figura articulada de Goku en forma Super Saiyan. Incluye efectos de energía.',
    44.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'anime'),
    20
  ),
  (
    'Master Chief',
    'Figura de Master Chief de Halo con armadura detallada y armas.',
    59.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'video-games'),
    7
  ),
  (
    'Captain America',
    'Figura de Captain America con escudo magnético y traje detallado.',
    52.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'marvel'),
    14
  ),
  (
    'Wonder Woman',
    'Figura de Wonder Woman con lazo de la verdad y accesorios.',
    49.99,
    '/placeholder.svg?height=400&width=400',
    (SELECT id FROM public.categories WHERE slug = 'dc-comics'),
    11
  )
ON CONFLICT DO NOTHING;
