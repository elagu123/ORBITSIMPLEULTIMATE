# 🚀 Orbit Simple Marketing - AI-Powered Marketing Platform

## 🎯 Descripción
Orbit Simple Marketing es una plataforma integral de marketing con IA que combina gestión de campañas, calendario de marketing, gestión de clientes, generación de contenido con IA, y sistemas integrados incluyendo WhatsApp Business, punto de venta y más. La aplicación está diseñada para pequeñas y medianas empresas que buscan automatizar y optimizar sus procesos de marketing.

## 🚀 Estado Actual del Proyecto

### ✅ Completado (Última sesión: 2025-09-08)
- ✅ **Arquitectura base completa** - Estructura de componentes organizada por features
- ✅ **Sistema de autenticación mock** - Login funcional (desarrollo)
- ✅ **Dashboard principal** - Widget de estadísticas, gráficos de ventas, actividades recientes
- ✅ **Módulo AI Strategy** - Planificación de campañas con IA, Data Flywheel Widget
- ✅ **Gestión de Assets** - Grid de assets, editor visual, panel de detalles, command palette
- ✅ **Calendario de Marketing** - Vista de calendario completa, creación de eventos, panel de IA
- ✅ **Generación de Contenido con IA** - Editor de contenido, variaciones, preview, generador visual
- ✅ **CRM de Clientes** - Tabla de clientes, vista Kanban, timeline, formularios
- ✅ **Sistema WhatsApp Business** - Chatbot flow builder, inbox unificado, catálogo de productos
- ✅ **Punto de Venta (POS)** - Sistema básico de ventas integrado
- ✅ **Onboarding con IA** - Wizard de configuración inicial inteligente
- ✅ **Gamificación** - Sistema de puntos y logros para engagement
- ✅ **Dark Mode** - Tema oscuro completo implementado
- ✅ **Skeleton Loading** - Estados de carga sofisticados
- ✅ **Error Boundaries** - Manejo de errores de React
- ✅ **React Error #31 RESUELTO** - Fix crítico en MarketingCalendar.tsx:101
- ✅ **TypeScript configurado** - Tipos definidos para todos los módulos

### 🔄 En Progreso
- 🔄 **Optimización de performance** - Bundle size reduction (actual: 1.4MB → objetivo: <500KB)
- 🔄 **Mejoras de seguridad** - Migración de API keys del cliente al servidor

### 📝 Pendiente (TODO)

#### 🚨 CRÍTICO (Semana 1-2)
- [ ] **Implementar backend seguro** para manejar API keys (VULNERABILIDAD CRÍTICA)
- [ ] **Sistema de autenticación real** (Auth0/Firebase) - Actualmente acepta cualquier credencial
- [ ] **Code splitting** para reducir bundle size de 1.4MB a <500KB
- [ ] **Validación de inputs** y sanitización en todos los formularios

#### 🔥 ALTO PRIORIDAD (Semana 3-4)
- [ ] Optimizar context providers con memoización (prevenir re-renders masivos)
- [ ] Implementar lazy loading en componentes pesados
- [ ] Agregar error boundaries comprehensivos en toda la aplicación
- [ ] Headers de seguridad y configuración HTTPS
- [ ] Consolidar servicios de IA (eliminar duplicación)

#### ⚡ MEDIO PRIORIDAD (Semana 5-6)
- [ ] Suite de testing completa (Jest + React Testing Library)
- [ ] Mejoras de accesibilidad (WCAG compliance)
- [ ] Documentación de usuario y guías
- [ ] Pipeline CI/CD automatizado
- [ ] Consistencia de idioma (resolver mezcla EN/ES)

## 💻 Stack Tecnológico
- **Frontend:** React 19.1.1 + TypeScript 5.8.2
- **Build Tool:** Vite 6.2.0
- **Estilos:** CSS-in-JS + Tailwind-like classes
- **Animaciones:** Framer Motion 10.12.18
- **Iconos:** Lucide React 0.294.0
- **Gráficos:** Recharts 2.12.7
- **Flow Charts:** ReactFlow 11.11.4
- **IA:** Google Gemini API (@google/genai)
- **Estado:** React Context + Hooks
- **Autenticación:** Context-based (mock en desarrollo)

