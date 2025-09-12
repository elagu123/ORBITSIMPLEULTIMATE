-- =============================================================================
-- ORBIT AI AGENT - INICIALIZACIÓN PGVECTOR DATABASE
-- =============================================================================

-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- MEMORIA A LARGO PLAZO (EMBEDDINGS)
-- =============================================================================

CREATE TABLE memory_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  content_type VARCHAR(100) NOT NULL, -- conversation, insight, pattern, action_result
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embeddings dimension
  metadata JSONB DEFAULT '{}',
  importance_score FLOAT DEFAULT 0.5, -- 0.0 to 1.0
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- MEMORIA EPISÓDICA (EXPERIENCIAS COMPLETAS)
-- =============================================================================

CREATE TABLE episodic_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  episode_type VARCHAR(100) NOT NULL, -- conversation, campaign, analysis, workflow
  title VARCHAR(500),
  summary TEXT,
  full_context JSONB NOT NULL,
  outcome VARCHAR(100), -- success, failure, partial, ongoing
  lessons_learned TEXT[],
  related_memories UUID[],
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- PATRONES DETECTADOS
-- =============================================================================

CREATE TABLE detected_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id VARCHAR(255) NOT NULL,
  pattern_type VARCHAR(100) NOT NULL, -- user_behavior, content_performance, market_trend
  pattern_name VARCHAR(255) NOT NULL,
  description TEXT,
  confidence_score FLOAT NOT NULL, -- 0.0 to 1.0
  supporting_evidence JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true
);

-- =============================================================================
-- CONOCIMIENTO DEL NEGOCIO
-- =============================================================================

