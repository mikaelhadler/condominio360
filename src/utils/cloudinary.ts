interface CloudinaryUploadOptions {
  folder?: string;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
}

export async function uploadToCloudinary(file: File, options: CloudinaryUploadOptions = {}): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/${options.resource_type || 'image'}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao fazer upload do arquivo');
  }

  const data = await response.json();
  return data.secure_url;
}