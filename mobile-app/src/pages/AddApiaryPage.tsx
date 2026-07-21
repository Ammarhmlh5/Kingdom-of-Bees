import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import apiClient from '@/lib/apiClient';
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
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم المنحل');
      return;
    }

    setLoading(true);
    const apiaryData = {
      name: name.trim(),
      type,
      location: location.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      if (isOnline) {
        try {
          await apiClient.post('/apiaries', apiaryData);
          toast.success('تم إضافة المنحل بنجاح');
          navigate('/');
          return;
        } catch {
          // fall through to offline save
        }
      }

      // Offline fallback: save to IndexedDB + sync queue
      const id = await add('apiaries', apiaryData);
      await addToSyncQueue('apiaries', 'create', { ...apiaryData, id });
      toast.success('تم الحفظ محلياً وسيتم المزامنة لاحقاً');
      navigate('/');
    } catch {
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
