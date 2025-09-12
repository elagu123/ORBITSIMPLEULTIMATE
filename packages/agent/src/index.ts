// =============================================================================
// ORBIT AI AGENT - PUNTO DE ENTRADA PRINCIPAL
// =============================================================================

import { OrbitAgent } from './core/OrbitAgent.js';
import { OrbitIntegration } from './integrations/OrbitIntegration.js';
import { Logger } from './utils/Logger.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const logger = new Logger('OrbitAgentMain');

/**
 * 🚀 INICIALIZACIÓN DEL AGENTE ORBIT AI
 */
async function main() {
  logger.info('🌟 Starting Orbit AI Agent System...');

  try {
    // 1. Crear instancia del agente
    const agent = new OrbitAgent({
      enableMemory: true,
      enableAnalytics: true,
      enableAutonomy: true,
      memoryConfig: {
        redis: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          password: process.env.REDIS_PASSWORD
        },
        vector: {
          connectionString: process.env.PGVECTOR_URL || 'postgresql://localhost:5432/orbit_agent'
        }
      }
    });

    // 2. Crear integración con sistema existente
    const integration = new OrbitIntegration(agent);

    // 3. Inicializar sistema completo
    await integration.initialize();

    // 4. Configurar manejo de señales de sistema
    process.on('SIGINT', async () => {
      logger.info('📡 Received SIGINT, shutting down gracefully...');
      await integration.shutdown();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('📡 Received SIGTERM, shutting down gracefully...');
      await integration.shutdown();
      process.exit(0);
    });

    logger.info('🎯 Orbit AI Agent System is ready!');
    logger.info('🔗 Integration API running on http://localhost:3003');
    logger.info('📊 Health check: http://localhost:3003/health');

  } catch (error) {
    logger.error('💥 Failed to start Orbit AI Agent:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('💥 Unhandled error in main:', error);
    process.exit(1);
  });
}

export { OrbitAgent, OrbitIntegration };