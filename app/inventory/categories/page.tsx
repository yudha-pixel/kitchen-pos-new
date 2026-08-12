'use client';

import { useState, useEffect } from 'react';
import { Plus, Sliders, Tags, X } from 'lucide-react';

import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { useToast } from '@/src/components/ui/Toast';
import { Modal } from '@/src/components/ui/Modal';
import { ConfirmDialog } from '@/src/components/ui/ConfirmDialog';
import { Button } from '@/src/components/ui/Button';
import { getToken } from '@/src/lib/api';
import { API_BASE_URL } from '@/src/config/runtime';

interface IngredientCategory {
  id: string;
  name: string;
  color?: string | null;
}

export default function InventoryCategoriesPage() {
  const { toast } = useToast();
  const [ingredientCategories, setIngredientCategories] = useState<IngredientCategory[]>([]);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IngredientCategory | null>(null);
  const [categoryFormName, setCategoryFormName] = useState('');
  const [categoryFormColor, setCategoryFormColor] = useState('#8b5cf6');
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryFormError, setCategoryFormError] = useState('');
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<{ id: string; name: string } | null>(null);
  const [categoryDeleting, setCategoryDeleting] = useState(false);

  const loadIngredientCategories = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/ingredients/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error(`Failed to load ingredient categories: ${res.status}`);
      setIngredientCategories(await res.json());
    } catch (error) {
      console.error('Failed to load ingredient categories:', error);
    }
  };

  useEffect(() => {
    loadIngredientCategories();
  }, []);

  const openAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormName('');
    setCategoryFormColor('#8b5cf6');
    setCategoryFormError('');
    setCategoryFormOpen(true);
  };

  const openEditCategory = (cat: IngredientCategory) => {
    setEditingCategory(cat);
    setCategoryFormName(cat.name);
    setCategoryFormColor(cat.color || '#8b5cf6');
    setCategoryFormError('');
    setCategoryFormOpen(true);
  };

  const closeCategoryForm = () => {
    if (categorySaving) return;
    setCategoryFormOpen(false);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormName.trim()) {
      setCategoryFormError('Nama kategori wajib diisi');
      return;
    }
    setCategorySaving(true);
    setCategoryFormError('');
    try {
      const token = getToken();
      const url = editingCategory
        ? `${API_BASE_URL}/api/ingredients/categories/${editingCategory.id}`
        : `${API_BASE_URL}/api/ingredients/categories`;
      const res = await fetch(url, {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ name: categoryFormName.trim(), color: categoryFormColor }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Gagal menyimpan kategori');
      }
      toast('success', editingCategory ? 'Kategori berhasil diperbarui' : 'Kategori berhasil ditambahkan');
      setCategoryFormOpen(false);
      await loadIngredientCategories();
    } catch (error) {
      setCategoryFormError(error instanceof Error ? error.message : 'Gagal menyimpan kategori');
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteCategoryTarget) return;
    setCategoryDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/api/ingredients/categories/${deleteCategoryTarget.id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Gagal menghapus kategori');
      }
      toast('success', 'Kategori dihapus');
      setDeleteCategoryTarget(null);
      await loadIngredientCategories();
    } catch (error) {
      toast('error', error instanceof Error ? error.message : 'Gagal menghapus kategori');
    } finally {
      setCategoryDeleting(false);
    }
  };

  return (
    <ResponsiveShell title="Kategori Bahan Baku">
      <main className="flex-1 flex flex-col overflow-hidden bg-surface-alt">
        <div className="border-b border-line bg-surface px-6 py-4 shrink-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Tags className="h-5 w-5 text-ink-secondary" aria-hidden="true" />
              <h1 className="text-lg font-semibold text-ink">Kategori Bahan Baku</h1>
            </div>
            <p className="mt-1 text-sm text-ink-secondary">
              Kelompokkan bahan baku (mis. Protein, Dairy, Produce) — terpisah dari kategori menu produk.
            </p>
          </div>
          <Button onClick={openAddCategory}>
            <Plus className="h-4 w-4" />
            Tambah Kategori
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {ingredientCategories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line-strong bg-surface p-8 text-center">
              <Tags className="mx-auto h-8 w-8 text-ink-muted" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold text-ink">Belum ada kategori</h3>
              <p className="mt-1 text-xs text-ink-secondary">
                Klik &quot;Tambah Kategori&quot; untuk mulai mengelompokkan bahan baku.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ingredientCategories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border border-line bg-surface p-4 shadow-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="h-8 w-8 shrink-0 rounded-lg"
                      style={{ backgroundColor: cat.color || '#8b5cf6' }}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-ink truncate">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditCategory(cat)}
                      aria-label={`Edit ${cat.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-alt hover:text-ink"
                    >
                      <Sliders className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteCategoryTarget(cat)}
                      aria-label={`Hapus ${cat.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-danger-soft"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Modal
        isOpen={categoryFormOpen}
        onClose={closeCategoryForm}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        footer={
          <>
            <Button variant="secondary" onClick={closeCategoryForm} disabled={categorySaving} className="flex-1">
              Batal
            </Button>
            <Button onClick={handleSaveCategory} loading={categorySaving} className="flex-1">
              Simpan
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Nama Kategori *</label>
            <input
              type="text"
              value={categoryFormName}
              onChange={(e) => setCategoryFormName(e.target.value)}
              className="w-full min-h-11 rounded-lg border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              placeholder="mis. Protein"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">Warna</label>
            <input
              type="color"
              value={categoryFormColor}
              onChange={(e) => setCategoryFormColor(e.target.value)}
              className="h-11 w-20 rounded-lg border border-line-strong bg-surface"
            />
          </div>
          {categoryFormError && (
            <p role="alert" className="text-sm font-medium text-danger">{categoryFormError}</p>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCategoryTarget}
        title="Hapus Kategori"
        message={deleteCategoryTarget ? `Hapus kategori "${deleteCategoryTarget.name}"? Bahan baku yang menggunakan kategori ini akan menjadi tanpa kategori.` : ''}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        danger
        loading={categoryDeleting}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCategoryTarget(null)}
      />
    </ResponsiveShell>
  );
}
