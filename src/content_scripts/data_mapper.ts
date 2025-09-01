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
  
  return selection;
}
