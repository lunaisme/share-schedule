-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks table
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Allow users to view all tasks (globally visible)
CREATE POLICY "Allow users to view all tasks" ON public.tasks
FOR SELECT USING (true);

-- Allow users to create their own tasks
CREATE POLICY "Allow users to create tasks" ON public.tasks
FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own tasks
CREATE POLICY "Allow users to update own tasks" ON public.tasks
FOR UPDATE USING (auth.uid() = created_by);

-- Allow users to delete their own tasks
CREATE POLICY "Allow users to delete own tasks" ON public.tasks
FOR DELETE USING (auth.uid() = created_by);

-- Create an index on created_by for better query performance
CREATE INDEX IF NOT EXISTS tasks_created_by_idx ON public.tasks(created_by);

-- Create an index on start_time for date filtering
CREATE INDEX IF NOT EXISTS tasks_start_time_idx ON public.tasks(start_time);
