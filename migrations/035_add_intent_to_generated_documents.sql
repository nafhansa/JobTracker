-- Add intent column to generated_documents for filtering/analytics
ALTER TABLE generated_documents ADD COLUMN IF NOT EXISTS intent TEXT;

-- Add check constraint for valid intent values
ALTER TABLE generated_documents DROP CONSTRAINT IF EXISTS valid_intent;
ALTER TABLE generated_documents ADD CONSTRAINT valid_intent 
  CHECK (intent IS NULL OR intent IN (
    'opportunistic_reach', 
    'follow_up', 
    'quick_call', 
    'interview_thank_you', 
    'keep_warm'
  ));

-- Add index for intent filtering
CREATE INDEX IF NOT EXISTS idx_generated_documents_intent ON generated_documents(intent) WHERE intent IS NOT NULL;