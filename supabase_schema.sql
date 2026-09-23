-- ============================================================
-- SUPABASE DATABASE SCHEMA FOR QA CALL EVALUATION DASHBOARD
-- Run this entire script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ============================================================

-- 1. DROP EXISTING TABLES IF RE-CREATING (OPTIONAL)
-- DROP TABLE IF EXISTS calls CASCADE;
-- DROP TABLE IF EXISTS batches CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- 2. CREATE BATCHES TABLE
CREATE TABLE IF NOT EXISTS batches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    uploaded_at TEXT NOT NULL,
    uploaded_by TEXT NOT NULL DEFAULT 'admin',
    is_visible BOOLEAN NOT NULL DEFAULT true,
    total_calls_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'qa_auditor',
    code TEXT,
    avatar TEXT DEFAULT '👨‍💼',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREATE CALLS TABLE (Stores 30 Initial Fields + QA Audit Evaluation)
CREATE TABLE IF NOT EXISTS calls (
    id TEXT PRIMARY KEY,
    batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
    call_number TEXT NOT NULL,
    agent_name TEXT NOT NULL DEFAULT 'Unassigned',
    group_name TEXT NOT NULL DEFAULT 'General',
    duration_minutes TEXT NOT NULL DEFAULT '00:00',
    ai_overall_score NUMERIC DEFAULT 0,
    flag_reason TEXT DEFAULT 'None',
    diagnosis_class TEXT DEFAULT '-',
    diagnosis_score NUMERIC DEFAULT 0,
    diagnosis_errors TEXT DEFAULT 'None',
    case_score NUMERIC DEFAULT 0,
    case_errors TEXT DEFAULT 'None',
    case_reason TEXT DEFAULT 'None',
    inquiry_class TEXT DEFAULT '-',
    inquiry_score NUMERIC DEFAULT 0,
    inquiry_errors TEXT DEFAULT 'None',
    inquiry_reason TEXT DEFAULT 'None',
    problem_class TEXT DEFAULT '-',
    problem_score NUMERIC DEFAULT 0,
    problem_errors TEXT DEFAULT 'None',
    problem_reason TEXT DEFAULT 'None',
    answer_ending_score NUMERIC DEFAULT 0,
    answer_ending_missing TEXT DEFAULT 'None',
    answer_ending_reason TEXT DEFAULT 'None',
    comm_score NUMERIC DEFAULT 0,
    comm_issue TEXT DEFAULT 'None',
    comm_reason TEXT DEFAULT 'None',
    violation_highest_severity TEXT DEFAULT 'None',
    violation_reasons TEXT DEFAULT 'None',
    call_date TEXT,
    snapshot_at TEXT,

    -- QA Audit & Re-Evaluation State
    status TEXT NOT NULL DEFAULT 'unlocked', -- 'unlocked', 'locked', 'completed'
    locked_by_user_id TEXT,
    locked_by_user_name TEXT,
    locked_at TEXT,
    matching TEXT, -- 'Match', 'Mismatch'
    policy TEXT,   -- 4 policy choices
    description TEXT DEFAULT '',
    qa_answer NUMERIC,
    qa_skills NUMERIC,
    qa_diagnosis NUMERIC,
    qa_solve NUMERIC,
    qa_inquiries NUMERIC,
    qa_case NUMERIC,
    final_score NUMERIC,
    evaluated_by_user_id TEXT,
    evaluated_by_user_name TEXT,
    evaluated_at TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS on all tables
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access (for rapid development and custom auth)
CREATE POLICY "Allow public full access on batches" ON batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public full access on calls" ON calls FOR ALL USING (true) WITH CHECK (true);

-- 6. ENABLE SUPABASE REALTIME ON CALLS & BATCHES
-- Ensures live lock state and evaluations broadcast immediately to all connected browsers
ALTER PUBLICATION supabase_realtime ADD TABLE calls;
ALTER PUBLICATION supabase_realtime ADD TABLE batches;

-- 7. INSERT INITIAL SEED DATA FOR USERS & DEFAULT BATCH
INSERT INTO users (id, name, username, password, role, code, avatar)
VALUES 
    ('usr_admin', 'System Administrator', 'admin', 'admin123', 'admin', 'ADM-001', '👑'),
    ('usr_1', 'Ahmed Ali', 'ahmed', '123456', 'qa_auditor', 'QA-101', '👨‍💻'),
    ('usr_2', 'Sara Mahmoud', 'sara', '123456', 'qa_auditor', 'QA-102', '👩‍💼'),
    ('usr_3', 'Khaled Al-Otaibi', 'khaled', '123456', 'qa_auditor', 'QA-103', '👨‍💼'),
    ('usr_4', 'Maryam Ibrahim', 'maryam', '123456', 'qa_auditor', 'QA-104', '👩‍💻')
ON CONFLICT (username) DO NOTHING;

INSERT INTO batches (id, name, file_name, uploaded_at, uploaded_by, is_visible, total_calls_count)
VALUES 
    ('batch_initial_01', 'September Initial Call Batch', 'September_Calls_Audit.xlsx', NOW()::text, 'System Admin', true, 10)
ON CONFLICT (id) DO NOTHING;
