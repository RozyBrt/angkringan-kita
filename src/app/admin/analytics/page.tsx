'use client';

import { useEffect, useState } from 'react';
import { getRevenueStats, getTopItems } from '@/lib/actions/orders';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Banknote, TrendingUp, ShoppingBag, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsDashboard() {
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [topItems, setTopItems] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [revRes, topRes] = await Promise.all([
        getRevenueStats(days),
        getTopItems(days)
      ]);
      if (revRes.success && revRes.data) setRevenueData(revRes.data);
      if (topRes.success && topRes.data) setTopItems(topRes.data);
      setLoading(false);
    }
    loadData();
  }, [days]);

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = revenueData.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const timeRanges = [
    { label: '7 Hari', value: 7 },
    { label: '30 Hari', value: 30 },
    { label: '90 Hari', value: 90 },
  ];

  if (loading && revenueData.length === 0) {
    return (
      <div className="min-h-screen bg-coffee-950 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-cream-500 mb-4" size={48} />
        <p className="text-coffee-400 animate-pulse font-display tracking-widest">MENYEDUH DATA...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-coffee-950 p-6 md:p-10 font-sans text-cream-50 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-orange-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-cream-100 to-orange-200 flex items-center gap-3">
            <TrendingUp className="text-orange-400 flex-shrink-0" /> Business Intelligence
          </h1>
          <p className="text-coffee-400 mt-2 font-medium">Ringkasan performa penjualan {days} hari terakhir.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-coffee-900/60 p-1.5 rounded-2xl border border-coffee-800/50 backdrop-blur-md">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setDays(range.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                days === range.value 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-coffee-400 hover:text-cream-200 hover:bg-coffee-800/50'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <Link href="/admin/dashboard" className="px-5 py-2.5 bg-coffee-900/60 hover:bg-coffee-800 text-cream-200 rounded-xl font-bold flex items-center gap-2 transition-all border border-coffee-700/50 backdrop-blur-md shadow-lg w-fit">
          <ArrowLeft size={18} /> Kembali ke Dapur
        </Link>
      </div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-coffee-900/40 backdrop-blur-xl border border-coffee-800/60 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/20 shadow-inner">
                <Banknote size={28} />
              </div>
              <p className="text-coffee-300 font-medium tracking-wide uppercase text-sm">Total Pendapatan</p>
            </div>
            <h2 className="text-4xl font-display font-black tracking-tight text-white">{formatCurrency(totalRevenue)}</h2>
          </div>

          <div className="bg-coffee-900/40 backdrop-blur-xl border border-coffee-800/60 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                <ShoppingBag size={28} />
              </div>
              <p className="text-coffee-300 font-medium tracking-wide uppercase text-sm">Total Pesanan</p>
            </div>
            <h2 className="text-4xl font-display font-black tracking-tight text-white">{totalOrders} <span className="text-xl text-coffee-500 font-medium ml-1">nota</span></h2>
          </div>

          <div className="bg-coffee-900/40 backdrop-blur-xl border border-coffee-800/60 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-orange-500/30 transition-all duration-300">
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all duration-500" />
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-inner">
                <TrendingUp size={28} />
              </div>
              <p className="text-coffee-300 font-medium tracking-wide uppercase text-sm">Rata-rata Order (AOV)</p>
            </div>
            <h2 className="text-4xl font-display font-black tracking-tight text-white">{formatCurrency(Math.round(avgOrderValue))}</h2>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Revenue Line Chart */}
          <div className="lg:col-span-3 bg-coffee-900/40 backdrop-blur-xl border border-coffee-800/60 p-8 rounded-[2rem] shadow-2xl relative">
            {loading && (
              <div className="absolute inset-0 bg-coffee-900/20 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[2rem]">
                <Loader2 className="animate-spin text-orange-400" size={32} />
              </div>
            )}
            <h3 className="text-xl font-display font-bold mb-8 text-cream-100 flex items-center gap-2">
              <div className="w-2 h-6 bg-orange-400 rounded-full" />
              Tren Pendapatan {days} Hari
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 10, bottom: 5, left: 10 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbd38d" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#fbd38d" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#fbd38d" 
                    strokeWidth={4} 
                    dot={days <= 31 ? { r: 6, fill: '#1a1412', strokeWidth: 2, stroke: '#fbd38d' } : false} 
                    activeDot={{ r: 8, fill: '#f6ad55', stroke: '#fff', strokeWidth: 2 }} 
                    animationDuration={1000}
                  />
                  <CartesianGrid stroke="#3d2b24" strokeDasharray="5 5" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#8b7366" 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10} 
                    fontSize={10} 
                    fontWeight={500}
                    interval={days > 30 ? 6 : days > 7 ? 2 : 0}
                  />
                  <YAxis 
                    stroke="#8b7366" 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => value === 0 ? '0' : `${value / 1000}k`} 
                    fontSize={12} 
                    fontWeight={500}
                    dx={-10}
                  />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(45, 30, 24, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#5e4336', borderRadius: '16px', color: '#f7fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#fbd38d', fontWeight: 'bold' }}
                    labelStyle={{ color: '#b9a397', marginBottom: '8px' }}
                    formatter={(value) => [formatCurrency(Number(value) || 0), 'Pendapatan']}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Items Bar Chart */}
          <div className="lg:col-span-2 bg-coffee-900/40 backdrop-blur-xl border border-coffee-800/60 p-8 rounded-[2rem] shadow-2xl relative">
            {loading && (
              <div className="absolute inset-0 bg-coffee-900/20 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[2rem]">
                <Loader2 className="animate-spin text-blue-400" size={32} />
              </div>
            )}
            <h3 className="text-xl font-display font-bold mb-8 text-cream-100 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-400 rounded-full" />
              Top 5 Menu Terlaris
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                  <CartesianGrid stroke="#3d2b24" strokeDasharray="5 5" horizontal={false} />
                  <XAxis type="number" stroke="#8b7366" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#d4c4b7" tickLine={false} axisLine={false} width={120} fontSize={13} fontWeight={600} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(94, 67, 54, 0.2)' }}
                    contentStyle={{ backgroundColor: 'rgba(45, 30, 24, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#5e4336', borderRadius: '16px', color: '#f7fafc', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)' }}
                    itemStyle={{ color: '#f6ad55', fontWeight: 'bold' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value, name, props) => [ `${Number(value) || 0} porsi`, (props as { payload: { name: string } }).payload.name ]}
                  />
                  <Bar dataKey="value" fill="#ed8936" radius={[0, 8, 8, 0]} barSize={32} animationDuration={1000}>
                    {topItems.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#ed8936', '#f6ad55', '#fbd38d', '#f6e05e', '#faf089'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
