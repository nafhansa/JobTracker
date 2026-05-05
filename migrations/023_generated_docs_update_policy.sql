-- Add updated_at column to generated_documents
ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add UPDATE policy for generated_documents (allow users to update their own docs)
CREATE POLICY "Users can update own documents" ON generated_documents
  FOR UPDATE USING (user_id = auth.uid()::text OR user_id = current_setting('request.uid', true));

-- Add trigger to auto-update updated_at
CREATE TRIGGER update_generated_documents_updated_at
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();