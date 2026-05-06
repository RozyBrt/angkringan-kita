'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import AdminLogin from '@/components/AdminLogin';
import { 
  Plus, Pencil, Trash2, X, Save, Tag, Calendar, 
  ToggleLeft, ToggleRight, Loader2, AlertCircle, User
} from 'lucide-react';
import { createPromotion, updatePromotion, deletePromotion } from '@/lib/actions/promotions';

interface Promotion {
  id: string;
  code: string;
  description: string;
  discount_type: 'fixed' | 'percentage';
  value: number;
  min_order_amount: number;
  is_active: boolean;
  valid_until: string | null;
  usage_limit: number | null;
  usage_count: number;
}

export default function AdminPromotions() {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCode, setFormCode] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formType, setFormType] = useState<'fixed' | 'percentage'>('percentage');
  const [formValue, setFormValue] = useState('');
  const [formMinOrder, setFormMinOrder] = useState('0');
  const [formUntil, setFormUntil] = useState('');
  const [formUsageLimit, setFormUsageLimit] = useState('');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  useEffect(() => {
    checkSession();

    // Pasang "Kuping" Realtime bray! 👂
    const channel = supabase
      .channel('promotions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'promotions' },
        () => {
          console.log('Ada perubahan promo, narik data baru...');
          fetchPromos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setSessionLoading(false);
    if (data.session) fetchPromos();
  }

  async function fetchPromos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setPromos(data);
    setLoading(false);
  }

  function resetForm() {
    setFormCode('');
    setFormDesc('');
    setFormType('percentage');
    setFormValue('');
    setFormMinOrder('0');
    setFormUntil('');
    setFormUsageLimit('');
    setEditingId(null);
    setShowForm(false);
  }

  function openEdit(promo: Promotion) {
    setEditingId(promo.id);
    setFormCode(promo.code);
    setFormDesc(promo.description || '');
    setFormType(promo.discount_type);
    setFormValue(String(promo.value));
    setFormMinOrder(String(promo.min_order_amount));
    setFormUntil(promo.valid_until ? promo.valid_until.split('T')[0] : '');
    setFormUsageLimit(promo.usage_limit ? String(promo.usage_limit) : '');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formCode || !formValue) return;

    setFormSubmitLoading(true);
    const payload = {
      code: formCode.toUpperCase().trim(),
      description: formDesc.trim(),
      discount_type: formType,
      value: Number(formValue),
      min_order_amount: Number(formMinOrder),
      valid_until: formUntil ? new Date(formUntil).toISOString() : null,
      usage_limit: formUsageLimit ? Number(formUsageLimit) : null,
      is_active: true,
    };

    const res = editingId 
      ? await updatePromotion(editingId, payload)
      : await createPromotion(payload);

    if (res.success) {
      fetchPromos();
      resetForm();
    } else {
      alert(res.error || 'Gagal simpan promo bray');
    }
    setFormSubmitLoading(false);
  }

  async function toggleStatus(promo: Promotion) {
    const res = await updatePromotion(promo.id, { is_active: !promo.is_active });
    if (res.success) {
      setPromos(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin mau hapus promo ini bray?')) return;
    const res = await deletePromotion(id);
    if (res.success) {
      setPromos(prev => prev.filter(p => p.id !== id));
    }
  }

  if (sessionLoading) return <div className="py-20 text-center"><Loader2 className="animate-spin inline text-coffee-600" /></div>;
  if (!session) return <AdminLogin onLoginSuccess={checkSession} />;

  return (
    <div className="py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-100 flex items-center gap-2">
            <Tag size={24} className="text-warm-500" />
            Kelola Promo
          </h1>
          <p className="text-coffee-400 text-sm mt-0.5">{promos.length} kode promo aktif</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-warm-500 text-white 
                     font-semibold text-sm hover:bg-warm-600 transition-all active:scale-95 shadow-lg shadow-warm-900/20"
        >
          <Plus size={16} />
          Tambah Promo
        </button>
      </div>

      {/* Grid Promo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promos.map((promo) => (
          <div 
            key={promo.id} 
            className={`bg-coffee-900 border ${promo.is_active ? 'border-coffee-700 shadow-xl' : 'border-coffee-800 opacity-60'} 
                        rounded-2xl p-5 transition-all hover:border-coffee-600 group`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="bg-coffee-800 px-3 py-1 rounded-lg border border-coffee-700">
                <span className="text-warm-400 font-mono font-bold tracking-widest text-lg">{promo.code}</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openEdit(promo)}
                  className="p-2 text-coffee-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all"
                >
                  <Pencil size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(promo.id)}
                  className="p-2 text-coffee-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-cream-100 font-medium mb-1">{promo.description || 'Tanpa deskripsi'}</p>
            
            <div className="flex items-center gap-2 text-coffee-400 text-xs mb-4">
              <div className="flex items-center gap-1">
                <Tag size={12} />
                {promo.discount_type === 'percentage' ? `${promo.value}%` : `Rp ${promo.value.toLocaleString()}`}
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar size={12} />
                {promo.valid_until ? new Date(promo.valid_until).toLocaleDateString() : 'Selamanya'}
              </div>
              {promo.usage_limit && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-blue-400">
                    <User size={12} />
                    Limit: {promo.usage_limit}x
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-coffee-800">
              <div className="text-[10px] text-coffee-500 uppercase tracking-tighter">
                Digunakan: <span className="text-cream-100 font-bold">{promo.usage_count}x</span>
              </div>
              <button 
                onClick={() => toggleStatus(promo)}
                className={`flex items-center gap-1.5 text-xs font-bold transition-all ${promo.is_active ? 'text-green-500' : 'text-coffee-500'}`}
              >
                {promo.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                {promo.is_active ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-coffee-900 border border-coffee-700 rounded-3xl w-full max-w-md p-6 shadow-2xl animate-slide-up"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-cream-100">
                {editingId ? 'Edit Promo' : 'Buat Promo Baru'}
              </h2>
              <button type="button" onClick={resetForm} className="text-coffee-400 hover:text-cream-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-1.5">Kode Promo *</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="CONTOH: HEMAT10"
                  className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700 text-cream-100 placeholder-coffee-600 focus:ring-2 focus:ring-warm-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-1.5">Deskripsi</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Diskon spesial buat kamu..."
                  className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700 text-cream-100 placeholder-coffee-600 focus:ring-2 focus:ring-warm-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-1.5">Tipe Diskon</label>
                  <select 
                    value={formType}
                    onChange={(e: any) => setFormType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700 text-cream-100 focus:ring-2 focus:ring-warm-500 outline-none"
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Potongan (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-1.5">Nilai Diskon *</label>
                  <input
                    type="number"
                    required
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={formType === 'percentage' ? '10' : '5000'}
                    className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700 text-cream-100 placeholder-coffee-600 focus:ring-2 focus:ring-warm-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-1.5">Min. Order (Rp)</label>
                <input
                  type="number"
                  value={formMinOrder}
                  onChange={(e) => setFormMinOrder(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700 text-cream-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-1.5">Berlaku Sampai</label>
                  <input
                    type="date"
                    value={formUntil}
                    onChange={(e) => setFormUntil(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700 text-cream-100 outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-coffee-400 uppercase tracking-widest mb-1.5">Kuota (Berapa Kali)</label>
                  <input
                    type="number"
                    value={formUsageLimit}
                    onChange={(e) => setFormUsageLimit(e.target.value)}
                    placeholder="Contoh: 100"
                    className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700 text-cream-100 placeholder-coffee-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-3.5 rounded-2xl border border-coffee-700 text-coffee-300 font-bold hover:bg-coffee-800 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={formSubmitLoading}
                className="flex-1 py-3.5 rounded-2xl bg-warm-500 text-white font-bold hover:bg-warm-600 transition-all flex items-center justify-center gap-2"
              >
                {formSubmitLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                Simpan Promo
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && promos.length === 0 && (
        <div className="py-20 text-center text-coffee-500">Memuat data promo...</div>
      )}
      
      {!loading && promos.length === 0 && (
        <div className="py-20 text-center bg-coffee-900/50 rounded-3xl border border-dashed border-coffee-800">
          <div className="w-16 h-16 bg-coffee-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Tag size={32} className="text-coffee-600" />
          </div>
          <p className="text-coffee-400">Belum ada kode promo nih bray.</p>
          <button onClick={() => setShowForm(true)} className="text-warm-500 font-bold mt-2 hover:underline">
            Buat promo pertama kamu
          </button>
        </div>
      )}
    </div>
  );
}
