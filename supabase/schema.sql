-- ============================================================
-- AI Dashboard - Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid()::text = id);

-- ============================================================
-- NOTES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_updated_at_idx ON notes(updated_at DESC);

-- RLS
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own notes" ON notes FOR ALL USING (user_id = auth.uid()::text);

-- ============================================================
-- YOUTUBE SUMMARIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS youtube_summaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_id TEXT NOT NULL,
  video_title TEXT,
  thumbnail_url TEXT,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS youtube_summaries_user_id_idx ON youtube_summaries(user_id);

ALTER TABLE youtube_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own summaries" ON youtube_summaries FOR ALL USING (user_id = auth.uid()::text);

-- ============================================================
-- SAVED JOBS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  link TEXT,
  requirements TEXT,
  salary TEXT,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS saved_jobs_user_id_idx ON saved_jobs(user_id);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own saved jobs" ON saved_jobs FOR ALL USING (user_id = auth.uid()::text);

-- ============================================================
-- RESUMES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  full_name TEXT,
  job_title TEXT,
  content TEXT NOT NULL,
  form_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON resumes(user_id);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own resumes" ON resumes FOR ALL USING (user_id = auth.uid()::text);

-- ============================================================
-- NOTE: Since NextAuth uses server-side JWTs (not Supabase Auth),
-- you need to use the service role key in your API routes to bypass RLS.
-- The user_id in tables is the NextAuth user ID (string), not Supabase auth.uid().
-- For full RLS enforcement, use service role key OR disable RLS and rely on 
-- server-side authorization in your API routes.
-- ============================================================

-- DISABLE RLS for server-side service role access (recommended for this setup)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_summaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE resumes DISABLE ROW LEVEL SECURITY;
