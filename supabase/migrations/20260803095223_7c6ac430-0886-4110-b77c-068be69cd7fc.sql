CREATE POLICY "Anyone can read project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Anyone can upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Anyone can update project images" ON storage.objects FOR UPDATE USING (bucket_id = 'project-images') WITH CHECK (bucket_id = 'project-images');
CREATE POLICY "Anyone can delete project images" ON storage.objects FOR DELETE USING (bucket_id = 'project-images');