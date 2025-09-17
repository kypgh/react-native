/**
 * Image handling utilities for profile photo management
 */

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate image file for profile photo upload
 */
export const validateProfileImage = (image: ImagePickerResult): ImageValidationResult => {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (image.size && image.size > maxSize) {
    return {
      isValid: false,
      error: 'Image size must be less than 5MB',
    };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(image.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Only JPEG and PNG images are allowed',
    };
  }

  return { isValid: true };
};

/**
 * Generate a unique filename for profile photo
 */
export const generateProfilePhotoName = (userId: string, extension: string = 'jpg'): string => {
  const timestamp = Date.now();
  return `profile-${userId}-${timestamp}.${extension}`;
};

/**
 * Get file extension from URI or filename
 */
export const getFileExtension = (uri: string): string => {
  const parts = uri.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'jpg';
};

/**
 * Get MIME type from file extension
 */
export const getMimeType = (extension: string): string => {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
  };
  
  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
};

/**
 * Create FormData entry for image upload
 */
export const createImageFormData = (
  uri: string,
  fieldName: string = 'profilePhoto',
  filename?: string
): FormData => {
  const formData = new FormData();
  const extension = getFileExtension(uri);
  const mimeType = getMimeType(extension);
  const name = filename || `image.${extension}`;

  formData.append(fieldName, {
    uri,
    type: mimeType,
    name,
  } as any);

  return formData;
};

/**
 * Validate and prepare image for upload
 */
export const prepareImageForUpload = (
  image: ImagePickerResult,
  userId?: string
): { isValid: boolean; error?: string; formData?: FormData } => {
  // Validate image
  const validation = validateProfileImage(image);
  if (!validation.isValid) {
    return validation;
  }

  // Generate filename
  const extension = getFileExtension(image.uri);
  const filename = userId 
    ? generateProfilePhotoName(userId, extension)
    : `profile-photo.${extension}`;

  // Create FormData
  const formData = createImageFormData(image.uri, 'profilePhoto', filename);

  return {
    isValid: true,
    formData,
  };
};

/**
 * Get image dimensions (placeholder for future implementation)
 * Note: This would require react-native-image-size or similar library
 */
export const getImageDimensions = async (uri: string): Promise<{ width: number; height: number } | null> => {
  // Placeholder implementation
  // In a real app, you would use a library like react-native-image-size
  // or react-native-image-picker's built-in dimension detection
  
  if (__DEV__) {
    console.log('Image dimensions check for:', uri);
  }
  
  return null;
};

/**
 * Resize image (placeholder for future implementation)
 * Note: This would require react-native-image-resizer or similar library
 */
export const resizeImage = async (
  uri: string,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.8
): Promise<string> => {
  // Placeholder implementation
  // In a real app, you would use a library like react-native-image-resizer
  
  if (__DEV__) {
    console.log('Image resize requested for:', uri, { maxWidth, maxHeight, quality });
  }
  
  // Return original URI for now
  return uri;
};

/**
 * Default profile photo placeholder
 */
export const DEFAULT_PROFILE_PHOTO = 'https://via.placeholder.com/150x150/cccccc/666666?text=Profile';

/**
 * Check if a URL is a valid image URL
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.toLowerCase();
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    
    return validExtensions.some(ext => pathname.endsWith(ext)) || 
           url.includes('placeholder') || 
           url.includes('avatar') ||
           url.includes('profile');
  } catch {
    return false;
  }
};

/**
 * Get profile photo URL with fallback
 */
export const getProfilePhotoUrl = (photoUrl?: string | null): string => {
  if (photoUrl && isValidImageUrl(photoUrl)) {
    return photoUrl;
  }
  
  return DEFAULT_PROFILE_PHOTO;
};