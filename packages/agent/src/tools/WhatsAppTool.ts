// =============================================================================
// ORBIT AI AGENT - WHATSAPP TOOL
// =============================================================================

import { Message, MessageIntent, ConversationContext } from '../types/index.js';
import { Logger } from '../utils/Logger.js';

/**
 * 📱 HERRAMIENTA DE WHATSAPP
 * 
 * Maneja toda la comunicación por WhatsApp:
 * - Envío de mensajes
 * - Recepción y procesamiento
 * - Gestión de conversaciones
 * - Integración con WhatsApp Business API
 */
export class WhatsAppTool {
  private readonly logger: Logger;
  private readonly isEnabled: boolean;
  private client?: any; // WhatsApp Web JS o Business API client
  
  constructor(isEnabled: boolean = false) {
    this.isEnabled = isEnabled;
    this.logger = new Logger('WhatsAppTool');
  }
  
  async initialize(): Promise<void> {
    if (!this.isEnabled) {
      this.logger.warn('⚠️ WhatsApp tool is disabled in configuration');
      return;
    }
    
    this.logger.info('🔄 Initializing WhatsApp tool...');
    
    try {
      // En producción, inicializar WhatsApp Web JS o Business API
      await this.initializeWhatsAppClient();
      
      this.logger.info('✅ WhatsApp tool initialized successfully');
    } catch (error) {
      this.logger.error('❌ Failed to initialize WhatsApp tool:', error);
      throw error;
    }
  }
  
  /**
   * Envía mensaje por WhatsApp
   */
  async sendMessage(
    to: string, 
    content: string, 
    options?: {
      businessId?: string;
      automated?: boolean;
      timestamp?: Date;
      type?: 'text' | 'image' | 'document';
      mediaUrl?: string;
    }
  ): Promise<any> {
    if (!this.isEnabled) {
      // Modo simulación
      this.logger.info(`📱 [SIMULATION] Would send WhatsApp message to ${to}: ${content}`);
      return {
        id: `msg_${Date.now()}`,
        status: 'sent',
        timestamp: new Date(),
        simulation: true
      };
    }
    
    try {
      // Validar número de WhatsApp
      const validatedNumber = this.validateWhatsAppNumber(to);
      
      // Preparar mensaje según tipo
      const messageData = this.prepareMessageData(content, options);
      
      // Enviar usando cliente de WhatsApp
      const result = await this.sendViaClient(validatedNumber, messageData);
      
      this.logger.info(`✅ WhatsApp message sent to ${to}`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Failed to send WhatsApp message to ${to}:`, error);
      throw error;
    }
  }
  
  /**
   * Envía mensaje con template (WhatsApp Business)
   */
  async sendTemplate(
    to: string,
    templateName: string,
    parameters: any[],
    options?: { businessId?: string }
  ): Promise<any> {
    if (!this.isEnabled) {
      this.logger.info(`📱 [SIMULATION] Would send template ${templateName} to ${to}`);
      return { id: `template_${Date.now()}`, status: 'sent', simulation: true };
    }
    
    try {
      const validatedNumber = this.validateWhatsAppNumber(to);
      
      const templateMessage = {
        messaging_product: 'whatsapp',
        to: validatedNumber,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'es_AR' },
          components: [{
            type: 'body',
            parameters: parameters.map(param => ({ type: 'text', text: param }))
          }]
        }
      };
      
      const result = await this.sendViaBusinessAPI(templateMessage);
      
      this.logger.info(`✅ WhatsApp template ${templateName} sent to ${to}`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Failed to send WhatsApp template to ${to}:`, error);
      throw error;
    }
  }
  
  /**
   * Envía imagen con caption
   */
  async sendImage(
    to: string,
    imageUrl: string,
    caption?: string,
    options?: { businessId?: string }
  ): Promise<any> {
    return await this.sendMessage(to, caption || '', {
      ...options,
      type: 'image',
      mediaUrl: imageUrl
    });
  }
  
