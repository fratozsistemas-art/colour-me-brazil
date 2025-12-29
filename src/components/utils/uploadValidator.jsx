// ✅ CRITICAL FIX: File upload validation to prevent malicious uploads

/**
 * Allowed MIME types for uploads
 */
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  audio: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
  ],
  documents: [
    'application/pdf',
    'text/plain',
  ],
};

/**
 * Maximum file sizes (in bytes)
 */
const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  audio: 50 * 1024 * 1024, // 50MB
  documents: 25 * 1024 * 1024, // 25MB
};

/**
 * Validate file type by MIME type and extension
 */
export function validateFileType(file, category = 'images') {
  const allowedTypes = ALLOWED_MIME_TYPES[category];
  
  if (!allowedTypes) {
    throw new Error(`Invalid file category: ${category}`);
  }

  // ✅ Check MIME type
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  // ✅ Check file extension (double-check)
  const extension = file.name.split('.').pop().toLowerCase();
  const validExtensions = {
    images: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    audio: ['mp3', 'wav', 'ogg', 'webm', 'mpeg'],
    documents: ['pdf', 'txt'],
  };

  if (!validExtensions[category]?.includes(extension)) {
    throw new Error(`Invalid file extension: .${extension}`);
  }

  return true;
}

/**
 * Validate file size
 */
export function validateFileSize(file, category = 'images') {
  const maxSize = MAX_FILE_SIZES[category];
  
  if (!maxSize) {
    throw new Error(`Invalid file category: ${category}`);
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    throw new Error(`File too large. Maximum size: ${maxSizeMB}MB`);
  }

  return true;
}

/**
 * Sanitize filename (prevent path traversal)
 */
export function sanitizeFilename(filename) {
  // Remove path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');
  
  // Remove special characters except dots, hyphens, underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const extension = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 200) + '.' + extension;
  }
  
  return sanitized;
}

/**
 * Comprehensive file validation
 */
export async function validateFile(file, category = 'images') {
  try {
    // ✅ Basic checks
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file object');
    }

    if (file.size === 0) {
      throw new Error('File is empty');
    }

    // ✅ Validate type and size
    validateFileType(file, category);
    validateFileSize(file, category);

    // ✅ For images, validate it's actually an image
    if (category === 'images') {
      await validateImageFile(file);
    }

    console.log('✅ File validation passed:', file.name);
    return {
      valid: true,
      sanitizedName: sanitizeFilename(file.name),
    };

  } catch (error) {
    console.error('❌ File validation failed:', error.message);
    throw error;
  }
}

/**
 * Validate image file by attempting to load it
 */
function validateImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      img.onload = () => {
        // Image loaded successfully
        resolve(true);
      };
      img.onerror = () => {
        reject(new Error('Invalid or corrupted image file'));
      };
      img.src = e.target.result;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if file matches magic bytes (file signature)
 */
export function checkMagicBytes(arrayBuffer, expectedType) {
  const arr = new Uint8Array(arrayBuffer).subarray(0, 4);
  let header = '';
  for (let i = 0; i < arr.length; i++) {
    header += arr[i].toString(16).padStart(2, '0');
  }

  const signatures = {
    'image/jpeg': ['ffd8ffe0', 'ffd8ffe1', 'ffd8ffe2'],
    'image/png': ['89504e47'],
    'image/gif': ['47494638'],
    'application/pdf': ['25504446'],
  };

  const expectedSignatures = signatures[expectedType];
  if (!expectedSignatures) return true; // No signature check available

  return expectedSignatures.some(sig => header.startsWith(sig));
}

export default { validateFile, validateFileType, validateFileSize, sanitizeFilename };