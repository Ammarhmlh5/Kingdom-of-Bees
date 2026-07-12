import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiseases, useApiaries, useCreateDiseaseRecord } from '@/hooks/api';
import type { Disease } from '@/services/diseases';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Search } from 'lucide-react';

export default function ReportDiseasePage() {
    // State
    const [step, setStep] = useState(1);

    // Hooks
    const { data: apiaries = [] } = useApiaries();
    const { data: diseases = [] } = useDiseases();
    const createDiseaseMutation = useCreateDiseaseRecord();

    // Selection
    const [selectedApiaryId, setSelectedApiaryId] = useState<string>('');
    const [selectedDiseaseId, setSelectedDiseaseId] = useState<string>('');
    const [affectedHiveIds, setAffectedHiveIds] = useState<string[]>([]); // Mock selection for now

    // Search
    const [diseaseSearch, setDiseaseSearch] = useState('');

    const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!selectedApiaryId || !selectedDiseaseId) return;
        try {
            await createDiseaseMutation.mutateAsync({
                apiaryId: selectedApiaryId,
                diseaseId: selectedDiseaseId,
                affectedHives: affectedHiveIds, // Empty for apiary-wide or user selected later
                date: new Date().toISOString()
            });
            navigate('/diseases?success=true');
        } catch (e) {
            console.error(e);
            alert("Failed to create record");
        }
    };

    const filteredDiseases = diseases.filter((d: any) =>
        d.nameAr.includes(diseaseSearch) || d.nameEn.toLowerCase().includes(diseaseSearch.toLowerCase())
    );

    return (
        <div className="max-w-2xl mx-auto py-10 space-y-8 animate-in fade-in">
            <div className="text-center">
                <h1 className="text-3xl font-black text-gray-900">الإبلاغ عن حالة مرضية</h1>
                <p className="text-gray-500 mt-2">ساعد في حماية النحل بالإبلاغ المبكر عن الإصابات</p>
            </div>

            {/* Step 1: Select Apiary */}
            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>1. اختر المنحل المصاب</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {apiaries.map((apiary: any) => (
                                <div
                                    key={apiary.id}
                                    onClick={() => setSelectedApiaryId(apiary.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedApiaryId === apiary.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'}`}
                                >
                                    <h3 className="font-bold">{apiary.name}</h3>
                                    <p className="text-sm text-gray-500">{apiary.location || 'No location'}</p>
                                </div>
                            ))}
                        </div>
                        <Button
                            className="w-full mt-4"
                            disabled={!selectedApiaryId}
                            onClick={() => setStep(2)}
                        >
                            التالي
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Select Disease */}
            {step === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle>2. تحديد المرض أو الآفة</CardTitle>
                        <CardDescription>ابحث واختر المرض الذي تشتبه به</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="ابحث باسم المرض..."
                                className="pr-10"
                                value={diseaseSearch}
                                onChange={(e) => setDiseaseSearch(e.target.value)}
                            />
                        </div>
                        <div className="h-64 overflow-y-auto space-y-2 border rounded-lg p-2">
                            {filteredDiseases.map((disease: any) => (
                                <div
                                    key={disease.id}
                                    onClick={() => setSelectedDiseaseId(disease.id)}
                                    className={`p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-50 ${selectedDiseaseId === disease.id ? 'bg-red-50 ring-1 ring-red-200' : ''}`}
                                >
                                    <div>
                                        <p className="font-bold text-gray-900">{disease.nameAr}</p>
                                        <p className="text-xs text-gray-500">{disease.scientificName}</p>
                                    </div>
                                    {selectedDiseaseId === disease.id && <CheckCircle className="w-5 h-5 text-red-600" />}
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">رجوع</Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                disabled={!selectedDiseaseId}
                                onClick={handleSubmit}
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                إبلاغ وتنبيه
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
