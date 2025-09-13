import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      "dashboard": "Dashboard",
      "content": "Content",
      "calendar": "Calendar",
      "customers": "Customers",
      "systems": "Systems",
      "settings": "Settings",

      // Common actions
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      "create": "Create",
      "update": "Update",
      "loading": "Loading...",
      "error": "Error",
      "success": "Success",

      // Auth
      "login": "Login",
      "logout": "Logout",
      "signup": "Sign Up",
      "email": "Email",
      "password": "Password",

      // Common phrases
      "welcome": "Welcome",
      "hello": "Hello",
      "goodbye": "Goodbye",
      "please_wait": "Please wait...",
      "try_again": "Try again",
      "no_data": "No data available"
    }
  },
  es: {
    translation: {
      // Navigation
      "dashboard": "Panel de Control",
      "content": "Contenido",
      "calendar": "Calendario",
      "customers": "Clientes",
      "systems": "Sistemas",
      "settings": "Configuración",

      // Common actions
      "save": "Guardar",
      "cancel": "Cancelar",
      "edit": "Editar",
      "delete": "Eliminar",
      "create": "Crear",
      "update": "Actualizar",
      "loading": "Cargando...",
      "error": "Error",
      "success": "Éxito",

      // Auth
      "login": "Iniciar Sesión",
      "logout": "Cerrar Sesión",
      "signup": "Registrarse",
      "email": "Correo Electrónico",
      "password": "Contraseña",

      // Common phrases
      "welcome": "Bienvenido",
      "hello": "Hola",
      "goodbye": "Adiós",
      "please_wait": "Por favor espera...",
      "try_again": "Inténtalo de nuevo",
      "no_data": "No hay datos disponibles"
    }
  }
};

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'es', // default language
    fallbackLng: 'en', // fallback language

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already does escaping
    },

    // Debug mode for development
    debug: import.meta.env.MODE === 'development',

    // React specific options
    react: {
      useSuspense: false // disable suspense for now
    },

    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;