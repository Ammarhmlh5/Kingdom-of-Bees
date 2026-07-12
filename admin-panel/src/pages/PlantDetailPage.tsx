import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminPlantsService } from '../services/plants';
import type { Plant } from '../services/plants';
import { Flower2, Edit, Trash2, ArrowRight, Loader2, Check, X, Globe, Image, BookOpen } from 'lucide-react';

const plantTypeLabels: Record<string, string> = {
  TREE: 'شجرة',
  SHRUB: 'شجيرة',
  HERB: 'عشبة',
  CROP: 'محصول',
  WILDFLOWER: 'زهرة برية',
};

const nectarLabels: Record<string, string> = {
  HIGH: 'عالي',
  MEDIUM: 'متوسط',
  LOW: 'منخفض',
  NONE: 'لا يوجد',
};

export function PlantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await adminPlantsService.get(id);
        setPlant(res.data || res);
      } catch {
        showToast('فشل تحميل بيانات النبتة', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, showToast]);

  const handleDelete = async () => {
    if (!plant) return;
    if (!confirm(`هل أنت متأكد من حذف "${plant.commonNameAr}"؟`)) return;
    try {
      await adminPlantsService.delete(plant.id);
      showToast('تم الحذف بنجاح');
      navigate('/plants');
    } catch {
      showToast('فشل الحذف', 'error');
    }
  };

  const handleVerify = async () => {
    if (!plant) return;
    try {
      await adminPlantsService.verify(plant.id);
      setPlant(prev => prev ? { ...prev, verified: !prev.verified } : null);
      showToast(plant.verified ? 'تم إلغاء التحقق' : 'تم التحقق من النبتة');
    } catch {
      showToast('فشل التحديث', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plant) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>النبتة غير موجودة</p>
        <button onClick={() => navigate('/plants')} className="mt-4 text-primary hover:underline">العودة للقائمة</button>
      </div>
    );
  }
  const bv = (plant.beekeepingValue || {}) as { nectar?: { production: string; rating: number }; pollen?: { production: string; rating: number }; attraction: string };

  const fl = (plant.flowering || {}) as { startMonth?: number; endMonth?: number; peakMonth?: number; flowerColor?: string; durationWeeks?: number };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl font-bold shadow-xl text-white transition-all ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          {toast.text}
        </div>
      )}

      <button onClick={() => navigate('/plants')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowRight className="w-4 h-4" />
        العودة إلى مكتبة النباتات
      </button>

      {/* Header */}
      <div className="glass-panel rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-pink-500/20 flex items-center justify-center">
              <Flower2 className="w-7 h-7 text-pink-500" />
            </div>
            <div>
              <h1 className="text-2xl font-black">{plant.commonNameAr}</h1>
              <p className="text-muted-foreground italic">{plant.scientificName}</p>
            </div>
            {plant.verified ? (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                موثق
              </span>
            ) : (
              <span className="px-3 py-1 bg-orange-500/20 text-orange-500 text-xs font-bold rounded-full flex items-center gap-1">
                <X className="w-3 h-3" />
                غير موثق
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`/plants/${plant.id}/edit`)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl transition-all text-sm">
              <Edit className="w-4 h-4" />
              تعديل
            </button>
            <button onClick={handleVerify} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${plant.verified ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}>
              {plant.verified ? 'إلغاء التوثيق' : 'توثيق النبتة'}
            </button>
            <button onClick={handleDelete} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">المعلومات الأساسية</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">النوع</span>
              <span className="font-bold">{plantTypeLabels[plant.plantType] || plant.plantType}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">العائلة</span>
              <span className="font-bold">{plant.family || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">الاسم الإنجليزي</span>
              <span className="font-bold">{plant.commonNameEn || '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">الأسماء المحلية</span>
              <span className="font-bold">{plant.localNames?.length ? plant.localNames.join('، ') : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">المرادفات</span>
              <span className="font-bold">{plant.synonyms?.length ? plant.synonyms.join('، ') : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">الارتفاع</span>
              <span className="font-bold">{plant.heightMinMeters || plant.heightMaxMeters ? `${plant.heightMinMeters || '?'} - ${plant.heightMaxMeters || '?'} م` : '-'}</span>
            </div>
          </div>
        </div>

        {/* Beekeeping Value */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">قيمة النحالة</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">الرحيق</span>
              <span className="font-bold">{bv.nectar?.production ? nectarLabels[bv.nectar.production] : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">تقييم الرحيق</span>
              <span className="font-bold">{bv.nectar?.rating ? `${bv.nectar.rating}/5` : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">حبوب اللقاح</span>
              <span className="font-bold">{bv.pollen?.production ? nectarLabels[bv.pollen.production] : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">جذب النحل</span>
              <span className="font-bold">{nectarLabels[bv.attraction] || '-'}</span>
            </div>
          </div>
        </div>

        {/* Flowering */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">موسم الإزهار</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">شهر البداية</span>
              <span className="font-bold">{fl.startMonth ? `الشهر ${fl.startMonth}` : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">شهر النهاية</span>
              <span className="font-bold">{fl.endMonth ? `الشهر ${fl.endMonth}` : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">شهر الذروة</span>
              <span className="font-bold">{fl.peakMonth ? `الشهر ${fl.peakMonth}` : '-'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-white/5">
              <span className="text-muted-foreground">لون الزهر</span>
              <span className="font-bold">{fl.flowerColor || '-'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">المدة</span>
              <span className="font-bold">{fl.durationWeeks ? `${fl.durationWeeks} أسبوع` : '-'}</span>
            </div>
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            التوزيع الجغرافي
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-muted-foreground text-sm">المناطق الأصلية</span>
              <p className="font-bold mt-1">{plant.nativeRegions?.length ? plant.nativeRegions.join('، ') : '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground text-sm">المناطق المزروعة</span>
              <p className="font-bold mt-1">{plant.cultivatedRegions?.length ? plant.cultivatedRegions.join('، ') : '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {(plant.descriptionAr || plant.descriptionEn) && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            الوصف
          </h2>
          {plant.descriptionAr && <p className="leading-relaxed">{plant.descriptionAr}</p>}
          {plant.descriptionEn && <p className="leading-relaxed text-muted-foreground mt-2 text-sm italic">{plant.descriptionEn}</p>}
        </div>
      )}

      {/* Images */}
      {plant.images && plant.images.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            الصور
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {plant.images.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-xl overflow-hidden bg-white/5 hover:ring-2 ring-primary/50 transition-all">
                <img src={url} alt={`${plant.commonNameAr} - ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Videos */}
      {plant.videos && plant.videos.length > 0 && (
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="font-bold text-lg mb-4">الفيديو</h2>
          <div className="space-y-2">
            {plant.videos.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block text-primary hover:underline text-sm">{url}</a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
