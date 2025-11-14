-- Create saved_courses table
CREATE TABLE public.saved_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  course_data JSONB NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning_progress table
CREATE TABLE public.learning_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_title TEXT NOT NULL,
  progress_percentage INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'not_started',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_progress CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  CONSTRAINT valid_status CHECK (status IN ('not_started', 'in_progress', 'completed'))
);

-- Enable Row Level Security
ALTER TABLE public.saved_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for saved_courses
CREATE POLICY "Users can view their own saved courses"
  ON public.saved_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save courses"
  ON public.saved_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saved courses"
  ON public.saved_courses FOR DELETE
  USING (auth.uid() = user_id);

-- Create policies for learning_progress
CREATE POLICY "Users can view their own progress"
  ON public.learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress"
  ON public.learning_progress FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for learning_progress updated_at
CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_saved_courses_user_id ON public.saved_courses(user_id);
CREATE INDEX idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX idx_learning_progress_status ON public.learning_progress(status);