# ✅ Checklist de Deploy - Optimizaciones

## 🔍 Pre-Deploy

### Verificación de Código
- [x] ✅ Eliminado `router.refresh()` de componentes problemáticos
- [x] ✅ Agregado timeout de seguridad en add-to-cart
- [x] ✅ Memoización de componentes (ProductCard, CartItem)
- [x] ✅ Lazy loading de imágenes
- [x] ✅ Hook centralizado use-cart creado
- [x] ✅ Next.js config optimizado
- [x] ✅ Optimistic updates implementados

### Verificación de Archivos
- [x] ✅ `components/navbar.tsx` - Optimizado
- [x] ✅ `components/add-to-cart-button.tsx` - Timeout agregado
- [x] ✅ `components/cart-item.tsx` - Memoizado + optimistic
- [x] ✅ `components/product-card.tsx` - Memoizado + lazy loading
- [x] ✅ `components/product-form.tsx` - Sin router.refresh()
- [x] ✅ `components/delete-product-button.tsx` - Sin router.refresh()
- [x] ✅ `components/checkout-form.tsx` - Sin router.refresh()
- [x] ✅ `hooks/use-cart.ts` - Nuevo hook
- [x] ✅ `next.config.mjs` - Optimizado

### Documentación
- [x] ✅ `OPTIMIZACIONES-PRODUCCION.md` - Guía completa
- [x] ✅ `GUIA-RAPIDA-OPTIMIZACIONES.md` - Referencia rápida
- [x] ✅ `RESUMEN-CAMBIOS.md` - Resumen ejecutivo
- [x] ✅ `CHECKLIST-DEPLOY.md` - Este archivo

---

## 🚀 Deploy

### Paso 1: Build Local
```bash
# Verificar que el build funciona
npm run build
```
**Resultado esperado:** ✅ Build exitoso sin errores

### Paso 2: Test Local
```bash
# Iniciar en modo producción
npm start
```
**Verificar:**
- [ ] App carga correctamente
- [ ] Login funciona
- [ ] Agregar al carrito funciona
- [ ] Iconos permanecen visibles

### Paso 3: Commit y Push
```bash
git add .
git commit -m "feat: optimización completa de producción

- Fix: Iconos de navbar desapareciendo al cambiar ruta
- Fix: Estado de loading colgado en agregar al carrito
- Perf: Memoización de componentes críticos
- Perf: Lazy loading de imágenes
- Perf: Optimizaciones de Next.js config
- Feat: Hook centralizado use-cart para gestión del carrito
- Docs: Documentación completa de optimizaciones"

git push origin main
```

---

## 🧪 Post-Deploy Testing

### Test 1: Funcionalidad Básica
- [ ] Cargar página principal
- [ ] Navegar a productos
- [ ] Ver detalle de producto
- [ ] Iniciar sesión
- [ ] Cerrar sesión

### Test 2: Carrito (CRÍTICO)
- [ ] Agregar producto al carrito
- [ ] Verificar que iconos NO desaparecen
- [ ] Verificar que "Agregando..." no dura más de 10s
- [ ] Ir a página de carrito
- [ ] Actualizar cantidad
- [ ] Verificar que iconos NO desaparecen
- [ ] Eliminar producto
- [ ] Verificar que iconos NO desaparecen

### Test 3: Checkout
- [ ] Agregar productos al carrito
- [ ] Ir a checkout
- [ ] Completar formulario
- [ ] Crear orden
- [ ] Verificar redirección a WhatsApp
- [ ] Verificar que iconos NO desaparecen

### Test 4: Admin (si aplica)
- [ ] Login como admin
- [ ] Ver panel admin
- [ ] Crear producto
- [ ] Editar producto
- [ ] Eliminar producto
- [ ] Ver órdenes
- [ ] Cambiar estado de orden

### Test 5: Performance
- [ ] Abrir DevTools → Network
- [ ] Verificar lazy loading de imágenes
- [ ] Abrir DevTools → Performance
- [ ] Verificar que no hay re-renders excesivos
- [ ] Ejecutar Lighthouse
- [ ] Score debe ser > 80 en Performance

### Test 6: Navegación
- [ ] Navegar entre páginas múltiples veces
- [ ] Verificar que iconos SIEMPRE permanecen
- [ ] Verificar que no hay errores en consola
- [ ] Verificar que el estado se mantiene

---

## 🐛 Troubleshooting

### Si iconos desaparecen:
```bash
1. F12 → Console
2. Buscar "router.refresh()"
3. Solo debe aparecer en:
   - navbar.tsx línea 88 (SIGNED_IN/SIGNED_OUT)
   - navbar.tsx línea 101 (handleLogout)
```

### Si "Agregando..." se cuelga:
```bash
1. F12 → Console
2. Debe aparecer "Tiempo agotado" después de 10s
3. Verificar error en console
4. Verificar conexión a Supabase
```

### Si imágenes no cargan:
```bash
1. Verificar .env → NEXT_PUBLIC_CLOUDFLARE_WORKER_URL
2. Verificar next.config.mjs → remotePatterns
3. Verificar permisos de R2 en Cloudflare
```

### Si hay errores de build:
```bash
1. npm run lint
2. Corregir errores de TypeScript
3. Verificar imports
4. npm run build
```

---

## 📊 Métricas a Monitorear

### Inmediato (Primeras 24h)
- [ ] Errores en consola del navegador
- [ ] Errores en logs del servidor
- [ ] Tiempo de respuesta de API
- [ ] Quejas de usuarios sobre iconos

### Corto Plazo (Primera semana)
- [ ] Tasa de conversión (agregar al carrito)
- [ ] Tasa de abandono de carrito
- [ ] Tiempo promedio en sitio
- [ ] Bounce rate

### Largo Plazo (Primer mes)
- [ ] Performance score (Lighthouse)
- [ ] Core Web Vitals
- [ ] Tasa de error general
- [ ] Satisfacción de usuarios

---

## 🎯 Criterios de Éxito

### Mínimo Aceptable:
- ✅ Iconos permanecen visibles al navegar
- ✅ No hay loading colgado
- ✅ No hay errores críticos en consola
- ✅ Todas las funcionalidades básicas funcionan

### Óptimo:
- ✅ Performance score > 80
- ✅ Tiempo de carga < 3s
- ✅ Sin errores en consola
- ✅ Feedback positivo de usuarios

---

## 📞 Rollback Plan

Si algo sale mal:

### Opción 1: Revertir commit
```bash
git revert HEAD
git push origin main
```

### Opción 2: Volver a commit anterior
```bash
git log --oneline
git reset --hard <commit-hash>
git push origin main --force
```

### Opción 3: Deploy de emergencia
```bash
# Volver a versión estable conocida
git checkout <stable-commit>
git push origin main --force
```

---

## ✅ Sign-Off

### Desarrollador
- [x] ✅ Código revisado y testeado localmente
- [x] ✅ Documentación completa
- [x] ✅ Listo para deploy

### QA (Post-Deploy)
- [ ] Funcionalidad básica verificada
- [ ] Carrito testeado completamente
- [ ] Performance aceptable
- [ ] Sin errores críticos

### Product Owner
- [ ] Problemas reportados resueltos
- [ ] Performance mejorada
- [ ] Listo para usuarios

---

## 🎉 Deploy Completado

**Fecha:** _____________  
**Hora:** _____________  
**Versión:** 1.1.0  
**Responsable:** _____________  

**Notas adicionales:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Estado Final:** ⬜ PENDIENTE | ⬜ EN PROGRESO | ⬜ COMPLETADO | ⬜ ROLLBACK
