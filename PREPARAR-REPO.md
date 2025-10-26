# 📦 Checklist para Subir al Repositorio

## ✅ Verificaciones Antes de Subir

### 1. Archivos Sensibles Protegidos
- [x] `.env` está en `.gitignore`
- [x] `.env.example` existe con valores de ejemplo
- [x] Scripts SQL están en `.gitignore`
- [x] Cloudflare workers de ejemplo están en `.gitignore`

### 2. Archivos de Configuración
- [x] `.gitignore` configurado correctamente
- [x] `README.md` actualizado
- [x] `package.json` con todas las dependencias

### 3. Código Limpio
- [x] No hay `console.log()` innecesarios (algunos son útiles para debug)
- [x] No hay TODOs críticos pendientes
- [x] Código formateado correctamente

### 4. Documentación
- [x] README con instrucciones de instalación
- [x] Documentación de setup de Cloudflare
- [x] Instrucciones para admin
- [x] Troubleshooting guides

---

## 🚀 Pasos para Subir al Repositorio

### 1. Verificar Estado Actual

```bash
git status
```

**Estado actual:** HEAD detached, working tree clean

### 2. Volver a la Rama Main

```bash
git checkout main
```

### 3. Crear Rama para Nuevas Funciones

```bash
git checkout -b feature/mejoras-v2
```

### 4. Agregar Todos los Cambios

```bash
git add .
```

### 5. Verificar Qué se Va a Subir

```bash
git status
```

**Asegúrate que NO se incluyan:**
- ❌ `.env` (archivo con credenciales reales)
- ❌ `node_modules/`
- ❌ `.next/`
- ❌ Scripts SQL con datos sensibles

**Debe incluirse:**
- ✅ `.env.example`
- ✅ Todos los componentes nuevos
- ✅ Archivos de configuración
- ✅ Documentación

### 6. Hacer Commit

```bash
git commit -m "feat: Implementar múltiples imágenes, características, dark mode y optimizaciones

- Agregar soporte para múltiples imágenes por producto
- Agregar características específicas por producto (JSONB)
- Implementar dark mode con next-themes
- Agregar imagen de fondo al hero
- Optimizar rendimiento (eliminar router.refresh innecesario)
- Crear componentes: ProductImageGallery, MultiImageUpload, FeaturesEditor, ProductFeatures, ThemeToggle
- Resolver bug de iconos que desaparecían
- Mejorar sistema de órdenes para admin"
```

### 7. Hacer Push

```bash
git push origin feature/mejoras-v2
```

### 8. Crear Pull Request (Opcional)

Si trabajas con equipo, crea un PR en GitHub/GitLab.

### 9. Merge a Main

```bash
git checkout main
git merge feature/mejoras-v2
git push origin main
```

---

## 📋 Archivos Nuevos Creados

### Componentes
- ✅ `components/product-image-gallery.tsx`
- ✅ `components/multi-image-upload.tsx`
- ✅ `components/features-editor.tsx`
- ✅ `components/product-features.tsx`
- ✅ `components/theme-toggle.tsx`
- ✅ `hooks/use-refresh.ts`

### Scripts
- ✅ `scripts/add-product-features.sql`
- ✅ `scripts/fix-orders-rls.sql`

### Documentación
- ✅ `OPTIMIZACIONES.md`
- ✅ `FIX-FINAL-NAVBAR-ORDENES.md`
- ✅ `FIXES-NAVBAR-ORDENES.md`

---

## 🔍 Verificar .gitignore

Tu `.gitignore` actual:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (keep .env.example)
.env
.env*.local

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Scripts SQL (contienen datos sensibles)
/scripts

# Cloudflare Worker
/cloudflare-worker-example.js
/cloudflare-worker-fixed.js
```

**⚠️ PROBLEMA:** Los scripts SQL están ignorados completamente.

---

## 🔧 Ajustar .gitignore

Los scripts SQL de setup SÍ deben subirse (no contienen datos sensibles).
Solo ignora scripts con datos reales.

**Opción 1: Permitir scripts SQL de setup**

Elimina esta línea del `.gitignore`:
```
/scripts
```

Y agrega:
```
# Scripts SQL con datos sensibles (si los hay)
/scripts/*-data.sql
/scripts/*-backup.sql
```

**Opción 2: Mover scripts a documentación**

Incluye los scripts SQL dentro de los archivos `.md` como ejemplos.

---

## ✅ Checklist Final

Antes de hacer push, verifica:

- [ ] `.env` NO está en el repositorio
- [ ] `.env.example` SÍ está en el repositorio
- [ ] `node_modules/` NO está en el repositorio
- [ ] `.next/` NO está en el repositorio
- [ ] Todos los componentes nuevos están incluidos
- [ ] README actualizado con nuevas funciones
- [ ] Scripts SQL de setup están disponibles (en `/scripts` o en docs)
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Cloudflare Worker URL está en `.env.example` como ejemplo

---

## 📝 Actualizar README

Agrega al README principal:

```markdown
## 🆕 Nuevas Funciones

### Múltiples Imágenes por Producto
- Galería de imágenes con navegación
- Hasta 5 imágenes por producto
- Miniaturas clickeables

### Características Específicas
- Agregar características personalizadas (altura, material, etc.)
- Editor dinámico de características
- Visualización limpia con iconos

### Dark Mode
- Tema claro/oscuro/sistema
- Toggle en navbar
- Persistencia de preferencia

### Optimizaciones
- Mejor rendimiento
- Sin parpadeos en navegación
- Imágenes optimizadas con Next.js Image

## 🗄️ Base de Datos

Ejecuta estos scripts en Supabase:

\`\`\`sql
-- Agregar columnas para múltiples imágenes y características
ALTER TABLE products
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::JSONB;
\`\`\`
```

---

## 🎯 Resumen

**Estado actual:**
- ✅ Código listo
- ✅ Documentación completa
- ✅ `.gitignore` configurado
- ⚠️ Scripts SQL ignorados (decidir si incluirlos)

**Acción recomendada:**
1. Ajustar `.gitignore` para permitir scripts SQL de setup
2. Volver a rama main
3. Crear rama feature
4. Commit y push
5. Actualizar README en GitHub

¿Procedo con los comandos de Git?
