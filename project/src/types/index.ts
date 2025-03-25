import { Database } from './supabase';

export type Tables = Database['public']['Tables'];

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType;
}

export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface UserPreferences {
  currency: Currency;
  language: string;
}

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  items: InvoiceItem[];
  notes: string;
  terms: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  totalAmount: number;
  currency: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BillUpload {
  id: string;
  file: File;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  progress: number;
  crops: BillCrop[];
}

export interface BillCrop {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface Bill {
  id: string;
  user_id: string;
  file_path: string;
  file_name: string;
  file_size: number;
  status: string;
  crops: BillCrop[];
  created_at: string;
  updated_at: string;
  print_job_id?: string;
  crop_x?: number;
  crop_y?: number;
  crop_width?: number;
  crop_height?: number;
}

export interface PrintJob {
  id: string;
  user_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  files: Array<{
    path: string;
    name: string;
    size: number;
    type: string;
  }>;
  crop_settings?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  payment_status: 'pending' | 'paid' | 'failed';
  amount: number;
  created_at: string;
  updated_at: string;
}

export interface InvoiceTemplate {
  id: string;
  user_id: string;
  name: string;
  data: {
    layout: 'classic' | 'modern';
    sections: {
      header: { enabled: boolean; position: string };
      items: { enabled: boolean; position: string };
      footer: { enabled: boolean; position: string };
    };
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBranding {
  logo: string | null;
  color: string;
  font: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  company?: string;
  subscription: 'free' | 'pro' | 'enterprise';
  billCredits: number;
  preferences: UserPreferences;
  branding: UserBranding;
  last_invoice_number: number;
}