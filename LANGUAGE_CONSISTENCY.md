# 🌍 Language Consistency Guide

## 📋 Current State Analysis

The Orbit Marketing Platform currently has **mixed English/Spanish content** throughout the codebase. Based on the context and target market, **Spanish should be the primary language** for user-facing content.

## 🎯 Language Strategy

### **Primary Language: Spanish**
- All user-facing text should be in Spanish
- Error messages and notifications in Spanish
- Form labels and placeholders in Spanish
- Navigation and menu items in Spanish

### **English Retained For:**
- Code comments and documentation (for international developers)
- Technical logs and debug information
- API responses (can be bilingual)
- Development tools and console outputs

## 📊 Identified Issues

### **High Priority Fixes Needed**

#### **1. Mixed Navigation & UI Elements**
```tsx
// ❌ Current (Mixed)
"Dashboard" // English
"Clientes"  // Spanish

// ✅ Should be (Spanish)
"Panel"     // or "Tablero"
"Clientes"  // Spanish
```

#### **2. Form Labels & Validation**
```tsx
// ❌ Current (Mixed)
"Email is required"           // English
"Contraseña es requerida"    // Spanish

// ✅ Should be (Spanish)
"Email es requerido"         // Spanish
"Contraseña es requerida"    // Spanish
```

#### **3. Button Text & Actions**
```tsx
// ❌ Current (Mixed)
"Save"      // English
"Guardar"   // Spanish

// ✅ Should be (Spanish)
"Guardar"   // Spanish
"Cancelar"  // Spanish
```

## 🔧 Implementation Plan

### **Phase 1: Core UI Elements (Week 1)**

#### **Navigation & Page Titles**
```typescript
// File: src/types/index.ts
export type Page = 
  | 'Panel'        // Instead of 'Dashboard'
  | 'Clientes'     // ✓ Already Spanish
  | 'Contenido'    // ✓ Already Spanish  
  | 'Calendario'   // ✓ Already Spanish
  | 'Recursos'     // Instead of 'Assets'
  | 'Sistemas'     // ✓ Already Spanish
  | 'Estrategia'   // Instead of 'AIStrategy'
  | 'Configuración' // Instead of 'Settings'
```

#### **Button Labels**
```typescript
// File: src/components/ui/Button.tsx
export const ButtonLabels = {
  save: 'Guardar',
  cancel: 'Cancelar',
  delete: 'Eliminar',
  edit: 'Editar',
  create: 'Crear',
  update: 'Actualizar',
  submit: 'Enviar',
  close: 'Cerrar',
  back: 'Volver',
  next: 'Siguiente',
  previous: 'Anterior',
  confirm: 'Confirmar',
  retry: 'Reintentar',
  refresh: 'Actualizar',
  export: 'Exportar',
  import: 'Importar',
  upload: 'Subir',
  download: 'Descargar',
};
```

### **Phase 2: Form Validation (Week 1)**

#### **Validation Messages**
```typescript
// File: src/utils/validation.ts
const ValidationMessages = {
  required: 'Este campo es requerido',
  email: 'Por favor ingresa un email válido',
  password: 'La contraseña debe tener al menos 6 caracteres',
  passwordMatch: 'Las contraseñas no coinciden',
  phone: 'Formato de teléfono no válido',
  url: 'URL no válida',
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  // Add more as needed...
};
```

#### **Form Field Labels**
```typescript
// File: src/components/forms/FormLabels.ts
export const FormLabels = {
  // Authentication
  email: 'Correo electrónico',
  password: 'Contraseña',
  confirmPassword: 'Confirmar contraseña',
  firstName: 'Nombre',
  lastName: 'Apellido',
  rememberMe: 'Recordarme',
  
  // Customer fields
  company: 'Empresa',
  phone: 'Teléfono',
  notes: 'Notas',
  tags: 'Etiquetas',
  
  // Content fields
  title: 'Título',
  content: 'Contenido',
  platform: 'Plataforma',
  scheduledDate: 'Fecha programada',
  
  // Business fields
  businessName: 'Nombre del negocio',
  industry: 'Industria',
  website: 'Sitio web',
  targetAudience: 'Audiencia objetivo',
};
```

