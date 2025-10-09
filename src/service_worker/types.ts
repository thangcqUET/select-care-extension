
// Define selection type
export type SelectionType = 'learn' | 'note' | 'chat';


export type CoreSelection = {
  selection_id: string;
  text: string;
  context: Record<string, any>;
  tags: string[];
  type: SelectionType;
  comments?: string[];
  metadata: Record<string, any>;
}

// Define specific data types for each selection type
export interface LearnSpecificData extends CoreSelection {
  source_language: string;
  translation_context: string | null;
  pieces: [
    {
      target_language: string;
      definition: string | null;
      translation: string | null;
      example: string | null;
      part_of_speech: string | null;
      phonetics_text: string | null;
      phonetics_audio: string | null;
      image_url: string | null;
    }
  ]
    
}

export interface NoteSpecificData extends CoreSelection {
}

export interface ChatSpecificData extends CoreSelection {
  chat_id: string;
}

export type BasedSelection = LearnSpecificData | NoteSpecificData | ChatSpecificData;

// Simple helper to create selections (without ID - will be assigned by database)
export function createSelection({
  type,
  text,
  context,
  metadata,
  tags
}: {
  type: SelectionType;
  text: string;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
}): Omit<BasedSelection, 'selection_id'> {
  return {
    text,
    context: context || {},
    tags: tags || [],
    type,
    metadata: metadata || {}
  } as Omit<BasedSelection, 'selection_id'>;
}





