import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { add, addToSyncQueue } from '@/lib/db';
import { toast } from 'sonner';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export default function AddApiaryPage() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const [name, setName] = useState('');
  const [type, setType] = useState('standing');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('يرجى إدخال اسم المنحل');
      return;
    }

    setLoading(true);
    try {
      const apiaryData = {
        name,
        type,
        location: location || undefined,
        notes: notes || undefined,
        createdAt: new Date().toISOString(),
      };

      const id = await add('apiaries', apiaryData);

      if (isOnline) {
        try {
          const { apiClient } = await import('@/lib/apiClient');
          await apiClient.post('/api/apiaries', { ...apiaryData, id });
        } catch {
          await addToSyncQueue('apiaries', 'create', { ...apiaryData, id });
        }
      } else {
        await addToSyncQueue('apiaries', 'create', { ...apiaryData, id });
      }

      toast.success('تم إضافة المنحل بنجاح');
      navigate('/');
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="إضافة منحل جديد" />

      <form onSubmit={handleSubmit} className="flex-1 px-4 py-6 space-y-4">
        <Input
          label="اسم المنحل"
          placeholder="مثال: منحل الأزهار"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select
          label="نوع المنحل"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'standing', label: 'منحل واقف' },
            { value: 'horizontal', label: 'منحل أفقي' },
            { value: 'mobile', label: 'منحل متنقل' },
            { value: 'top_bar', label: 'بار علوي' },
          ]}
        />

        <Input
          label="الموقع (اختياري)"
          placeholder="المدينة أو المنطقة"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Textarea
          label="ملاحظات (اختياري)"
          placeholder="أي ملاحظات إضافية..."
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            أنت غير متصل. سيتم حفظ البيانات محلياً والمزامنة لاحقاً.
          </div>
        )}

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