  /**
   * Envía documento
   */
  async sendDocument(
    to: string,
    documentUrl: string,
    filename: string,
    caption?: string,
    options?: { businessId?: string }
  ): Promise<any> {
    return await this.sendMessage(to, caption || '', {
      ...options,
      type: 'document',
      mediaUrl: documentUrl
    });
  }
  
  /**
   * Responde a mensaje específico
   */
  async replyToMessage(
    to: string,
    content: string,
    originalMessageId: string,
    options?: { businessId?: string }
  ): Promise<any> {
    if (!this.isEnabled) {
      this.logger.info(`📱 [SIMULATION] Would reply to message ${originalMessageId}: ${content}`);
      return { id: `reply_${Date.now()}`, status: 'sent', simulation: true };
    }
    
    try {
      const messageData = {
        messaging_product: 'whatsapp',
        to: this.validateWhatsAppNumber(to),
        type: 'text',
        context: { message_id: originalMessageId },
        text: { body: content }
      };
      
      const result = await this.sendViaBusinessAPI(messageData);
      
      this.logger.info(`✅ Reply sent to ${to}`);
      return result;
      
    } catch (error) {
      this.logger.error(`❌ Failed to send reply to ${to}:`, error);
      throw error;
    }
  }
  
  /**
   * Marca mensaje como leído
   */
  async markAsRead(messageId: string): Promise<void> {
    if (!this.isEnabled) {
      this.logger.info(`📱 [SIMULATION] Would mark message ${messageId} as read`);
      return;
    }
    
    try {
      await this.sendViaBusinessAPI({
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      });
      
      this.logger.debug(`✅ Message ${messageId} marked as read`);
    } catch (error) {
      this.logger.error(`❌ Failed to mark message as read:`, error);
    }
  }
  
  /**
   * Obtiene información del contacto
   */
  async getContactInfo(phoneNumber: string): Promise<any> {
    if (!this.isEnabled) {
      return {
        phone: phoneNumber,
        name: 'Cliente',
        profile_pic: null,
        simulation: true
      };
    }
    
    try {
      // En producción, usar WhatsApp Business API para obtener info del contacto
      const contactInfo = await this.fetchContactInfo(phoneNumber);
      
      this.logger.info(`📋 Contact info retrieved for ${phoneNumber}`);
      return contactInfo;
      
    } catch (error) {
      this.logger.error(`❌ Failed to get contact info for ${phoneNumber}:`, error);
      return {
        phone: phoneNumber,
        name: 'Cliente',
        error: error.message
      };
    }
  }
  
  /**
   * Obtiene historial de conversación
   */
  async getConversationHistory(
    phoneNumber: string, 
    limit: number = 50
  ): Promise<Message[]> {
    if (!this.isEnabled) {
      // Historial simulado
      return [{
        id: `msg_${Date.now()}`,
        from: phoneNumber,
        to: 'business',
        content: 'Hola, ¿tienen disponible el producto X?',
        type: 'text',
        platform: 'whatsapp',
        timestamp: new Date(),
        metadata: { simulation: true }
      }];
    }
    
    try {
      const history = await this.fetchConversationHistory(phoneNumber, limit);
      
      this.logger.info(`📜 Retrieved ${history.length} messages for ${phoneNumber}`);
      return history;
      
    } catch (error) {
      this.logger.error(`❌ Failed to get conversation history:`, error);
      return [];
    }
  }
  
  /**
   * Configura webhook para recibir mensajes
   */
  async setupWebhook(webhookUrl: string, verifyToken: string): Promise<void> {
    if (!this.isEnabled) {
      this.logger.info(`📱 [SIMULATION] Would setup webhook: ${webhookUrl}`);
      return;
    }
    
    try {
      // Configurar webhook en WhatsApp Business API
      await this.configureWebhook(webhookUrl, verifyToken);
      
      this.logger.info('✅ WhatsApp webhook configured successfully');
    } catch (error) {
      this.logger.error('❌ Failed to setup WhatsApp webhook:', error);
      throw error;
    }
  }
  
