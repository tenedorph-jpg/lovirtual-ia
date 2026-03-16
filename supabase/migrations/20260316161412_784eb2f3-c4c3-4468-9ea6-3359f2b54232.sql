
-- Update bucket file size limit to 100MB (104857600 bytes)
UPDATE storage.buckets SET file_size_limit = 104857600 WHERE id = 'assignments';

-- Allow users to delete their own assignments
CREATE POLICY "Users can delete own assignments"
ON public.assignments
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to delete their own files from storage
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'assignments' AND (storage.foldername(name))[1] = auth.uid()::text);
