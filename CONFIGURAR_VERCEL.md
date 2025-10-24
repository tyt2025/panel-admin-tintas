# Configuración de Variables de Entorno en Vercel

## ⚠️ IMPORTANTE: Configurar antes de usar

El panel necesita las credenciales de Supabase para funcionar. Debes configurarlas en Vercel:

## 📝 Pasos para configurar en Vercel:

1. **Ve a tu proyecto en Vercel:**
   - https://vercel.com/tintasytecnologias-projects/panel-admin-tintas

2. **Ve a Settings → Environment Variables**

3. **Agrega estas 2 variables:**

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://cxxifwpwarbrrodtzyqn.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

   **Variable 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4eGlmd3B3YXJicnJvZHR6eXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc5OTAsImV4cCI6MjA3MzgwMzk5MH0.tMgoakEvw8wsvrWZpRClZo3BpiUIJ4OQrQsiM4BGM54`
   - Environments: ✅ Production, ✅ Preview, ✅ Development

4. **Redeploy el proyecto:**
   - Ve a Deployments
   - Click en el último deployment
   - Click en los tres puntos (...)
   - Click en "Redeploy"

5. **¡Listo! Ahora el login debe funcionar.**

## 🔐 Seguridad

Estas variables son seguras para ser públicas (NEXT_PUBLIC_*) porque son del lado del cliente.
La anon key está diseñada para ser expuesta en el frontend.

## 📱 Para desarrollo local (opcional)

Si quieres probar localmente:

1. Crea un archivo `.env.local` en la raíz del proyecto
2. Copia el contenido de `.env.example`
3. Reemplaza los valores con tus credenciales
4. Ejecuta `npm run dev`

**NOTA:** El archivo `.env.local` NO se debe subir a GitHub (ya está en .gitignore)
