import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminPlantsService } from '../services/plants';
import type { Plant } from '../services/plants';
import { Flower2, Plus, Edit, Trash2, Search, Loader2, Check, X } from 'lucide-react';

const plantTypeLabels: Record<string, string> = {
  TREE: 'شجرة',
  SHRUB: 'شجيرة',
  HERB: 'عشبة',
  CROP: 'محصول',
  WILDFLOWER: 'زهرة برية',
};

export function PlantsListPage() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadPlants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminPlantsService.list({ search, type: typeFilter || undefined });
      setPlants(Array.isArray(res) ? res : res.data || []);
    } catch {
      showToast('فشل تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, showToast]);

  useEffect(() => { loadPlants(); }, [loadPlants]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${name}"؟`)) return;
    try {
      await adminPlantsService.delete(id);
      showToast(`تم حذف "${name}" بنجاح`);
      loadPlants();
    } catch {
      showToast('فشل الحذف', 'error');
    }
  };

  const handleVerify = async (id: string, current: boolean) => {
    try {
      await adminPlantsService.verify(id);
      showToast(current ? 'تم إلغاء التحقق' : 'تم التحقق من النبتة');
      loadPlants();
    } catch {
      showToast('فشل التحديث', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl font-bold shadow-xl text-white transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Flower2 className="w-8 h-8 text-pink-500" />
            مكتبة النباتات
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">إدارة النباتات الرحيقية المستخدمة في تحليل المرعى</p>
        </div>
        <button
          onClick={() => navigate('/plants/new')}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          إضافة نبات جديد
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="بحث بالاسم العربي أو العلمي..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm"
        >
          <option value="">جميع الأنواع</option>
          <option value="TREE">أشجار</option>
          <option value="SHRUB">شجيرات</option>
          <option value="HERB">أعشاب</option>
          <option value="CROP">محاصيل</option>
          <option value="WILDFLOWER">أزهار برية</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : plants.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <Flower2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-bold mb-2">لا توجد نباتات مسجلة</h3>
          <p className="text-muted-foreground text-sm">ابدأ بإضافة النباتات الرحيقية لبناء المكتبة</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-right p-4 font-bold">الاسم العربي</th>
                <th className="text-right p-4 font-bold">الاسم العلمي</th>
                <th className="text-right p-4 font-bold">النوع</th>
                <th className="text-right p-4 font-bold">العائلة</th>
                <th className="text-center p-4 font-bold">تحقق</th>
                <th className="text-center p-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {plants.map(plant => (
                <tr
                  key={plant.id}
                  className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => navigate(`/plants/${plant.id}`)}
                >
                  <td className="p-4 font-bold">{plant.commonNameAr}</td>
                  <td className="p-4 text-muted-foreground italic">{plant.scientificName}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-white/10 text-xs font-bold rounded-full">
                      {plantTypeLabels[plant.plantType] || plant.plantType}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">{plant.family || '-'}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={e => { e.stopPropagation(); handleVerify(plant.id, plant.verified); }}
                      className={`p-1.5 rounded-lg transition-colors ${plant.verified ? 'text-emerald-500 bg-emerald-500/10' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {plant.verified ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/plants/${plant.id}/edit`)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(plant.id, plant.commonNameAr)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
