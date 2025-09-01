import { BasedSelection } from "./types";

const DB_NAME = 'SelectCareDB';
const DB_VERSION = 1;
const STORE_NAME = 'selections';

class SelectionDatabase {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store for selections
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'selection_id' });
          // Create indexes for efficient querying
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
          store.createIndex('sourceUrl', 'context.sourceUrl', { unique: false });
          store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
          
          console.log('SelectCare object store created');
        }
      };
    });
  }

  async saveSelection(selection: BasedSelection): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const request = store.put(selection);

      request.onsuccess = () => {
        console.log('Selection saved to IndexedDB:', selection.selection_id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save selection:', request.error);
        reject(request.error);
      };
    });
  }

  async getSelection(selection_id: string): Promise<BasedSelection | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(selection_id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get selection:', request.error);
        reject(request.error);
      };
    });
  }

  async getAllSelections(): Promise<BasedSelection[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        // Sort by timestamp (newest first)
        
        console.log("request.result");
        console.log(request.result);

        const selections = request.result.sort((a, b) => {
            return new Date(b.metadata?.timestamp)?.getTime() - new Date(a.metadata?.timestamp)?.getTime();
        });
        console.log("selections");
        console.log(selections);
        resolve(selections);
      };

      request.onerror = () => {
        console.error('Failed to get all selections:', request.error);
        reject(request.error);
      };
    });
  }

  async deleteSelection(selection_id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(selection_id);

      request.onsuccess = () => {
        console.log('Selection deleted from IndexedDB:', selection_id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete selection:', request.error);
        reject(request.error);
      };
    });
  }

  async getSelectionsByActionType(actionType: string): Promise<BasedSelection[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(actionType);

      request.onsuccess = () => {
        const selections = request.result.sort((a, b) => 
          new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime()
        );
        resolve(selections);
      };

      request.onerror = () => {
        console.error('Failed to get selections by action type:', request.error);
        reject(request.error);
      };
    });
  }

  async searchSelections(query: string): Promise<BasedSelection[]> {
    const allSelections = await this.getAllSelections();
    
    const lowerQuery = query.toLowerCase();
    return allSelections.filter(selection => 
      selection.text.toLowerCase().includes(lowerQuery) ||
      selection.context.sourceUrl.toLowerCase().includes(lowerQuery) ||
      selection.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  async clearAllSelections(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All selections cleared from IndexedDB');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear selections:', request.error);
        reject(request.error);
      };
    });
  }
}

// Create and export singleton instance
export const selectionDB = new SelectionDatabase();
