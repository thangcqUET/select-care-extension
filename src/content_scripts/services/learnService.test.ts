// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { populateLearnUI } from './learnService';

// Sample data (trimmed) matching the user's payload
const sampleDataA = [
    {
        "word": "same",
        "phonetic": "/seɪm/",
        "phonetics": [
            {
                "text": "/seɪm/",
                "audio": ""
            },
            {
                "text": "/seɪm/",
                "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/same-us.mp3",
                "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=711217",
                "license": {
                    "name": "BY-SA 3.0",
                    "url": "https://creativecommons.org/licenses/by-sa/3.0"
                }
            }
        ],
        "meanings": [
            {
                "partOfSpeech": "adjective",
                "definitions": [
                    {
                        "definition": "Not different or other; not another or others; not different as regards self; selfsame; identical.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "Are you the same person who phoned me yesterday?"
                    },
                    {
                        "definition": "Lacking variety from; indistinguishable.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "It took all night to find our hotel room, as we forgot our room number and each door looked the same."
                    },
                    {
                        "definition": "Similar, alike.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "You have the same hair I do!"
                    },
                    {
                        "definition": "Used to express the unity of an object or person which has various different descriptions or qualities.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "Round here it can be cloudy and sunny even in the same day."
                    },
                    {
                        "definition": "A reply of confirmation of identity.",
                        "synonyms": [],
                        "antonyms": []
                    }
                ],
                "synonyms": [],
                "antonyms": []
            },
            {
                "partOfSpeech": "pronoun",
                "definitions": [
                    {
                        "definition": "The identical thing, ditto.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "It's the same everywhere."
                    },
                    {
                        "definition": "Something similar, something of the identical type.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "She's having apple pie? I'll have the same.   You two are just the same."
                    },
                    {
                        "definition": "It or them, without a connotation of similarity.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "Light valve suspensions and films containing UV absorbers and light valves containing the same (US Patent 5,467,217)"
                    },
                    {
                        "definition": "(Indian English, common) It or them, as above, meaning the last object mentioned, mainly as complement: on the same, for the same.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "My picture/photography blog...kindly give me your reviews on the same."
                    }
                ],
                "synonyms": [],
                "antonyms": []
            },
            {
                "partOfSpeech": "interjection",
                "definitions": [
                    {
                        "definition": "Indicates the speaker's strong approval or agreement with the previous material.",
                        "synonyms": [],
                        "antonyms": []
                    }
                ],
                "synonyms": [
                    "+1",
                    "like",
                    "this",
                    "IAWTP"
                ],
                "antonyms": []
            }
        ],
        "license": {
            "name": "CC BY-SA 3.0",
            "url": "https://creativecommons.org/licenses/by-sa/3.0"
        },
        "sourceUrls": [
            "https://en.wiktionary.org/wiki/same"
        ]
    },
    {
        "word": "same",
        "phonetic": "/seɪm/",
        "phonetics": [
            {
                "text": "/seɪm/",
                "audio": ""
            },
            {
                "text": "/seɪm/",
                "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/same-us.mp3",
                "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=711217",
                "license": {
                    "name": "BY-SA 3.0",
                    "url": "https://creativecommons.org/licenses/by-sa/3.0"
                }
            }
        ],
        "meanings": [
            {
                "partOfSpeech": "adverb",
                "definitions": [
                    {
                        "definition": "Together.",
                        "synonyms": [],
                        "antonyms": []
                    }
                ],
                "synonyms": [],
                "antonyms": []
            }
        ],
        "license": {
            "name": "CC BY-SA 3.0",
            "url": "https://creativecommons.org/licenses/by-sa/3.0"
        },
        "sourceUrls": [
            "https://en.wiktionary.org/wiki/same"
        ]
    }
];

