CREATE TABLE IF NOT EXISTS builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    commit_hash VARCHAR(255),
    branch VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending',
    trigger_type VARCHAR(50),
    config JSONB,
    logs TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_builds_project_id ON builds(project_id);
CREATE INDEX idx_builds_status ON builds(status);