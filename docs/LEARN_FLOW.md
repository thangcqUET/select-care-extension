# Learn Flow (Click → Save)

This document visualizes the "Learn it" flow in the Select-Care extension. The diagram shows the UI components, service calls, background message, and storage steps from the moment the user clicks the Learn icon to when the selection is saved.

```mermaid
flowchart TD
  A[User selects text on page] --> B[Select popup appears]
  B --> C[User clicks Learn it icon]
  C --> D[SelectPopup.handleIconClick]
  D --> E[FormPopup created - learn]
  E --> F[FormPopup.show position]
  F --> G[createLearnInputComponent]
  G --> H[Show loading skeleton]
  H --> I[Call populateLearnUI]
  I -->|success| J[populateLearnUI builds parts and dispatches addMeaning events]
  J --> K[FormPopup listens for addMeaning and adds meaning elements]
  K --> L{Any meanings added?}
  L -- Yes --> M[Show badges & tabs with meanings]
  L -- No --> N[Show no meanings hint in default noun tab; Custom Definition available]
  M & N --> O[User edits or adds definitions]
  O --> P[User clicks Learn it button]
  P --> Q[FormPopup.collectFormData]
  Q --> R[convertToSelection]
  R --> S[chrome.runtime.sendMessage action=learn]
  S --> T[Background listener receives message]
  T --> U[Background creates selection and saves to IndexedDB]
  U --> V[Background responds success and broadcasts dataUpdated]
  V --> W[Dashboard and other contexts refresh]

  I -->|failure| X[FormPopup shows failed-to-load message and keeps Custom Definition]

```

Notes:
- `populateLearnUI` calls an external dictionary adapter (`src/content_scripts/api/dictionary`) and dispatches `addMeaning` events.
- The popup keeps a "Custom Definition" button so the user can add definitions even if the dictionary yields no results.
- The save step uses `convertToSelection` (`src/content_scripts/data_mapper.ts`) and delivers the selection to the background via `chrome.runtime.sendMessage`.
- Background storage is handled in `src/service_worker/background.ts` and persists the selection to IndexedDB via `selectionDB`.

Accessibility & UX considerations:
- Loading skeleton uses a shimmer animation by default; the code respects `prefers-reduced-motion` for scrolling operations.
- When a meaning is expanded the popup will smooth-scroll the `.meanings-wrap` so the expanded element is fully visible (reduced motion respected).

Next steps (optional):
- Add an animated highlight when a new custom definition is created.
- Add a small toast on successful save.
- Add unit tests for the no-results and error flows.
