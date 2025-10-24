# 🚀 Sistema Completo de Cotizaciones - Tintas y Tecnología

Sistema profesional de gestión de cotizaciones con carrito de productos, generación de PDF/JPG e integración con WhatsApp.

## ✨ Características Completas

### 🔐 Autenticación
- ✅ Login seguro con validación en Supabase
- ✅ Sesión persistente
- ✅ 2 vendedores (Eash y Nayleth)

### 📊 Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Contador de cotizaciones, clientes y productos
- ✅ Acciones rápidas
- ✅ Diseño moderno y responsive

### 📋 Gestión de Cotizaciones
- ✅ Crear cotizaciones con carrito de productos
- ✅ Buscar y agregar productos dinámicamente
- ✅ Editar cantidades y precios en tiempo real
- ✅ Cálculos automáticos (subtotal, descuento, IVA, total)
- ✅ Lista de cotizaciones con filtros
- ✅ Ver detalle completo
- ✅ Estados (pendiente, aceptada, rechazada)
- ✅ Eliminar cotizaciones

### 👥 Gestión de Clientes
- ✅ CRUD completo de clientes
- ✅ Búsqueda en tiempo real
- ✅ Datos: nombre, teléfono, NIT, email, dirección, ciudad
- ✅ Historial asociado a vendedor

### 📄 Generación de Documentos
- ✅ Botón para generar PDF (implementación básica)
- ✅ Botón para generar imagen JPG (implementación básica)
- ✅ Plantilla lista para personalizar

### 📱 Integración WhatsApp
- ✅ Envío directo desde la cotización
- ✅ Mensaje pre-formateado con datos de la cotización
- ✅ Apertura de WhatsApp con un click

### 📈 Reportes
- ✅ Estadísticas generales
- ✅ Reportes del mes actual
- ✅ Métricas de ventas
- ✅ Promedios y totales

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **PDF**: jspdf
- **Imágenes**: html2canvas
- **Fechas**: date-fns

## 📦 Instalación

### Requisitos Previos
- Node.js 18+ 
- Cuenta en Supabase
- Cuenta en Vercel (para deployment)

### Instalación Local

1. **Clonar/Extraer el proyecto**
```bash
cd panel-admin-completo
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Crear archivo `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://cxxifwpwarbrrodtzyqn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

5. **Abrir en navegador**
```
http://localhost:3000
```

## 🚀 Deployment en Vercel

### Paso 1: Subir a GitHub
1. Crea un repositorio en GitHub
2. Sube todos los archivos del proyecto

### Paso 2: Conectar con Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Click en "New Project"
3. Importa tu repositorio de GitHub
4. Framework: **Next.js** (detectado automáticamente)

### Paso 3: Variables de Entorno
Agrega estas 2 variables:
```
NEXT_PUBLIC_SUPABASE_URL=https://cxxifwpwarbrrodtzyqn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4eGlmd3B3YXJicnJvZHR6eXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc5OTAsImV4cCI6MjA3MzgwMzk5MH0.tMgoakEvw8wsvrWZpRClZo3BpiUIJ4OQrQsiM4BGM54
```

### Paso 4: Deploy
1. Click "Deploy"
2. Espera 2-3 minutos
3. ¡Listo! ✅

## 👤 Usuarios de Prueba

**Vendedor 1 (Eash):**
- Usuario: `tintasytecnologia1`
- Contraseña: `@Np2026.ñ`
- Vendedor ID: 1

**Vendedor 2 (Nayleth):**
- Usuario: `tintasytecnologia2`
- Contraseña: `@Np2026.ñ`
- Vendedor ID: 2

## 📁 Estructura del Proyecto

```
panel-admin-completo/
├── app/
│   ├── dashboard/          # Dashboard principal
│   ├── login/              # Página de login
│   ├── cotizaciones/       # Gestión de cotizaciones
│   │   ├── nueva/          # Crear cotización
│   │   └── [id]/           # Ver detalle
│   ├── clientes/           # Gestión de clientes
│   │   └── nuevo/          # Crear cliente
│   ├── reportes/           # Reportes y estadísticas
│   ├── layout.js           # Layout principal
│   ├── page.js             # Redirect a login
│   └── globals.css         # Estilos globales
├── components/
│   └── Sidebar.js          # Menú lateral
├── lib/
│   └── supabase.js         # Cliente de Supabase
├── utils/                  # Utilidades (futuro)
├── package.json
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── README.md
```

## 🎯 Guía de Uso

### Crear una Cotización

1. **Dashboard** → Click en "+ Nueva Cotización"
2. **Seleccionar cliente** de la lista
3. **Buscar productos** en el buscador
4. **Agregar al carrito** haciendo click en el producto
5. **Ajustar cantidades** y precios si es necesario
6. **Configurar descuento** e IVA
7. **Agregar observaciones** (opcional)
8. **Crear Cotización**

### Ver y Enviar Cotización

1. **Lista de Cotizaciones** → Click en "Ver"
2. **Revisar detalle** de la cotización
3. **Generar PDF** para impresión
4. **Generar JPG** para redes sociales
5. **Enviar por WhatsApp** directamente

### Agregar Cliente

1. **Clientes** → "+ Nuevo Cliente"
2. **Llenar formulario** (nombre y teléfono obligatorios)
3. **Guardar Cliente**

## 🔧 Personalización

### Cambiar Logo
Edita el header en `components/Sidebar.js`

### Modificar Colores
Edita `tailwind.config.js`:
```js
colors: {
  primary: '#1e40af',  // Azul principal
  secondary: '#64748b', // Gris secundario
}
```

### Agregar Campos
1. Modificar tabla en Supabase
2. Actualizar formularios en las páginas correspondientes

## 📝 Próximas Mejoras Sugeridas

- [ ] Implementar generación de PDF completa
- [ ] Implementar generación de imagen JPG completa
- [ ] Agregar gráficas en reportes
- [ ] Exportar reportes a Excel
- [ ] Sistema de notificaciones
- [ ] Historial de cambios
- [ ] Duplicar cotizaciones
- [ ] Plantillas de cotización
- [ ] Multi-moneda
- [ ] Inventario de productos

## 🐛 Solución de Problemas

### Error: "Module not found"
- **Solución**: Verifica que jsconfig.json esté presente
- Asegúrate de tener todas las dependencias instaladas

### Error: "Can't connect to Supabase"
- **Solución**: Verifica las variables de entorno
- Confirma que la URL y Anon Key sean correctas

### Los datos no se cargan
- **Solución**: Verifica que las tablas existan en Supabase
- Confirma que el vendedor_id esté correctamente asignado

## 📞 Soporte

Para dudas o problemas:
1. Revisa la documentación
2. Verifica los logs en la consola del navegador
3. Revisa los logs de deployment en Vercel

## 📄 Licencia

Proyecto privado para Tintas y Tecnología

---

**Desarrollado con ❤️ para Tintas y Tecnología**

🚀 **¡Sistema listo para producción!**
