
// Define selection type
export type SelectionType = 'learn' | 'note' | 'chat';


export type BaseSelection = {
  selection_id: string;
  text: string;
  context: Record<string, any>;
  tags: string[];
  metadata: Record<string, any>;
}

// Define specific data types for each selection type
export interface LearnSpecificData extends BaseSelection {
  type: 'learn';
  image?: string;
  pieces: {
    language: string;
    lang_context: string;
  };
}

export interface NoteSpecificData extends BaseSelection {
  type: 'note';
}

export interface ChatSpecificData extends BaseSelection {
  type: 'chat';
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





