import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function DiseasePage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [disease, setDisease] = useState('');
  const [customDisease, setCustomDisease] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const diseaseName = disease === 'other' ? customDisease : DISEASES.find(d => d.value === disease)?.label || disease;
    if (!diseaseName) {
      toast.error('يرجى اختيار أو إدخال اسم المرض');
      return;
    }

    setLoading(true);
    try {
      const data = {
        hiveId,
        disease: diseaseName,
        severity,
        treatment: treatment || undefined,
        notes: notes || undefined,
        date: new Date().toISOString(),
      };

      if (isOnline) {
        try {
          await apiClient.post(`/diseases`, data);
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="تسجيل مرض" />

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-4">
        <Select
          label="نوع المرض"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
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

        <Select
          label="الشدة"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          options={[
            { value: 'mild', label: 'خفيف' },
            { value: 'moderate', label: 'متوسط' },
            { value: 'severe', label: 'شديد' },
          ]}
        />

        <Input
          label="العلاج (اختياري)"
          placeholder="العلاج المطبق"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />

        <Textarea
          label="ملاحظات (اختياري)"
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
