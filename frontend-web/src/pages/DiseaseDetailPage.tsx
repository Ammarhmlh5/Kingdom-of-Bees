import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDisease } from '@/hooks/api';
import type { Disease } from '@/services/diseases';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, ArrowRight, Activity, Thermometer, ShieldCheck, Stethoscope } from 'lucide-react';

export default function DiseaseDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { data: disease, isLoading: loading } = useDisease(id || '');

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!disease) return <div className="p-10 text-center">Disease not found</div>;

    const symptoms = Array.isArray(disease.symptoms) ? disease.symptoms :
        typeof disease.symptoms === 'object' ? Object.entries(disease.symptoms).map(([k, v]) => `${k}: ${v}`) : [];

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link to="/diseases" className="hover:text-brand-600">Library</Link>
                <span>/</span>
                <span>{disease.nameEn}</span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">{disease.nameAr}</h1>
                        <p className="text-xl text-gray-500 font-mono italic">{disease.scientificName || disease.nameEn}</p>
                    </div>

                    <div className="flex gap-2">
                        <Badge variant="outline">{disease.diseaseType}</Badge>
                        <Badge className={disease.severity === 'CRITICAL' ? 'bg-red-600' : 'bg-orange-500'}>
                            {disease.severity}
                        </Badge>
                        {disease.contagiousness !== 'NONE' && (
                            <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Contagious: {disease.contagiousness}
                            </Badge>
                        )}
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-brand-600" />
                                Symptoms & Diagnosis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2">
                                {symptoms.map((s: string | any, i: number) => (
                                    <li key={i} className="text-gray-700">
                                        {typeof s === 'string' ? s : JSON.stringify(s)}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-blue-600" />
                                Treatments
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                {disease.treatable ? 'Treatment options available:' : 'No known cure. Management focuses on containment.'}
                            </p>
                            {/* Assuming treatments are included in disease object as per backend */}
                            {(disease as any).treatments?.length > 0 ? (
                                <div className="grid gap-4">
                                    {(disease as any).treatments.map((t: any) => (
                                        <div key={t.id} className="border p-4 rounded-lg bg-blue-50/50">
                                            <h4 className="font-bold text-blue-900">{t.nameAr}</h4>
                                            <p className="text-sm text-blue-700 mt-1">{t.description}</p>
                                            <div className="mt-2 flex gap-2 text-xs">
                                                <Badge variant="outline">{t.type}</Badge>
                                                <span>Effectiveness: {t.effectiveness}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400">No specific treatments listed.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="w-full md:w-80 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Treatable</span>
                                <span className="font-bold">{disease.treatable ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Report Mandatory</span>
                                <span className="font-bold">{(disease as any).reportingMandatory ? 'Yes' : 'No'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2">
                                <span className="text-gray-500">Quarantine</span>
                                <span className="font-bold">{(disease as any).quarantineRequired ? 'Yes' : 'No'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {disease.imageUrl && (
                        <div className="rounded-xl overflow-hidden shadow-lg border">
                            <img src={disease.imageUrl} alt={disease.nameEn} className="w-full h-auto" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
