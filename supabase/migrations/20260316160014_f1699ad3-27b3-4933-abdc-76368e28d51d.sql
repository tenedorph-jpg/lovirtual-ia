
-- Create assignments table for Level 3 file submissions
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  module_id integer NOT NULL,
  file_path text NOT NULL,
  file_name text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'submitted',
  grade integer,
  feedback text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Users can insert their own assignments
CREATE POLICY "Users can insert own assignments" ON public.assignments
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own assignments
CREATE POLICY "Users can view own assignments" ON public.assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all assignments
CREATE POLICY "Admins can view all assignments" ON public.assignments
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update assignments (for grading)
CREATE POLICY "Admins can update assignments" ON public.assignments
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger
CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for assignments
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('assignments', 'assignments', false, 52428800);

-- Storage RLS: users can upload to their own folder
CREATE POLICY "Users can upload own assignments" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: users can read their own files
CREATE POLICY "Users can read own assignments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Storage RLS: admins can read all assignment files
CREATE POLICY "Admins can read all assignments" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'assignments' AND public.has_role(auth.uid(), 'admin'));
