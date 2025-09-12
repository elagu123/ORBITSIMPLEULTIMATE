#!/bin/bash

# =============================================================================
# ORBIT SIMPLE MKT + AI AGENT - SCRIPT DE DEPLOYMENT
# =============================================================================

set -e

echo "🌟 ORBIT DEPLOYMENT INICIADO"
echo "============================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para logs con color
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# =============================================================================
# VERIFICACIONES PREVIAS
# =============================================================================

log "🔍 Verificando dependencias..."

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado"
    exit 1
fi

# Verificar archivo .env
if [ ! -f ".env" ]; then
    warn "Archivo .env no encontrado, creando desde template..."
    cp .env.example .env
    warn "⚠️ IMPORTANTE: Configurar las variables en .env antes de continuar"
    info "Editando .env..."
    
    # Generar valores por defecto
    JWT_SECRET=$(openssl rand -base64 32)
    REDIS_PASSWORD=$(openssl rand -base64 16)
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
    GRAFANA_PASSWORD=$(openssl rand -base64 16)
    
    # Actualizar .env con valores generados
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    sed -i "s/REDIS_PASSWORD=.*/REDIS_PASSWORD=$REDIS_PASSWORD/" .env
    sed -i "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env
    sed -i "s/GRAFANA_PASSWORD=.*/GRAFANA_PASSWORD=$GRAFANA_PASSWORD/" .env
    
    log "✅ Passwords generados automáticamente"
fi

# Cargar variables de entorno
source .env

log "✅ Verificaciones completadas"

# =============================================================================
# PREPARACIÓN DEL DEPLOYMENT
# =============================================================================

log "🔧 Preparando deployment..."

# Crear directorios necesarios
mkdir -p nginx/ssl
mkdir -p uploads
mkdir -p monitoring/grafana/{dashboards,datasources}
mkdir -p scripts

# Verificar puertos disponibles
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        warn "Puerto $port está en uso"
        return 1
    fi
    return 0
}

# Verificar puertos críticos
PORTS=(80 443 3000 3001 3003 5432 5433 6379 9090 3001)
for port in "${PORTS[@]}"; do
    if ! check_port $port; then
        error "Puerto $port está ocupado. Deteniendo procesos..."
        # Intentar liberar puerto si es de nuestra aplicación
        docker-compose down 2>/dev/null || true
        sleep 2
        if ! check_port $port; then
            error "No se pudo liberar el puerto $port"
            exit 1
        fi
    fi
done

log "✅ Puertos verificados"

# =============================================================================
# CONSTRUCCIÓN DE IMÁGENES
# =============================================================================

log "🏗️ Construyendo imágenes Docker..."

# Detener servicios existentes
docker-compose down --volumes 2>/dev/null || true

# Limpiar imágenes previas
docker-compose down --rmi all --volumes --remove-orphans 2>/dev/null || true

# Construir imágenes
info "Construyendo imagen del frontend..."
docker build -f Dockerfile.frontend -t orbit-frontend .

info "Construyendo imagen del backend..."
docker build -f Dockerfile.backend -t orbit-backend .

info "Construyendo imagen del agente AI..."
docker build -f Dockerfile.agent -t orbit-agent .

log "✅ Imágenes construidas exitosamente"

# =============================================================================
# INICIALIZACIÓN DE BASE DE DATOS
# =============================================================================

log "🗃️ Inicializando bases de datos..."

# Iniciar solo los servicios de BD primero
docker-compose up -d postgres pgvector redis

# Esperar que las bases de datos estén listas
info "Esperando PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U postgres; do
    sleep 2
done

info "Esperando PGVector..."
until docker-compose exec -T pgvector pg_isready -U postgres; do
    sleep 2
done

info "Esperando Redis..."
until docker-compose exec -T redis redis-cli ping; do
    sleep 2
done

log "✅ Bases de datos inicializadas"

# =============================================================================
# DEPLOYMENT COMPLETO
# =============================================================================

log "🚀 Iniciando deployment completo..."

