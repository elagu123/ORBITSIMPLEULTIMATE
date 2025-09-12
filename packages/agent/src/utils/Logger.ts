// =============================================================================
// ORBIT AI AGENT - LOGGING SYSTEM
// =============================================================================

import winston from 'winston';

/**
 * 📝 SISTEMA DE LOGGING
 * 
 * Logger especializado para el agente IA con contexto de negocio
 */
export class Logger {
  private winston: winston.Logger;
  private context: string;
  
  constructor(context: string = 'OrbitAgent') {
    this.context = context;
    
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level.toUpperCase()}] [${context || this.context}] ${message}${metaStr}`;
        })
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        new winston.transports.File({ 
          filename: 'logs/agent-error.log', 
          level: 'error' 
        }),
        new winston.transports.File({ 
          filename: 'logs/agent-combined.log' 
        })
      ]
    });
  }
  
  info(message: string, meta?: any): void {
    this.winston.info(message, { context: this.context, ...meta });
  }
  
  error(message: string, error?: any, meta?: any): void {
    this.winston.error(message, { 
      context: this.context, 
      error: error?.message || error,
      stack: error?.stack,
      ...meta 
    });
  }
  
  warn(message: string, meta?: any): void {
    this.winston.warn(message, { context: this.context, ...meta });
  }
  
  debug(message: string, meta?: any): void {
    this.winston.debug(message, { context: this.context, ...meta });
  }
  
  // Métodos especializados para el agente
  
  agentAction(action: string, businessId: string, meta?: any): void {
    this.info(`🤖 Agent action: ${action}`, { businessId, ...meta });
  }
  
  businessEvent(event: string, businessId: string, meta?: any): void {
    this.info(`🏪 Business event: ${event}`, { businessId, ...meta });
  }
  
  learningEvent(insight: string, confidence: number, meta?: any): void {
    this.info(`🧠 Learning: ${insight}`, { confidence, ...meta });
  }
  
  performanceMetric(metric: string, value: number, unit?: string, meta?: any): void {
    this.info(`📊 Performance: ${metric} = ${value}${unit || ''}`, { metric, value, unit, ...meta });
  }
}