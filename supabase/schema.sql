-- Smart Examination Platform Database Schema
-- Run this SQL in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== EXAMS TABLE ====================
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_points INTEGER DEFAULT 0,
    passing_score INTEGER DEFAULT 50,
    shuffle_questions BOOLEAN DEFAULT FALSE,
    shuffle_answers BOOLEAN DEFAULT FALSE,
    show_results BOOLEAN DEFAULT TRUE,
    allow_review BOOLEAN DEFAULT TRUE,
    max_attempts INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Index for instructor lookups
CREATE INDEX IF NOT EXISTS idx_exams_instructor ON exams(instructor_id);

-- ==================== EXAM QUESTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer', 'essay')),
    correct_answer TEXT,
    points INTEGER DEFAULT 1,
    explanation TEXT,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- Index for exam lookups
CREATE INDEX IF NOT EXISTS idx_questions_exam ON exam_questions(exam_id);

-- ==================== QUESTION OPTIONS TABLE ====================
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    position INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for question lookups
CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);

-- ==================== EXAM CLASSES TABLE ====================
CREATE TABLE IF NOT EXISTS exam_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code VARCHAR(8),
    student_count INTEGER DEFAULT 0,
    exam_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    UNIQUE(code)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_classes_instructor ON exam_classes(instructor_id);
CREATE INDEX IF NOT EXISTS idx_classes_code ON exam_classes(code);
CREATE INDEX IF NOT EXISTS idx_classes_invite ON exam_classes(invite_code);

-- ==================== CLASS MEMBERS TABLE ====================
CREATE TABLE IF NOT EXISTS class_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES exam_classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255),
    name VARCHAR(255),
    email VARCHAR(255),
    avatar TEXT,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('teacher', 'student', 'assistant')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_members_class ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_members_user ON class_members(user_id);

-- ==================== CLASS EXAM ASSIGNMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS class_exam_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES exam_classes(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES auth.users(id),
    UNIQUE(class_id, exam_id)
);

-- ==================== EXAM ATTEMPTS TABLE ====================
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES exam_classes(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'terminated')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    time_spent_seconds INTEGER,
    total_score DECIMAL(10, 2),
    percentage DECIMAL(5, 2),
    correct_count INTEGER,
    incorrect_count INTEGER,
    unanswered_count INTEGER,
    is_passed BOOLEAN
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_class ON exam_attempts(class_id);

-- ==================== STUDENT ANSWERS TABLE ====================
CREATE TABLE IF NOT EXISTS student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    is_correct BOOLEAN,
    points_earned DECIMAL(10, 2),
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_answers_attempt ON student_answers(attempt_id);

-- ==================== ANTI-CHEAT VIOLATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS anticheat_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    violation_type VARCHAR(50) NOT NULL CHECK (violation_type IN ('no_face', 'multiple_faces', 'looking_away', 'phone_detected', 'headphones_detected', 'tab_switch', 'other')),
    description TEXT,
    screenshot_url TEXT,
    occurred_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_violations_attempt ON anticheat_violations(attempt_id);

-- ==================== USERS TABLE (for user profile data) ====================
-- Note: This extends auth.users with additional profile data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(255) UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255),
    avatar TEXT,
    student_id VARCHAR(50),
    profile_image_url TEXT,
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
    department VARCHAR(255),
    bio TEXT,
    phone VARCHAR(50),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ,
    last_active TIMESTAMPTZ
);

-- Index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ==================== ROW LEVEL SECURITY ====================

-- Enable RLS on all tables
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_exam_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE anticheat_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- Exams: Instructors can manage their own exams
CREATE POLICY "Instructors can view their own exams" ON exams
    FOR SELECT USING (auth.uid() = instructor_id);
    
CREATE POLICY "Instructors can create exams" ON exams
    FOR INSERT WITH CHECK (auth.uid() = instructor_id);
    
CREATE POLICY "Instructors can update their own exams" ON exams
    FOR UPDATE USING (auth.uid() = instructor_id);
    
CREATE POLICY "Instructors can delete their own exams" ON exams
    FOR DELETE USING (auth.uid() = instructor_id);

-- Published exams can be viewed by students
CREATE POLICY "Students can view published exams" ON exams
    FOR SELECT USING (status = 'published');

-- Exam Questions: Follow exam permissions
CREATE POLICY "Users can view questions of accessible exams" ON exam_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_questions.exam_id 
            AND (exams.instructor_id = auth.uid() OR exams.status = 'published')
        )
    );

CREATE POLICY "Instructors can manage questions" ON exam_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exams 
            WHERE exams.id = exam_questions.exam_id 
            AND exams.instructor_id = auth.uid()
        )
    );

-- Question Options: Follow question permissions
CREATE POLICY "Users can view options" ON question_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exam_questions q
            JOIN exams e ON e.id = q.exam_id
            WHERE q.id = question_options.question_id
            AND (e.instructor_id = auth.uid() OR e.status = 'published')
        )
    );

