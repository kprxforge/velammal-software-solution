# Supabase Setup Guide for Velammal Software Solutions

Now that you have created your Supabase project, follow these steps to initialize your database and storage.

## 1. Configure Environment Variables
Create a file named `.env` in your project root and add your Supabase credentials:

```env
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

## 2. Initialize Database Tables
Go to the **SQL Editor** in your Supabase Dashboard and run the following script to create all necessary tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Internships Table
CREATE TABLE internships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  fee DECIMAL,
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Internship Applications Table
CREATE TABLE internship_applications (
  id TEXT PRIMARY KEY,
  userId UUID NOT NULL,
  fullName TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college TEXT,
  degree TEXT,
  year TEXT,
  city TEXT,
  github TEXT,
  portfolio TEXT,
  linkedin TEXT,
  resumeUrl TEXT,
  learningMode TEXT,
  internshipId UUID REFERENCES internships(id),
  internshipTitle TEXT,
  domain TEXT,
  status TEXT DEFAULT 'Pending Review',
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Project Requests (Custom & Applications)
-- NOTE: These columns are intentionally lowercase in queries.
-- If you create camelCase names without double quotes in PostgreSQL, they are stored as lowercase.
CREATE TABLE project_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userid UUID NOT NULL,
  clientname TEXT NOT NULL,
  email TEXT NOT NULL,
  projectname TEXT,
  description TEXT,
  budget TEXT,
  status TEXT DEFAULT 'pending',
  paymentstatus TEXT DEFAULT 'none', -- none, pending, verified
  paymentscreenshoturl TEXT,
  type TEXT DEFAULT 'custom', -- custom, application
  createdat TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Marketplace Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL,
  imageUrl TEXT,
  tech TEXT[],
  active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Transactions (Marketplace Sales)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  projectId UUID REFERENCES projects(id),
  projectTitle TEXT,
  price DECIMAL,
  buyerEmail TEXT,
  status TEXT DEFAULT 'pending',
  paymentScreenshotUrl TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. System Configuration
CREATE TABLE config (
  id TEXT PRIMARY KEY,
  upiId TEXT,
  qrUrl TEXT,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Seed initial config
INSERT INTO config (id, upiId) VALUES ('payment', 'velammal@upi');

-- 7. Admin Access Control
CREATE TABLE admins (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'admin'
);
```

## 3. Configure Storage
1. Go to the **Storage** tab in your Supabase Dashboard.
2. Create a new bucket named `projects`.
3. Set it to **Public** (so screenshots can be viewed via URL).
4. (Optional) Add an RLS policy to allow anyone to `INSERT` but only admins to `DELETE`.

## 4. Enable Google Auth
1. Go to **Authentication** -> **Providers** -> **Google**.
2. Enable Google.
3. You will need to set up a **Google Cloud Project** to get the `Client ID` and `Client Secret`.
4. Add the Supabase **Redirect URI** to your Google Cloud Console's authorized redirect URIs.

## 5. Enable Real-time
1. Go to **Database** -> **Replication**.
2. Click on **'supabase_realtime'** publication.
3. Enable replication for all the tables created above (`internships`, `internship_applications`, `project_requests`, `transactions`, `projects`, `config`).
