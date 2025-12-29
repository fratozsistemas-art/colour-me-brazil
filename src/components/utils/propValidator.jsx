// ✅ MEDIUM FIX: Runtime prop validation (type safety)

/**
 * Validate prop types at runtime
 */
export const PropTypes = {
  string: (value, propName) => {
    if (typeof value !== 'string') {
      throw new Error(`${propName} must be a string, got ${typeof value}`);
    }
  },

  number: (value, propName) => {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error(`${propName} must be a number, got ${typeof value}`);
    }
  },

  boolean: (value, propName) => {
    if (typeof value !== 'boolean') {
      throw new Error(`${propName} must be a boolean, got ${typeof value}`);
    }
  },

  object: (value, propName) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      throw new Error(`${propName} must be an object, got ${typeof value}`);
    }
  },

  array: (value, propName) => {
    if (!Array.isArray(value)) {
      throw new Error(`${propName} must be an array, got ${typeof value}`);
    }
  },

  function: (value, propName) => {
    if (typeof value !== 'function') {
      throw new Error(`${propName} must be a function, got ${typeof value}`);
    }
  },

  arrayOf: (type) => (value, propName) => {
    if (!Array.isArray(value)) {
      throw new Error(`${propName} must be an array`);
    }
    value.forEach((item, index) => {
      try {
        type(item, `${propName}[${index}]`);
      } catch (error) {
        throw new Error(`${propName}[${index}]: ${error.message}`);
      }
    });
  },

  shape: (schema) => (value, propName) => {
    if (typeof value !== 'object' || value === null) {
      throw new Error(`${propName} must be an object`);
    }
    Object.keys(schema).forEach(key => {
      if (value[key] !== undefined) {
        try {
          schema[key](value[key], `${propName}.${key}`);
        } catch (error) {
          throw new Error(`${propName}.${key}: ${error.message}`);
        }
      }
    });
  },

  oneOf: (allowedValues) => (value, propName) => {
    if (!allowedValues.includes(value)) {
      throw new Error(
        `${propName} must be one of [${allowedValues.join(', ')}], got ${value}`
      );
    }
  },

  required: (type) => (value, propName) => {
    if (value === undefined || value === null) {
      throw new Error(`${propName} is required`);
    }
    type(value, propName);
  },

  optional: (type) => (value, propName) => {
    if (value !== undefined && value !== null) {
      type(value, propName);
    }
  },
};

/**
 * Validate component props
 */
export function validateProps(props, propTypes, componentName = 'Component') {
  if (process.env.NODE_ENV === 'production') {
    return; // Skip validation in production for performance
  }

  Object.keys(propTypes).forEach(propName => {
    try {
      propTypes[propName](props[propName], propName);
    } catch (error) {
      console.error(`❌ PropType validation failed for ${componentName}.${propName}:`, error.message);
    }
  });
}

/**
 * HOC to add prop validation to components
 */
export function withPropValidation(Component, propTypes) {
  return function ValidatedComponent(props) {
    validateProps(props, propTypes, Component.name);
    return Component(props);
  };
}

/**
 * Common prop type validators
 */
export const CommonProps = {
  bookId: PropTypes.required(PropTypes.string),
  pageId: PropTypes.required(PropTypes.string),
  profileId: PropTypes.required(PropTypes.string),
  userId: PropTypes.required(PropTypes.string),
  
  book: PropTypes.required(PropTypes.shape({
    id: PropTypes.required(PropTypes.string),
    title_en: PropTypes.required(PropTypes.string),
    title_pt: PropTypes.required(PropTypes.string),
    collection: PropTypes.required(PropTypes.oneOf(['amazon', 'culture'])),
  })),

  userProfile: PropTypes.required(PropTypes.shape({
    id: PropTypes.required(PropTypes.string),
    child_name: PropTypes.required(PropTypes.string),
    avatar_icon: PropTypes.required(PropTypes.string),
    preferred_language: PropTypes.required(PropTypes.oneOf(['en', 'pt'])),
  })),

  onCallback: PropTypes.required(PropTypes.function),
  onOptionalCallback: PropTypes.optional(PropTypes.function),
};

export default { PropTypes, validateProps, withPropValidation, CommonProps };