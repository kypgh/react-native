# ProfileService Documentation

## Overview

The ProfileService handles all user profile-related API operations including profile data management, preferences, and photo uploads. It extends the BaseService to provide consistent error handling and retry logic.

## Features

- **Profile Management**: CRUD operations for user profile data
- **Preferences Management**: Update user preferences including categories, difficulty, notifications
- **Photo Upload**: Secure profile photo upload with validation
- **Settings Persistence**: Save and retrieve user settings
- **Data Validation**: Client-side validation before API calls
- **Error Handling**: Comprehensive error handling with user-friendly messages

## API Endpoints

### Profile Operations
- `GET /api/client/profile` - Get current user profile
- `PUT /api/client/profile` - Update user profile
- `DELETE /api/client/profile/photo` - Delete profile photo
- `POST /api/client/profile/photo` - Upload profile photo

### Preferences Operations
- `PATCH /api/client/profile/preferences` - Update all preferences
- `PATCH /api/client/profile/preferences/notifications` - Update notification preferences
- `PATCH /api/client/profile/preferences/categories` - Update favorite categories
- `PATCH /api/client/profile/preferences/difficulty` - Update preferred difficulty
- `PATCH /api/client/profile/preferences/timezone` - Update timezone preference

## Usage Examples

### Basic Profile Operations

```typescript
import { profileService } from '../services/api/profileService';

// Get user profile
const response = await profileService.getProfile();
if (response.success) {
  console.log('User profile:', response.data.client);
}

// Update profile
const updateData = {
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
};

const updateResponse = await profileService.updateProfile(updateData);
if (updateResponse.success) {
  console.log('Profile updated:', updateResponse.data.client);
}
```

### Photo Upload

```typescript
// Upload profile photo
const photoUri = 'file://path/to/photo.jpg';
const uploadResponse = await profileService.uploadProfilePhoto(photoUri);

if (uploadResponse.success) {
  console.log('Photo uploaded:', uploadResponse.data.profilePhoto);
} else {
  console.error('Upload failed:', uploadResponse.error?.message);
}

// Delete profile photo
const deleteResponse = await profileService.deleteProfilePhoto();
if (deleteResponse.success) {
  console.log('Photo deleted');
}
```

### Preferences Management

```typescript
// Update all preferences
const preferences = {
  favoriteCategories: ['yoga', 'pilates'],
  preferredDifficulty: 'intermediate' as const,
  notifications: {
    email: true,
    sms: false,
    push: true,
  },
  timezone: 'America/New_York',
};

const prefResponse = await profileService.updatePreferences(preferences);

// Update specific preference sections
await profileService.updateFavoriteCategories(['yoga', 'strength']);
await profileService.updatePreferredDifficulty('advanced');
await profileService.updateNotificationPreferences({
  email: false,
  sms: true,
  push: true,
});
await profileService.updateTimezone('America/Los_Angeles');
```

## Using with useProfile Hook

The recommended way to use ProfileService is through the `useProfile` hook:

```typescript
import { useProfile } from '../hooks/useProfile';

function ProfileScreen() {
  const {
    profile,
    isLoading,
    isUpdating,
    isUploadingPhoto,
    error,
    updateProfile,
    uploadProfilePhoto,
    updatePreferences,
    clearError,
  } = useProfile();

  const handleUpdateProfile = async () => {
    const success = await updateProfile({
      firstName: 'Jane',
      lastName: 'Smith',
    });
    
    if (success) {
      console.log('Profile updated successfully');
    }
  };

  const handlePhotoUpload = async (photoUri: string) => {
    const success = await uploadProfilePhoto(photoUri);
    
    if (success) {
      console.log('Photo uploaded successfully');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onDismiss={clearError} />;

  return (
    <View>
      <Text>{profile?.firstName} {profile?.lastName}</Text>
      <Button 
        title="Update Profile" 
        onPress={handleUpdateProfile}
        loading={isUpdating}
      />
    </View>
  );
}
```