CREATE TABLE business_knowledge (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id VARCHAR(255) NOT NULL,
  knowledge_type VARCHAR(100) NOT NULL, -- product, service, audience, competitor, market
  entity_name VARCHAR(255) NOT NULL,
  description TEXT,
  properties JSONB DEFAULT '{}',
  relationships JSONB DEFAULT '{}', -- connections to other entities
  embedding vector(1536),
  confidence_score FLOAT DEFAULT 0.5,
  source VARCHAR(100), -- learned, provided, inferred
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- ÍNDICES VECTORIALES PARA BÚSQUEDA SEMÁNTICA
-- =============================================================================

-- Índices HNSW para búsqueda rápida de vectores
CREATE INDEX ON memory_embeddings USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON episodic_memories USING hnsw (embedding vector_cosine_ops);
CREATE INDEX ON business_knowledge USING hnsw (embedding vector_cosine_ops);

-- =============================================================================
-- ÍNDICES TRADICIONALES PARA QUERIES
-- =============================================================================

-- Memory embeddings
CREATE INDEX idx_memory_embeddings_business_id ON memory_embeddings(business_id);
CREATE INDEX idx_memory_embeddings_user_id ON memory_embeddings(user_id);
CREATE INDEX idx_memory_embeddings_content_type ON memory_embeddings(content_type);
CREATE INDEX idx_memory_embeddings_importance ON memory_embeddings(importance_score);
CREATE INDEX idx_memory_embeddings_created_at ON memory_embeddings(created_at);

-- Episodic memories
CREATE INDEX idx_episodic_memories_business_id ON episodic_memories(business_id);
CREATE INDEX idx_episodic_memories_user_id ON episodic_memories(user_id);
CREATE INDEX idx_episodic_memories_episode_type ON episodic_memories(episode_type);
CREATE INDEX idx_episodic_memories_created_at ON episodic_memories(created_at);

-- Patterns
CREATE INDEX idx_detected_patterns_business_id ON detected_patterns(business_id);
CREATE INDEX idx_detected_patterns_type ON detected_patterns(pattern_type);
CREATE INDEX idx_detected_patterns_active ON detected_patterns(is_active);
CREATE INDEX idx_detected_patterns_confidence ON detected_patterns(confidence_score);

-- Business knowledge
CREATE INDEX idx_business_knowledge_business_id ON business_knowledge(business_id);
CREATE INDEX idx_business_knowledge_type ON business_knowledge(knowledge_type);
CREATE INDEX idx_business_knowledge_entity ON business_knowledge(entity_name);

-- =============================================================================
-- FUNCIONES HELPER PARA BÚSQUEDA SEMÁNTICA
-- =============================================================================

-- Función para buscar memorias similares
CREATE OR REPLACE FUNCTION search_similar_memories(
  query_embedding vector(1536),
  business_id_param text,
  content_type_param text DEFAULT NULL,
  limit_param integer DEFAULT 10,
  similarity_threshold float DEFAULT 0.7
) RETURNS TABLE (
  id uuid,
  content text,
  similarity float,
  metadata jsonb,
  importance_score float,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    1 - (m.embedding <=> query_embedding) as similarity,
    m.metadata,
    m.importance_score,
    m.created_at
  FROM memory_embeddings m
  WHERE 
    m.business_id = business_id_param
    AND (content_type_param IS NULL OR m.content_type = content_type_param)
    AND (1 - (m.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar episodios similares
CREATE OR REPLACE FUNCTION search_similar_episodes(
  query_embedding vector(1536),
  business_id_param text,
  episode_type_param text DEFAULT NULL,
  limit_param integer DEFAULT 5,
  similarity_threshold float DEFAULT 0.6
) RETURNS TABLE (
  id uuid,
  title varchar,
  summary text,
  similarity float,
  outcome varchar,
  lessons_learned text[],
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.summary,
    1 - (e.embedding <=> query_embedding) as similarity,
    e.outcome,
    e.lessons_learned,
    e.created_at
  FROM episodic_memories e
  WHERE 
    e.business_id = business_id_param
    AND (episode_type_param IS NULL OR e.episode_type = episode_type_param)
    AND e.embedding IS NOT NULL
    AND (1 - (e.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- Función para buscar conocimiento del negocio
CREATE OR REPLACE FUNCTION search_business_knowledge(
  query_embedding vector(1536),
  business_id_param text,
  knowledge_type_param text DEFAULT NULL,
  limit_param integer DEFAULT 10,
  similarity_threshold float DEFAULT 0.6
) RETURNS TABLE (
  id uuid,
  entity_name varchar,
  description text,
  similarity float,
  properties jsonb,
  confidence_score float
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bk.id,
    bk.entity_name,
    bk.description,
    1 - (bk.embedding <=> query_embedding) as similarity,
    bk.properties,
    bk.confidence_score
  FROM business_knowledge bk
  WHERE 
    bk.business_id = business_id_param
    AND (knowledge_type_param IS NULL OR bk.knowledge_type = knowledge_type_param)
    AND bk.embedding IS NOT NULL
    AND (1 - (bk.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY bk.embedding <=> query_embedding
  LIMIT limit_param;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TRIGGERS PARA MANTENIMIENTO AUTOMÁTICO
-- =============================================================================

-- Trigger para actualizar access_count y last_accessed_at
CREATE OR REPLACE FUNCTION update_memory_access()
RETURNS TRIGGER AS $$
BEGIN
    NEW.access_count = OLD.access_count + 1;
    NEW.last_accessed_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger solo cuando se hace SELECT (simulado con un UPDATE específico)
-- En la aplicación, se debe hacer un UPDATE al acceder a la memoria

-- Trigger para updated_at en business_knowledge
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_knowledge_updated_at 
  BEFORE UPDATE ON business_knowledge
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- LIMPIEZA AUTOMÁTICA DE MEMORIAS EXPIRADAS
-- =============================================================================

-- Función para limpiar memorias expiradas
CREATE OR REPLACE FUNCTION cleanup_expired_memories()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM memory_embeddings 
  WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DATOS DE EJEMPLO PARA DESARROLLO
-- =============================================================================

-- Insertar algunos patrones de ejemplo
INSERT INTO detected_patterns (business_id, pattern_type, pattern_name, description, confidence_score, supporting_evidence) VALUES
('default', 'user_behavior', 'Morning Activity Peak', 'Users are most active between 8-10 AM', 0.85, '{"time_ranges": ["08:00-10:00"], "activity_increase": "65%"}'),
('default', 'content_performance', 'Video Content Preference', 'Video content performs 3x better than images', 0.92, '{"video_engagement": 45.2, "image_engagement": 15.1}'),
('default', 'market_trend', 'Sustainable Marketing Rise', 'Increasing interest in eco-friendly messaging', 0.78, '{"keyword_trends": ["sustainable", "eco-friendly", "green"], "growth_rate": "25%"}');

COMMIT;