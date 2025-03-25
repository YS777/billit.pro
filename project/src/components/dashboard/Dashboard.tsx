import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardHome from './DashboardHome';
import InvoiceList from '../invoice/InvoiceList';
import InvoiceCreate from '../invoice/InvoiceCreate';
import BillsPage from '../bills/BillsPage';
import SettingsPage from './SettingsPage';
import Layout from '../shared/Layout';

export default function Dashboard() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardHome />} />
        <Route path="/invoices" element={<InvoiceList />} />
        <Route path="/invoices/new" element={<InvoiceCreate />} />
        <Route path="/bills" element={<BillsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}