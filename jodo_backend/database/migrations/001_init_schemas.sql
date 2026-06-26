-- Jodo PostgreSQL + PostGIS + pgvector Database Initialization Migration
-- Target: production-grade spatial indexing and vector matching schemas

-- 1. Enable SQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Define Custom Enums
CREATE TYPE user_role AS ENUM ('citizen', 'verifier', 'lead', 'admin');
CREATE TYPE issue_status AS ENUM ('ingested', 'verified', 'resolved');
CREATE TYPE log_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE verification_status AS ENUM ('verified', 'rejected');

-- 3. Create Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'citizen',
    trust_score NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (trust_score BETWEEN 0.00 AND 10.00),
    reputation_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE observations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    description_vector vector(768), -- Target text-embedding-004
    category VARCHAR(50) NOT NULL,
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 10),
    status issue_status NOT NULL DEFAULT 'ingested',
    location GEOMETRY(Point, 4326) NOT NULL, -- Point geometry using SRID 4326 (WGS 84)
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    risk_weight NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (risk_weight BETWEEN 0.00 AND 10.00),
    area_importance NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (area_importance BETWEEN 0.00 AND 10.00),
    image_before_url TEXT NOT NULL,
    image_after_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    verifier_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status verification_status NOT NULL DEFAULT 'verified',
    notes TEXT,
    evidence_media_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE backers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_issue_user_back UNIQUE (issue_id, user_id)
);

CREATE TABLE agent_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES observations(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL,
    log_type log_type NOT NULL DEFAULT 'info',
    message TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create Indexes
-- Spatial geometry index for location search (PostGIS GIST)
CREATE INDEX idx_observations_location ON observations USING GIST (location);

-- Semantic search index for duplicate issue discovery (pgvector HNSW)
CREATE INDEX idx_observations_vector ON observations USING hnsw (description_vector vector_cosine_ops);

-- Operational indexes for sorting/filtering
CREATE INDEX idx_observations_status ON observations (status);
CREATE INDEX idx_observations_category ON observations (category);
CREATE INDEX idx_observations_created_at ON observations (created_at DESC);
CREATE INDEX idx_agent_logs_issue ON agent_logs (issue_id);