## 📂 Estructura del Proyecto
```
orbitclaude/
├── src/
│   ├── app/                    # Páginas principales (Next.js-style routing)
│   │   ├── (auth)/            # Páginas de autenticación
│   │   ├── dashboard/         # Dashboard principal
│   │   ├── aistrategy/        # Estrategia de IA
│   │   ├── assets/            # Gestión de assets
│   │   ├── calendar/          # Calendario de marketing
│   │   ├── content/           # Generación de contenido
│   │   ├── customers/         # CRM de clientes
│   │   ├── settings/          # Configuraciones
│   │   └── systems/           # Sistemas integrados (WhatsApp, POS)
│   ├── components/
│   │   ├── features/          # Componentes por feature
│   │   │   ├── ai/           # Componentes de IA
│   │   │   ├── aistrategy/   # Estrategia de IA
│   │   │   ├── assets/       # Gestión de assets
│   │   │   ├── calendar/     # Calendario
│   │   │   ├── content/      # Contenido
│   │   │   ├── customers/    # CRM
│   │   │   ├── dashboard/    # Dashboard
│   │   │   ├── onboarding/   # Onboarding
│   │   │   ├── settings/     # Configuraciones
│   │   │   └── systems/      # Sistemas integrados
│   │   ├── layouts/          # Layouts (Header, Sidebar)
│   │   └── ui/              # Componentes UI básicos
│   ├── store/               # Context providers y estado global
│   ├── services/            # Servicios de IA y APIs
│   ├── hooks/               # Custom hooks
│   └── types/               # Definiciones de TypeScript
├── public/                  # Assets estáticos
├── .env.local              # Variables de entorno (GEMINI_API_KEY)
├── package.json            # Dependencias y scripts
├── tsconfig.json           # Configuración TypeScript
├── vite.config.ts          # Configuración Vite
└── session-log-*.md        # Logs detallados de sesiones
```

## 🔧 Instalación y Configuración

### Requisitos Previos
- Node.js v18+ (recomendado v20+)
- npm o yarn
- API Key de Google Gemini

