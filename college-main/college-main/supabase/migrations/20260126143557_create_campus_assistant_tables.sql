/*
  # Campus Assistant Database Schema

  ## Overview
  Creates the core database structure for the Voice-Controlled Campus Assistant system.
  This schema supports storing class timetables, campus events, department information,
  and frequently asked questions for quick voice-based access.

  ## New Tables

  ### 1. `classes`
  Stores class schedule information
  - `id` (uuid, primary key) - Unique identifier
  - `subject_name` (text) - Name of the subject/course
  - `subject_code` (text) - Course code (e.g., CS101)
  - `instructor` (text) - Professor/instructor name
  - `day_of_week` (text) - Day when class occurs
  - `start_time` (time) - Class start time
  - `end_time` (time) - Class end time
  - `room_number` (text) - Classroom location
  - `department` (text) - Academic department
  - `semester` (text) - Current semester
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `events`
  Stores campus events and activities
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Event name
  - `description` (text) - Event details
  - `event_date` (date) - Date of event
  - `start_time` (time) - Event start time
  - `end_time` (time) - Event end time
  - `location` (text) - Event venue
  - `category` (text) - Event type (academic, sports, cultural, etc.)
  - `organizer` (text) - Organizing body/department
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `departments`
  Stores department information
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - Department name
  - `head` (text) - Department head name
  - `location` (text) - Building/room location
  - `contact_email` (text) - Contact email
  - `contact_phone` (text) - Contact phone number
  - `description` (text) - Department overview
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `faqs`
  Stores frequently asked questions and answers
  - `id` (uuid, primary key) - Unique identifier
  - `question` (text) - The question
  - `answer` (text) - The answer
  - `category` (text) - FAQ category
  - `keywords` (text[]) - Keywords for better matching
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - RLS enabled on all tables
  - Public read access for all campus information
  - Insert/update/delete restricted to authenticated users only
*/

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name text NOT NULL,
  subject_code text NOT NULL,
  instructor text NOT NULL,
  day_of_week text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  room_number text NOT NULL,
  department text NOT NULL,
  semester text DEFAULT 'Spring 2026',
  created_at timestamptz DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  location text NOT NULL,
  category text DEFAULT 'general',
  organizer text,
  created_at timestamptz DEFAULT now()
);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  head text NOT NULL,
  location text NOT NULL,
  contact_email text,
  contact_phone text,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create faqs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for classes
CREATE POLICY "Anyone can view classes"
  ON classes FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete classes"
  ON classes FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for events
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for departments
CREATE POLICY "Anyone can view departments"
  ON departments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert departments"
  ON departments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update departments"
  ON departments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete departments"
  ON departments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for faqs
CREATE POLICY "Anyone can view faqs"
  ON faqs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert faqs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update faqs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete faqs"
  ON faqs FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_day ON classes(day_of_week);
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);