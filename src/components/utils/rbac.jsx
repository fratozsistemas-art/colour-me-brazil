/**
 * Role-Based Access Control (RBAC) Utility
 * 
 * Role Hierarchy:
 * - admin: Full access to everything
 * - curator: Content management, moderation
 * - parent: Parent portal, child profile management
 * - kidsuser: Limited child access
 * - user: Standard user access
 */

// Define role permissions
export const PERMISSIONS = {
  // Content Management
  MANAGE_BOOKS: ['admin', 'curator'],
  CREATE_BOOKS: ['admin', 'curator'],
  DELETE_BOOKS: ['admin'],
  
  // User Management
  MANAGE_USERS: ['admin'],
  VIEW_ALL_USERS: ['admin', 'curator'],
  INVITE_USERS: ['admin', 'parent'],
  
  // Content Moderation
  MODERATE_CONTENT: ['admin', 'curator'],
  APPROVE_SUBMISSIONS: ['admin', 'curator'],
  DELETE_USER_CONTENT: ['admin', 'curator'],
  
  // Parent Features
  MANAGE_CHILD_PROFILES: ['admin', 'parent'],
  VIEW_CHILD_ACTIVITY: ['admin', 'parent'],
  SET_CONTENT_RESTRICTIONS: ['admin', 'parent'],
  
  // Shop & Purchases
  MANAGE_PRODUCTS: ['admin'],
  VIEW_ALL_PURCHASES: ['admin'],
  
  // Analytics & Reports
  VIEW_ANALYTICS: ['admin', 'curator'],
  EXPORT_DATA: ['admin'],
  
  // Forum & Community
  PIN_POSTS: ['admin', 'curator'],
  LOCK_TOPICS: ['admin', 'curator'],
  DELETE_POSTS: ['admin', 'curator'],
  
  // Events & Challenges
  CREATE_EVENTS: ['admin', 'curator'],
  MANAGE_CHALLENGES: ['admin', 'curator'],
};

// Role display names and descriptions
export const ROLE_INFO = {
  admin: {
    name: 'Administrador',
    name_en: 'Administrator',
    description: 'Acesso total ao sistema',
    description_en: 'Full system access',
    color: 'red',
    icon: '👑'
  },
  curator: {
    name: 'Curador',
    name_en: 'Curator',
    description: 'Gerencia conteúdo e moderação',
    description_en: 'Manages content and moderation',
    color: 'purple',
    icon: '🎨'
  },
  parent: {
    name: 'Responsável',
    name_en: 'Parent',
    description: 'Gerencia perfis de crianças',
    description_en: 'Manages child profiles',
    color: 'blue',
    icon: '👨‍👩‍👧'
  },
  kidsuser: {
    name: 'Criança',
    name_en: 'Child',
    description: 'Acesso infantil controlado',
    description_en: 'Controlled child access',
    color: 'green',
    icon: '👶'
  },
  user: {
    name: 'Usuário',
    name_en: 'User',
    description: 'Acesso padrão',
    description_en: 'Standard access',
    color: 'gray',
    icon: '👤'
  }
};

/**
 * Check if a user has a specific permission
 * @param {Object} user - User object with role property
 * @param {string} permission - Permission constant from PERMISSIONS
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(user.role);
}

/**
 * Check if a user has any of the specified permissions
 * @param {Object} user - User object with role property
 * @param {string[]} permissions - Array of permission constants
 * @returns {boolean}
 */
export function hasAnyPermission(user, permissions) {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if a user has all specified permissions
 * @param {Object} user - User object with role property
 * @param {string[]} permissions - Array of permission constants
 * @returns {boolean}
 */
export function hasAllPermissions(user, permissions) {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Get user role information
 * @param {Object} user - User object with role property
 * @param {string} language - Language code ('pt' or 'en')
 * @returns {Object} Role information
 */
export function getRoleInfo(user, language = 'pt') {
  if (!user || !user.role) return null;
  
  const info = ROLE_INFO[user.role];
  if (!info) return null;
  
  return {
    ...info,
    displayName: language === 'en' ? info.name_en : info.name,
    displayDescription: language === 'en' ? info.description_en : info.description
  };
}

/**
 * Check if user can access a specific route
 * @param {Object} user - User object with role property
 * @param {string} routeName - Route/page name
 * @returns {boolean}
 */
export function canAccessRoute(user, routeName) {
  const routePermissions = {
    'ManageBooks': 'MANAGE_BOOKS',
    'ManageUsers': 'MANAGE_USERS',
    'ContentModeration': 'MODERATE_CONTENT',
    'ParentPortal': 'MANAGE_CHILD_PROFILES',
    'CuratorDashboard': 'VIEW_ANALYTICS',
  };
  
  const permission = routePermissions[routeName];
  if (!permission) return true; // Public route
  
  return hasPermission(user, permission);
}

/**
 * Filter array of items based on user permissions
 * Useful for showing/hiding menu items, buttons, etc.
 * @param {Object} user - User object
 * @param {Array} items - Array of items with 'requiredPermission' property
 * @returns {Array} Filtered items
 */
export function filterByPermission(user, items) {
  return items.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(user, item.requiredPermission);
  });
}

/**
 * React hook for checking permissions
 * Usage: const canManageBooks = usePermission(user, 'MANAGE_BOOKS');
 */
export function usePermission(user, permission) {
  return hasPermission(user, permission);
}