### Pasos de Instalación
```bash
# 1. Clonar el repositorio
git clone https://github.com/elagu123/ORBITSIMPLEULTIMATE.git
cd ORBITSIMPLEULTIMATE

# 2. Instalar dependencias (usar legacy-peer-deps para React 19)
npm install --legacy-peer-deps

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con tu GEMINI_API_KEY

# 4. Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno Necesarias
```
GEMINI_API_KEY=tu_api_key_de_google_gemini_aqui
```

## 🐛 Problemas Conocidos

### ⚠️ CRÍTICOS DE SEGURIDAD
- **API Keys expuestas en cliente** - Las claves de IA están en el frontend (VULNERABILIDAD CRÍTICA)
- **Autenticación mock** - Acepta cualquier email/contraseña en desarrollo
- **Sin validación de inputs** - Falta sanitización en formularios

### 🚀 PERFORMANCE
- **Bundle size grande** - 1.4MB actual (objetivo: <500KB)
- **Sin code splitting** - Toda la app se carga de una vez
- **Re-renders masivos** - Context providers anidados causan performance issues

### 🔧 TÉCNICOS
- **React 19 compatibility** - Algunas dependencias pueden requerir `--legacy-peer-deps`
- **Mezcla de idiomas** - Componentes en inglés y español mezclados
- **Falta accesibilidad** - No cumple estándares WCAG

## 📊 Últimos Cambios Importantes

### 2025-09-09
- 🔄 **Cambio de repositorio** - Migrado a nuevo repo GitHub: ORBITSIMPLEULTIMATE
- 📝 **Documentación completa** - README comprensivo y session logs actualizados

### 2025-09-08
- 🐛 **CRÍTICO RESUELTO**: React Error #31 en MarketingCalendar.tsx:101
- 🔧 **TypeScript fixes**: Agregados imports de React faltantes
- 📦 **Dependencias**: Instalados @types/react y @types/react-dom para React 19
- 🎯 **Auditoría completa**: Análisis exhaustivo de arquitectura, performance y seguridad
- 📋 **Roadmap definido**: TODOs priorizados por criticidad

## 🎨 Decisiones de Diseño/Arquitectura

### ¿Por qué React 19?
- **Concurrent Features** - Mejor performance con Suspense y Concurrent Rendering
- **Automatic Batching** - Menos re-renders automáticamente
- **Server Components ready** - Preparado para futuro SSR

### Patrón Feature-Based
- **Escalabilidad** - Cada feature es independiente y mantenible
- **Colocation** - Componentes, tipos y lógica juntos por feature
- **Team Workflow** - Múltiples desarrolladores pueden trabajar sin conflictos

### Context over Redux
- **Simplicidad** - Menos boilerplate para estado de aplicación
- **TypeScript friendly** - Mejor experiencia de desarrollo con tipos
- **Performance** - Con memoización adecuada, igual de eficiente

## 🔗 Enlaces y Recursos

- **Repositorio**: https://github.com/elagu123/ORBITSIMPLEULTIMATE
- **AI Studio Original**: https://ai.studio/apps/drive/16s2645StK4grTqnTY5fCv4NhL4Qy2JHe
- **Deploy**: 🚫 NO LISTO PARA PRODUCCIÓN (ver problemas críticos)
- **Docs Técnicos**: Ver session-log-*.md para detalles de implementación

## 📋 Notas para la Próxima Sesión

### ⚠️ IMPORTANTE - Leer antes de continuar:
- **SEGURIDAD CRÍTICA**: Las API keys están expuestas en el cliente - NO DEPLOYAR A PRODUCCIÓN
- **PERFORMANCE**: Bundle de 1.4MB necesita code splitting inmediato
- **AUTENTICACIÓN**: Sistema actual es solo mock, acepta cualquier credencial
- **React Error #31 RESUELTO**: El fix está en MarketingCalendar.tsx:101, no tocar sin revisar

### 🎯 Próximo paso recomendado:
1. **Implementar backend seguro** - Crear API proxy para manejar llamadas a Gemini
2. **Code splitting inmediato** - Implementar lazy loading con React.lazy()
3. **Autenticación real** - Integrar Auth0 o Firebase Auth
4. **Validación de formularios** - Agregar Zod o Yup para validación

### 💡 Ideas/Mejoras para considerar:
- **Internacionalización (i18n)** - Resolver mezcla de idiomas EN/ES
- **Testing Strategy** - Implementar Jest + React Testing Library
- **Monitoring** - Integrar Sentry para error tracking en producción
- **Analytics** - Considerar Google Analytics o Mixpanel
- **PWA Features** - Convertir en Progressive Web App

## 🤖 Contexto para Claude Code

### Resumen del Proyecto:
Este proyecto es una plataforma integral de marketing con IA para PyMEs que incluye dashboard, calendario de marketing, CRM, generación de contenido con IA, y sistemas integrados como WhatsApp Business. La aplicación está construida con React 19 + TypeScript y usa Google Gemini para funcionalidades de IA. **CRÍTICO**: Actualmente NO está listo para producción debido a vulnerabilidades de seguridad (API keys expuestas) y problemas de performance (bundle 1.4MB).

### Archivos Clave:
- **src/App.tsx**: Componente raíz con lógica de autenticación
- **src/app/layout.tsx**: Layout principal con sidebar y header
- **src/store/**: Context providers para estado global (auth, AI, app data, gamification)
- **src/components/features/calendar/MarketingCalendar.tsx**: Fix crítico en línea 101 (React Error #31)
- **src/services/aiService.ts**: Servicio de IA (VULNERABILIDAD: API key expuesta)
- **package.json**: React 19, Vite 6, dependencias de IA

### Comandos Útiles:
```bash
npm run dev              # Desarrollo (puerto 5173)
npm run build           # Build producción
npm install --legacy-peer-deps  # Instalar dependencias (React 19 compatibility)
npx tsc --noEmit        # Verificar errores TypeScript
```

### Historial de Trabajo:
- **2025-09-09**: Migración a nuevo repositorio, documentación completa
- **2025-09-08**: React Error #31 resuelto, auditoría completa, roadmap definido
- **Inicial**: Configuración base del proyecto con todas las features principales

---

📅 **Última actualización**: 2025-09-09 22:00 UTC  
👤 **Autor**: Agustin  
🚀 **Estado**: En desarrollo activo - NO LISTO PARA PRODUCCIÓN  
⏱️ **Tiempo estimado para launch**: 4-6 semanas (tras resolver críticos de seguridad)