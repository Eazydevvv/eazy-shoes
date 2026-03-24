'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CloudinaryUploadProps {
  onUpload: (url: string) => void;
  existingImage?: string;
}

export default function CloudinaryUpload({ onUpload, existingImage }: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(existingImage || '');
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'eazy-shoes');

    console.log('Uploading to Cloudinary...');
    console.log('Cloud name:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();
      console.log('Cloudinary response:', data); // This will show the error

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        onUpload(data.secure_url);
        console.log('✅ Image uploaded:', data.secure_url);
      } else {
        // Show the actual error from Cloudinary
        setError(data.error?.message || 'Upload failed');
        console.error('Cloudinary error:', data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload image. Please check your internet connection.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-black transition">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="hidden"
          id="cloudinary-upload"
        />
        <label
          htmlFor="cloudinary-upload"
          className="cursor-pointer block"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-black mb-2"></div>
              <p className="text-gray-500">Uploading to Cloudinary...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">📸</span>
              <p className="text-gray-600">Click to upload shoe image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
            </div>
          )}
        </label>
      </div>

      {/* Preview */}
      {imageUrl && (
        <div className="relative">
          <div className="relative h-48 w-full rounded-xl overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt="Product preview"
              fill
              className="object-contain"
            />
          </div>
          <button
            onClick={() => {
              setImageUrl('');
              onUpload('');
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}
    </div>
  );
}