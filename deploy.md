# 🚀 Orbit Simple Marketing - Deployment Guide

## ✅ Build Completado Exitosamente

La aplicación ha sido construida exitosamente para producción:
- **Bundle Size**: ~1.4MB (comprimido)
- **PWA Ready**: Service Worker configurado
- **Code Splitting**: Chunks optimizados por características
- **Assets**: Optimizados y comprimidos

## 📁 Archivos de Deployment Creados

1. **`.env.production`** - Variables de entorno para producción
2. **`Dockerfile`** - Configuración para containerización
3. **`ecosystem.config.js`** - Configuración PM2 para producción
4. **`server/health-check.js`** - Health check para Docker

## 🌐 Opciones de Deployment

### Opción 1: Vercel (Recomendado para Frontend)

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Configurar variables de entorno en dashboard de Vercel
# - VITE_GEMINI_API_KEY
# - Otras variables de .env.production
```

### Opción 2: Netlify

```bash
# 1. Build ya está hecho
# 2. Arrastra carpeta 'dist' a netlify.com
# 3. O conecta repository en Netlify dashboard
```

### Opción 3: Railway (Para Full Stack)

```bash
# 1. Crear cuenta en railway.app
# 2. Conectar repository
# 3. Railway detectará automáticamente el Dockerfile
```

### Opción 4: Docker Local

```bash
# 1. Construir imagen
docker build -t orbit-marketing .

# 2. Ejecutar container
docker run -p 3000:3000 -p 3003:3003 orbit-marketing
```

## ⚙️ Configuración Requerida

### Variables de Entorno Críticas:

```env
# 🔑 OBLIGATORIO - Sin esto la IA no funciona
VITE_GEMINI_API_KEY=tu_clave_gemini_aqui

# 🌐 URLs de producción
VITE_API_BASE_URL=https://tu-dominio.com/api
VITE_AI_AGENT_URL=https://tu-dominio.com:3003
```

### Para obtener API Key de Gemini:
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea un API Key
3. Agrega la clave a las variables de entorno

## 🚀 Deployment Más Rápido

### Vercel (Frontend Only):
```bash
npx vercel --prod
```

### Railway (Full Stack):
1. Sube el código a GitHub
2. Conecta GitHub a Railway
3. Deploy automático

## 📊 Verificación Post-Deployment

Después del deployment, verifica:

1. **Frontend carga** ✅
2. **AI Agent responde** ✅
3. **Wizard funciona** ✅
4. **PWA instalable** ✅

## 🛠️ Troubleshooting

### Si la IA no responde:
- Verificar VITE_GEMINI_API_KEY está configurada
- Verificar VITE_AI_AGENT_URL apunta al servidor correcto

### Si hay errores CORS:
- Verificar que el AI Agent permite el dominio de producción
- Actualizar CORS origins en `server/multi-llm-agent.cjs`

## 🎯 Next Steps

Una vez deployed:
1. Configurar dominio personalizado
2. Configurar SSL/HTTPS
3. Monitorear logs y métricas
4. Configurar backup de datos

¡La aplicación está lista para production! 🎉