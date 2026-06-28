import cloudinary from 'cloudinary';

interface CloudinaryConfig {
  cloudName?: string;
  apiKey?: string;
  apiSecret?: string;
}

export function configureCloudinary({ cloudName, apiKey, apiSecret }: CloudinaryConfig): void {
  cloudinary.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });
}
