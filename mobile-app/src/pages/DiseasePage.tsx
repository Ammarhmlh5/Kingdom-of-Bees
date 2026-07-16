import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { add, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';

export default function DiseasePage() {
  const { id: hiveId } = useParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [disease, setDisease] = useState('');
  const [severity, setSeverity] = useState('mild');
  const [treatment, setTreatment] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disease) {
      toast.error('يرجى إدخال اسم المرض');
      return;
    }

    setLoading(true);
    try {
      const data = {
        hiveId: Number(hiveId),
        disease,
        severity,
        treatment: treatment || undefined,
        notes: notes || undefined,
        date: new Date().toISOString(),
      };

      const id = await add('disease_records', data);

      if (isOnline) {
        try {
          const { apiClient } = await import('@/lib/apiClient');
          await apiClient.post('/api/diseases', { ...data, id });
        } catch {
          await addToSyncQueue('disease_records', 'create', { ...data, id });
        }
      } else {
        await addToSyncQueue('disease_records', 'create', { ...data, id });
      }

      toast.success('تم تسجيل المرض بنجاح');
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
        <Input
          label="اسم المرض"
          placeholder="مثال: فاروا"
          value={disease}
          onChange={(e) => setDisease(e.target.value)}
        />

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
