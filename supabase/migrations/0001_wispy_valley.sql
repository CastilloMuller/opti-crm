/*
  # Initial Schema Setup for OptiCRM

  1. Tables
    - users
      - id (uuid, primary key)
      - username (text)
      - password (text)
      - created_at (timestamp)
    
    - customers
      - id (uuid, primary key)
      - name (text)
      - phone (text)
      - email (text)
      - month_decision (date)
      - next_action_date (timestamp)
      - status (text)
      - created_at (timestamp)
      - created_by (uuid, references users)
    
    - notes
      - id (uuid, primary key)
      - customer_id (uuid, references customers)
      - content (text)
      - created_by (uuid, references users)
      - created_at (timestamp)
    
    - tasks
      - id (uuid, primary key)
      - customer_id (uuid, references customers)
      - title (text)
      - description (text)
      - due_date (timestamp)
      - completed (boolean)
      - created_by (uuid, references users)
      - created_at (timestamp)
    
    - statuses
      - id (uuid, primary key)
      - name (text)
      - created_at (timestamp)
    
    - audit_logs
      - id (uuid, primary key)
      - user_id (uuid, references users)
      - action (text)
      - table_name (text)
      - record_id (uuid)
      - changes (jsonb)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username text UNIQUE NOT NULL,
  password text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Customers table
CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  phone text,
  email text,
  month_decision date,
  next_action_date timestamptz,
  status text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id)
);

-- Notes table
CREATE TABLE notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Tasks table
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  completed boolean DEFAULT false,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

-- Statuses table
CREATE TABLE statuses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  changes jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all users" ON users
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can read all customers" ON customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create customers" ON customers
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update customers" ON customers
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete customers" ON customers
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all notes" ON notes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create notes" ON notes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update own notes" ON notes
  FOR UPDATE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can delete own notes" ON notes
  FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can read all tasks" ON tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete tasks" ON tasks
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all statuses" ON statuses
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create statuses" ON statuses
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can update statuses" ON statuses
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can delete statuses" ON statuses
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can read all audit logs" ON audit_logs
  FOR SELECT TO authenticated USING (true);

-- Insert default statuses
INSERT INTO statuses (name) VALUES
  ('Try to complete'),
  ('Good chance, keep warm'),
  ('Call back 1st time'),
  ('Call when nothing has been heard'),
  ('Schedule a visit');

-- Insert default users
INSERT INTO users (username, password) VALUES
  ('Linda', 'L@vere!1'),
  ('Kamal', 'L@vere!1'),
  ('Castillo', 'L@vere!1');