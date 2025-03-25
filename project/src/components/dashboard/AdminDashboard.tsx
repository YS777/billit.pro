import React, { useEffect, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, Users, FileText, CreditCard, 
  DollarSign, ArrowUpRight, ArrowDownRight 
} from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { useBillStore } from '../../store/billStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalUsers: number;
  totalInvoices: number;
  totalBills: number;
  totalRevenue: number;
  monthlyGrowth: number;
  activeUsers: number;
}

interface ChartData {
  date: string;
  invoices: number;
  bills: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalInvoices: 0,
    totalBills: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeUsers: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch basic stats
      const { data: users } = await supabase.from('profiles').select('count');
      const { data: invoices } = await supabase.from('invoices').select('count');
      const { data: bills } = await supabase.from('bills').select('count');
      
      // Calculate revenue (from paid invoices)
      const { data: revenue } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid');
      
      const totalRevenue = revenue?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

      // Calculate monthly growth
      const lastMonth = await supabase
        .from('invoices')
        .select('count')
        .gte('created_at', startOfMonth(subDays(new Date(), 30)).toISOString())
        .lte('created_at', endOfMonth(subDays(new Date(), 30)).toISOString());

      const thisMonth = await supabase
        .from('invoices')
        .select('count')
        .gte('created_at', startOfMonth(new Date()).toISOString())
        .lte('created_at', endOfMonth(new Date()).toISOString());

      const monthlyGrowth = ((thisMonth?.count || 0) - (lastMonth?.count || 0)) / (lastMonth?.count || 1) * 100;

      // Get active users (users who created invoice/bill in last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data: activeUsers } = await supabase
        .from('profiles')
        .select('id')
        .in('id', supabase
          .from('invoices')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo)
          .union(
            supabase
              .from('bills')
              .select('user_id')
              .gte('created_at', thirtyDaysAgo)
          )
        );

      setStats({
        totalUsers: users?.[0]?.count || 0,
        totalInvoices: invoices?.[0]?.count || 0,
        totalBills: bills?.[0]?.count || 0,
        totalRevenue,
        monthlyGrowth,
        activeUsers: activeUsers?.length || 0
      });

      // Fetch chart data for last 30 days
      const chartData = await Promise.all(
        Array.from({ length: 30 }, (_, i) => {
          const date = subDays(new Date(), i);
          const dateStr = format(date, 'yyyy-MM-dd');
          
          return Promise.all([
            supabase
              .from('invoices')
              .select('count')
              .gte('created_at', `${dateStr}T00:00:00`)
              .lt('created_at', `${dateStr}T23:59:59`),
            supabase
              .from('bills')
              .select('count')
              .gte('created_at', `${dateStr}T00:00:00`)
              .lt('created_at', `${dateStr}T23:59:59`),
            supabase
              .from('invoices')
              .select('total_amount')
              .eq('status', 'paid')
              .gte('created_at', `${dateStr}T00:00:00`)
              .lt('created_at', `${dateStr}T23:59:59`)
          ]).then(([invoices, bills, revenue]) => ({
            date: format(date, 'MMM dd'),
            invoices: invoices?.count || 0,
            bills: bills?.count || 0,
            revenue: revenue?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0
          }));
        })
      );

      setChartData(chartData.reverse());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your business performance and growth
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalUsers}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold">
                        {stats.activeUsers} active
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Invoices
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.totalInvoices}
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.monthlyGrowth >= 0 ? (
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(stats.monthlyGrowth).toFixed(1)}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DollarSign className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Revenue
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        ${stats.totalRevenue.toFixed(2)}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4F46E5" 
                    fill="#EEF2FF" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Activity</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="invoices" fill="#4F46E5" name="Invoices" />
                  <Bar dataKey="bills" fill="#6366F1" name="Bills" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {/* Add recent activity items here */}
              <div className="px-6 py-4 flex items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New invoice created
                  </p>
                  <p className="text-sm text-gray-500">
                    Invoice #1234 for $500.00
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <span className="text-sm text-gray-500">
                    2 minutes ago
                  </span>
                </div>
              </div>
              {/* Add more activity items as needed */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}