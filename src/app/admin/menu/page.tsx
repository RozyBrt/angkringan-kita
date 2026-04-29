'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem, Category } from '@/types';
import { formatPrice } from '@/lib/cart';
import AdminLogin from '@/components/AdminLogin';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Coffee,
  UtensilsCrossed,
  ImageOff,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { createMenuItem, updateMenuItem, deleteMenuItem, toggleMenuItemAvailability } from '@/lib/actions/menu';

const CATEGORY_OPTIONS: Category[] = ['Minuman', 'Cemilan', 'Makanan'];

export default function AdminMenuPage() {
  const [session, setSession] = useState<unknown>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<Category>('Minuman');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchMenu = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category')
      .order('name');
    if (!error && data) setMenuItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session) fetchMenu();
  }, [session, fetchMenu]);

  function resetForm() {
    setFormName('');
    setFormCategory('Minuman');
    setFormDescription('');
    setFormPrice('');
    setFormImageUrl('');
    setFormAvailable(true);
    setFormError(null);
    setEditingItem(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(item: MenuItem) {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description || '');
    setFormPrice(String(item.price));
    setFormImageUrl(item.image_url || '');
    setFormAvailable(item.is_available);
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  async function handleSave() {
    if (!formName.trim() || !formPrice) {
      setFormError('Nama dan harga wajib diisi.');
      return;
    }

    setSaving(true);
    setFormError(null);

    const payload = {
      name: formName.trim(),
      category: formCategory,
      description: formDescription.trim() || null,
      price: parseInt(formPrice, 10),
      image_url: formImageUrl.trim() || null,
      is_available: formAvailable,
    };

    if (editingItem) {
      // Update pake Server Action bray
      const res = await updateMenuItem(editingItem.id, payload as any);
      if (!res.success) {
        setFormError(res.error || 'Gagal update menu');
        setSaving(false);
        return;
      }
    } else {
      // Insert pake Server Action bray
      const res = await createMenuItem(payload as any);
      if (!res.success) {
        setFormError(res.error || 'Gagal tambah menu');
        setSaving(false);
        return;
      }
    }

    await fetchMenu();
    closeForm();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin mau hapus menu ini bray?')) return;
    setDeleting(id);
    const res = await deleteMenuItem(id);
    if (!res.success) {
      alert('Gagal hapus bray: ' + res.error);
    } else {
      await fetchMenu();
    }
    setDeleting(null);
  }

  async function toggleAvailability(item: MenuItem) {
    const res = await toggleMenuItemAvailability(item.id, item.is_available);
    if (res.success) {
      setMenuItems((prev) =>
        prev.map((m) =>
          m.id === item.id ? { ...m, is_available: !m.is_available } : m
        )
      );
    } else {
      alert('Gagal ubah status ketersediaan bray');
    }
  }

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="w-8 h-8 border-2 border-coffee-600 border-t-coffee-300 rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLoginSuccess={() => fetchMenu()} />;
  }

  return (
    <div className="py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-cream-100">Kelola Menu</h1>
          <p className="text-coffee-400 text-sm mt-0.5">
            {menuItems.length} item menu
          </p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 text-white 
                     font-semibold text-sm hover:bg-green-500 transition-all active:scale-95"
        >
          <Plus size={16} />
          Tambah Menu
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-coffee-900 border border-coffee-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-xl font-bold text-cream-100">
                {editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h2>
              <button onClick={closeForm} className="text-coffee-400 hover:text-cream-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-300 mb-1">Nama *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Kopi Susu Gula Aren"
                  className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700
                             text-cream-100 placeholder-coffee-500 focus:outline-none 
                             focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-300 mb-1">Kategori *</label>
                <div className="flex gap-2">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormCategory(cat)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        formCategory === cat
                          ? 'bg-coffee-500 text-white'
                          : 'bg-coffee-800 text-coffee-400 hover:bg-coffee-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-300 mb-1">Deskripsi</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Deskripsi singkat menu..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700
                             text-cream-100 placeholder-coffee-500 focus:outline-none 
                             focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-300 mb-1">Harga (Rp) *</label>
                <input
                  type="number"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="Contoh: 12000"
                  min="0"
                  className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700
                             text-cream-100 placeholder-coffee-500 focus:outline-none 
                             focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-coffee-300 mb-1">URL Gambar</label>
                <input
                  type="url"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-3 rounded-xl bg-coffee-800 border border-coffee-700
                             text-cream-100 placeholder-coffee-500 focus:outline-none 
                             focus:ring-2 focus:ring-coffee-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-coffee-300">Tersedia?</span>
                <button
                  type="button"
                  onClick={() => setFormAvailable(!formAvailable)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    formAvailable
                      ? 'bg-green-900/40 text-green-400 border border-green-800/50'
                      : 'bg-red-900/40 text-red-400 border border-red-800/50'
                  }`}
                >
                  {formAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                  {formAvailable ? 'Ya' : 'Habis'}
                </button>
              </div>

              {formError && (
                <div className="bg-red-900/40 border border-red-800/60 text-red-300 rounded-xl px-4 py-3 text-sm">
                  {formError}
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 px-5 bg-coffee-500 
                           hover:bg-coffee-400 text-white font-semibold rounded-xl transition-all 
                           active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={16} />
                    {editingItem ? 'Simpan Perubahan' : 'Tambah Menu'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Menu List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : menuItems.length === 0 ? (
        <div className="text-center py-16 text-coffee-500">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="font-semibold">Belum ada menu</p>
          <p className="text-sm mt-1 text-coffee-600">Klik &quot;Tambah Menu&quot; untuk memulai.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map((cat) => {
            const items = menuItems.filter((m) => m.category === cat);
            if (items.length === 0) return null;
            return (
              <div key={cat} className="mb-4">
                <h3 className="text-coffee-400 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  {cat === 'Minuman' ? <Coffee size={12} /> : <UtensilsCrossed size={12} />}
                  {cat} ({items.length})
                </h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        item.is_available
                          ? 'bg-coffee-800 border-coffee-700'
                          : 'bg-coffee-900/60 border-coffee-800 opacity-60'
                      }`}
                    >
                      {/* Image */}
                      <div className="w-12 h-12 rounded-lg bg-coffee-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.image_url ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageOff size={16} className="text-coffee-500" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-cream-100 text-sm truncate">{item.name}</p>
                          {!item.is_available && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-900/50 text-red-400 rounded-full">Habis</span>
                          )}
                        </div>
                        <p className="text-coffee-400 text-xs">{formatPrice(item.price)}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => toggleAvailability(item)}
                          className={`p-2 rounded-lg transition-colors ${
                            item.is_available
                              ? 'text-green-400 hover:bg-green-900/30'
                              : 'text-red-400 hover:bg-red-900/30'
                          }`}
                          title={item.is_available ? 'Tandai Habis' : 'Tandai Tersedia'}
                        >
                          {item.is_available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button
                          onClick={() => openEditForm(item)}
                          className="p-2 rounded-lg text-coffee-400 hover:text-cream-100 hover:bg-coffee-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleting === item.id}
                          className="p-2 rounded-lg text-coffee-400 hover:text-red-400 hover:bg-red-900/30 transition-colors
                                     disabled:opacity-50"
                          title="Hapus"
                        >
                          {deleting === item.id ? (
                            <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin block" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
