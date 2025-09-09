# 🛡️ Orbit AI Backend - Secure API Proxy

## 🎯 Descripción
Backend seguro para la plataforma Orbit Marketing que maneja todas las llamadas a APIs de IA de forma segura. Las API keys están protegidas en el servidor y nunca se exponen al cliente.

## ✅ Problema Resuelto
**ANTES**: ❌ API keys de Gemini expuestas en el frontend (VULNERABILIDAD CRÍTICA)  
**AHORA**: ✅ API keys manejadas de forma segura en el servidor

## 🚀 Características
- ✅ **Proxy seguro** para Google Gemini API  
- ✅ **CORS configurado** para desarrollo  
- ✅ **Validación de requests** y manejo de errores  
- ✅ **Health check** endpoint  
- ✅ **Logging estructurado**  
- ✅ **Hot reload** con nodemon  

## 🔧 Instalación y Configuración

### 1. Instalar dependencias
```bash
cd server
npm install
```

### 2. Configurar variables de entorno
```bash
# Copiar el template
cp .env.example .env

# Editar .env con tu API key real
GEMINI_API_KEY=tu_api_key_real_aqui
```

**🔑 Obtener API Key:**
1. Ve a [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Crea una nueva API key
3. Cópiala al archivo `.env`

### 3. Iniciar el servidor
```bash
# Desarrollo (con hot reload)
npm run dev

# Producción
npm start
```

## 📡 Endpoints Disponibles

### Health Check
```bash
GET /health
```
**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2025-09-09T01:30:08.373Z",
  "aiConfigured": true
}
```

### Generación de IA Básica
```bash
POST /api/ai/generate
Content-Type: application/json

{
  "prompt": "Tu prompt aquí",
  "model": "gemini-2.5-flash"
}
```

### Generación Estructurada (con JSON Schema)
```bash
POST /api/ai/generate-structured
Content-Type: application/json

{
  "prompt": "Tu prompt aquí",
  "responseSchema": { /* esquema JSON */ },
  "model": "gemini-2.5-flash"
}
```

### Magic Onboarding
```bash
POST /api/ai/magic-onboarding
Content-Type: application/json

{
  "businessName": "Mi Negocio",
  "industry": "restaurant"
}
```

### Análisis de Imagen
```bash
POST /api/ai/analyze-image
Content-Type: application/json

{
  "imageData": "base64_image_data",
  "mimeType": "image/jpeg",
  "prompt": "Analiza esta imagen"
}
```

## 🔐 Seguridad

### Variables de Entorno Críticas
```bash
# NUNCA commitear estas variables
GEMINI_API_KEY=tu_api_key_aqui
```

### CORS
- Configurado para `http://localhost:5173` en desarrollo
- Ajustar `FRONTEND_URL` en producción

### Rate Limiting
- ⚠️ **TODO**: Implementar rate limiting para producción
- ⚠️ **TODO**: Agregar autenticación de usuarios

## 📊 Logging
El servidor registra:
- ✅ Requests de IA recibidos  
- ✅ Errores de API  
- ✅ Estado de configuración  

## 🚨 Estado de Desarrollo

### ✅ Completado
- ✅ Proxy básico para Gemini API
- ✅ Endpoints principales implementados
- ✅ Manejo de errores robusto
- ✅ CORS y middleware básico
- ✅ Health check funcional

### 🔄 En Progreso
- 🔄 Migración completa de todos los métodos del frontend

### 📝 TODO
- [ ] Rate limiting y autenticación
- [ ] Logging a archivo/servicio externo
- [ ] Metrics y monitoreo
- [ ] Tests unitarios
- [ ] Docker containerization
- [ ] Deploy a producción (Railway, Heroku, etc.)

## 🧪 Testing

### Probar el servidor
```bash
# Health check
curl http://localhost:3001/health

# Test básico de IA (necesita API key válida)
curl -X POST http://localhost:3001/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello world"}'
```

### Con el Frontend
```bash
# Desde la raíz del proyecto
npm run dev:full  # Inicia backend + frontend juntos
```

## 🐛 Troubleshooting

### Error: "API key not valid"
- Verifica que `GEMINI_API_KEY` esté configurada en `.env`
- Confirma que la API key sea válida en [Google AI Studio](https://aistudio.google.com/)

### Error: "Backend server is not running"
- Asegúrate de que el backend esté corriendo en puerto 3001
- Verifica que `VITE_BACKEND_URL` esté configurada en el frontend

### Error de CORS
- Confirma que `FRONTEND_URL` coincida con la URL del frontend
- En desarrollo debe ser `http://localhost:5173`

## 🏗️ Arquitectura

```
server/
├── server.js           # Servidor principal
├── package.json        # Dependencias y scripts  
├── .env               # Variables de entorno (NO commitear)
├── .env.example       # Template de variables
├── .gitignore         # Protección de secrets
└── README.md          # Esta documentación
```

## 🔄 Migración desde el Frontend

**Antes de esta implementación:**
- ❌ API keys expuestas en `src/services/aiService.ts`
- ❌ Llamadas directas a Gemini desde el cliente
- ❌ Vulnerabilidad de seguridad crítica

**Después de esta implementación:**
- ✅ API keys seguras en el servidor
- ✅ Frontend usa HTTP calls al backend
- ✅ Compatibilidad mantenida (mismo aiService interface)

---

📅 **Implementado**: 2025-09-09  
👤 **Autor**: Agustin  
🛡️ **Estado**: Funcional - SEGURIDAD MEJORADA  
🚀 **Próximo**: Rate limiting y deploy a producción