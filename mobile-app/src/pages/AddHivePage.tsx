import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import apiClient from '@/lib/apiClient';
import { add, addToSyncQueue } from '@/lib/db';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { toast } from 'sonner';

export default function AddHivePage() {
  const { id: apiaryId } = useParams();
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [name, setName] = useState('');
  const [type, setType] = useState('langstroth');
  const [queenYear, setQueenYear] = useState(new Date().getFullYear().toString());
  const [queenSource, setQueenSource] = useState('');
  const [framesCount, setFramesCount] = useState('10');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم الخلية');
      return;
    }
    const year = Number(queenYear);
    const currentYear = new Date().getFullYear();
    if (!queenYear || isNaN(year) || year < 2000 || year > currentYear) {
      toast.error(`سنة الملكة يجب أن بين 2000 و ${currentYear}`);
      return;
    }
    const frames = Number(framesCount);
    if (isNaN(frames) || frames < 8 || frames > 40) {
      toast.error('عدد الأطر يجب أن بين 8 و 40');
      return;
    }

    setLoading(true);
    try {
      const hiveData = {
        name,
        type,
        status: 'active',
        queenYear: Number(queenYear),
        queenSource: queenSource || undefined,
        framesCount: Number(framesCount),
        notes: notes || undefined,
      };

      if (isOnline) {
        try {
          await apiClient.post(`/apiaries/${apiaryId}/hives`, hiveData);
          toast.success('تم إضافة الخلية بنجاح');
          navigate(`/apiary/${apiaryId}/hives`);
          return;
        } catch {
          // fall through to offline save
        }
      }

      await add('hives', { ...hiveData, apiaryId: Number(apiaryId), createdAt: new Date().toISOString() });
      await addToSyncQueue('hives', 'create', { ...hiveData, apiaryId: Number(apiaryId) });
      toast.success('تم الحفظ محلياً وسيتم المزامنة لاحقاً');
      navigate(`/apiary/${apiaryId}/hives`);
    } catch {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="إضافة خلية جديدة" />

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-4">
        <Input
          label="اسم الخلية"
          placeholder="مثال: الخلية الأولى"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select
          label="نوع الخلية"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'langstroth', label: 'لانجستروث' },
            { value: 'top_bar', label: 'بار علوي' },
            { value: 'dadar', label: 'دادار' },
            { value: 'warre', label: 'واريه' },
          ]}
        />

        <Input
          label="سنة الملكة"
          type="number"
          value={queenYear}
          onChange={(e) => setQueenYear(e.target.value)}
        />

        <Input
          label="مصدر الملكة (اختياري)"
          placeholder="المزرعة أو المصدر"
          value={queenSource}
          onChange={(e) => setQueenSource(e.target.value)}
        />

        <Input
          label="عدد الأطر"
          type="number"
          value={framesCount}
          onChange={(e) => setFramesCount(e.target.value)}
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
