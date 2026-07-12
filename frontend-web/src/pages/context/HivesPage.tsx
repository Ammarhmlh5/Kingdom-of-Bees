import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useApiaryContext } from "@/contexts/ApiaryContext";
import { getHives, isHiveConfigured } from "@/services/hives";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    LayoutGrid,
    Plus,
    Search,
    Settings,
    GitFork,
    Combine,
    ArrowUp,
    Activity,
    Thermometer,
    ClipboardCheck,
    BarChart3,
    Filter,
    CheckCircle2,
    ArrowUpDown,
    CalendarDays,
} from "lucide-react";
import { InspectionModal } from "@/components/hives/InspectionModal";
import { SetupModal } from "@/components/hives/SetupModal";

// Tab Components
import CreateHiveModal from "@/components/modals/CreateHiveModal";
import { SplitTab } from "@/components/hives/SplitTab";
import { MergeTab } from "@/components/hives/MergeTab";
import { SuperTab } from "@/components/hives/SuperTab";


export default function HivesPage() {
    const { id: apiaryId } = useParams<{ id: string }>();
    const [hives, setHives] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("inspection");
    const [hiveTypeFilter, setHiveTypeFilter] = useState<string>("all"); // "all", "TRADITIONAL", "LANGSTROTH", "NUC"
    const [sortBy, setSortBy] = useState<string>(() => {
        return localStorage.getItem('hiveSortPreference') || 'number';
    });
    const [selectedHiveForInspection, setSelectedHiveForInspection] = useState<string | null>(null);
    const [selectedHiveForSetup, setSelectedHiveForSetup] = useState<{ id: string; number: string } | null>(null);

    // Action States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    async function fetchData() {
        if (!apiaryId) return;
        setLoading(true);
        try {
            const data = await getHives(apiaryId);
            setHives(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to load hives", e);
            setHives([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, [apiaryId]);

    const strengthScore = (h: any): number => {
        if (h.strengthScore != null) return h.strengthScore;
        const map: Record<string, number> = { VERY_STRONG: 5, STRONG: 4, MEDIUM: 3, WEAK: 2, VERY_WEAK: 1, CRITICAL: 0 };
        return h.strengthRating ? (map[h.strengthRating] ?? 0) : 0;
    };

    const hiveTypeMatchesFilter = (h: any, filter: string): boolean => {
        if (filter === "all") return true;
        const nameEn = h.hiveType?.nameEn?.toLowerCase() || '';
        if (filter === "TRADITIONAL") return nameEn === 'baladi';
        if (filter === "LANGSTROTH") return nameEn === 'langstroth';
        if (filter === "NUC") return (nameEn === 'langstroth' && h.framesPerBox && h.framesPerBox <= 6) || h.hiveNumber?.toLowerCase().startsWith('n');
        return false;
    };

    const filteredHives = useMemo(() => {
        const list = Array.isArray(hives) ? [...hives] : [];
        return list
            .filter(h => {
                const matchesSearch = h.hiveNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (h.name && h.name.toLowerCase().includes(searchQuery.toLowerCase()));
                const matchesType = hiveTypeMatchesFilter(h, hiveTypeFilter);
                return matchesSearch && matchesType;
            })
            .sort((a, b) => {
                if (sortBy === 'number') return (a.hiveNumber || '').localeCompare(b.hiveNumber || '', undefined, { numeric: true });
                if (sortBy === 'strength-desc') return strengthScore(b) - strengthScore(a);
                if (sortBy === 'strength-asc') return strengthScore(a) - strengthScore(b);
                return 0;
            });
    }, [hives, searchQuery, hiveTypeFilter, sortBy]);

    const nextHiveNumber = useMemo(() => {
        if (!hives.length) return 1;
        const nums = hives
            .map(h => parseInt(h.hiveNumber))
            .filter(n => !isNaN(n));
        return nums.length ? Math.max(...nums) + 1 : 1;
    }, [hives]);

    const nextNucNumber = useMemo(() => {
        if (!hives.length) return 1;
        const nums = hives
            .map(h => {
                const m = h.hiveNumber?.match(/^n(\d+)$/i);
                return m ? parseInt(m[1]) : NaN;
            })
            .filter(n => !isNaN(n));
        return nums.length ? Math.max(...nums) + 1 : 1;
    }, [hives]);

    // Helpers to reset states when changing tabs
    const handleTabChange = (value: string) => {
        setActiveTab(value);
    };

    const handleInspectionClick = (hiveId: string) => {
        setSelectedHiveForInspection(hiveId);
    };

    const handleInspectionClose = () => {
        setSelectedHiveForInspection(null);
    };

    const handleInspectionSuccess = () => {
        setSelectedHiveForInspection(null);
        fetchData(); // Refresh data after successful inspection
    };

    const handleSetupClick = (hive: any) => {
        setSelectedHiveForSetup({ id: hive.id, number: hive.hiveNumber });
    };

    const handleSetupClose = () => {
        setSelectedHiveForSetup(null);
    };

    const handleSetupSuccess = () => {
        setSelectedHiveForSetup(null);
        fetchData();
    };

    const HiveCard = ({ hive, actionLabel, onAction, actionIcon: Icon, variant = "default" }: any) => (
        <Card className="hover:shadow-md transition-shadow cursor-default group overflow-hidden border-t-4 border-t-amber-400">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <Badge variant="outline" className="mb-2 bg-amber-50 text-amber-900 border-amber-200">
                            {hive.hiveType?.nameEn === 'Baladi' ? 'بلدي' :
                             hive.hiveType?.nameEn === 'Kenyan Top Bar' ? 'كيني' :
                             (hive.framesPerBox && hive.framesPerBox <= 6) || hive.hiveNumber?.toLowerCase().startsWith('n') ? 'نوية' :
                             'لانجستروث'}
                        </Badge>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <div dir="ltr" className="text-amber-600">#{hive.hiveNumber}</div>
                            {hive.name && <span className="text-sm font-normal text-gray-500">({hive.name})</span>}
                        </CardTitle>

                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                        ['VERY_STRONG', 'STRONG'].includes(hive.strengthRating) ? 'bg-green-500' : 
                        ['WEAK', 'VERY_WEAK', 'CRITICAL'].includes(hive.strengthRating) ? 'bg-red-500' : 
                        'bg-yellow-500'
                    }`} />

                </div>
            </CardHeader>
            <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span>{hive.strengthRating === 'VERY_STRONG' ? 'ممتازة' :
                              hive.strengthRating === 'STRONG' ? 'جيدة' :
                              hive.strengthRating === 'MEDIUM' ? 'متوسطة' :
                              hive.strengthRating === 'WEAK' ? 'ضعيفة' :
                              hive.strengthRating === 'VERY_WEAK' ? 'ضعيفة جداً' :
                              hive.strengthRating === 'CRITICAL' ? 'حرجة' : 'غير مقيمة'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                        <Thermometer className="w-4 h-4" />
                        <span>{hive.frames?.total || 0} إطارات</span>
                    </div>
                </div>
            </CardContent>
            {actionLabel && (
                <CardFooter className="pt-2">
                    <Button
                        onClick={() => onAction(hive)}
                        className="w-full gap-2"
                        variant={variant === "destructive" ? "destructive" : "default"}
                    >
                        {Icon && <Icon className="w-4 h-4" />}
                        {actionLabel}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <LayoutGrid className="w-8 h-8 text-amber-600" />
                        إدارة الخلايا
                    </h1>
                    <p className="text-gray-500 mt-1">عرض ومراقبة وتنفيذ العمليات على جميع خلايا المنحل</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsCreateModalOpen(true)} className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2">
                        <Plus className="w-5 h-5" />
                        خلية جديدة
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="inspection" value={activeTab} onValueChange={handleTabChange} className="w-full" dir="rtl">
                <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1 bg-gray-100 rounded-xl">
                    <TabsTrigger value="inspection" className="data-[state=active]:bg-white data-[state=active]:text-amber-700 py-3">
                        <LayoutGrid className="w-4 h-4 ml-2" /> خلايا المنحل
                    </TabsTrigger>
                    <TabsTrigger value="split" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 py-3">
                        <GitFork className="w-4 h-4 ml-2" /> التقسيم
                    </TabsTrigger>
                    <TabsTrigger value="merge" className="data-[state=active]:bg-white data-[state=active]:text-red-700 py-3">
                        <Combine className="w-4 h-4 ml-2" /> دمج وتحديث
                    </TabsTrigger>
                    <TabsTrigger value="super" className="data-[state=active]:bg-white data-[state=active]:text-green-700 py-3">
                        <ArrowUp className="w-4 h-4 ml-2" /> رفع أدوار وعاسلات
                    </TabsTrigger>
                    <TabsTrigger value="setup" className="data-[state=active]:bg-white data-[state=active]:text-amber-700 py-3">
                        <Settings className="w-4 h-4 ml-2" /> تهيئة خلايا
                    </TabsTrigger>
                </TabsList>

                {/* Search Bar (Shared) */}
                <div className="my-6 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                        placeholder="بحث برقم الخلية أو الاسم..."
                        className="pr-10 py-6 text-lg bg-white shadow-sm border-gray-200"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Hive List Tab */}
                <TabsContent value="inspection" className="mt-0">
                    {/* Filter & Sort Bar */}
                    <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Filter className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 ml-1">النوع:</span>
                            <Button
                                variant={hiveTypeFilter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setHiveTypeFilter("all")}
                                className={hiveTypeFilter === "all" ? "bg-amber-600 hover:bg-amber-700" : ""}
                            >
                                الكل
                            </Button>
                            <Button
                                variant={hiveTypeFilter === "TRADITIONAL" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setHiveTypeFilter("TRADITIONAL")}
                                className={hiveTypeFilter === "TRADITIONAL" ? "bg-amber-600 hover:bg-amber-700" : ""}
                            >
                                بلدي
                            </Button>
                            <Button
                                variant={hiveTypeFilter === "LANGSTROTH" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setHiveTypeFilter("LANGSTROTH")}
                                className={hiveTypeFilter === "LANGSTROTH" ? "bg-amber-600 hover:bg-amber-700" : ""}
                            >
                                لانجستروث
                            </Button>
                            <Button
                                variant={hiveTypeFilter === "NUC" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setHiveTypeFilter("NUC")}
                                className={hiveTypeFilter === "NUC" ? "bg-amber-600 hover:bg-amber-700" : ""}
                            >
                                نويات
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <ArrowUpDown className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">ترتيب:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => {
                                    setSortBy(e.target.value);
                                    localStorage.setItem('hiveSortPreference', e.target.value);
                                }}
                                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            >
                                <option value="number">الرقم</option>
                                <option value="strength-desc">القوة (الأقوى أولاً)</option>
                                <option value="strength-asc">القوة (الأضعف أولاً)</option>
                            </select>
                        </div>
                    </div>

                    {/* Hive List */}
                    <div className="space-y-4">
                        {filteredHives.map(hive => {
                            const frames = Array.isArray(hive.frames) ? hive.frames : [];
                            const usedFrames = frames.filter((f: any) => f.frameType !== 'EMPTY').length;
                            const emptyFrames = frames.filter((f: any) => f.frameType === 'EMPTY').length;
                            const avgBrood = frames.length ? Math.round(frames.reduce((s: number, f: any) => s + (f.broodPercentage || 0), 0) / frames.length) : 0;
                            const avgHoney = frames.length ? Math.round(frames.reduce((s: number, f: any) => s + (f.honeyPercentage || 0), 0) / frames.length) : 0;
                            const avgPollen = frames.length ? Math.round(frames.reduce((s: number, f: any) => s + (f.pollenPercentage || 0), 0) / frames.length) : 0;
                            const lastInspection = hive.lastInspectionDate || hive.inspections?.[0]?.inspectionDate || null;
                            const strengthLabel = hive.strengthRating || hive.strength || 'UNRATED';

                            return (
                                <div key={hive.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all">
                                    {/* Top Row: Badges + Title */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg ${
                                                ['VERY_STRONG', 'STRONG'].includes(hive.strengthRating) ? 'bg-green-500' :
                                                (hive.strengthRating) === 'MEDIUM' ? 'bg-amber-500' :
                                                ['WEAK', 'VERY_WEAK', 'CRITICAL'].includes(hive.strengthRating) ? 'bg-red-500' :
                                                'bg-gray-400'
                                            }`}>
                                                {hive.hiveNumber?.replace(/^0+/, '') || '?'}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    خلية {hive.hiveNumber}
                                                    {hive.name && <span className="text-sm font-normal text-gray-500 mr-2">({hive.name})</span>}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
                                                        {hive.hiveType?.nameEn === 'Baladi' ? 'بلدي' :
                                                         hive.hiveType?.nameEn === 'Kenyan Top Bar' ? 'كيني' :
                                                         (hive.framesPerBox && hive.framesPerBox <= 6) || hive.hiveNumber?.toLowerCase().startsWith('n') ? 'نوية' :
                                                         'لانجستروث'}
                                                    </Badge>
                                                    <Badge variant="outline" className={`text-xs ${
                                                        ['VERY_STRONG', 'STRONG'].includes(hive.strengthRating) ? 'bg-green-50 text-green-700 border-green-200' :
                                                        ['WEAK', 'VERY_WEAK', 'CRITICAL'].includes(hive.strengthRating) ? 'bg-red-50 text-red-700 border-red-200' :
                                                        'bg-gray-50 text-gray-600 border-gray-200'
                                                    }`}>
                                                        {strengthLabel === 'VERY_STRONG' ? 'ممتازة' :
                                                         strengthLabel === 'STRONG' ? 'جيدة' :
                                                         strengthLabel === 'MEDIUM' ? 'متوسطة' :
                                                         strengthLabel === 'WEAK' ? 'ضعيفة' :
                                                         strengthLabel === 'VERY_WEAK' ? 'ضعيفة جداً' :
                                                         strengthLabel === 'CRITICAL' ? 'حرجة' : 'غير مقيمة'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => handleInspectionClick(hive.id)}
                                            size="sm"
                                            className="gap-1.5 bg-amber-600 hover:bg-amber-700 shrink-0"
                                        >
                                            <ClipboardCheck className="w-4 h-4" />
                                            فحص
                                        </Button>
                                    </div>

                                    {/* Frame Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                                            <div className="text-xs text-gray-500 mb-1">الإطارات</div>
                                            <div className="font-bold text-gray-900 text-lg">{frames.length}/{hive.framesPerBox || 10}</div>
                                            <div className="text-xs text-gray-400">
                                                {usedFrames > 0 ? `${usedFrames} مستخدم` : 'فارغ'}
                                                {emptyFrames > 0 && ` - ${emptyFrames} فاضي`}
                                            </div>
                                        </div>
                                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                                            <div className="text-xs text-blue-600 mb-1">🍯 العسل</div>
                                            <div className="font-bold text-blue-800 text-lg">{avgHoney}%</div>
                                            <div className="text-xs text-blue-500">{frames.filter((f: any) => f.frameType === 'HONEY' || f.honeyPercentage > 50).length} إطار</div>
                                        </div>
                                        <div className="bg-purple-50 rounded-xl p-3 text-center">
                                            <div className="text-xs text-purple-600 mb-1">🌱 الحضنة</div>
                                            <div className="font-bold text-purple-800 text-lg">{avgBrood}%</div>
                                            <div className="text-xs text-purple-500">{frames.filter((f: any) => f.frameType === 'BROOD' || f.broodPercentage > 50).length} إطار</div>
                                        </div>
                                        <div className="bg-orange-50 rounded-xl p-3 text-center">
                                            <div className="text-xs text-orange-600 mb-1">🌸 حبوب اللقاح</div>
                                            <div className="font-bold text-orange-800 text-lg">{avgPollen}%</div>
                                            <div className="text-xs text-orange-500">{frames.filter((f: any) => f.frameType === 'POLLEN' || f.pollenPercentage > 50).length} إطار</div>
                                        </div>
                                    </div>

                                    {/* Bottom Row: Meta Data */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-4">
                                            {lastInspection && (
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="w-3.5 h-3.5" />
                                                    آخر فحص: {new Date(lastInspection).toLocaleDateString('ar-SA')}
                                                </span>
                                            )}
                                            {!lastInspection && (
                                                <span className="text-amber-600 font-medium">لم يتم الفحص بعد</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={`w-2 h-2 rounded-full ${
                                                hive.status === 'ACTIVE' ? 'bg-green-500' :
                                                hive.status === 'QUEENLESS' ? 'bg-red-500' :
                                                'bg-gray-400'
                                            }`} />
                                            {hive.status === 'ACTIVE' ? 'نشطة' :
                                             hive.status === 'QUEENLESS' ? 'بلا ملكة' :
                                             hive.status === 'INACTIVE' ? 'غير نشطة' : 'نشطة'}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {filteredHives.length === 0 && !loading && (
                            <div className="py-20 text-center bg-white/40 rounded-xl border-2 border-dashed border-gray-200">
                                <p className="text-gray-500">لا توجد خلايا تطابق بحثك</p>
                            </div>
                        )}
                    </div>
                </TabsContent>






                {/* 2. Setup Tab */}
                <TabsContent value="setup" className="mt-0">
                    <div className="space-y-4">
                        {(() => {
                            const unconfiguredHives = filteredHives.filter(h => !isHiveConfigured(h));
                            if (filteredHives.length === 0 && !loading) {
                                return (
                                    <div className="py-20 text-center bg-white/40 rounded-xl border-2 border-dashed border-gray-200">
                                        <p className="text-gray-500">لا توجد خلايا في هذا المنحل</p>
                                    </div>
                                );
                            }
                            if (unconfiguredHives.length === 0) {
                                return (
                                    <div className="py-16 text-center bg-green-50 rounded-2xl border-2 border-green-200">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-green-800">تم تهيئة جميع الخلايا!</h3>
                                        <p className="text-green-600 mt-2">جميع خلايا المنحل مكتملة البيانات وجاهزة.</p>
                                    </div>
                                );
                            }
                            return (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-sm text-gray-500">
                                            إجمالي {unconfiguredHives.length} خلية{' '}
                                            {filteredHives.length - unconfiguredHives.length > 0 &&
                                                `(مهيأة: ${filteredHives.length - unconfiguredHives.length})`
                                            }
                                        </p>
                                    </div>
                                    {unconfiguredHives.map(hive => (
                                        <div key={hive.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow border-r-4 border-r-amber-400">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="outline" className="bg-amber-50 text-amber-900 border-amber-200">
                                                                    {hive.hiveType?.nameEn === 'Baladi' ? 'بلدي' :
                                                                     hive.hiveType?.nameEn === 'Kenyan Top Bar' ? 'كيني' :
                                                                     (hive.framesPerBox && hive.framesPerBox <= 6) || hive.hiveNumber?.toLowerCase().startsWith('n') ? 'نوية' :
                                                                     'لانجستروث'}
                                                                </Badge>
                                                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                                                    غير مهيأة
                                                                </Badge>
                                                            </div>
                                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                                <div dir="ltr" className="text-amber-600">#{hive.hiveNumber}</div>
                                                                {hive.name && <span className="text-sm font-normal text-gray-500">({hive.name})</span>}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Activity className="w-4 h-4" />
                                                            <span className="text-sm">{hive.strengthRating === 'VERY_STRONG' ? 'ممتازة' :
                                                                    hive.strengthRating === 'STRONG' ? 'جيدة' :
                                                                    hive.strengthRating === 'MEDIUM' ? 'متوسطة' :
                                                                    hive.strengthRating === 'WEAK' ? 'ضعيفة' :
                                                                    hive.strengthRating === 'VERY_WEAK' ? 'ضعيفة جداً' :
                                                                    hive.strengthRating === 'CRITICAL' ? 'حرجة' : 'غير مقيمة'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <Settings className="w-4 h-4" />
                                                            <span className="text-sm">تحتاج تهيئة</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="md:w-32">
                                                    <Button
                                                        onClick={() => handleSetupClick(hive)}
                                                        className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        تهيئة
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            );
                        })()}
                    </div>
                </TabsContent>

                {/* 3. Split Tab */}
                <TabsContent value="split" className="mt-0">
                    <SplitTab />
                </TabsContent>

                {/* 4. Merge Tab */}
                <TabsContent value="merge" className="mt-0">
                    <MergeTab />
                </TabsContent>

                {/* 5. Super Tab */}
                <TabsContent value="super" className="mt-0">
                    <SuperTab />
                </TabsContent>
            </Tabs>

            <CreateHiveModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
                apiaryId={apiaryId}
                nextHiveNumber={nextHiveNumber}
                nextNucNumber={nextNucNumber}
            />

            {/* Inspection Modal */}
            {selectedHiveForInspection && apiaryId && (
                <InspectionModal
                    hiveId={selectedHiveForInspection}
                    apiaryId={apiaryId}
                    isOpen={true}
                    onClose={handleInspectionClose}
                    onSuccess={handleInspectionSuccess}
                />
            )}

            {/* Setup Modal */}
            {selectedHiveForSetup && apiaryId && (
                <SetupModal
                    hiveId={selectedHiveForSetup.id}
                    apiaryId={apiaryId}
                    isOpen={true}
                    onClose={handleSetupClose}
                    onSuccess={handleSetupSuccess}
                    hiveNumber={selectedHiveForSetup.number}
                />
            )}
        </div>
    );
}
