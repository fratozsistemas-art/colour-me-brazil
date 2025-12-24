import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Define which entities are sensitive and how to filter them
const ENTITY_SECURITY_RULES = {
  UserProfile: {
    readFilter: (user, query) => {
      // Users can read their own profiles or profiles from their parent account
      return { ...query, parent_account_id: user.parent_account_id };
    },
    writeFilter: (user, data) => {
      // Ensure parent_account_id matches
      return { ...data, parent_account_id: user.parent_account_id };
    }
  },
  ParentAccount: {
    readFilter: (user, query) => {
      return { ...query, parent_user_id: user.id };
    },
    writeFilter: (user, data) => {
      return { ...data, parent_user_id: user.id };
    }
  },
  Purchase: {
    readFilter: (user, query) => {
      return { ...query, user_id: user.id };
    },
    writeFilter: (user, data) => {
      return { ...data, user_id: user.id };
    }
  },
  ColoredArtwork: {
    readFilter: (user, query) => {
      // Allow reading showcased artwork publicly, but filter by profile for non-showcased
      if (query.is_showcased === true) return query;
      return { ...query, profile_id: user.current_profile_id };
    },
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  ReadingGoal: {
    readFilter: (user, query) => {
      return { ...query, parent_account_id: user.parent_account_id };
    },
    writeFilter: (user, data) => {
      return { ...data, parent_account_id: user.parent_account_id };
    }
  },
  UserActivityLog: {
    readFilter: (user, query) => {
      return { ...query, profile_id: user.current_profile_id };
    },
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  QuizResult: {
    readFilter: (user, query) => {
      return { ...query, profile_id: user.current_profile_id };
    },
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  UserItemInventory: {
    readFilter: (user, query) => {
      return { ...query, profile_id: user.current_profile_id };
    },
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  ColoringSession: {
    readFilter: (user, query) => {
      return { ...query, profile_id: user.current_profile_id };
    },
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  ShowcaseItem: {
    readFilter: (user, query) => {
      // Showcased items can be public, but apply filter if specifically querying user's own
      return query;
    },
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  StoryContribution: {
    readFilter: (user, query) => query, // Public read
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  Like: {
    readFilter: (user, query) => query, // Public read
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  Comment: {
    readFilter: (user, query) => query, // Public read
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  ForumTopic: {
    readFilter: (user, query) => query, // Public read
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  },
  ForumReply: {
    readFilter: (user, query) => query, // Public read
    writeFilter: (user, data) => {
      return { ...data, profile_id: user.current_profile_id };
    }
  }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_name, operation, query, data, id } = await req.json();

    if (!entity_name || !operation) {
      return Response.json({ 
        error: 'Missing required parameters: entity_name, operation' 
      }, { status: 400 });
    }

    // Get security rules for this entity
    const rules = ENTITY_SECURITY_RULES[entity_name];
    
    if (!rules) {
      // Entity not in security rules - allow public access
      // This includes entities like Book, Page, etc.
      const entity = base44.entities[entity_name];
      
      switch (operation) {
        case 'list':
          const result = await entity.list(query?.sort, query?.limit);
          return Response.json({ success: true, data: result });
        
        case 'filter':
          const filtered = await entity.filter(query || {}, query?.sort, query?.limit);
          return Response.json({ success: true, data: filtered });
        
        case 'get':
          if (!id) return Response.json({ error: 'Missing id for get operation' }, { status: 400 });
          const item = await entity.get(id);
          return Response.json({ success: true, data: item });
        
        case 'create':
          const created = await entity.create(data);
          return Response.json({ success: true, data: created });
        
        case 'update':
          if (!id) return Response.json({ error: 'Missing id for update operation' }, { status: 400 });
          const updated = await entity.update(id, data);
          return Response.json({ success: true, data: updated });
        
        case 'delete':
          if (!id) return Response.json({ error: 'Missing id for delete operation' }, { status: 400 });
          await entity.delete(id);
          return Response.json({ success: true });
        
        default:
          return Response.json({ error: 'Invalid operation' }, { status: 400 });
      }
    }

    // Entity has security rules - apply them
    const entity = base44.asServiceRole.entities[entity_name];

    switch (operation) {
      case 'list':
        const listResult = await entity.list(query?.sort, query?.limit);
        return Response.json({ success: true, data: listResult });
      
      case 'filter':
        const secureQuery = rules.readFilter(user, query || {});
        const filterResult = await entity.filter(secureQuery, query?.sort, query?.limit);
        return Response.json({ success: true, data: filterResult });
      
      case 'get':
        if (!id) return Response.json({ error: 'Missing id for get operation' }, { status: 400 });
        const item = await entity.get(id);
        
        // Verify ownership
        const secureCheck = rules.readFilter(user, {});
        const ownershipKey = Object.keys(secureCheck).find(k => k !== 'is_showcased');
        if (ownershipKey && item[ownershipKey] !== secureCheck[ownershipKey]) {
          return Response.json({ error: 'Forbidden' }, { status: 403 });
        }
        
        return Response.json({ success: true, data: item });
      
      case 'create':
        const secureData = rules.writeFilter(user, data);
        const created = await entity.create(secureData);
        return Response.json({ success: true, data: created });
      
      case 'update':
        if (!id) return Response.json({ error: 'Missing id for update operation' }, { status: 400 });
        
        // Verify ownership before update
        const existingItem = await entity.get(id);
        const checkQuery = rules.readFilter(user, {});
        const ownerKey = Object.keys(checkQuery).find(k => k !== 'is_showcased');
        
        if (ownerKey && existingItem[ownerKey] !== checkQuery[ownerKey]) {
          return Response.json({ error: 'Forbidden - not your resource' }, { status: 403 });
        }
        
        const secureUpdateData = rules.writeFilter(user, data);
        const updated = await entity.update(id, secureUpdateData);
        return Response.json({ success: true, data: updated });
      
      case 'delete':
        if (!id) return Response.json({ error: 'Missing id for delete operation' }, { status: 400 });
        
        // Verify ownership before delete
        const itemToDelete = await entity.get(id);
        const deleteCheck = rules.readFilter(user, {});
        const deleteKey = Object.keys(deleteCheck).find(k => k !== 'is_showcased');
        
        if (deleteKey && itemToDelete[deleteKey] !== deleteCheck[deleteKey]) {
          return Response.json({ error: 'Forbidden - cannot delete others resources' }, { status: 403 });
        }
        
        await entity.delete(id);
        return Response.json({ success: true });
      
      default:
        return Response.json({ error: 'Invalid operation' }, { status: 400 });
    }

  } catch (error) {
    console.error('Security query error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});