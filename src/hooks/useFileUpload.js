import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const uploadFile = useCallback(async (file, manuscriptId = null, type = 'manuscript') => {
    if (!user) {
      throw new Error('User must be authenticated to upload files');
    }

    if (!file) {
      throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = {
      manuscript: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
      cover: ['image/jpeg', 'image/png', 'image/webp']
    };

    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes[type].join(', ')}`);
    }

    // Validate file size (50MB for manuscripts, 5MB for covers)
    const maxSize = type === 'manuscript' ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `${user.id}/${type}s/${fileName}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(type === 'manuscript' ? 'manuscripts' : 'covers')
        .upload(filePath, file, {
          onUploadProgress: (progress) => {
            setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
          }
        });

      if (uploadError) {
        throw uploadError;
      }

      // Record upload in database
      const uploadRecord = {
        user_id: user.id,
        manuscript_id: manuscriptId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filePath,
        upload_status: 'completed',
        completed_at: new Date().toISOString()
      };

      const { data: recordData, error: recordError } = await supabase
        .from('uploads')
        .insert(uploadRecord)
        .select()
        .single();

      if (recordError) {
        // Try to clean up uploaded file
        await supabase.storage
          .from(type === 'manuscript' ? 'manuscripts' : 'covers')
          .remove([filePath]);
        throw recordError;
      }

      // Get public URL for covers
      let publicUrl = null;
      if (type === 'cover') {
        const { data: urlData } = supabase.storage
          .from('covers')
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      setUploadProgress(100);
      toast.success(`${type} uploaded successfully!`);

      return {
        upload: recordData,
        storagePath: filePath,
        publicUrl,
        fileUrl: uploadData.path
      };

    } catch (err) {
      setError(err.message);
      toast.error(`Upload failed: ${err.message}`);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [user]);

  const deleteFile = useCallback(async (uploadId, storagePath, bucket = 'manuscripts') => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([storagePath]);

      if (storageError) {
        console.warn('Failed to delete from storage:', storageError);
      }

      // Delete record from database
      const { error: dbError } = await supabase
        .from('uploads')
        .delete()
        .eq('id', uploadId)
        .eq('user_id', user.id);

      if (dbError) {
        throw dbError;
      }

      toast.success('File deleted successfully');
    } catch (err) {
      toast.error(`Delete failed: ${err.message}`);
      throw err;
    }
  }, [user]);

  const getFileUrl = useCallback(async (storagePath, bucket = 'manuscripts') => {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(storagePath, 3600); // 1 hour expiry

      if (error) {
        throw error;
      }

      return data.signedUrl;
    } catch (err) {
      console.error('Failed to get file URL:', err);
      throw err;
    }
  }, []);

  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    uploading,
    uploadProgress,
    error,
    setError
  };
};

export default useFileUpload; 