import * as ImagePicker from 'expo-image-picker';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

class ImageService {
  // Request camera permissions
  async requestCameraPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  // Request media library permissions
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  // Pick an image from gallery
  async pickImageFromGallery(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: asset.type === 'image' ? 'image/jpeg' : 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}.jpg`,
        size: asset.fileSize,
      };
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      return null;
    }
  }

  // Take a photo with camera
  async takePhoto(options?: {
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
  }): Promise<ImagePickerResult | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: options?.allowsEditing ?? true,
        aspect: options?.aspect ?? [1, 1],
        quality: options?.quality ?? 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        type: 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: asset.fileSize,
      };
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  }

  // Pick multiple images
  async pickMultipleImages(options?: {
    quality?: number;
    selectionLimit?: number;
  }): Promise<ImagePickerResult[] | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: false,
        quality: options?.quality ?? 0.8,
        allowsMultipleSelection: true,
        selectionLimit: options?.selectionLimit ?? 10,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      return result.assets.map((asset, index) => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
        size: asset.fileSize,
      }));
    } catch (error) {
      console.error('Error picking multiple images:', error);
      return null;
    }
  }

  // Create FormData for upload
  createFormData(image: ImagePickerResult, fieldName: string = 'image'): FormData {
    const formData = new FormData();
    
    // Create file object for React Native
    const file: any = {
      uri: image.uri,
      type: image.type,
      name: image.name,
    };

    formData.append(fieldName, file);
    return formData;
  }

  // Create FormData with multiple images
  createMultipleImageFormData(images: ImagePickerResult[], fieldName: string = 'images'): FormData {
    const formData = new FormData();
    
    images.forEach((image, index) => {
      const file: any = {
        uri: image.uri,
        type: image.type,
        name: image.name,
      };
      
      formData.append(`${fieldName}[${index}]`, file);
    });
    
    return formData;
  }

  // Add additional fields to FormData
  addFieldsToFormData(formData: FormData, fields: { [key: string]: any }): FormData {
    Object.keys(fields).forEach((key) => {
      const value = fields[key];
      if (value !== undefined && value !== null) {
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      }
    });
    return formData;
  }

  // Validate image size
  validateImageSize(image: ImagePickerResult, maxSizeMB: number = 5): boolean {
    if (!image.size) return true;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return image.size <= maxSizeBytes;
  }

  // Get image dimensions
  async getImageDimensions(uri: string): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        resolve(null);
      };
      img.src = uri;
    });
  }
}

export default new ImageService();
