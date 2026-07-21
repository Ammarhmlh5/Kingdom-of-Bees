import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import apiClient from '@/lib/apiClient';
import { add, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';

const DISEASES = [
  { value: 'varroa', label: 'فاروا (الهمّاق)' },
  { value: 'nosema', label: 'نوزيما' },
  { value: 'american_foulbrood', label: 'السلالة الأمريكية' },
  { value: 'european_foulbrood', label: 'السلالة الأوروبية' },
  { value: 'chalkbrood', label: 'مرض الطباشير' },
  { value: 'sacbrood', label: 'مرض الكيس' },
  { value: 'wax_moth', label: 'حشرة الشمع' },
  { value: 'small_hive_beetle', label: 'خنفساء الخلية الصغيرة' },
  { value: 'tracheal_mite', label: 'الهمّاق القصبي' },
  { value: 'other', label: 'أخرى' },
];

const TREATMENTS: Record<string, { value: string; label: string }[]> = {
  varroa: [
    { value: 'apivar', label: 'شريط أبيفار' },
    { value: 'oxalic_acid', label: 'حمض الأكزالك' },
    { value: 'formic_acid', label: 'حمض الفورميك' },
    { value: 'thymol', label: 'تيمول ( safegaurd )' },
    { value: 'flumethrin', label: 'فلوميثرين (باي فارول)' },
  ],
  nosema: [
    { value: 'fumagilin', label: 'يوماجيلين (Fumagilin-B)' },
    { value: 'nosevit', label: 'نوزفيت' },
  ],
  american_foulbrood: [
    { value: 'tylosin', label: 'تيلوسين (تيلام' },
    { value: 'oxytetracycline', label: 'أوكسي تتراسيكلين' },
  ],
  european_foulbrood: [
    { value: 'oxytetracycline', label: 'أوكسي تتراسيكلين' },
    { value: 'tylosin', label: 'تيلوسين' },
  ],
  chalkbrood: [
    { value: 'requeening', label: 'إعادة تعيين الملكة' },
    { value: 'improve_ventilation', label: 'تحسين التهوية' },
  ],
  sacbrood: [
    { value: 'requeening', label: 'إعادة تعيين الملكة' },
  ],
  wax_moth: [
    { value: 'bacillus_thuringiensis', label: 'باسيلوس ثورينجيانسيس' },
    { value: 'freeze_frames', label: 'تجميد الأطر' },
  ],
  small_hive_beetle: [
    { value: 'check_mite', label: 'شريط CheckMite+' },
    { value: 'oil_traps', label: 'فخاخ زيتية' },
  ],
  tracheal_mite: [
    { value: 'menthol', label: 'منثول' },
    { value: 'formic_acid', label: 'حمض الفورميك' },
  ],
};

export default function DiseasePage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const apiaryId = (location.state as any)?.apiaryId;
  const isOnline = useOnlineStatus();
  const [disease, setDisease] = useState('');
  const [customDisease, setCustomDisease] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [treatment, setTreatment] = useState('');
  const [customTreatment, setCustomTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const availableTreatments = disease && disease !== 'other' ? (TREATMENTS[disease] || []) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const diseaseName = disease === 'other' ? customDisease : DISEASES.find(d => d.value === disease)?.label || disease;
    if (!diseaseName) {
      toast.error('يرجى اختيار أو إدخال اسم المرض');
      return;
    }

    setLoading(true);
    try {
      const resolvedTreatment = treatment === '_custom' ? customTreatment : treatment;
      const treatmentLabel = resolvedTreatment
        ? (availableTreatments.find(t => t.value === resolvedTreatment)?.label || resolvedTreatment)
        : undefined;

      const data = {
        hiveId,
        diseaseName,
        diseaseKey: disease,
        severity,
        treatment: treatmentLabel,
        notes: notes || undefined,
        dateReported: new Date().toISOString(),
        status: 'ACTIVE',
      };

      if (isOnline && apiaryId) {
        try {
          await apiClient.post(`/apiaries/${apiaryId}/diseases`, data);
          toast.success('تم تسجيل المرض بنجاح');
          navigate(-1);
          return;
        } catch {
          // fall through
        }
      }

      await add('disease_records', data);
      await addToSyncQueue('disease_records', 'create', data);
      toast.success('تم الحفظ محلياً');
      navigate(-1);
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  const severityConfig: Record<string, { label: string; color: string }> = {
    mild: { label: 'خفيف', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
    moderate: { label: 'متوسط', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    severe: { label: 'شديد', color: 'bg-red-50 border-red-200 text-red-700' },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="تسجيل مرض" />

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-4">
        <Select
          label="نوع المرض"
          value={disease}
          onChange={(e) => { setDisease(e.target.value); setTreatment(''); }}
          options={[{ value: '', label: 'اختر المرض...' }, ...DISEASES]}
        />

        {disease === 'other' && (
          <Input
            label="اسم المرض"
            placeholder="اكتب اسم المرض"
            value={customDisease}
            onChange={(e) => setCustomDisease(e.target.value)}
          />
        )}

        <div>
          <label className="text-sm font-medium text-bee-text block mb-1.5">الشدة</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(severityConfig).map(([value, config]) => (
              <button
                key={value}
                type="button"
                onClick={() => setSeverity(value)}
                className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  severity === value ? config.color : 'bg-white border-bee-border text-bee-muted'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {availableTreatments.length > 0 && (
          <Select
            label="العلاج المقترح"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            options={[{ value: '', label: 'اختر العلاج...' }, ...availableTreatments, { value: '_custom', label: 'علاج آخر...' }]}
          />
        )}

        {treatment === '_custom' && (
          <Input
            label="اسم العلاج"
            placeholder="اكتب اسم العلاج"
            value={customTreatment}
            onChange={(e) => setCustomTreatment(e.target.value)}
          />
        )}

        {!availableTreatments.length && disease && disease !== 'other' && (
          <Input
            label="العلاج (اختياري)"
            placeholder="العلاج المطبق"
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
          />
        )}

        <Textarea
          label="ملاحظات (اختياري)"
          placeholder="أعراض ملاحظة، إجراءات مُتخذة..."
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" fullWidth onClick={() => navigate(-1)}>
            إلغاء
          </Button>
          <Button type="submit" fullWidth disabled={loading}>
            {loading ? 'جاري الحفظ...' : 'حفظ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
