// =============================================================================
// ORBIT AI AGENT - SALES TOOL
// =============================================================================

import { Order, BusinessProfile } from '../types/index.js';
import { Logger } from '../utils/Logger.js';

/**
 * 💰 HERRAMIENTA DE VENTAS
 * 
 * Gestiona todo el proceso de ventas:
 * - Creación de promociones automáticas
 * - Procesamiento de pedidos
 * - Recomendaciones de upsell/cross-sell
 * - Análisis de conversion
 * - Gestión de inventario básica
 */
export class SalesTool {
  private readonly logger: Logger;
  
  // Simulación de base de datos de promociones y pedidos
  private promotions: Map<string, any> = new Map();
  private orders: Map<string, Order> = new Map();
  private products: Map<string, any> = new Map();
  
  constructor() {
    this.logger = new Logger('SalesTool');
  }
  
  async initialize(): Promise<void> {
    this.logger.info('🔄 Initializing sales tool...');
    
    // Cargar datos de productos y promociones existentes
    await this.loadProducts();
    await this.loadActivePromotions();
    
    this.logger.info('✅ Sales tool initialized');
  }
  
  // ==========================================================================
  // GESTIÓN DE PROMOCIONES
  // ==========================================================================
  
  /**
   * Crea una promoción automática
   */
  async createPromotion(params: {
    type: string;
    discount: number;
    products?: string[];
    duration: number; // horas
    businessId: string;
    conditions?: any;
  }): Promise<any> {
    this.logger.info(`💰 Creating ${params.type} promotion: ${params.discount}% off`);
    
    const promoId = `promo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const expiresAt = new Date(Date.now() + params.duration * 60 * 60 * 1000);
    
    const promotion = {
      id: promoId,
      type: params.type,
      discount: params.discount,
      products: params.products || [],
      businessId: params.businessId,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
      conditions: params.conditions || {},
      usage: {
        totalUses: 0,
        maxUses: params.conditions?.maxUses || 100,
        minOrderAmount: params.conditions?.minOrderAmount || 0
      },
      metadata: this.generatePromotionMetadata(params)
    };
    
    this.promotions.set(promoId, promotion);
    
    this.logger.info(`✅ Promotion created: ${promoId} (expires ${expiresAt.toISOString()})`);
    return promotion;
  }
  
  /**
   * Genera promociones inteligentes basadas en contexto
   */
  async generateSmartPromotion(context: {
    businessId: string;
    trigger: 'sales_drop' | 'competitor_activity' | 'high_traffic' | 'inventory_clear' | 'weekend' | 'lunch_time';
    severity?: 'low' | 'medium' | 'high';
    metadata?: any;
  }): Promise<any> {
    this.logger.info(`🧠 Generating smart promotion for trigger: ${context.trigger}`);
    
    const promoStrategy = this.getPromotionStrategy(context.trigger, context.severity);
    
    return await this.createPromotion({
      type: promoStrategy.type,
      discount: promoStrategy.discount,
      products: promoStrategy.products,
      duration: promoStrategy.duration,
      businessId: context.businessId,
      conditions: promoStrategy.conditions
    });
  }
  
  private getPromotionStrategy(trigger: string, severity: string = 'medium'): any {
    const strategies = {
      'sales_drop': {
        low: { type: 'flash_sale', discount: 10, duration: 24, products: [] },
        medium: { type: 'rescue_promo', discount: 15, duration: 48, products: [] },
        high: { type: 'emergency_sale', discount: 25, duration: 72, products: [] }
      },
      'competitor_activity': {
        low: { type: 'counter_offer', discount: 12, duration: 24, products: [] },
        medium: { type: 'beat_competition', discount: 18, duration: 48, products: [] },
        high: { type: 'aggressive_counter', discount: 30, duration: 24, products: [] }
      },
      'high_traffic': {
        low: { type: 'traffic_boost', discount: 8, duration: 6, products: [] },
        medium: { type: 'momentum_sale', discount: 12, duration: 12, products: [] },
        high: { type: 'viral_promo', discount: 20, duration: 24, products: [] }
      },
      'inventory_clear': {
        low: { type: 'clearance', discount: 15, duration: 168, products: [] },
        medium: { type: 'stock_clear', discount: 25, duration: 120, products: [] },
        high: { type: 'liquidation', discount: 40, duration: 72, products: [] }
      },
      'weekend': {
        low: { type: 'weekend_special', discount: 10, duration: 48, products: [] },
        medium: { type: 'weekend_blast', discount: 15, duration: 48, products: [] },
        high: { type: 'weekend_mega', discount: 20, duration: 48, products: [] }
      },
      'lunch_time': {
        low: { type: 'lunch_deal', discount: 8, duration: 3, products: [] },
        medium: { type: 'lunch_combo', discount: 12, duration: 4, products: [] },
        high: { type: 'lunch_flash', discount: 18, duration: 2, products: [] }
      }
    };
    
    const strategy = strategies[trigger as keyof typeof strategies]?.[severity as keyof typeof strategies[typeof trigger]] 
      || strategies.sales_drop.medium;
    
    return {
      ...strategy,
      conditions: {
        maxUses: strategy.discount > 20 ? 50 : 100,
        minOrderAmount: strategy.discount > 15 ? 1000 : 500
      }
    };
  }
  
  /**
   * Valida si una promoción es aplicable a un pedido
   */
  async validatePromotion(promoCode: string, orderData: any): Promise<{ valid: boolean; discount: number; reason?: string }> {
    const promotion = this.promotions.get(promoCode);
    
    if (!promotion) {
      return { valid: false, discount: 0, reason: 'Promotion not found' };
    }
    
    if (!promotion.isActive) {
      return { valid: false, discount: 0, reason: 'Promotion is inactive' };
    }
    
    if (new Date() > promotion.expiresAt) {
      return { valid: false, discount: 0, reason: 'Promotion expired' };
    }
    
    if (promotion.usage.totalUses >= promotion.usage.maxUses) {
      return { valid: false, discount: 0, reason: 'Promotion usage limit reached' };
    }
    
    if (orderData.total < promotion.usage.minOrderAmount) {
      return { 
        valid: false, 
        discount: 0, 
        reason: `Minimum order amount: $${promotion.usage.minOrderAmount}` 
      };
    }
    
    return { valid: true, discount: promotion.discount };
  }
  
  // ==========================================================================
  // PROCESAMIENTO DE PEDIDOS
  // ==========================================================================
  
  /**
   * Procesa un pedido completo
   */
  async processOrder(orderData: {
    customerId: string;
    items: any[];
    total: number;
    businessId: string;
    promoCode?: string;
    deliveryAddress?: string;
    notes?: string;
  }): Promise<Order> {
    this.logger.info(`🛒 Processing order for customer ${orderData.customerId}`);
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    let finalTotal = orderData.total;
    let appliedDiscount = 0;
    
    // Aplicar promoción si existe
    if (orderData.promoCode) {
      const promoValidation = await this.validatePromotion(orderData.promoCode, orderData);
      if (promoValidation.valid) {
        appliedDiscount = (orderData.total * promoValidation.discount) / 100;
        finalTotal = orderData.total - appliedDiscount;
        
        // Actualizar uso de la promoción
        const promotion = this.promotions.get(orderData.promoCode);
        if (promotion) {
          promotion.usage.totalUses += 1;
        }
      }
    }
    
    const order: Order = {
      id: orderId,
      customerId: orderData.customerId,
      items: orderData.items.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity || 1,
        price: item.price || 0,
        customizations: item.customizations || []
      })),
      total: finalTotal,
      originalTotal: orderData.total,
      discount: appliedDiscount,
      promoCode: orderData.promoCode,
      status: 'confirmed',
      createdAt: new Date(),
      deliveryAddress: orderData.deliveryAddress,
      notes: orderData.notes,
      businessId: orderData.businessId,
      paymentStatus: 'pending',
      estimatedDelivery: this.calculateEstimatedDelivery()
    };
    
    this.orders.set(orderId, order);
    
    // Actualizar inventario (simulado)
    await this.updateInventory(order.items);
    
    // Generar recomendaciones de upsell para el futuro
    const upsellRecommendations = await this.generateUpsellRecommendations(orderData.customerId, order.items);
    
    this.logger.info(`✅ Order processed: ${orderId} ($${finalTotal})`);
    
    return {
      ...order,
      recommendations: upsellRecommendations
    } as Order;
  }
  
  /**
   * Actualiza el estado de un pedido
   */
  async updateOrderStatus(orderId: string, newStatus: Order['status'], notes?: string): Promise<boolean> {
    const order = this.orders.get(orderId);
    
    if (!order) {
      this.logger.error(`Order ${orderId} not found`);
      return false;
    }
    
    const oldStatus = order.status;
    order.status = newStatus;
    order.updatedAt = new Date();
    
    if (notes) {
      order.statusNotes = notes;
    }
    
    this.logger.info(`📋 Order ${orderId} status updated: ${oldStatus} -> ${newStatus}`);
    
    // Enviar notificación al cliente (simulado)
    await this.sendOrderStatusNotification(order);
    
    return true;
  }
  
  // ==========================================================================
  // RECOMENDACIONES Y UPSELLING
  // ==========================================================================
  
  /**
   * Genera recomendaciones de productos para un cliente
   */
  async generateRecommendations(customerId: string, currentCart: any[]): Promise<any[]> {
    this.logger.info(`🎯 Generating recommendations for customer ${customerId}`);
    
    const recommendations = [];
    
    // 1. Productos complementarios
    const complementary = await this.findComplementaryProducts(currentCart);
    recommendations.push(...complementary);
    
    // 2. Productos populares
    const popular = await this.getPopularProducts(3);
    recommendations.push(...popular);
    
    // 3. Basado en historial del cliente
    const historical = await this.getCustomerBasedRecommendations(customerId, 2);
    recommendations.push(...historical);
    
    // 4. Ofertas especiales activas
    const promos = await this.getPromotionalRecommendations(2);
    recommendations.push(...promos);
    
    return this.rankRecommendations(recommendations, currentCart).slice(0, 5);
  }
  
  private async findComplementaryProducts(cartItems: any[]): Promise<any[]> {
    // Lógica de productos complementarios basada en rules simples
    const complementaryRules = {
      'empanadas': ['bebida', 'salsa', 'postre'],
      'pizza': ['bebida', 'entrada', 'postre'],
      'hamburguesa': ['papas', 'bebida', 'salsa'],
      'remera': ['pantalon', 'accesorio', 'calzado'],
      'telefono': ['funda', 'cargador', 'auriculares']
    };
    
    const recommendations = [];
    
    for (const item of cartItems) {
      const productName = item.name || item.productName || '';
      for (const [key, complements] of Object.entries(complementaryRules)) {
        if (productName.toLowerCase().includes(key)) {
          complements.forEach(complement => {
            recommendations.push({
              type: 'complementary',
              reason: `Va perfecto con ${productName}`,
              product: complement,
              score: 0.8
            });
          });
        }
      }
    }
    
    return recommendations;
  }
  
  private async getPopularProducts(count: number): Promise<any[]> {
    // Productos más vendidos (simulado)
    const popular = [
      { name: 'Producto Estrella', category: 'popular', score: 0.9 },
      { name: 'Lo Más Pedido', category: 'trending', score: 0.85 },
      { name: 'Favorito', category: 'popular', score: 0.8 }
    ];
    
    return popular.slice(0, count).map(product => ({
      type: 'popular',
      reason: 'Es uno de nuestros más vendidos',
      product: product.name,
      score: product.score
    }));
  }
  
  private async getCustomerBasedRecommendations(customerId: string, count: number): Promise<any[]> {
    // Basado en historial del cliente (simulado)
    const customerHistory = await this.getCustomerOrderHistory(customerId);
    
    if (customerHistory.length === 0) {
      return [];
    }
    
    // Encontrar patrones en pedidos anteriores
    const frequentProducts = this.analyzeCustomerPreferences(customerHistory);
    
    return frequentProducts.slice(0, count).map(product => ({
      type: 'personal',
      reason: 'Basado en tus pedidos anteriores',
      product: product.name,
      score: product.frequency
    }));
  }
  
  private async getPromotionalRecommendations(count: number): Promise<any[]> {
    const activePromos = Array.from(this.promotions.values())
      .filter(promo => promo.isActive && new Date() < promo.expiresAt);
    
    return activePromos.slice(0, count).map(promo => ({
      type: 'promotion',
      reason: `${promo.discount}% de descuento`,
      product: promo.type,
      score: 0.7,
      discount: promo.discount
    }));
  }
  
  private rankRecommendations(recommendations: any[], currentCart: any[]): any[] {
    // Ranking simple por score y diversidad
    return recommendations
      .sort((a, b) => b.score - a.score)
      .filter((rec, index, arr) => 
        // Evitar duplicados
        arr.findIndex(r => r.product === rec.product) === index
      );
  }
  
  private async generateUpsellRecommendations(customerId: string, orderItems: any[]): Promise<any[]> {
    // Generar recomendaciones para el próximo pedido
    const upsellRecs = [];
    
    // Versiones premium de productos comprados
    orderItems.forEach(item => {
      upsellRecs.push({
        type: 'upgrade',
        reason: `Probá la versión premium de ${item.productId}`,
        product: `${item.productId} Premium`,
        score: 0.6
      });
    });
    
    // Cantidades mayores
    if (orderItems.length === 1 && orderItems[0].quantity === 1) {
      upsellRecs.push({
        type: 'quantity',
        reason: 'Ahorrá pidiendo mayor cantidad',
        product: `Pack x${orderItems[0].quantity * 2}`,
        score: 0.5
      });
    }
    
    return upsellRecs.slice(0, 3);
  }
  
  // ==========================================================================
  // ANÁLISIS DE VENTAS
  // ==========================================================================
  
  /**
   * Calcula métricas de conversión
   */
  async calculateConversionMetrics(businessId: string, period: string = '7d'): Promise<any> {
    const orders = Array.from(this.orders.values())
      .filter(order => order.businessId === businessId);
    
    // Simulación de métricas de conversión
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      conversionRate: Math.random() * 0.05 + 0.02, // 2-7%
      repeatCustomerRate: Math.random() * 0.3 + 0.2, // 20-50%
      promotionUsage: this.calculatePromotionUsage(businessId),
      topProducts: this.getTopSellingProducts(orders, 5),
      revenueByDay: this.getRevenueByDay(orders, 7)
    };
  }
  
  private calculatePromotionUsage(businessId: string): any {
    const relevantPromos = Array.from(this.promotions.values())
      .filter(promo => promo.businessId === businessId);
    
    return {
      totalPromotions: relevantPromos.length,
      activePromotions: relevantPromos.filter(p => p.isActive).length,
      totalUsage: relevantPromos.reduce((sum, promo) => sum + promo.usage.totalUses, 0),
      totalDiscount: relevantPromos.reduce((sum, promo) => sum + (promo.usage.totalUses * promo.discount), 0)
    };
  }
  
  private getTopSellingProducts(orders: Order[], count: number): any[] {
    const productSales = new Map<string, { quantity: number; revenue: number }>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSales.set(item.productId, existing);
      });
    });
    
    return Array.from(productSales.entries())
      .map(([productId, data]) => ({
        productId,
        quantitySold: data.quantity,
        revenue: data.revenue,
        avgPrice: data.revenue / data.quantity
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, count);
  }
  
  private getRevenueByDay(orders: Order[], days: number): any[] {
    const revenueByDay = new Map<string, number>();
    
    // Inicializar días
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      revenueByDay.set(dateStr, 0);
    }
    
    // Calcular revenue por día
    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const existing = revenueByDay.get(dateStr) || 0;
      revenueByDay.set(dateStr, existing + order.total);
    });
    
    return Array.from(revenueByDay.entries()).map(([date, revenue]) => ({
      date,
      revenue
    }));
  }
  
  // ==========================================================================
  // MÉTODOS PRIVADOS Y UTILIDADES
  // ==========================================================================
  
  private async loadProducts(): Promise<void> {
    // Cargar productos desde base de datos (simulado)
    const mockProducts = [
      { id: 'prod1', name: 'Producto A', price: 1000, stock: 50, category: 'general' },
      { id: 'prod2', name: 'Producto B', price: 1500, stock: 30, category: 'premium' },
      { id: 'prod3', name: 'Producto C', price: 800, stock: 100, category: 'basico' }
    ];
    
    mockProducts.forEach(product => {
      this.products.set(product.id, product);
    });
    
    this.logger.info(`📦 Loaded ${mockProducts.length} products`);
  }
  
  private async loadActivePromotions(): Promise<void> {
    // Cargar promociones activas (simulado)
    this.logger.info('📋 Active promotions loaded');
  }
  
  private generatePromotionMetadata(params: any): any {
    return {
      channel: 'agent_generated',
      priority: params.discount > 20 ? 'high' : 'medium',
      targetAudience: 'all',
      expectedUptake: Math.min(params.discount * 2, 50), // Estimación simple
      createdBy: 'orbit_agent'
    };
  }
  
  private calculateEstimatedDelivery(): Date {
    // Estimación simple: 30-60 minutos
    const minutes = Math.floor(Math.random() * 30) + 30;
    return new Date(Date.now() + minutes * 60 * 1000);
  }
  
  private async updateInventory(items: any[]): Promise<void> {
    // Actualizar stock (simulado)
    items.forEach(item => {
      const product = this.products.get(item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
  }
  
  private async sendOrderStatusNotification(order: Order): Promise<void> {
    // Enviar notificación al cliente (simulado)
    this.logger.info(`📧 Notification sent to customer ${order.customerId} for order ${order.id}: ${order.status}`);
  }
  
  private async getCustomerOrderHistory(customerId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.customerId === customerId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  private analyzeCustomerPreferences(orders: Order[]): any[] {
    const productFrequency = new Map<string, number>();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const count = productFrequency.get(item.productId) || 0;
        productFrequency.set(item.productId, count + item.quantity);
      });
    });
    
    return Array.from(productFrequency.entries())
      .map(([productId, frequency]) => ({ name: productId, frequency }))
      .sort((a, b) => b.frequency - a.frequency);
  }
}