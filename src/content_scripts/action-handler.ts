/**
 * Action handlers for processing different types of selections
 * Handles communication with background script and data processing
 */

import { convertToSelection } from './data_mapper';

export interface ActionHandler {
  handleLearn(data: any): Promise<void>;
  handleNote(data: any): Promise<void>;
  handleChat(data: any): Promise<void>;
}

export class SelectionActionHandler implements ActionHandler {
  /**
   * Handle learn action - process text for language learning
   */
  async handleLearn(data: any): Promise<void> {
    console.log('💾 Saving learn data:', data);
    
    try {
      const learnSelection = convertToSelection(data);
      console.log('Created learn selection:', learnSelection);
      
      const response = await chrome.runtime.sendMessage({
        action: 'learn',
        data: learnSelection
      });
      
      console.log('Response from background:', response);
    } catch (error) {
      console.error('Failed to handle learn action:', error);
    }
  }

  /**
   * Handle note action - save text as a note with tags
   */
  async handleNote(data: any): Promise<void> {
    console.log('💾 Saving note:', data);
    console.log('📋 Parsed tags:', data.tags);
    console.log('🏷️ Tag count:', data.tagCount);
    
    try {
      const noteSelection = convertToSelection(data);
      console.log('Created note selection:', noteSelection);
      
      const response = await chrome.runtime.sendMessage({
        action: 'note',
        data: noteSelection
      });
      
      console.log('Response from background:', response);
    } catch (error) {
      console.error('Failed to handle note action:', error);
    }
  }

  /**
   * Handle chat action - send text to AI for processing
   */
  async handleChat(data: any): Promise<void> {
    console.log('🤖 Asking AI:', data);
    
    try {
      const chatSelection = convertToSelection(data);
      console.log('Created chat selection:', chatSelection);
      
      const response = await chrome.runtime.sendMessage({
        action: 'chat',
        data: chatSelection
      });
      
      console.log('Response from background:', response);
    } catch (error) {
      console.error('Failed to handle chat action:', error);
    }
  }

  /**
   * Route action to appropriate handler
   */
  async handleAction(actionType: string, data: any): Promise<void> {
    switch (actionType) {
      case 'learn':
        await this.handleLearn(data);
        break;
      case 'note':
        await this.handleNote(data);
        break;
      case 'chat':
        await this.handleChat(data);
        break;
      default:
        console.warn('Unknown action type:', actionType);
    }
  }
}
