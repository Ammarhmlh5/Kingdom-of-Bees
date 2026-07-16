import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/services/api';
import { Droplets, Search, Calendar, MapPin, Beaker } from 'lucide-react';

interface FeedingRecord {
    id: string;
    feedingLocation: 'INTERNAL' | 'EXTERNAL';
    contentType: 'SUGAR_SYRUP' | 'PROTEIN' | 'FONDANT' | 'DRY_SUGAR';
    quantityKg: number;
    feedingDate: string;
    notes?: string;
    hive?: {
        id: string;
        hiveNumber: string;
    };
    apiary?: {
        id: string;
        name: string;
    };
}

export default function GlobalFeedingPage() {
    const [search, setSearch] = useState('');
    const [locationFilter, setLocationFilter] = useState<'ALL' | 'INTERNAL' | 'EXTERNAL'>('ALL');

    const { data: feedingData, isLoading } = useQuery({
        queryKey: ['feeding', 'global', search, locationFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (locationFilter !== 'ALL') params.append('location', locationFilter);
            
            const response = await api.get(`/feeding?${params.toString()}`);
            return response.data.data || [];
        }
    });

    const records: FeedingRecord[] = feedingData || [];

    // Compute stats
    const now = new Date();
    const thisMonth = records.filter(r => {
        const d = new Date(r.feedingDate);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const totalSugar = thisMonth.filter(r => r.contentType === 'SUGAR_SYRUP').reduce((s, r) => s + Number(r.quantityKg || 0), 0);
    const totalProtein = thisMonth.filter(r => r.contentType === 'PROTEIN').reduce((s, r) => s + Number(r.quantityKg || 0), 0);
    const totalCount = records.length;

    const getContentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'SUGAR_SYRUP': 'شراب السكر',
            'PROTEIN': 'بروتين',
            'FONDANT': 'فوندانت',
            'DRY_SUGAR': 'سكر جاف'
        };
        return labels[type] || type;
    };

    const getContentTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'SUGAR_SYRUP': 'bg-amber-100 text-amber-800',
            'PROTEIN': 'bg-orange-100 text-orange-800',
            'FONDANT': 'bg-yellow-100 text-yellow-800',
            'DRY_SUGAR': 'bg-green-100 text-green-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-4" dir="rtl">
                <Skeleton className="h-12 w-full max-w-sm rounded-xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                </div>
                <Skeleton className="h-96 rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Droplets className="w-8 h-8 text-amber-500" />
                        إدارة التغذية
                    </h1>
                    <p className="text-muted-foreground mt-1">عرض وتتبع جميع سجلات التغذية عبر جميع المنحلات</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي السجلات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">شراب السكر (هذا الشهر)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-amber-600">{totalSugar.toFixed(1)} كجم</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">البروتين (هذا الشهر)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-orange-600">{totalProtein.toFixed(1)} كجم</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="بحث في سجلات التغذية..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pr-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={locationFilter === 'ALL' ? 'default' : 'outline'}
                        onClick={() => setLocationFilter('ALL')}
                    >
                        الكل
                    </Button>
                    <Button
                        variant={locationFilter === 'INTERNAL' ? 'default' : 'outline'}
                        onClick={() => setLocationFilter('INTERNAL')}
                    >
                        <MapPin className="w-4 h-4 ml-1" />
                        داخلي
                    </Button>
                    <Button
                        variant={locationFilter === 'EXTERNAL' ? 'default' : 'outline'}
                        onClick={() => setLocationFilter('EXTERNAL')}
                    >
                        <MapPin className="w-4 h-4 ml-1" />
                        خارجي
                    </Button>
                </div>
            </div>

            {/* Records List */}
            <Card>
                <CardHeader>
                    <CardTitle>سجلات التغذية</CardTitle>
                </CardHeader>
                <CardContent>
                    {records.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <Droplets className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>لا توجد سجلات تغذية</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {records.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            <Beaker className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{getContentTypeLabel(record.contentType)}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(record.feedingDate).toLocaleDateString('ar-SA')}
                                                {record.hive && (
                                                    <>
                                                        <span>•</span>
                                                        <span>خلية #{record.hive.hiveNumber}</span>
                                                    </>
                                                )}
                                                {record.apiary && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{record.apiary.name}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={getContentTypeColor(record.contentType)}>
                                            {record.feedingLocation === 'INTERNAL' ? 'داخلي' : 'خارجي'}
                                        </Badge>
                                        <div className="text-lg font-bold">{record.quantityKg} كجم</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
