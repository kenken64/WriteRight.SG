-- Allow topic creators to update their own topics
CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Allow topic creators to delete their own topics
CREATE POLICY "Users can delete own topics"
  ON topics FOR DELETE
  USING (created_by = auth.uid());
