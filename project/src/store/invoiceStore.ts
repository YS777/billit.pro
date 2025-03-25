import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Invoice, InvoiceTemplate } from '../types';

interface InvoiceState {
  invoices: Invoice[];
  templates: InvoiceTemplate[];
  loading: boolean;
  lastInvoiceNumber: number;
  createInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  fetchInvoices: () => Promise<void>;
  fetchTemplates: () => Promise<void>;
  createTemplate: (template: Omit<InvoiceTemplate, 'id'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<InvoiceTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
  getNextInvoiceNumber: () => Promise<number>;
}

export const useInvoiceStore = create<InvoiceState>((set, get) => ({
  invoices: [],
  templates: [],
  loading: false,
  lastInvoiceNumber: 1000,

  createInvoice: async (invoice) => {
    const { error, data } = await supabase
      .from('invoices')
      .insert([invoice])
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ 
      invoices: [...state.invoices, data],
      lastInvoiceNumber: state.lastInvoiceNumber + 1
    }));
  },

  updateInvoice: async (id, updates) => {
    const { error, data } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({
      invoices: state.invoices.map((inv) => (inv.id === id ? data : inv))
    }));
  },

  deleteInvoice: async (id) => {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({
      invoices: state.invoices.filter((inv) => inv.id !== id)
    }));
  },

  fetchInvoices: async () => {
    set({ loading: true });
    const { error, data } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    set({ invoices: data, loading: false });
  },

  fetchTemplates: async () => {
    const { error, data } = await supabase
      .from('invoice_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    set({ templates: data });
  },

  createTemplate: async (template) => {
    const { error, data } = await supabase
      .from('invoice_templates')
      .insert([template])
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ templates: [...state.templates, data] }));
  },

  updateTemplate: async (id, updates) => {
    const { error, data } = await supabase
      .from('invoice_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? data : t))
    }));
  },

  deleteTemplate: async (id) => {
    const { error } = await supabase
      .from('invoice_templates')
      .delete()
      .eq('id', id);
    if (error) throw error;
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id)
    }));
  },

  getNextInvoiceNumber: async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('last_invoice_number')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching last invoice number:', error);
        return get().lastInvoiceNumber + 1;
      }

      const nextNumber = (data?.last_invoice_number || 1000) + 1;
      set({ lastInvoiceNumber: nextNumber - 1 });
      return nextNumber;
    } catch (error) {
      console.error('Error getting next invoice number:', error);
      return get().lastInvoiceNumber + 1;
    }
  }
}));