import React, { useState } from 'react';
import { useHives, useHiveFrames } from '@/hooks/api';
import { useSearchParams, Link } from 'react-router-dom';
import FrameStats from '../components/frames/FrameStats';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface Frame {
    id: string;
    hiveId: string;
    story: number;
    position: number;
    sideAHoneyPercentage: number;
    sideABroodPercentage: number;
    sideAPollenPercentage: number;
    sideBHoneyPercentage: number;
    sideBBroodPercentage: number;
    sideBPollenPercentage: number;
}

const FramesManagementPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const apiaryId = searchParams.get('apiaryId') || '';

    // Fetch hives for selection
    const { data: hives = [], isLoading: hivesLoading } = useHives(apiaryId);

    const [filterHive, setFilterHive] = useState<string>('all');
    const [filterCondition, setFilterCondition] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('position');

    // Fetch frames for selected hive
    // Note: If 'all' is selected, we might need to handle it differently or prompt user to select hive.
    // For now, let's only fetch if a specific hive is selected, or empty if 'all' (since we don't have get-all-frames).
    const selectedHiveId = filterHive !== 'all' ? filterHive : '';
    const { data: hiveFrames = [], isLoading: framesLoading } = useHiveFrames(selectedHiveId);

    const frames: Frame[] = hiveFrames;
    const loading = hivesLoading || framesLoading;

    const getFrameCondition = (frame: Frame) => {
        const avgHoney = (frame.sideAHoneyPercentage + frame.sideBHoneyPercentage) / 2;
        const avgBrood = (frame.sideABroodPercentage + frame.sideBBroodPercentage) / 2;

        if (avgHoney > 70 || avgBrood > 70) return 'excellent';
        if (avgHoney > 40 || avgBrood > 40) return 'good';
        if (avgHoney > 20 || avgBrood > 20) return 'fair';
        return 'poor';
    };

    const filteredFrames = frames
        .filter((frame: Frame) => {
            if (filterCondition !== 'all') {
                const condition = getFrameCondition(frame);
                if (condition !== filterCondition) return false;
            }
            return true;
        })
        .sort((a: Frame, b: Frame) => {
            if (sortBy === 'position') return a.position - b.position;
            if (sortBy === 'honey') {
                const aHoney = (a.sideAHoneyPercentage + a.sideBHoneyPercentage) / 2;
                const bHoney = (b.sideAHoneyPercentage + b.sideBHoneyPercentage) / 2;
                return bHoney - aHoney;
            }
            if (sortBy === 'brood') {
                const aBrood = (a.sideABroodPercentage + a.sideBBroodPercentage) / 2;
                const bBrood = (b.sideABroodPercentage + b.sideBBroodPercentage) / 2;
                return bBrood - aBrood;
            }
            return 0;
        });

    const handleBulkUpdate = () => {
        alert('Bulk update feature coming soon!');
    };

    if (loading && !frames.length) {
        return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    }

    // ... render logic ...
    // Need to ensure Select for hive uses hives data


    const getConditionColor = (condition: string) => {
        switch (condition) {
            case 'excellent': return 'bg-green-100 text-green-800';
            case 'good': return 'bg-blue-100 text-blue-800';
            case 'fair': return 'bg-yellow-100 text-yellow-800';
            case 'poor': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getConditionLabel = (condition: string) => {
        switch (condition) {
            case 'excellent': return 'ممتاز';
            case 'good': return 'جيد';
            case 'fair': return 'مقبول';
            case 'poor': return 'ضعيف';
            default: return 'غير معروف';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 إدارة الإطارات</h1>
                <p className="text-gray-600">إدارة شاملة لجميع الإطارات عبر كافة الخلايا</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900">{frames.length}</div>
                    <div className="text-sm text-gray-600 mt-1">إجمالي الإطارات</div>
                </div>
                <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
                    <div className="text-3xl font-bold text-green-700">
                        {frames.filter(f => getFrameCondition(f) === 'excellent').length}
                    </div>
                    <div className="text-sm text-green-600 mt-1">إطارات ممتازة</div>
                </div>
                <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-700">
                        {frames.filter(f => getFrameCondition(f) === 'fair').length}
                    </div>
                    <div className="text-sm text-yellow-600 mt-1">تحتاج متابعة</div>
                </div>
                <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
                    <div className="text-3xl font-bold text-red-700">
                        {frames.filter(f => getFrameCondition(f) === 'poor').length}
                    </div>
                    <div className="text-sm text-red-600 mt-1">ضعيفة</div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">الخلية</label>
                        <Select value={filterHive} onValueChange={setFilterHive}>
                            <SelectTrigger>
                                <SelectValue placeholder="اختر خلية" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">جميع الخلايا</SelectItem>
                                {hives.map((h: any) => (
                                    <SelectItem key={h.id} value={h.id}>
                                        {h.name || h.hiveNumber}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">الحالة</label>
                        <select
                            value={filterCondition}
                            onChange={(e) => setFilterCondition(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">جميع الحالات</option>
                            <option value="excellent">ممتاز</option>
                            <option value="good">جيد</option>
                            <option value="fair">مقبول</option>
                            <option value="poor">ضعيف</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                        <label className="text-sm font-medium text-gray-700 mb-1 block">الترتيب</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="position">الموقع</option>
                            <option value="honey">نسبة العسل</option>
                            <option value="brood">نسبة الحضنة</option>
                        </select>
                    </div>

                    <button
                        onClick={handleBulkUpdate}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        تحديث متعدد
                    </button>
                </div>
            </div>

            {/* Frames Grid */}
            <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    الإطارات ({filteredFrames.length})
                </h2>

                {filteredFrames.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-600">لا توجد إطارات تطابق الفلاتر المحددة</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFrames.map((frame) => {
                            const condition = getFrameCondition(frame);
                            const avgHoney = (frame.sideAHoneyPercentage + frame.sideBHoneyPercentage) / 2;
                            const avgBrood = (frame.sideABroodPercentage + frame.sideBBroodPercentage) / 2;

                            return (
                                <Link
                                    key={frame.id}
                                    to={`/frames/${frame.id}`}
                                    className="block border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                إطار #{frame.position}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                طابق {frame.story}
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${getConditionColor(condition)}`}>
                                            {getConditionLabel(condition)}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>🍯 عسل</span>
                                                <span>{Math.round(avgHoney)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-500 h-2 rounded-full"
                                                    style={{ width: `${avgHoney}%` }}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                <span>🐝 حضنة</span>
                                                <span>{Math.round(avgBrood)}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-amber-600 h-2 rounded-full"
                                                    style={{ width: `${avgBrood}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FramesManagementPage;
