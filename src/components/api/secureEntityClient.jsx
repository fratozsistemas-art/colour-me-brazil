import { base44 } from '@/api/base44Client';

/**
 * Secure entity client wrapper for protected operations
 * Routes queries through backend security middleware
 */

class SecureEntityClient {
  constructor(entityName) {
    this.entityName = entityName;
  }

  async list(sort, limit) {
    const response = await base44.functions.invoke('secureEntityQuery', {
      entity_name: this.entityName,
      operation: 'list',
      query: { sort, limit }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Query failed');
    }
    
    return response.data.data;
  }

  async filter(query = {}, sort, limit) {
    const response = await base44.functions.invoke('secureEntityQuery', {
      entity_name: this.entityName,
      operation: 'filter',
      query: { ...query, sort, limit }
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Query failed');
    }
    
    return response.data.data;
  }

  async get(id) {
    const response = await base44.functions.invoke('secureEntityQuery', {
      entity_name: this.entityName,
      operation: 'get',
      id
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Query failed');
    }
    
    return response.data.data;
  }

  async create(data) {
    const response = await base44.functions.invoke('secureEntityQuery', {
      entity_name: this.entityName,
      operation: 'create',
      data
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Creation failed');
    }
    
    return response.data.data;
  }

  async update(id, data) {
    const response = await base44.functions.invoke('secureEntityQuery', {
      entity_name: this.entityName,
      operation: 'update',
      id,
      data
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Update failed');
    }
    
    return response.data.data;
  }

  async delete(id) {
    const response = await base44.functions.invoke('secureEntityQuery', {
      entity_name: this.entityName,
      operation: 'delete',
      id
    });
    
    if (!response.data.success) {
      throw new Error(response.data.error || 'Deletion failed');
    }
    
    return true;
  }
}

/**
 * Create secure entity clients for protected entities
 * Use these instead of base44.entities for sensitive data
 */
export const secureEntities = {
  UserProfile: new SecureEntityClient('UserProfile'),
  ParentAccount: new SecureEntityClient('ParentAccount'),
  Purchase: new SecureEntityClient('Purchase'),
  ColoredArtwork: new SecureEntityClient('ColoredArtwork'),
  ReadingGoal: new SecureEntityClient('ReadingGoal'),
  UserActivityLog: new SecureEntityClient('UserActivityLog'),
  QuizResult: new SecureEntityClient('QuizResult'),
  UserItemInventory: new SecureEntityClient('UserItemInventory'),
  ColoringSession: new SecureEntityClient('ColoringSession'),
  ShowcaseItem: new SecureEntityClient('ShowcaseItem'),
  StoryContribution: new SecureEntityClient('StoryContribution'),
  Like: new SecureEntityClient('Like'),
  Comment: new SecureEntityClient('Comment'),
  ForumTopic: new SecureEntityClient('ForumTopic'),
  ForumReply: new SecureEntityClient('ForumReply'),
  ContentRecommendation: new SecureEntityClient('ContentRecommendation'),
  ModerationEvent: new SecureEntityClient('ModerationEvent')
};

/**
 * For public entities (Book, Page, etc.), use regular base44.entities
 * For protected entities, use secureEntities
 * 
 * Example:
 *   const profiles = await secureEntities.UserProfile.filter({});
 *   const books = await base44.entities.Book.list(); // Still public
 */