### **Phase 3: Error Messages & Notifications (Week 2)**

#### **Error Messages**
```typescript
// File: src/constants/messages.ts
export const ErrorMessages = {
  // Network errors
  networkError: 'Error de conexión. Verifica tu internet.',
  serverError: 'Error del servidor. Intenta nuevamente.',
  timeout: 'La solicitud tardó demasiado. Intenta nuevamente.',
  
  // Authentication errors  
  invalidCredentials: 'Credenciales inválidas',
  sessionExpired: 'Sesión expirada. Inicia sesión nuevamente.',
  unauthorized: 'No tienes permisos para esta acción',
  
  // Validation errors
  fieldRequired: 'Este campo es requerido',
  invalidEmail: 'Email inválido',
  passwordTooShort: 'Contraseña muy corta',
  
  // General errors
  unexpected: 'Error inesperado. Intenta nuevamente.',
  rateLimited: 'Demasiados intentos. Espera un momento.',
};

export const SuccessMessages = {
  // Authentication
  loginSuccess: 'Inicio de sesión exitoso',
  logoutSuccess: 'Sesión cerrada exitosamente',
  registerSuccess: 'Registro exitoso. ¡Bienvenido!',
  
  // CRUD operations
  customerCreated: 'Cliente creado exitosamente',
  customerUpdated: 'Cliente actualizado exitosamente',
  customerDeleted: 'Cliente eliminado exitosamente',
  contentCreated: 'Contenido creado exitosamente',
  contentScheduled: 'Contenido programado exitosamente',
  
  // General
  changesSaved: 'Cambios guardados exitosamente',
  emailSent: 'Email enviado exitosamente',
};
```

### **Phase 4: Content & Labels (Week 2)**

#### **Dashboard & Analytics**
```typescript
// File: src/constants/labels.ts
export const DashboardLabels = {
  // Metrics
  totalCustomers: 'Total de Clientes',
  activeCustomers: 'Clientes Activos',
  newCustomers: 'Clientes Nuevos',
  revenue: 'Ingresos',
  growth: 'Crecimiento',
  performance: 'Rendimiento',
  
  // Time periods
  today: 'Hoy',
  thisWeek: 'Esta Semana',
  thisMonth: 'Este Mes',
  thisYear: 'Este Año',
  lastMonth: 'Mes Anterior',
  
  // Status
  active: 'Activo',
  inactive: 'Inactivo',
  pending: 'Pendiente',
  completed: 'Completado',
  draft: 'Borrador',
  published: 'Publicado',
  scheduled: 'Programado',
};
```

## 🛠️ Quick Fix Script

Let me create a script to automate the most common replacements:

```bash
#!/bin/bash
# Language consistency fix script

echo "🌍 Fixing language consistency..."

# Navigation items
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Dashboard"/"Panel"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Assets"/"Recursos"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Settings"/"Configuración"/g'

# Common button labels
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Save"/"Guardar"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Cancel"/"Cancelar"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Delete"/"Eliminar"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Edit"/"Editar"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Create"/"Crear"/g'

# Common field labels
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Email"/"Correo electrónico"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Password"/"Contraseña"/g'
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i 's/"Name"/"Nombre"/g'

echo "✅ Basic language fixes applied!"
echo "🔍 Manual review needed for context-specific translations"
```

## 📝 Translation Reference

### **Common UI Elements**

| English | Spanish |
|---------|---------|
| Dashboard | Panel / Tablero |
| Settings | Configuración |
| Assets | Recursos |
| Profile | Perfil |
| Account | Cuenta |
| Help | Ayuda |
| Support | Soporte |
| Documentation | Documentación |
| Tutorial | Tutorial |
| Guide | Guía |

