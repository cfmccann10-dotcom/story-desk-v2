# Story Desk V2

Production-ready PR story management platform for Middlesex University Dubai.

## Overview

Story Desk enables faculty to submit stories, helps PR leads prioritize and manage them through a publication pipeline, and provides senior management with visibility into story progress.

## Architecture

```
GitHub → Vercel → Story Desk (React + Vite)
                     ↓
                  Supabase
              (PostgreSQL + Auth + Storage + RLS)
```

## Local Development

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd story-desk-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in the values:
   - `VITE_SUPABASE_URL` — from Supabase project settings
   - `VITE_SUPABASE_ANON_KEY` — from Supabase API keys
   - `VITE_MICROSOFT_CLIENT_ID` — from Azure Entra ID app registration
   - `VITE_MICROSOFT_TENANT_ID` — your Azure AD tenant ID

4. **Start development server**
   ```bash
   npm run dev
   ```

   Opens at `http://localhost:5173`

## Supabase Setup

### 1. Create Supabase Project
- Go to [supabase.com](https://supabase.com)
- Create new project
- Copy project URL and anon key to `.env.local`

### 2. Create Database Schema

Run these SQL queries in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'faculty',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  overview TEXT NOT NULL,
  summary TEXT NOT NULL,
  department TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  
  submitter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT NOT NULL,
  
  subjects TEXT[] NOT NULL,
  
  under_18 TEXT NOT NULL,
  student_contact TEXT,
  
  priority_score INTEGER DEFAULT 0,
  ratings JSONB,
  
  placement_notes TEXT,
  internal_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story events (activity timeline)
CREATE TABLE story_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scoring configuration
CREATE TABLE scoring_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weights JSONB NOT NULL DEFAULT '{"news":35,"timely":20,"balance":20,"human":25}',
  factors JSONB,
  quiet_days INTEGER DEFAULT 30,
  stale_days INTEGER DEFAULT 21,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_department ON stories(department);
CREATE INDEX idx_stories_created ON stories(created_at DESC);
CREATE INDEX idx_attachments_story ON attachments(story_id);
CREATE INDEX idx_events_story ON story_events(story_id);
```

### 3. Enable Row Level Security

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_config ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can see their own profile
CREATE POLICY "Users can see own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- RLS Policy: Profiles are created by auth trigger
CREATE POLICY "Allow insert on profiles" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policy: Stories visible based on role
CREATE POLICY "PR Lead can see all stories" ON stories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pr_lead')
  );

CREATE POLICY "Senior Manager can see all stories" ON stories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'senior_manager')
  );

CREATE POLICY "Faculty can see their own stories" ON stories
  FOR SELECT USING (submitter_id = auth.uid());

-- RLS Policy: PR Lead can modify stories
CREATE POLICY "PR Lead can update stories" ON stories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'pr_lead')
  );

-- Similar policies for attachments, events, scoring config...
```

### 4. Set Up Storage

1. Go to Storage in Supabase dashboard
2. Create bucket: `story-attachments` (public)
3. Set up storage policies for upload/download

### 5. Enable Microsoft Authentication

1. Go to Authentication → Providers
2. Enable Azure
3. Configure with your Microsoft Entra ID tenant ID and client ID

## Microsoft Entra ID Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Entra ID → App registrations
3. Create new application registration
4. Set redirect URIs:
   - Local: `http://localhost:5173/auth/callback`
   - Production: `https://your-domain.vercel.app/auth/callback`
5. Create client secret and note the client ID
6. Add these to `.env.local`

## Project Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Page components (route handlers)
├── lib/
│   ├── supabase.ts  # Supabase client
│   └── types.ts     # TypeScript type definitions
├── store/           # Zustand state management
├── App.tsx          # Main app with routing
├── main.tsx         # React DOM entry
└── index.css        # Design system + global styles
```

## Build for Production

```bash
npm run build
```

Output: `dist/` directory

## Deployment to Vercel

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel project settings
4. Deploy

Vercel automatically deploys on git push to main branch.

## User Roles

### Faculty
- Submit stories via public form
- Upload files (required)
- See submission confirmation

### PR Lead (Admin)
- View dashboard
- Manage board (Kanban workflow)
- Search and filter story bank
- Customize scoring weights
- View settings
- Generate exports

### Senior Manager
- View dashboard (read-only)
- View story bank (read-only)
- Cannot modify anything

## Story Statuses

- **New** — Just submitted
- **Reviewing** — PR lead evaluating
- **Pitched** — Sent to media
- **Placed** — Publication scheduled/in discussion
- **Declined** — Rejected
- **Archived** — Old, lifecycle complete

## Features

- 🔐 Institutional Microsoft authentication
- 📝 Story submission with file uploads
- 📊 Priority scoring algorithm
- 🎯 Kanban board workflow
- 🔍 Search and filter
- 📈 Dashboard with insights
- ⚙️ Customizable scoring weights
- 📱 Mobile-responsive design
- 📊 Excel exports
- 🔒 Row-level security (database)

## Support

For issues or questions, contact the development team.

---

**Built with:** React + Vite + TypeScript + Supabase + Vercel
