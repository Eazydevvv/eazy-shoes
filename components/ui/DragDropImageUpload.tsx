'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface DragDropImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  existingImages?: string[];
  maxFiles?: number;
}

export default function DragDropImageUpload({
  onImagesUploaded,
  existingImages = [],
  maxFiles = 5
}: DragDropImageUploadProps) {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'eazy-shoes');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );

        const data = await response.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }

        setUploadProgress(Math.round(((i + 1) / acceptedFiles.length) * 100));
      }

      const newImages = [...images, ...uploadedUrls];
      setImages(newImages);
      onImagesUploaded(newImages);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [images, onImagesUploaded]);

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUploaded(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
    },
    maxFiles: maxFiles,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
        }`}
        style={{ backgroundColor: 'var(--background)' }}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black dark:border-white mb-4"></div>
            <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
            <div className="w-full max-w-xs h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
              <div
                className="h-2 bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-3">📥</span>
            <p className="text-lg font-semibold">Drop your images here</p>
            <p className="text-sm opacity-70">Release to upload</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className="text-5xl mb-3">🖼️</span>
            <p className="text-lg font-semibold">Drag & drop images here</p>
            <p className="text-sm opacity-70 mt-1">
              or click to browse (max {maxFiles} images)
            </p>
            <p className="text-xs opacity-50 mt-2">
              PNG, JPG, GIF, WebP up to 5MB
            </p>
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{images.length} images uploaded</p>
          <div className="grid grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center hover:bg-red-600 text-xs"
                >
                  ✕
                </button>
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Remove all images?')) {
                  setImages([]);
                  onImagesUploaded([]);
                }
              }}
              className="mt-2 text-sm text-red-500 hover:text-red-700 transition"
            >
              Remove all
            </button>
          )}
        </div>
      )}
    </div>
  );
}