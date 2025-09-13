import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🔍 Ejecutando verificaciones pre-deploy...\n');

const checks = [
  {
    name: 'Verificar PropTypes imports incorrectos',
    command: () => {
      try {
        const result = execSync('grep -r "PropTypes.*from.*[\'\\"]react[\'\\"]" src/ || true',
          { encoding: 'utf8' });
        if (result.trim()) {
          throw new Error(`❌ Encontrados imports incorrectos de PropTypes:\n${result}`);
        }
        console.log('✅ No hay imports incorrectos de PropTypes');
      } catch (error) {
        if (error.message.includes('❌')) throw error;
        console.log('✅ No hay imports incorrectos de PropTypes');
      }
    }
  },
  {
    name: 'Verificar versiones de React consistentes',
    command: () => {
      try {
        const result = execSync('npm ls react react-dom prop-types --json',
          { encoding: 'utf8' });
        const deps = JSON.parse(result);

        // Verificar que no hay conflictos de versiones
        if (deps.problems && deps.problems.length > 0) {
          const reactProblems = deps.problems.filter(p =>
            p.includes('react') || p.includes('prop-types'));
          if (reactProblems.length > 0) {
            throw new Error(`❌ Conflictos de versiones:\n${reactProblems.join('\n')}`);
          }
        }
        console.log('✅ Versiones de React consistentes');
      } catch (error) {
        if (error.message.includes('❌')) throw error;
        console.log('✅ Versiones de React consistentes');
      }
    }
  },
  {
    name: 'Verificar configuración de Vite',
    command: () => {
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');

      // Verificar que los alias están configurados
      if (!viteConfig.includes("'prop-types': path.resolve('./node_modules/prop-types')")) {
        throw new Error('❌ Falta alias para prop-types en vite.config.ts');
      }

      // Verificar que PropTypes está en react-vendor chunk
      if (!viteConfig.includes("id.includes('prop-types')")) {
        throw new Error('❌ PropTypes no está configurado en react-vendor chunk');
      }

      console.log('✅ Configuración de Vite correcta');
    }
  },
  {
    name: 'Build de prueba',
    command: () => {
      console.log('🔨 Iniciando build de prueba...');
      try {
        execSync('npm run build', { stdio: 'inherit', timeout: 120000 });
        console.log('✅ Build exitoso');
      } catch (error) {
        throw new Error(`❌ Build falló: ${error.message}`);
      }
    }
  },
  {
    name: 'Verificar chunks generados',
    command: () => {
      const distPath = path.join(process.cwd(), 'dist', 'assets');
      if (!fs.existsSync(distPath)) {
        throw new Error('❌ Directorio dist/assets no existe');
      }

      const files = fs.readdirSync(distPath);
      const reactVendorFile = files.find(f => f.includes('react-vendor') && f.endsWith('.js'));

      if (!reactVendorFile) {
        throw new Error('❌ No se encontró react-vendor chunk');
      }

      // Verificar que PropTypes está en el chunk correcto
      const reactVendorPath = path.join(distPath, reactVendorFile);
      const reactVendorContent = fs.readFileSync(reactVendorPath, 'utf8');

      if (!reactVendorContent.includes('PropTypes')) {
        console.log('⚠️ PropTypes no encontrado en react-vendor chunk');
      } else {
        console.log('✅ PropTypes incluido en react-vendor chunk');
      }

      console.log(`✅ Chunks generados correctamente (${reactVendorFile})`);
    }
  }
];

let allPassed = true;

for (const check of checks) {
  try {
    console.log(`\n🔍 ${check.name}...`);
    check.command();
  } catch (error) {
    console.error(`\n❌ Falló: ${check.name}`);
    console.error(error.message);
    allPassed = false;
    break; // Stop on first failure
  }
}

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('🎉 ¡Todas las verificaciones pasaron! Listo para deploy.');
  process.exit(0);
} else {
  console.log('💥 Algunas verificaciones fallaron. Revisa los errores antes de hacer deploy.');
  process.exit(1);
}