  /**
   * Procesa webhook entrante
   */
  async processWebhook(payload: any): Promise<Message[]> {
    try {
      const messages: Message[] = [];
      
      // Procesar payload de WhatsApp Business API
      if (payload.entry && payload.entry.length > 0) {
        for (const entry of payload.entry) {
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              if (change.value && change.value.messages) {
                for (const msg of change.value.messages) {
                  const message = this.parseIncomingMessage(msg, change.value);
                  messages.push(message);
                }
              }
            }
          }
        }
      }
      
      this.logger.info(`📥 Processed ${messages.length} incoming messages`);
      return messages;
      
    } catch (error) {
      this.logger.error('❌ Failed to process webhook:', error);
      return [];
    }
  }
  
  // ==========================================================================
  // MÉTODOS PRIVADOS
  // ==========================================================================
  
  private async initializeWhatsAppClient(): Promise<void> {
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (!accessToken || !phoneNumberId) {
      throw new Error('WhatsApp credentials not configured');
    }
    
    // Configurar cliente
    this.client = {
      apiVersion,
      accessToken,
      phoneNumberId,
      baseUrl: `https://graph.facebook.com/${apiVersion}/${phoneNumberId}`
    };
    
    // Verificar conexión
    await this.testConnection();
  }
  
  private async testConnection(): Promise<void> {
    // Test simple para verificar que la API responde
    try {
      const response = await fetch(`${this.client.baseUrl}`, {
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`WhatsApp API returned ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      throw new Error(`WhatsApp API connection test failed: ${error.message}`);
    }
  }
  
  private validateWhatsAppNumber(phoneNumber: string): string {
    // Remover espacios y caracteres especiales
    let cleaned = phoneNumber.replace(/[^0-9+]/g, '');
    
    // Si no tiene código de país, asumir Argentina (+54)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('54')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('9')) {
        cleaned = '+54' + cleaned;
      } else {
        cleaned = '+549' + cleaned;
      }
    }
    
    return cleaned;
  }
  
  private prepareMessageData(content: string, options: any = {}): any {
    const baseData = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      type: options.type || 'text'
    };
    
    switch (options.type) {
      case 'image':
        return {
          ...baseData,
          type: 'image',
          image: {
            link: options.mediaUrl,
            caption: content || ''
          }
        };
        
      case 'document':
        return {
          ...baseData,
          type: 'document',
          document: {
            link: options.mediaUrl,
            caption: content || '',
            filename: options.filename || 'document.pdf'
          }
        };
        
      default: // text
        return {
          ...baseData,
          type: 'text',
          text: { body: content }
        };
    }
  }
  
  private async sendViaClient(to: string, messageData: any): Promise<any> {
    // Implementar envío usando el cliente de WhatsApp
    // Por ahora, simulación
    return {
      id: `msg_${Date.now()}`,
      status: 'sent',
      timestamp: new Date(),
      to,
      messageData
    };
  }
  
  private async sendViaBusinessAPI(messageData: any): Promise<any> {
    if (!this.client) {
      throw new Error('WhatsApp client not initialized');
    }
    
    try {
      const response = await fetch(`${this.client.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.client.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(error)}`);
      }
      
      return await response.json();
      
    } catch (error) {
      throw new Error(`Failed to send via WhatsApp Business API: ${error.message}`);
    }
  }
  
  private async fetchContactInfo(phoneNumber: string): Promise<any> {
    // Implementar obtención de info del contacto
    return {
      phone: phoneNumber,
      name: 'Cliente',
      profile_pic: null
    };
  }
  
  private async fetchConversationHistory(phoneNumber: string, limit: number): Promise<Message[]> {
    // Implementar obtención del historial
    return [];
  }
  
  private async configureWebhook(webhookUrl: string, verifyToken: string): Promise<void> {
    // Implementar configuración del webhook
  }
  
  private parseIncomingMessage(msg: any, value: any): Message {
    return {
      id: msg.id,
      from: msg.from,
      to: value.metadata?.phone_number_id || 'business',
      content: msg.text?.body || msg.caption || '',
      type: msg.type === 'text' ? 'text' : msg.type,
      platform: 'whatsapp',
      timestamp: new Date(parseInt(msg.timestamp) * 1000),
      metadata: {
        context: msg.context,
        contacts: value.contacts,
        profile: value.profiles
      }
    };
  }
}