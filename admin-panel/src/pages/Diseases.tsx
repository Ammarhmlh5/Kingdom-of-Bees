import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithAuth } from '../config';
import { ShieldAlert, Plus, Edit, Trash2, ChevronDown, ChevronUp, Beaker, Pill, AlertTriangle, Activity, X } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface Treatment {
    id: string;
    nameAr: string;
    nameEn: string;
    description?: string;
    type?: string;
    applicationMethod?: string;
    durationDays?: number;
    withdrawalPeriod?: number;
}

interface Disease {
    id: string;
    nameAr: string;
    nameEn: string;
    scientificName?: string;
    diseaseType?: string;
    severity?: string;
    contagiousness?: string;
    treatments?: Treatment[];
}

// ─── Toast (simple) ──────────────────────────────────────────────────────────
function useToast() {
    const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const show = useCallback((text: string, type: 'success' | 'error' = 'success') => {
        setMsg({ text, type });
        setTimeout(() => setMsg(null), 3000);
    }, []);
    return { msg, show };
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Diseases() {
    const [diseases, setDiseases] = useState<Disease[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [isDiseaseModalOpen, setIsDiseaseModalOpen] = useState(false);
    const [editingDisease, setEditingDisease] = useState<Disease | null>(null);
    const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
    const [editingTreatment, setEditingTreatment] = useState<Treatment | null>(null);
    const [selectedDiseaseId, setSelectedDiseaseId] = useState<string | null>(null);
    const { msg, show } = useToast();

    const loadDiseases = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetchWithAuth('/admin/diseases');
            const data = await res.json();
            setDiseases(Array.isArray(data) ? data : data.data || []);
        } catch {
            show('فشل تحميل البيانات', 'error');
        } finally {
            setLoading(false);
        }
    }, [show]);

    useEffect(() => { loadDiseases(); }, [loadDiseases]);

    const handleDeleteDisease = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المرض؟ سيتم حذف كافة العلاجات المرتبطة به.')) return;
        await fetchWithAuth(`/admin/diseases/${id}`, { method: 'DELETE' });
        show('تم الحذف بنجاح');
        loadDiseases();
    };

    const handleDeleteTreatment = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا العلاج؟')) return;
        await fetchWithAuth(`/admin/treatments/${id}`, { method: 'DELETE' });
        show('تم حذف العلاج بنجاح');
        loadDiseases();
    };

    const severityColor = (s?: string) => s === 'SEVERE' || s === 'CATASTROPHIC' ? 'bg-red-500' : s === 'MODERATE' ? 'bg-orange-500' : 'bg-green-500';

    return (
        <div className="space-y-6 p-6" dir="rtl">
            {/* Toast */}
            {msg && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl font-bold shadow-xl text-white transition-all ${msg.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
                    {msg.text}
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-3">
                        <ShieldAlert className="w-8 h-8 text-primary" />
                        إدارة مكتبة الأمراض والعلاجات
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">إضافة وتعديل الأمراض والبروتوكولات العلاجية المعتمدة في النظام</p>
                </div>
                <button
                    onClick={() => { setEditingDisease(null); setIsDiseaseModalOpen(true); }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    إضافة مرض جديد
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                </div>
            ) : diseases.length === 0 ? (
                <div className="glass-panel rounded-2xl p-12 text-center">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-bold mb-2">لا توجد أمراض مسجلة</h3>
                    <p className="text-muted-foreground text-sm">ابدأ بإضافة الأمراض والآفات لبناء المكتبة</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {diseases.map(disease => (
                        <div key={disease.id} className="glass-panel rounded-2xl overflow-hidden">
                            {/* Disease Row */}
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => setExpandedId(expandedId === disease.id ? null : disease.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${severityColor(disease.severity)}`}>
                                        <Activity className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{disease.nameAr}</h3>
                                        <p className="text-xs text-muted-foreground">{disease.scientificName || disease.nameEn}</p>
                                    </div>
                                    <div className="hidden md:flex gap-2 mr-2">
                                        {disease.diseaseType && <span className="px-2 py-0.5 bg-white/10 text-xs font-bold rounded-full">{disease.diseaseType}</span>}
                                        {disease.contagiousness && <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">عدوى: {disease.contagiousness}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={e => { e.stopPropagation(); setEditingDisease(disease); setIsDiseaseModalOpen(true); }} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={e => { e.stopPropagation(); handleDeleteDisease(disease.id); }} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <div className="w-px h-5 bg-white/10 mx-1" />
                                    {expandedId === disease.id ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                                </div>
                            </div>

                            {/* Treatments */}
                            {expandedId === disease.id && (
                                <div className="border-t border-white/10 p-5 bg-black/10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold flex items-center gap-2 text-sm">
                                            <Beaker className="w-4 h-4 text-primary" />
                                            البروتوكولات العلاجية المعتمدة
                                        </h4>
                                        <button
                                            onClick={() => { setSelectedDiseaseId(disease.id); setEditingTreatment(null); setIsTreatmentModalOpen(true); }}
                                            className="text-xs bg-white/10 hover:bg-white/20 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            إضافة بروتوكول
                                        </button>
                                    </div>
                                    {!disease.treatments || disease.treatments.length === 0 ? (
                                        <div className="text-center py-6 border border-dashed border-white/20 rounded-xl">
                                            <Pill className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">لم يتم إضافة أي بروتوكول علاجي</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {disease.treatments.map(t => (
                                                <div key={t.id} className="glass-card p-4 rounded-xl border border-white/10">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h5 className="font-bold text-sm">{t.nameAr}</h5>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => { setSelectedDiseaseId(disease.id); setEditingTreatment(t); setIsTreatmentModalOpen(true); }} className="p-1.5 text-muted-foreground hover:text-primary rounded transition-colors">
                                                                <Edit className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => handleDeleteTreatment(t.id)} className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {t.description && <p className="text-xs text-muted-foreground mb-2">{t.description}</p>}
                                                    <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                                                        {t.applicationMethod && <span className="px-2 py-0.5 bg-white/10 rounded">طريقة: {t.applicationMethod}</span>}
                                                        {t.durationDays && <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">المدة: {t.durationDays} يوم</span>}
                                                        {t.withdrawalPeriod != null && t.withdrawalPeriod > 0 && (
                                                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded flex items-center gap-1">
                                                                <AlertTriangle className="w-3 h-3" />
                                                                تحريم: {t.withdrawalPeriod} يوم
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Disease Modal */}
            {isDiseaseModalOpen && (
                <DiseaseModal
                    disease={editingDisease}
                    onClose={() => setIsDiseaseModalOpen(false)}
                    onSaved={() => { setIsDiseaseModalOpen(false); loadDiseases(); show(editingDisease ? 'تم تعديل المرض' : 'تمت إضافة المرض'); }}
                    onError={() => show('حدث خطأ أثناء الحفظ', 'error')}
                />
            )}

            {/* Treatment Modal */}
            {isTreatmentModalOpen && selectedDiseaseId && (
                <TreatmentModal
                    treatment={editingTreatment}
                    diseaseId={selectedDiseaseId}
                    onClose={() => setIsTreatmentModalOpen(false)}
                    onSaved={() => { setIsTreatmentModalOpen(false); loadDiseases(); show(editingTreatment ? 'تم تعديل العلاج' : 'تمت إضافة العلاج'); }}
                    onError={() => show('حدث خطأ أثناء الحفظ', 'error')}
                />
            )}
        </div>
    );
}

// ─── Disease Modal ────────────────────────────────────────────────────────────
function DiseaseModal({ disease, onClose, onSaved, onError }: {
    disease: Disease | null;
    onClose: () => void;
    onSaved: () => void;
    onError: () => void;
}) {
    const [form, setForm] = useState({
        nameAr: disease?.nameAr || '',
        nameEn: disease?.nameEn || '',
        scientificName: disease?.scientificName || '',
        diseaseType: disease?.diseaseType || 'PARASITIC',
        severity: disease?.severity || 'MODERATE',
        contagiousness: disease?.contagiousness || 'HIGH',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (disease) {
                await fetchWithAuth(`/admin/diseases/${disease.id}`, { method: 'PUT', body: JSON.stringify(form) });
            } else {
                await fetchWithAuth('/admin/diseases', { method: 'POST', body: JSON.stringify(form) });
            }
            onSaved();
        } catch {
            onError();
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-sm placeholder:text-muted-foreground";
    const selectCls = "w-full bg-[#1a1f2e] border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-sm";

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold">{disease ? 'تعديل مرض' : 'إضافة مرض جديد'}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">الاسم بالعربية *</label>
                            <input required type="text" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">الاسم بالإنجليزية *</label>
                            <input required type="text" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className={inputCls} dir="ltr" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1 text-muted-foreground">الاسم العلمي</label>
                        <input type="text" value={form.scientificName} onChange={e => setForm({ ...form, scientificName: e.target.value })} className={inputCls} dir="ltr" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">النوع</label>
                            <select value={form.diseaseType} onChange={e => setForm({ ...form, diseaseType: e.target.value })} className={selectCls}>
                                <option value="PARASITIC">طفيلي</option>
                                <option value="BACTERIAL">بكتيري</option>
                                <option value="VIRAL">فيروسي</option>
                                <option value="FUNGAL">فطري</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">الخطورة</label>
                            <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })} className={selectCls}>
                                <option value="MILD">خفيفة</option>
                                <option value="MODERATE">متوسطة</option>
                                <option value="SEVERE">شديدة</option>
                                <option value="CATASTROPHIC">كارثية</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">العدوى</label>
                            <select value={form.contagiousness} onChange={e => setForm({ ...form, contagiousness: e.target.value })} className={selectCls}>
                                <option value="NONE">غير معدي</option>
                                <option value="LOW">منخفضة</option>
                                <option value="MEDIUM">متوسطة</option>
                                <option value="HIGH">عالية</option>
                                <option value="EXTREMELY_HIGH">فائقة</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 font-bold py-2.5 rounded-xl transition-colors">إلغاء</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-60">
                            {saving ? 'جاري الحفظ...' : 'حفظ المرض'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Treatment Modal ──────────────────────────────────────────────────────────
function TreatmentModal({ treatment, diseaseId, onClose, onSaved, onError }: {
    treatment: Treatment | null;
    diseaseId: string;
    onClose: () => void;
    onSaved: () => void;
    onError: () => void;
}) {
    const [form, setForm] = useState({
        nameAr: treatment?.nameAr || '',
        nameEn: treatment?.nameEn || '',
        description: treatment?.description || '',
        type: treatment?.type || 'CHEMICAL',
        applicationMethod: treatment?.applicationMethod || '',
        durationDays: treatment?.durationDays?.toString() || '',
        withdrawalPeriod: treatment?.withdrawalPeriod?.toString() || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const body = {
            ...form,
            durationDays: form.durationDays ? Number(form.durationDays) : null,
            withdrawalPeriod: form.withdrawalPeriod ? Number(form.withdrawalPeriod) : null,
        };
        try {
            if (treatment) {
                await fetchWithAuth(`/admin/treatments/${treatment.id}`, { method: 'PUT', body: JSON.stringify(body) });
            } else {
                await fetchWithAuth(`/admin/diseases/${diseaseId}/treatments`, { method: 'POST', body: JSON.stringify(body) });
            }
            onSaved();
        } catch {
            onError();
        } finally {
            setSaving(false);
        }
    };

    const inputCls = "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-sm placeholder:text-muted-foreground";
    const selectCls = "w-full bg-[#1a1f2e] border border-white/20 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary text-sm";

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <div className="glass-panel rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Pill className="w-5 h-5 text-primary" />
                        {treatment ? 'تعديل البروتوكول' : 'إضافة بروتوكول علاجي'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">اسم العلاج (عربي) *</label>
                            <input required type="text" value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">اسم العلاج (إنجليزي) *</label>
                            <input required type="text" value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className={inputCls} dir="ltr" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-1 text-muted-foreground">وصف العلاج</label>
                        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={`${inputCls} h-20 resize-none`} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">النوع</label>
                            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className={selectCls}>
                                <option value="CHEMICAL">كيميائي</option>
                                <option value="ORGANIC">عضوي</option>
                                <option value="BIOLOGICAL">بيولوجي</option>
                                <option value="MANAGEMENT">إدارة الخلية</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">طريقة التطبيق *</label>
                            <input required type="text" placeholder="مثال: شرائح بين الإطارات" value={form.applicationMethod} onChange={e => setForm({ ...form, applicationMethod: e.target.value })} className={inputCls} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold mb-1 text-muted-foreground">المدة (بالأيام)</label>
                            <input type="number" min="1" value={form.durationDays} onChange={e => setForm({ ...form, durationDays: e.target.value })} className={inputCls} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold mb-1 text-red-400 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                فترة التحريم (أيام)
                            </label>
                            <input type="number" min="0" value={form.withdrawalPeriod} onChange={e => setForm({ ...form, withdrawalPeriod: e.target.value })} className="w-full bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 font-bold py-2.5 rounded-xl transition-colors">إلغاء</button>
                        <button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-xl transition-colors shadow-lg shadow-primary/20 disabled:opacity-60">
                            {saving ? 'جاري الحفظ...' : 'حفظ العلاج'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
