import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle, Check, X, Clock, ArrowRight, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getApiarySchedules, completeSchedule, cancelSchedule, InspectionSchedule } from '@/services/inspectionSchedules';
import { Skeleton } from '@/components/ui/Skeleton';

type FilterTab = 'all' | 'pending' | 'completed' | 'overdue';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'قادم', color: 'bg-amber-100 text-amber-700', icon: Clock },
  COMPLETED: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700', icon: Check },
  OVERDUE: { label: 'متأخر', color: 'bg-red-100 text-red-700', icon: AlertCircle },
  CANCELLED: { label: 'ملغي', color: 'bg-gray-100 text-gray-500', icon: X },
};

const STATUS_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: 'القادمة' },
  { key: 'completed', label: 'المكتملة' },
  { key: 'overdue', label: 'المتأخرة' },
];

export function InspectionSchedulesPage() {
  const { id: apiaryId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: schedules = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['inspectionSchedules', apiaryId],
    queryFn: () => getApiarySchedules(apiaryId!),
    enabled: !!apiaryId,
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => completeSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionSchedules', apiaryId] });
      toast.success('تم تحديد الفحص كمكتمل');
    },
    onError: () => toast.error('فشل في تحديث الحالة'),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspectionSchedules', apiaryId] });
      toast.success('تم إلغاء الجدول');
    },
    onError: () => toast.error('فشل في إلغاء الجدول'),
  });

  const filteredSchedules = (schedules as InspectionSchedule[]).filter(s => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending' && s.status === 'PENDING') ||
      (activeTab === 'completed' && s.status === 'COMPLETED') ||
      (activeTab === 'overdue' && (s.status === 'OVERDUE' || s.status === 'MISSED'));
    const matchesSearch =
      !searchTerm ||
      s.hive?.hiveNumber?.toString().includes(searchTerm) ||
      s.setting?.nameAr?.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-4" dir="rtl">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600 bg-red-50 rounded-2xl border border-red-100" dir="rtl">
        <AlertCircle className="w-10 h-10 mb-2" />
        <p className="font-bold">فشل في تحميل الجداول</p>
        <button onClick={() => refetch()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-amber-500" />
            جدول الفحوصات
          </h1>
          <p className="text-gray-500 mt-1">متابعة الفحوصات المجدولة والقادمة</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="بحث برقم الخلية أو نوع الفحص..."
            className="w-full pr-10 pl-4 py-2 border rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-gray-400 w-5 h-5" />
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            {searchTerm || activeTab !== 'all'
              ? 'لا توجد جداول تطابق بحثك'
              : activeTab === 'overdue'
                ? 'لا توجد فحوصات متأخرة'
                : 'لا توجد جداول فحص. قم بتسجيل فحص جديد لإنشاء جدول تلقائياً'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredSchedules.map((schedule: InspectionSchedule) => {
              const StatusIcon = STATUS_CONFIG[schedule.status]?.icon || Clock;
              return (
                <div key={schedule.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        schedule.status === 'COMPLETED' ? 'bg-emerald-100' :
                        schedule.status === 'OVERDUE' || schedule.status === 'MISSED' ? 'bg-red-100' :
                        'bg-amber-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          schedule.status === 'COMPLETED' ? 'text-emerald-600' :
                          schedule.status === 'OVERDUE' || schedule.status === 'MISSED' ? 'text-red-600' :
                          'text-amber-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">
                          خلية {schedule.hive?.hiveNumber || schedule.hiveId?.slice(0, 6)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(schedule.scheduledDate).toLocaleDateString('ar-SA')}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_CONFIG[schedule.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                            {STATUS_CONFIG[schedule.status]?.label || schedule.status}
                          </span>
                          {schedule.setting && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              {schedule.setting.nameAr}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {schedule.status === 'PENDING' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => completeMutation.mutate(schedule.id)}
                          disabled={completeMutation.isPending}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          إتمام
                        </button>
                        <button
                          onClick={() => cancelMutation.mutate(schedule.id)}
                          disabled={cancelMutation.isPending}
                          className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50 flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          إلغاء
                        </button>
                      </div>
                    )}

                    {schedule.completedAt && (
                      <div className="text-xs text-gray-400">
                        تم: {new Date(schedule.completedAt).toLocaleDateString('ar-SA')}
                      </div>
                    )}
                  </div>

                  {schedule.notes && (
                    <p className="mt-2 text-sm text-gray-500 mr-14">{schedule.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h4 className="font-medium text-sm text-gray-500 mb-3">ملخص الإحصائيات</h4>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'المجموع', count: schedules.length, color: 'text-gray-900' },
            { label: 'القادمة', count: schedules.filter((s: InspectionSchedule) => s.status === 'PENDING').length, color: 'text-amber-600' },
            { label: 'المكتملة', count: schedules.filter((s: InspectionSchedule) => s.status === 'COMPLETED').length, color: 'text-emerald-600' },
            { label: 'المتأخرة', count: schedules.filter((s: InspectionSchedule) => s.status === 'OVERDUE' || s.status === 'MISSED').length, color: 'text-red-600' },
          ].map(stat => (
            <div key={stat.label} className="text-center p-3 bg-gray-50 rounded-xl">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.count}</div>
              <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
