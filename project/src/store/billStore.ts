import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import type { BillUpload } from '../types';

interface BillState {
  uploads: BillUpload[];
  addUpload: (file: File) => void;
  updateUpload: (id: string, updates: Partial<BillUpload>) => void;
  removeUpload: (id: string) => void;
  processUploads: () => Promise<void>;
}

export const useBillStore = create<BillState>((set, get) => ({
  uploads: [],
  addUpload: (file) => {
    const upload: BillUpload = {
      id: crypto.randomUUID(),
      file,
      status: 'uploading',
      progress: 0,
      crops: []
    };
    set((state) => ({ uploads: [...state.uploads, upload] }));
  },
  updateUpload: (id, updates) => {
    set((state) => ({
      uploads: state.uploads.map((upload) =>
        upload.id === id ? { ...upload, ...updates } : upload
      )
    }));
  },
  removeUpload: (id) => {
    set((state) => ({
      uploads: state.uploads.filter((upload) => upload.id !== id)
    }));
  },
  processUploads: async () => {
    const { uploads } = get();
    const user = useAuthStore.getState().user;
    if (!user) return;

    // Process each upload in parallel
    await Promise.all(
      uploads.map(async (upload) => {
        try {
          // Update status to processing
          get().updateUpload(upload.id, { status: 'processing', progress: 0 });

          // Upload file to Supabase Storage
          const fileExt = upload.file.name.split('.').pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${user.id}/${fileName}`;

          const { error: uploadError, data } = await supabase.storage
            .from('bills')
            .upload(filePath, upload.file, {
              upsert: false,
              contentType: upload.file.type
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('bills')
            .getPublicUrl(filePath);

          // Create bill record in database
          const { error: dbError } = await supabase
            .from('bills')
            .insert({
              user_id: user.id,
              file_path: filePath,
              file_name: upload.file.name,
              file_size: upload.file.size,
              status: 'processing',
              crops: []
            });

          if (dbError) throw dbError;

          // Update bill credits
          const { error: creditError } = await supabase
            .from('profiles')
            .update({ 
              bill_credits: user.billCredits - 1 
            })
            .eq('id', user.id);

          if (creditError) throw creditError;

          // Update local user state
          useAuthStore.setState({
            user: {
              ...user,
              billCredits: user.billCredits - 1
            }
          });

          // Update upload status to ready
          get().updateUpload(upload.id, { status: 'ready', progress: 100 });

        } catch (error) {
          console.error('Error processing bill:', error);
          get().updateUpload(upload.id, { status: 'error', progress: 0 });
        }
      })
    );
  }
}));