# Iniciar todos los servicios
docker-compose up -d

# Verificar que todos los servicios estén corriendo
info "Verificando servicios..."

services=("postgres" "pgvector" "redis" "backend" "agent" "frontend")
for service in "${services[@]}"; do
    if docker-compose ps $service | grep -q "Up"; then
        log "✅ $service: Running"
    else
        error "$service: Failed to start"
        docker-compose logs $service
        exit 1
    fi
done

# Esperar que los servicios estén listos
info "Esperando que los servicios estén listos..."

# Health check del backend
until curl -f http://localhost:3001/health > /dev/null 2>&1; do
    info "Esperando backend..."
    sleep 5
done

# Health check del agente
until curl -f http://localhost:3003/health > /dev/null 2>&1; do
    info "Esperando agente AI..."
    sleep 5
done

# Health check del frontend
until curl -f http://localhost:3000 > /dev/null 2>&1; do
    info "Esperando frontend..."
    sleep 5
done

log "✅ Todos los servicios están corriendo"

# =============================================================================
# CONFIGURACIÓN POST-DEPLOYMENT
# =============================================================================

log "⚙️ Configuración post-deployment..."

# Ejecutar migraciones si es necesario
info "Verificando migraciones..."
# docker-compose exec backend npm run migrate || true

# Inicializar datos de ejemplo si es el primer deployment
if [ "$1" = "--init-data" ]; then
    info "Inicializando datos de ejemplo..."
    # docker-compose exec backend npm run seed || true
fi

# Configurar monitoreo
info "Configurando monitoreo..."
docker-compose up -d prometheus grafana

log "✅ Configuración post-deployment completada"

# =============================================================================
# VERIFICACIONES FINALES
# =============================================================================

log "🔍 Verificaciones finales..."

# Test de endpoints críticos
endpoints=(
    "http://localhost:3000"
    "http://localhost:3001/health"
    "http://localhost:3003/health"
    "http://localhost:9090"
    "http://localhost:3001"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f "$endpoint" > /dev/null 2>&1; then
        log "✅ $endpoint: OK"
    else
        warn "$endpoint: No responde"
    fi
done

# Mostrar información del deployment
echo ""
echo "🎉 ¡DEPLOYMENT COMPLETADO EXITOSAMENTE!"
echo "======================================"
echo ""
echo "📱 APLICACIONES:"
echo "  🌐 Frontend:           http://localhost:3000"
echo "  🔧 Backend API:        http://localhost:3001"
echo "  🤖 Agente AI:          http://localhost:3003"
echo ""
echo "📊 MONITOREO:"
echo "  📈 Prometheus:         http://localhost:9090"
echo "  📊 Grafana:            http://localhost:3001"
echo "     Usuario: admin"
echo "     Password: $GRAFANA_PASSWORD"
echo ""
echo "🗃️ BASES DE DATOS:"
echo "  📝 PostgreSQL:         localhost:5432"
echo "  🔍 PGVector:            localhost:5433"
echo "  🚀 Redis:               localhost:6379"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "  Ver logs:              docker-compose logs -f [servicio]"
echo "  Reiniciar:             docker-compose restart [servicio]"
echo "  Detener todo:          docker-compose down"
echo "  Ver estado:            docker-compose ps"
echo ""

# Opcional: abrir browser
if command -v xdg-open &> /dev/null; then
    read -p "¿Abrir aplicación en el navegador? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        xdg-open http://localhost:3000
    fi
elif command -v open &> /dev/null; then
    read -p "¿Abrir aplicación en el navegador? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open http://localhost:3000
    fi
fi

log "🎯 Sistema Orbit Simple MKT + AI Agent desplegado y listo para usar!"

# =============================================================================
# OPCIONAL: MOSTRAR LOGS EN TIEMPO REAL
# =============================================================================

if [ "$1" = "--logs" ]; then
    echo ""
    log "📋 Mostrando logs en tiempo real (Ctrl+C para salir)..."
    docker-compose logs -f
fi