
// Define selection type
export type SelectionType = 'learn' | 'note' | 'chat';

// Define specific data types for each selection type
export interface LearnSpecificData {
  image?: string;
  pieces: {
    language: string;
    lang_context: string;
  };
}

export interface NoteSpecificData {
  // No additional fields required for note type
}

export interface ChatSpecificData {
  chat_id: string;
}

// Discriminated union for selections with type-safe specific_data
export type BasedSelection = 
  | {
      selection_id: string;
      text: string;
      context: Record<string, any>;
      tags: string[];
      type: 'learn';
      specific_data: LearnSpecificData;
      metadata: Record<string, any>;
    }
  | {
      selection_id: string;
      text: string;
      context: Record<string, any>;
      tags: string[];
      type: 'note';
      specific_data: NoteSpecificData;
      metadata: Record<string, any>;
    }
  | {
      selection_id: string;
      text: string;
      context: Record<string, any>;
      tags: string[];
      type: 'chat';
      specific_data: ChatSpecificData;
      metadata: Record<string, any>;
    };

// Simple helper to create selections (without ID - will be assigned by database)
export function createSelection({
  type,
  text,
  specificData,
  context,
  metadata,
  tags
}: {
  type: SelectionType;
  text: string;
  specificData?: any;
  context?: Record<string, any>;
  metadata?: Record<string, any>;
  tags?: string[];
}): Omit<BasedSelection, 'selection_id'> {
  return {
    text,
    context: context || {},
    tags: tags || [],
    type,
    specific_data: specificData,
    metadata: metadata || {}
  } as Omit<BasedSelection, 'selection_id'>;
}





