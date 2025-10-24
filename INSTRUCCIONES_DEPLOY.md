# Panel Admin Tintas - Configuración

## ⚡ Nueva Funcionalidad: Carga de Imágenes

Este proyecto ahora incluye carga directa de imágenes en el formulario de productos.

### ✨ Características:
- ✅ Input de archivo en lugar de URL
- ✅ Vista previa de imagen antes de crear producto
- ✅ Validación de tipo y tamaño (máx 5MB)
- ✅ Subida automática a Supabase Storage
- ✅ URL pública generada automáticamente

---

## 🚀 Despliegue en Vercel

### 1. Subir a GitHub

```bash
git add .
git commit -m "Agregada funcionalidad de carga de imágenes"
git push origin main
```

### 2. Configurar Variables de Entorno en Vercel

⚠️ **MUY IMPORTANTE**: Debes configurar estas 2 variables en Vercel:

1. Ve a tu proyecto en Vercel
2. Ve a **Settings → Environment Variables**
3. Agrega estas variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://cxxifwpwarbrrodtzyqn.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4eGlmd3B3YXJicnJvZHR6eXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc5OTAsImV4cCI6MjA3MzgwMzk5MH0.tMgoakEvw8wsvrWZpRClZo3BpiUIJ4OQrQsiM4BGM54
```

4. Guarda y espera que Vercel redesplegue automáticamente

---

## 📋 Verificación

Después de desplegar, verifica que:

- [ ] Puedes acceder al panel
- [ ] En "Productos → Nuevo Producto" hay un campo para seleccionar archivo
- [ ] Puedes ver una vista previa de la imagen
- [ ] El producto se crea correctamente con la imagen

---

## 🗄️ Almacenamiento

Las imágenes se guardan en:
- **Bucket:** product-images (público)
- **Carpeta:** PRODUCTOS_IMAGENES/
- **Formato:** {timestamp}-{random}.{extensión}

---

## 🐛 Solución de Problemas

### Las imágenes no cargan
- Verifica que las variables de entorno estén configuradas en Vercel
- Verifica que el bucket `product-images` sea público en Supabase

### Error al subir imagen
- Verifica que la imagen sea menor a 5MB
- Verifica que sea JPG, PNG, WEBP o GIF

### Variables de entorno no funcionan
- Deben empezar con `NEXT_PUBLIC_`
- Guarda y espera el redespliegue automático
- Verifica en la pestaña Deployments que terminó

---

## 📞 Soporte

**Proyecto:** Panel Admin - Tintas y Tecnología  
**Vercel:** https://vercel.com/tintasytecnologias-projects/panel-admin-tintas  
**Supabase:** https://cxxifwpwarbrrodtzyqn.supabase.co

---

**Versión:** 1.1.0  
**Última actualización:** Octubre 2025
