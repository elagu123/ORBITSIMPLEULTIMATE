# 🔥 Firebase Authentication Setup

Este documento explica cómo configurar Firebase Authentication para habilitar funciones empresariales en Orbit Simple Marketing.

## 🚀 ¿Por qué Firebase?

### **Modo Actual: JWT (Self-hosted)**
✅ **FUNCIONA AHORA** - Sistema básico funcional  
- Login/registro con email/contraseña
- Tokens JWT seguros
- Usuarios demo incluidos
- Sin configuración adicional necesaria

### **Modo Enterprise: Firebase**
🔥 **FUNCIONES AVANZADAS** - Para uso empresarial  
- OAuth (Google, GitHub, Facebook, etc.)
- Multi-factor authentication (MFA)  
- Phone authentication
- Password reset por email
- Analytics de usuarios
- Escalabilidad automática

## 🛠️ Configuración Firebase (Opcional)

### Paso 1: Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o usa uno existente
3. Habilita Authentication en el menú lateral

### Paso 2: Configurar Proveedores
```
Authentication → Sign-in method → Enable providers:
✅ Email/Password
✅ Google
✅ GitHub
✅ Phone (optional)
```

### Paso 3: Obtener Configuración
```
Project Settings → General → Your apps → Web app
```

### Paso 4: Variables de Entorno
Edita `.env.local` y agrega:

```bash
# Firebase Configuration (OPCIONAL - for enterprise features)
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Paso 5: Reiniciar Aplicación
```bash
npm run dev
```

## 🔄 Funcionamiento Híbrido

La aplicación detecta automáticamente si Firebase está configurado:

### **Si Firebase está configurado:**
```
🔐 Authentication Mode: Firebase (Enterprise)
✅ OAuth login buttons aparecen
✅ MFA disponible
✅ Password reset por email
```

### **Si Firebase NO está configurado:**
```
🔐 Authentication Mode: JWT (Self-hosted)  
✅ Login básico funciona
✅ Usuarios demo disponibles
⚠️ Solo email/contraseña
```

## 🧪 Testing

### JWT Mode (Actual)
```bash
# Login demo
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@orbit.com", "password": "password"}'

# O usar admin
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@orbit.com", "password": "admin123"}'
```

### Firebase Mode
- OAuth buttons aparecerán en la UI
- Redirect automático después del login
- Gestión de sesiones mejorada

## 🔐 Seguridad

### JWT Mode:
- ✅ Passwords hasheadas con bcrypt
- ✅ Tokens JWT con expiración
- ✅ Refresh tokens
- ✅ Rate limiting

### Firebase Mode (Añade):
- ✅ OAuth seguro con providers
- ✅ MFA con SMS/App
- ✅ Account recovery avanzado
- ✅ Audit logs empresariales
- ✅ Compliance (SOC2, GDPR)

## 📈 Migración

### De JWT a Firebase:
1. Los usuarios existentes **permanecen funcionales**
2. Nuevos registros pueden usar OAuth
3. **Sin downtime** durante la transición
4. Rollback instantáneo si es necesario

### Rollback Firebase → JWT:
1. Comentar variables Firebase en `.env.local`
2. Reiniciar aplicación
3. Sistema vuelve automáticamente a JWT

## 🚨 Importante

- **JWT mode es PRODUCTION-READY** para uso básico
- **Firebase es OPCIONAL** - solo para funciones enterprise
- **Ambos sistemas son seguros** y están bien implementados
- **La elección depende de tus necesidades**:
  - JWT: Simplicidad, control total, sin costos externos
  - Firebase: Funciones avanzadas, escalabilidad, menos mantenimiento

## 💡 Recomendaciones

### Usa JWT si:
- ✅ Control total sobre datos de usuarios
- ✅ Infraestructura self-hosted
- ✅ Costos predecibles
- ✅ Simplicidad en el deployment

### Usa Firebase si:
- ✅ Necesitas OAuth con múltiples providers  
- ✅ MFA es requerida
- ✅ Escalabilidad automática
- ✅ Análisis de usuarios avanzado
- ✅ Compliance empresarial

---

**Status actual:** ✅ JWT completamente funcional, Firebase listo para configurar cuando se necesite.