// Another sample to exercise different POS shapes
const sampleDataB = [
    {
        "word": "receiving",
        "phonetic": "/ɹɪˈsiːvɪŋ/",
        "phonetics": [
            {
                "text": "/ɹɪˈsiːvɪŋ/",
                "audio": "https://api.dictionaryapi.dev/media/pronunciations/en/receiving-us.mp3",
                "sourceUrl": "https://commons.wikimedia.org/w/index.php?curid=1669341",
                "license": {
                    "name": "BY-SA 3.0",
                    "url": "https://creativecommons.org/licenses/by-sa/3.0"
                }
            }
        ],
        "meanings": [
            {
                "partOfSpeech": "verb",
                "definitions": [
                    {
                        "definition": "To take, as something that is offered, given, committed, sent, paid, etc.; to accept; to be given something.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "She received many presents for her birthday."
                    },
                    {
                        "definition": "To take goods knowing them to be stolen.",
                        "synonyms": [],
                        "antonyms": []
                    },
                    {
                        "definition": "To act as a host for guests; to give admittance to; to permit to enter, as into one's house, presence, company, etc.",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "to receive a lodger, visitor, ambassador, messenger, etc."
                    },
                    {
                        "definition": "To incur (an injury).",
                        "synonyms": [],
                        "antonyms": [],
                        "example": "I received a bloody nose from the collision."
                    },
                    {
                        "definition": "To allow (a custom, tradition, etc.); to give credence or acceptance to.",
                        "synonyms": [],
                        "antonyms": []
                    },
                    {
                        "definition": "To detect a signal from a transmitter.",
                        "synonyms": [],
                        "antonyms": []
                    },
                    {
                        "definition": "To be in a position to take possession, or hit back the ball.",
                        "synonyms": [],
                        "antonyms": []
                    },
                    {
                        "definition": "To accept into the mind; to understand.",
                        "synonyms": [],
                        "antonyms": []
                    }
                ],
                "synonyms": [],
                "antonyms": []
            },
            {
                "partOfSpeech": "noun",
                "definitions": [
                    {
                        "definition": "The act by which something is received; reception.",
                        "synonyms": [],
                        "antonyms": []
                    }
                ],
                "synonyms": [],
                "antonyms": []
            }
        ],
        "license": {
            "name": "CC BY-SA 3.0",
            "url": "https://creativecommons.org/licenses/by-sa/3.0"
        },
        "sourceUrls": [
            "https://en.wiktionary.org/wiki/receive",
            "https://en.wiktionary.org/wiki/receiving"
        ]
    }
];

// Mock the dictionary adapter used by the service
vi.mock('../api/dictionary', () => ({
    fetchDictionary: async (w: string) => {
        if (w === 'same') return sampleDataA;
        if (w === 'receiving') return sampleDataB;
        return [];
    }
}));

describe('populateLearnUI', () => {
  let controls: HTMLElement;
  let badgesWrap: HTMLElement;
  let tabs: HTMLElement;
  let synWrap: HTMLElement;

  beforeEach(() => {
    // create fresh DOM nodes
    controls = document.createElement('div');
    badgesWrap = document.createElement('div');
    tabs = document.createElement('div');
    synWrap = document.createElement('div');

        // Simulate FormPopup behavior: provide an ensureParts function that the
        // service will call directly (preferred API).
        (tabs as any).ensureParts = (parts: string[]) => {
            // clear existing
            tabs.innerHTML = '';
            parts.forEach((p, idx) => {
                const tab = document.createElement('div');
                tab.className = 'tab';
                tab.setAttribute('data-pos', p);
                if (idx === 0) tab.classList.add('active');
                const meaningsWrap = document.createElement('div');
                meaningsWrap.className = 'meanings-wrap';
                    // simulate FormPopup's addMeaning listener: append a simple div per meaning
                    meaningsWrap.addEventListener('addMeaning', (ev: any) => {
                        const detail = ev?.detail || {};
                        const def = document.createElement('div');
                        def.className = 'meaning';
                        def.textContent = detail.definition || detail.title || '';
                        meaningsWrap.appendChild(def);
                    });
                    tab.appendChild(meaningsWrap);
                const customBtn = document.createElement('button');
                customBtn.className = 'form-button';
                customBtn.textContent = 'Custom Definition';
                tab.appendChild(customBtn);
                tabs.appendChild(tab);
            });
        };
  });

  it('covered case for "same"', async () => {
    await populateLearnUI('same', controls, badgesWrap, tabs, synWrap);

    const adjWrap = tabs.querySelector('[data-pos="adjective"] .meanings-wrap') as HTMLElement | null;
    const pronWrap = tabs.querySelector('[data-pos="pronoun"] .meanings-wrap') as HTMLElement | null;
    const interWrap = tabs.querySelector('[data-pos="interjection"] .meanings-wrap') as HTMLElement | null;
    expect(pronWrap).not.toBeNull();
    expect(interWrap).not.toBeNull();
    expect(adjWrap).not.toBeNull();
    // adjective should have 5 definitions

    expect(adjWrap!.children.length).toBe(5);
    // pronoun should have 4 definitions
    expect(pronWrap!.children.length).toBe(4);
    // interjection should have 1 definition
    expect(interWrap!.children.length).toBe(1);
  });

    it('covered case for "receiving"', async () => {
        // reset tabs
        tabs.innerHTML = '';
        await populateLearnUI('receiving', controls, badgesWrap, tabs, synWrap);

        const verbWrap = tabs.querySelector('[data-pos="verb"] .meanings-wrap') as HTMLElement | null;
        const nounWrap = tabs.querySelector('[data-pos="noun"] .meanings-wrap') as HTMLElement | null;

        expect(verbWrap).not.toBeNull();
        expect(nounWrap).not.toBeNull();
        expect(verbWrap!.children.length).toBe(8);
        expect(nounWrap!.children.length).toBe(1);
    });
});
