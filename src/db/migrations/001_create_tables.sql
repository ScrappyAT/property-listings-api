-- Migration: 001_create_tables.sql
-- Creates the four core tables: agents, properties, images, inquiries

-- ============================================================
-- AGENTS
-- ============================================================
CREATE TABLE agents (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    phone       VARCHAR(50)  NOT NULL,
    agency_name VARCHAR(255),
    city        VARCHAR(255) NOT NULL,
    state       VARCHAR(255) NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE properties (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id      UUID         NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    title         VARCHAR(255) NOT NULL,
    description   TEXT         NOT NULL,
    property_type VARCHAR(20)  NOT NULL CHECK (property_type IN ('apartment', 'house', 'duplex', 'land')),
    listing_type  VARCHAR(10)  NOT NULL CHECK (listing_type  IN ('sale', 'rent')),
    price         BIGINT       NOT NULL CHECK (price >= 0),
    bedrooms      INTEGER               CHECK (bedrooms >= 0),
    bathrooms     INTEGER               CHECK (bathrooms >= 0),
    address       VARCHAR(500) NOT NULL,
    city          VARCHAR(255) NOT NULL,
    state         VARCHAR(255) NOT NULL,
    status        VARCHAR(20)  NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'rented', 'unavailable')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_properties_agent_id      ON properties (agent_id);
CREATE INDEX idx_properties_city          ON properties (city);
CREATE INDEX idx_properties_state         ON properties (state);
CREATE INDEX idx_properties_property_type ON properties (property_type);
CREATE INDEX idx_properties_listing_type  ON properties (listing_type);
CREATE INDEX idx_properties_status        ON properties (status);

-- ============================================================
-- IMAGES
-- ============================================================
CREATE TABLE images (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID         NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    url         VARCHAR(2048) NOT NULL,
    alt_text    VARCHAR(500),
    is_primary  BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_images_property_id ON images (property_id);

-- ============================================================
-- INQUIRIES
-- ============================================================
CREATE TABLE inquiries (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID         NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    message     TEXT         NOT NULL,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inquiries_property_id ON inquiries (property_id);