### **Actions & Buttons**

| English | Spanish |
|---------|---------|
| Save | Guardar |
| Cancel | Cancelar |
| Delete | Eliminar |
| Edit | Editar |
| Create | Crear |
| Update | Actualizar |
| Submit | Enviar |
| Close | Cerrar |
| Back | Volver |
| Next | Siguiente |
| Previous | Anterior |
| Confirm | Confirmar |
| Retry | Reintentar |

### **Form Fields**

| English | Spanish |
|---------|---------|
| Email | Correo electrónico |
| Password | Contraseña |
| First Name | Nombre |
| Last Name | Apellido |
| Company | Empresa |
| Phone | Teléfono |
| Address | Dirección |
| City | Ciudad |
| Country | País |
| Website | Sitio web |

### **Status & States**

| English | Spanish |
|---------|---------|
| Active | Activo |
| Inactive | Inactivo |
| Pending | Pendiente |
| Completed | Completado |
| Draft | Borrador |
| Published | Publicado |
| Scheduled | Programado |
| Loading | Cargando |
| Success | Éxito |
| Error | Error |

### **Time & Dates**

| English | Spanish |
|---------|---------|
| Today | Hoy |
| Yesterday | Ayer |
| Tomorrow | Mañana |
| This Week | Esta Semana |
| This Month | Este Mes |
| This Year | Este Año |
| Last Month | Mes Anterior |
| Next Month | Próximo Mes |

## ✅ Implementation Checklist

### **Week 1: Core UI**
- [ ] Update navigation labels
- [ ] Fix button text throughout app
- [ ] Standardize form field labels
- [ ] Update page titles and headers
- [ ] Fix breadcrumb navigation

### **Week 2: Messages & Content**
- [ ] Translate all error messages
- [ ] Update success notifications
- [ ] Fix validation messages
- [ ] Update help text and tooltips
- [ ] Review modal dialog content

### **Week 3: Advanced Content**
- [ ] Update dashboard metric labels
- [ ] Fix chart and graph labels
- [ ] Review email templates
- [ ] Update onboarding content
- [ ] Fix export/import labels

### **Week 4: Quality Assurance**
- [ ] Full application review
- [ ] Test all user workflows
- [ ] Verify accessibility with Spanish text
- [ ] Update documentation
- [ ] Create style guide for future content

## 🔍 Quality Assurance

### **Testing Checklist**
- [ ] All navigation works with new labels
- [ ] Forms submit correctly with Spanish labels
- [ ] Error messages display properly
- [ ] Accessibility features work with Spanish text
- [ ] Text fits properly in UI components
- [ ] Mobile responsive design maintained

### **Review Process**
1. **Automated Check**: Run language consistency linter
2. **Manual Review**: Native Spanish speaker review
3. **User Testing**: Test with Spanish-speaking users
4. **Accessibility**: Screen reader testing in Spanish
5. **Final Approval**: Stakeholder review

## 📚 Resources

### **Spanish Style Guides**
- [Real Academia Española](https://rae.es/) - Official Spanish language authority
- [Fundéu](https://fundeu.es/) - Spanish language foundation
- [Google Spanish Style Guide](https://developers.google.com/style/translation-spanish)

### **Tools**
- **Translation Memory**: Build glossary of common terms
- **Linting**: ESLint rules for language consistency
- **Testing**: Spanish language accessibility testing
- **Review**: Native speaker review process

---

## 🎯 Success Metrics

- **Language Consistency**: 100% Spanish for user-facing content
- **User Experience**: No confusion from mixed languages
- **Accessibility**: Properly announced by Spanish screen readers
- **Maintenance**: Clear guidelines for future content additions

---

🌟 **Goal**: Create a fully Spanish user experience that feels natural and professional for Spanish-speaking users while maintaining developer-friendly English in technical areas.