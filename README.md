#  Barcoda - E-commerce de Figuras de Acción

Tienda en línea moderna para la venta de figuras de acción coleccionables, construida con Next.js 16, React, TypeScript y Supabase.

##  Características

### Para Usuarios
- **Autenticación completa** con email/contraseña y Google OAuth
- **Carrito de compras** persbarcodaistente
- **Catálogo de productos** con categorías y búsqueda
- **Checkout con WhatsApp** para confirmar pedidos
- **Diseño 100% responsivo** (mobile-first)
- **Historial de órdenes**

### Para Administradores
- 👨‍💼 **Panel de administración** intuitivo
- 📊 **Dashboard con métricas** (productos, órdenes, ingresos, usuarios)
- ➕ **CRUD completo de productos**
- 📦 **Gestión de órdenes** con estados
- 🔒 **Rutas protegidas** por rol
- 📸 **Subida de imágenes** a Cloudflare R2 con preview

## Tecnologías

- **Framework:** Next.js 16 (App Router)
- **Frontend:** React 18 + TypeScript
- **Estilos:** Tailwind CSS v4
- **UI Components:** shadcn/ui + Radix UI
- **Backend:** Supabase (PostgreSQL + Auth)
- **Storage:** Cloudflare R2 + Workers
- **Formularios:** React Hook Form + Zod
- **Iconos:** Lucide React

## Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase
- Cuenta de Cloudflare (para R2 y Workers)
- Número de WhatsApp Business (opcional)

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/barcoda.git
cd barcoda
```

### 2. Instalar dependencias

```bash
npm install
# o
pnpm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key

# WhatsApp (formato: código_país + número sin espacios)
NEXT_PUBLIC_WHATSAPP_NUMBER=5215512345678

# Cloudflare R2 Worker
NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=https://tu-worker.workers.dev
```

### 4. Configurar Supabase

#### a) Crear las tablas

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Tabla de perfiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de carritos
CREATE TABLE carts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items del carrito
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de órdenes
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de órdenes
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### b) Configurar Row Level Security (RLS)

Ver el archivo `scripts/nuclear-fix-rls.sql` para las políticas RLS completas.

#### c) Configurar autenticación con Google

1. Ve a Authentication > Providers en Supabase
2. Habilita Google OAuth
3. Configura las credenciales de Google Cloud Console

#### d) Crear un usuario administrador

```sql
-- Reemplaza con tu email
UPDATE profiles 
SET role = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com');
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
barcoda/
├── app/                      # App Router de Next.js
│   ├── admin/               # Rutas del panel de administración
│   ├── auth/                # Autenticación (login, registro)
│   ├── cart/                # Carrito de compras
│   ├── checkout/            # Proceso de pago
│   ├── orders/              # Historial de órdenes
│   ├── products/            # Catálogo de productos
│   └── page.tsx             # Página principal
├── components/              # Componentes reutilizables
│   ├── ui/                  # Componentes de shadcn/ui
│   ├── navbar.tsx           # Barra de navegación
│   ├── product-card.tsx     # Tarjeta de producto
│   └── ...
├── lib/                     # Utilidades y configuración
│   └── supabase/            # Cliente de Supabase
├── hooks/                   # Custom hooks
├── public/                  # Archivos estáticos
└── styles/                  # Estilos globales
```

## Roles y Permisos

### Usuario Regular (`user`)
- Ver productos y categorías
- Agregar productos al carrito
- Realizar órdenes
- Ver su historial de órdenes

### Administrador (`admin`)
- Todas las funciones de usuario regular
- Acceso al panel de administración (`/admin`)
- Crear, editar y eliminar productos
- Ver todas las órdenes
- Ver estadísticas de la tienda

## ☁️ Configurar Cloudflare R2 (Almacenamiento de Imágenes)

### 1. Crear Bucket R2

1. Ve a tu dashboard de Cloudflare
2. Navega a **R2 Object Storage**
3. Crea un nuevo bucket (ej: `barcoda-images`)
4. Configura el acceso público (opcional):
   - Settings > Public Access
   - Habilita "Allow Access"
   - Copia el dominio público (ej: `https://pub-xxxxx.r2.dev`)

### 2. Crear Worker para Upload

1. Ve a **Workers & Pages**
2. Crea un nuevo Worker
3. Copia el código de `cloudflare-worker-example.js`
4. Despliega el Worker

### 3. Configurar Bindings

1. En tu Worker, ve a **Settings > Variables**
2. Agrega un **R2 Bucket Binding**:
   - Variable name: `BARCODA_BUCKET`
   - R2 bucket: Selecciona tu bucket

### 4. Configurar Dominio del Worker

1. Ve a **Triggers** en tu Worker
2. Copia la URL del Worker (ej: `https://barcoda-api.pepeveras845.workers.dev`)
3. Agrégala a tu `.env.local`:
   ```env
   NEXT_PUBLIC_CLOUDFLARE_WORKER_URL=https://tu-worker.workers.dev
   ```

### 5. Probar la Subida

1. Ve a `/admin/products/new` en tu app
2. Haz clic en "Subir Imagen"
3. Selecciona una imagen
4. Verifica que se suba correctamente

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno
3. Despliega

### Otras plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js 16+.

## Scripts Disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Linter
```

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT.

## Autor

Tu Nombre - [@tu_usuario](https://github.com/tu-usuario)

## Agradecimientos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