CREATE POLICY "Instructors can manage options" ON question_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exam_questions q
            JOIN exams e ON e.id = q.exam_id
            WHERE q.id = question_options.question_id
            AND e.instructor_id = auth.uid()
        )
    );

-- Classes: Instructors can manage their own classes
CREATE POLICY "Instructors can view their classes" ON exam_classes
    FOR SELECT USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can create classes" ON exam_classes
    FOR INSERT WITH CHECK (instructor_id = auth.uid());

CREATE POLICY "Instructors can update their classes" ON exam_classes
    FOR UPDATE USING (instructor_id = auth.uid());

CREATE POLICY "Instructors can delete their classes" ON exam_classes
    FOR DELETE USING (instructor_id = auth.uid());

-- Students can view classes they're enrolled in
CREATE POLICY "Students can view enrolled classes" ON exam_classes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM class_members
            WHERE class_members.class_id = exam_classes.id
            AND class_members.user_id = auth.uid()
        )
    );

-- Class Members
CREATE POLICY "Instructors can manage class members" ON class_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exam_classes
            WHERE exam_classes.id = class_members.class_id
            AND exam_classes.instructor_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own membership" ON class_members
    FOR SELECT USING (user_id = auth.uid());

-- Exam Attempts
CREATE POLICY "Students can manage their own attempts" ON exam_attempts
    FOR ALL USING (student_id = auth.uid());

CREATE POLICY "Instructors can view attempts for their exams" ON exam_attempts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exams
            WHERE exams.id = exam_attempts.exam_id
            AND exams.instructor_id = auth.uid()
        )
    );

-- Student Answers
CREATE POLICY "Students can manage their own answers" ON student_answers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM exam_attempts
            WHERE exam_attempts.id = student_answers.attempt_id
            AND exam_attempts.student_id = auth.uid()
        )
    );

CREATE POLICY "Instructors can view answers" ON student_answers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            WHERE a.id = student_answers.attempt_id
            AND e.instructor_id = auth.uid()
        )
    );

-- Anti-cheat Violations
CREATE POLICY "Students can create violations for their attempts" ON anticheat_violations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM exam_attempts
            WHERE exam_attempts.id = anticheat_violations.attempt_id
            AND exam_attempts.student_id = auth.uid()
        )
    );

CREATE POLICY "Instructors can view violations" ON anticheat_violations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM exam_attempts a
            JOIN exams e ON e.id = a.exam_id
            WHERE a.id = anticheat_violations.attempt_id
            AND e.instructor_id = auth.uid()
        )
    );

-- Users
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ==================== FUNCTIONS ====================

-- Function to update exam total points when questions change
CREATE OR REPLACE FUNCTION update_exam_total_points()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE exams 
        SET total_points = COALESCE((
            SELECT SUM(points) FROM exam_questions WHERE exam_id = OLD.exam_id
        ), 0)
        WHERE id = OLD.exam_id;
        RETURN OLD;
    ELSE
        UPDATE exams 
        SET total_points = COALESCE((
            SELECT SUM(points) FROM exam_questions WHERE exam_id = NEW.exam_id
        ), 0)
        WHERE id = NEW.exam_id;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating exam points
DROP TRIGGER IF EXISTS trigger_update_exam_points ON exam_questions;
CREATE TRIGGER trigger_update_exam_points
    AFTER INSERT OR UPDATE OR DELETE ON exam_questions
    FOR EACH ROW
    EXECUTE FUNCTION update_exam_total_points();

-- Function to update class student count
CREATE OR REPLACE FUNCTION update_class_student_count()
RETURNS TRIGGER AS $$
DECLARE
    target_class_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_class_id := OLD.class_id;
    ELSE
        target_class_id := NEW.class_id;
    END IF;
    
    UPDATE exam_classes 
    SET student_count = (
        SELECT COUNT(*) FROM class_members 
        WHERE class_id = target_class_id AND role = 'student'
    )
    WHERE id = target_class_id;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating student count
DROP TRIGGER IF EXISTS trigger_update_student_count ON class_members;
CREATE TRIGGER trigger_update_student_count
    AFTER INSERT OR UPDATE OR DELETE ON class_members
    FOR EACH ROW
    EXECUTE FUNCTION update_class_student_count();

-- ==================== COMMENTS ====================
COMMENT ON TABLE exams IS 'Stores exam/test information created by instructors';
COMMENT ON TABLE exam_questions IS 'Stores questions for each exam';
COMMENT ON TABLE question_options IS 'Stores multiple choice options for questions';
COMMENT ON TABLE exam_classes IS 'Stores classroom/course information';
COMMENT ON TABLE class_members IS 'Links students to classes';
COMMENT ON TABLE exam_attempts IS 'Records student exam attempts';
COMMENT ON TABLE student_answers IS 'Records student answers for each question';
COMMENT ON TABLE anticheat_violations IS 'Records anti-cheat system violations during exams';
