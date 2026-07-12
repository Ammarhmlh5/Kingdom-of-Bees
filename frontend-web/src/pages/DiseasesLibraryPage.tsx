import React, { useState } from 'react';
import { useDiseases } from '@/hooks/api';
import type { Disease } from '@/services/diseases';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Bug, AlertTriangle, Shield, Archive, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DiseasesLibraryPage() {
    const { data: diseases = [], isLoading: loading } = useDiseases();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('ALL');

    const filteredDiseases = diseases.filter((d: any) => {
        const matchesSearch =
            d.nameAr.includes(searchTerm) ||
            d.nameEn.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || d.diseaseType === filterType;
        return matchesSearch && matchesType;
    });

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'CATASTROPHIC': return 'bg-red-600 text-white';
            case 'SEVERE': return 'bg-orange-600 text-white';
            case 'MODERATE': return 'bg-yellow-500 text-black';
            case 'MILD': return 'bg-blue-500 text-white';
            default: return 'bg-gray-500 text-white';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                        <Bug className="w-10 h-10 text-brand-600" />
                        مكتبة الأمراض
                    </h1>
                    <p className="text-gray-500 mt-2">
                        دليل شامل لأمراض النحل وطرق العلاج والوقاية
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Shield className="w-4 h-4" />
                        بروتوكولات الوقاية
                    </Button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1">
                    <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="ابحث عن مرض..."
                        className="pr-10 bg-gray-50/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['ALL', 'BACTERIAL', 'VIRAL', 'FUNGAL', 'PARASITIC', 'PEST'].map((type: any) => (
                        <Button
                            key={type}
                            variant={filterType === type ? 'default' : 'ghost'}
                            onClick={() => setFilterType(type)}
                            className="whitespace-nowrap px-4"
                        >
                            {type === 'ALL' ? 'الكل' : type}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                </div>
            ) : filteredDiseases.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                    <Archive className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">لا توجد أمراض مطابقة</h3>
                    <p className="text-gray-500">حاول تغيير مصطلحات البحث أو الفلاتر</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDiseases.map((disease: any) => (
                        <Link to={`/diseases/${disease.id}`} key={disease.id} className="group">
                            <Card className="h-full hover:shadow-xl transition-all duration-300 border-gray-100 group-hover:border-brand-200 bg-white overflow-hidden">
                                <div className="h-32 bg-gray-100 relative">
                                    {/* Placeholder for Image */}
                                    {disease.imageUrl ? (
                                        <img src={disease.imageUrl} alt={disease.nameAr} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-50/50">
                                            <Bug className="w-12 h-12 text-brand-200" />
                                        </div>
                                    )}
                                    <Badge className={`absolute top-3 left-3 ${getSeverityColor(disease.severity)} shadow-sm`}>
                                        {disease.severity}
                                    </Badge>
                                </div>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">
                                                {disease.nameAr}
                                            </CardTitle>
                                            <CardDescription className="font-mono text-xs opacity-60 mt-1">
                                                {disease.scientificName || disease.nameEn}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                                            {disease.diseaseType}
                                        </Badge>
                                        {disease.contagiousness !== 'NONE' && (
                                            <Badge variant="outline" className="border-orange-200 text-orange-700 bg-orange-50">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                معدي: {disease.contagiousness}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-3">
                                        {disease.description || "لا يوجد وصف متاح."}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-500">
                                        <span>{disease.treatable ? '✅ قابل للعلاج' : '⚠️ صعب العلاج'}</span>
                                        <span className="group-hover:translate-x-[-4px] transition-transform text-brand-600 font-bold">
                                            التفاصيل &larr;
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
