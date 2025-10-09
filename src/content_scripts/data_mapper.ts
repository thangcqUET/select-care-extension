import { BasedSelection, createSelection } from "./types";

// convert data from selection event data to internal selection type
// selection event format
/**
 * actionType
: 
"note"
category
: 
"General"
selectedText
: 
"LoRaWAN modem is bidirectional device, so downlink could be re"
sourceUrl
: 
"https://wiki.risinghf.com/en/01/01/04/04/#application-with-full-duplex-gateway"
timestamp
: 
"2025-08-29T07:41:50.932Z"
title
: 
"ab"
 */

export function convertToSelection(data: any): Omit<BasedSelection, "selection_id"> | null {
  if (!data) return null;

  const {
    actionType,
    selectedText,
    sourceUrl,
    timestamp,
    tags,
    comment
  } = data;
  console.log("Converting to selection:");
  console.log(data);
  
  const selection = createSelection({
    type: actionType,
    text: selectedText,
    context: {
      sourceUrl,
    },
    // replace tags with an array
    tags: Array.isArray(tags) ? tags : [tags],
    metadata: {
      timestamp
    }
  });
  
  // Add comments if present
  if (comment && comment.trim()) {
    (selection as any).comments = [comment.trim()];
  }
  // Add learn-specific fields if actionType is 'learn'
  if (actionType === 'learn') {
    // top-level learn fields
    (selection as any).source_language = data.source_language || data.sourceLanguage || 'auto';
    (selection as any).translation_context = data.translation_context || data.translationContext || data.translation_context || data.translation_context || data.translationContext || data.translationContext || data.translation_context || data.translationContext || data.translation_context || data.translationContext || data.translationContext || data.translation_context || data.translationContext || data.translation_context || data.translationContext || data.translationContext || data.translation_context || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || data.translationContext || null;

    // Build pieces array: accept data.pieces if present, otherwise map legacy single fields into one-piece array
    let pieces: any[] = [];
    if (Array.isArray(data.pieces) && data.pieces.length > 0) {
      // Normalize incoming piece fields to expected snake_case keys
      pieces = data.pieces.map((p: any) => ({
        target_language: p.target_language || p.targetLanguage || data.targetLanguage || 'en',
        definition: (p.definition !== undefined) ? p.definition : (p.definition === undefined ? null : p.definition),
        translation: (p.translation !== undefined) ? p.translation : (p.translation === undefined ? null : p.translation),
        example: (p.example !== undefined) ? p.example : null,
        part_of_speech: p.part_of_speech || p.partOfSpeech || null,
        phonetics_text: p.phonetics_text || p.phoneticsText || null,
        phonetics_audio: p.phonetics_audio || p.phoneticsAudio || null,
        image_url: p.image_url || p.imageUrl || null
      }));
    }

    (selection as any).pieces = pieces;
  }
  
  return selection;
}
