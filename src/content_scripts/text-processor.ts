/**
 * Text processing utilities
 * Handles text cleaning and formatting operations
 */

export class TextProcessor {
  /**
   * Clean text by removing excessive whitespace and line breaks
   */
  static cleanText(text: string): string {
    if (!text) return '';
    
    return text
      // Replace multiple consecutive line breaks with single line break
      .replace(/\n{2,}/g, '\n')
      // Replace multiple consecutive spaces with single space
      .replace(/ {2,}/g, ' ')
      // Trim whitespace from start and end
      .trim();
  }

  /**
   * Truncate text to specified length with ellipsis
   */
  static truncateText(text: string, maxLength: number): string {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Check if text has meaningful content (not just whitespace)
   */
  static hasContent(text: string): boolean {
    return Boolean(text && text.trim().length > 0);
  }

  /**
   * Extract domain from URL
   */
  static extractDomain(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  /**
   * Sanitize text for HTML display
   */
  static sanitizeForDisplay(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * Format timestamp to readable string
   */
  static formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  }
}
