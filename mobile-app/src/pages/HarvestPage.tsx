import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Plus, Calendar, Scale, FileText, Filter } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { getAll } from '@/lib/db';

interface HarvestRecord {
  id: string;
  harvestDate: string;
  hiveId: string;
  hive?: { hiveNumber: string };
  totalQuantity: number;
  unit: string;
  harvestType: string;
  notes?: string;
}

export default function HarvestPage() {
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadHarvests();
  }, []);

  const loadHarvests = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/harvest/my');
      setHarvests(response.data.data || []);
    } catch {
      // Fallback to local DB
      const local = await getAll<HarvestRecord>('harvest_records');
      setHarvests(local);
    } finally {
      setLoading(false);
    }
  };

  const filteredHarvests = harvests.filter(h => {
    if (!dateFrom && !dateTo) return true;
    const d = new Date(h.harvestDate);
    if (dateFrom && d < new Date(dateFrom)) return false;
    if (dateTo && d > new Date(dateTo)) return false;
    return true;
  });

  const totalYield = filteredHarvests.reduce((sum, h) => sum + Number(h.totalQuantity || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="سجلات الحصاد" subtitle="جاري التحميل..." />
        <div className="flex-1 px-4 py-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-bee-border/50 rounded-lg" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="سجلات الحصاد" subtitle={`${filteredHarvests.length} حصاد`} />

      <div className="flex-1 px-4 py-4 space-y-4">
        <Card className="bg-honey/5 border-honey/20">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">الإنتاج الإجمالي</span>
            <span className="text-lg font-bold text-honey">{totalYield.toFixed(1)} كجم</span>
          </div>
        </Card>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterOpen ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'
            }`}
          >
            <Filter size={14} />
            تصفية
          </button>
        </div>

        {filterOpen && (
          <Card className="space-y-3">
            <div>
              <label className="text-xs font-medium text-bee-muted block mb-1">من تاريخ</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-bee-border text-sm bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-bee-muted block mb-1">إلى تاريخ</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-bee-border text-sm bg-white"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-honey font-medium"
              >
                مسح الفلتر
              </button>
            )}
          </Card>
        )}

        {filteredHarvests.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <Scale size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">لا توجد سجلات حصاد</p>
            <p className="text-sm">أضف سجل حصاد جديد</p>
          </div>
        ) : (
          filteredHarvests.map(harvest => (
            <Card key={harvest.id}>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale size={14} className="text-honey" />
                    <span className="text-lg font-bold text-honey">{harvest.totalQuantity} {harvest.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-bee-muted">
                    <Calendar size={12} />
                    {new Date(harvest.harvestDate).toLocaleDateString('ar-SA')}
                  </div>
                  {harvest.hive && (
                    <p className="text-xs text-bee-muted">خلية رقم {harvest.hive.hiveNumber}</p>
                  )}
                  <p className="text-xs text-honey font-medium">{harvest.harvestType}</p>
                  {harvest.notes && (
                    <div className="flex items-center gap-1 text-xs text-bee-muted">
                      <FileText size={12} />
                      {harvest.notes}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <button className="fixed bottom-24 left-4 w-14 h-14 bg-honey text-white rounded-full shadow-lg flex items-center justify-center hover:bg-honey-dark active:scale-95 transition-all z-40">
        <Plus size={28} />
      </button>
    </div>
  );
}