## Data Validation

The ProfileService includes client-side validation:

### Email Validation
- Must be valid email format
- Automatically converted to lowercase
- Trimmed of whitespace

### Phone Validation
- Basic phone number format validation
- Supports international formats with + prefix
- Removes common formatting characters

### Preferences Validation
- Difficulty must be 'beginner', 'intermediate', or 'advanced'
- Categories are filtered and trimmed
- Notification preferences must be boolean values

### Photo Validation
- Maximum file size: 5MB
- Supported formats: JPEG, PNG
- Automatic MIME type detection

## Error Handling

The service provides comprehensive error handling:

```typescript
// Error types returned by the service
interface ApiError {
  type: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'TIMEOUT_ERROR';
  message: string;
  code?: string;
  statusCode?: number;
}

// Example error handling
const response = await profileService.updateProfile(data);
if (!response.success) {
  switch (response.error?.type) {
    case 'VALIDATION_ERROR':
      // Handle validation errors
      showValidationError(response.error.message);
      break;
    case 'NETWORK_ERROR':
      // Handle network issues
      showNetworkError();
      break;
    default:
      // Handle other errors
      showGenericError(response.error?.message);
  }
}
```

## Image Upload Details

### Supported Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)

### File Size Limits
- Maximum: 5MB per image
- Recommended: Under 2MB for better performance

### Upload Process
1. Client-side validation (format, size)
2. FormData creation with proper MIME types
3. Multipart form upload to server
4. Server processing and URL generation
5. Profile update with new photo URL

### Error Scenarios
- `INVALID_IMAGE`: Unsupported format or too large
- `PHOTO_UPLOAD_FAILED`: Server-side upload failure
- `NETWORK_ERROR`: Connection issues during upload

## Performance Considerations

### Caching
- Profile data is cached in the useProfile hook
- Automatic refresh on app focus
- Manual refresh available via `refreshProfile()`

### Optimistic Updates
- UI updates immediately for better UX
- Reverts on API failure
- Loading states for all operations

### Request Optimization
- Automatic retry for failed requests
- Request deduplication
- Proper cleanup on component unmount

## Security Features

### Data Protection
- All requests include authentication headers
- Sensitive data validation before transmission
- Secure photo upload with server-side validation

### Privacy
- Profile photos stored securely on server
- User preferences encrypted in transit
- No sensitive data logged in production

## Testing

### Manual Testing Checklist
- [ ] Profile data loads correctly
- [ ] Profile updates save successfully
- [ ] Photo upload works with valid images
- [ ] Photo upload rejects invalid files
- [ ] Preferences save and persist
- [ ] Error handling works for network issues
- [ ] Loading states display correctly
- [ ] Validation prevents invalid data submission

### Common Test Scenarios
1. **Profile Load**: Verify profile data loads on app start
2. **Profile Update**: Test updating various profile fields
3. **Photo Upload**: Test with different image formats and sizes
4. **Preferences**: Test updating different preference categories
5. **Error Handling**: Test with network disconnected
6. **Validation**: Test with invalid email/phone formats

## Troubleshooting

### Common Issues

**Profile not loading**
- Check authentication status
- Verify network connectivity
- Check server endpoint availability

**Photo upload failing**
- Verify image format (JPEG/PNG only)
- Check file size (max 5MB)
- Ensure proper permissions for file access

**Preferences not saving**
- Validate preference values
- Check for network connectivity
- Verify authentication token validity

**Validation errors**
- Check email format
- Verify phone number format
- Ensure required fields are provided

### Debug Information

Enable debug logging in development:

```typescript
// In development, the service logs detailed information
if (__DEV__) {
  console.log('Profile API request:', requestData);
  console.log('Profile API response:', response);
}
```

## Related Components

- **useProfile Hook**: React hook for profile state management
- **AuthContext**: Provides authentication state
- **ImageUtils**: Utilities for image validation and processing
- **BaseService**: Provides common API functionality
- **ErrorHandler**: Centralized error handling utilities