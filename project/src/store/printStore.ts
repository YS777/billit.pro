import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { PrintJob } from '../types';

interface PrintState {
  printJobs: PrintJob[];
  loading: boolean;
  createPrintJob: (files: File[], cropSettings: any, amount: number) => Promise<string>;
  updatePrintJob: (id: string, updates: Partial<PrintJob>) => Promise<void>;
  fetchPrintJobs: () => Promise<void>;
  uploadFile: (file: File, jobId: string) => Promise<string>;
}

export const usePrintStore = create<PrintState>((set, get) => ({
  printJobs: [],
  loading: false,

  createPrintJob: async (files, cropSettings, amount) => {
    const { data, error } = await supabase
      .from('print_jobs')
      .insert({
        status: 'pending',
        files: [],
        crop_settings: cropSettings,
        amount,
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    
    set((state) => ({
      printJobs: [...state.printJobs, data]
    }));

    return data.id;
  },

  updatePrintJob: async (id, updates) => {
    const { error, data } = await supabase
      .from('print_jobs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      printJobs: state.printJobs.map((job) =>
        job.id === id ? { ...job, ...data } : job
      )
    }));
  },

  fetchPrintJobs: async () => {
    set({ loading: true });
    
    const { data, error } = await supabase
      .from('print_jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    set({
      printJobs: data || [],
      loading: false
    });
  },

  uploadFile: async (file: File, jobId: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `print-jobs/${jobId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('bills')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('bills')
      .getPublicUrl(filePath);

    return publicUrl;
  }
}));