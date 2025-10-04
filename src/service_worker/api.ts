// Token and API integration for SelectCare Extension
export class SelectCareAPI {
  private static readonly TOKEN_KEY = 'selectcare_api_token';
  private static readonly BASE_URL = 'https://your-domain.com/api/v1'; // Update with your domain
  
  // Token management
  static async setToken(token: string): Promise<void> {
    await chrome.storage.local.set({ [this.TOKEN_KEY]: token });
  }
  
  static async getToken(): Promise<string | null> {
    const result = await chrome.storage.local.get([this.TOKEN_KEY]);
    return result[this.TOKEN_KEY] || null;
  }
  
  static async removeToken(): Promise<void> {
    await chrome.storage.local.remove([this.TOKEN_KEY]);
  }
  
  // API calls
  static async createSelection(data: {
    text: string;
    context: {
      sourceUrl: string;
      title?: string;
      selector?: string;
    };
    tags?: string[];
    type: 'note' | 'learn' | 'chat';
    comments?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('No API token available. Please log in to the web app first.');
    }
    
    const response = await fetch(`${this.BASE_URL}/selections`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        await this.removeToken();
        throw new Error('Authentication failed. Please log in again in the web app.');
      }
      if (response.status === 403) {
        throw new Error('API access not available in your current plan. Please upgrade.');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  static async getUserInfo(): Promise<any> {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('No API token available.');
    }
    
    const response = await fetch(`${this.BASE_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        await this.removeToken();
        throw new Error('Authentication failed.');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
  
  static async getSelections(options: {
    page?: number;
    limit?: number;
    type?: string;
  } = {}): Promise<any> {
    const token = await this.getToken();
    
    if (!token) {
      throw new Error('No API token available.');
    }
    
    const params = new URLSearchParams();
    if (options.page) params.set('page', options.page.toString());
    if (options.limit) params.set('limit', options.limit.toString());
    if (options.type) params.set('type', options.type);
    
    const response = await fetch(`${this.BASE_URL}/selections?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        await this.removeToken();
        throw new Error('Authentication failed.');
      }
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  }
}

// Update the existing background script to use the API
export async function saveSelectionToAPI(selection: any) {
  try {
    const result = await SelectCareAPI.createSelection({
      text: selection.text,
      context: {
        sourceUrl: selection.context.sourceUrl,
        title: selection.metadata?.pageTitle,
      },
      tags: selection.tags || [],
      type: selection.type,
      comments: selection.comments,
      metadata: selection.metadata
    });
    
    console.log('Selection saved to API:', result.id);
    return result;
  } catch (error) {
    console.error('Failed to save to API:', error);
    
    // Fallback to local storage if API fails
    return await saveSelectionLocally(selection);
  }
}

async function saveSelectionLocally(selection: any) {
  // Your existing local storage logic here
  return selection;
}

// Listen for token updates from web app
chrome.runtime.onMessageExternal.addListener((message, _, sendResponse) => {
  if (message.action === 'setToken' && message.token) {
    SelectCareAPI.setToken(message.token)
      .then(() => {
        console.log('API token updated from web app');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Failed to set token:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Indicates we will send a response asynchronously
  }
});
