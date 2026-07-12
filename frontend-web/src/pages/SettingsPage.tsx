import React, { useState, useEffect } from 'react';
import { getHiveTemplates, createHiveTemplate, deleteHiveTemplate, HiveTemplate } from '@/services/hiveTemplates';
import { Settings, Plus, Trash2, Box, Info, ClipboardList } from 'lucide-react';
import CreateApiaryWizard from '@/components/wizards/CreateApiaryWizard';
import { DailyOperationsSettings } from '@/components/settings/DailyOperationsSettings';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('templates');
    const [templates, setTemplates] = useState<HiveTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [newTemplate, setNewTemplate] = useState({ name: '', type: 'LANGSTROTH', frames: 10 });
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        const data = await getHiveTemplates();
        setTemplates(data || []);
        setLoading(false);
    };

    const handleCreateTemplate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTemplate.name) return;

        await createHiveTemplate(newTemplate);
        setNewTemplate({ name: '', type: 'LANGSTROTH', frames: 10 });
        loadTemplates();
    };

    const handleDeleteTemplate = async (id: string) => {
        if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
            await deleteHiveTemplate(id);
            loadTemplates();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {isWizardOpen && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <CreateApiaryWizard
                        onClose={() => setIsWizardOpen(false)}
                        onSuccess={() => { setIsWizardOpen(false); /* Refresh apiaries if needed */ }}
                    />
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                        <Settings className="w-10 h-10 text-brand-600" />
                        الإعدادات
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">إدارة قوالب الخلايا وإعدادات المنصة.</p>
                </div>

                <button
                    onClick={() => setIsWizardOpen(true)}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand-600/20 hover:-translate-y-1 active:translate-y-0 flex items-center gap-3 w-fit"
                >
                    <Plus className="w-6 h-6" />
                    <span>إنشاء منحل جديد</span>
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-8 py-5 font-bold text-sm transition-colors relative ${activeTab === 'templates' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        قوالب الخلايا
                        {activeTab === 'templates' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`px-8 py-5 font-bold text-sm transition-colors relative ${activeTab === 'general' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        عام
                        {activeTab === 'general' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('dailyops')}
                        className={`px-8 py-5 font-bold text-sm transition-colors relative ${activeTab === 'dailyops' ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                        <ClipboardList className="w-4 h-4 inline ml-1.5 -mt-0.5" />
                        ضبط العمليات اليومية
                        {activeTab === 'dailyops' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-t-full"></div>}
                    </button>
                </div>

                <div className="p-8">
                    {activeTab === 'templates' && (
                        <div className="space-y-8">
                            <div className="bg-brand-50/50 rounded-2xl p-6 border border-brand-100/50 flex gap-4 items-start">
                                <Info className="w-6 h-6 text-brand-500 shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-brand-900">ما هي قوالب الخلايا؟</h3>
                                    <p className="text-brand-700/80 text-sm mt-1 leading-relaxed">
                                        تساعدك القوالب على تعريف أنواع الخلايا التي تستخدمها (مثل: لانجستروث 10 إطارات، خلية بلدية، إلخ).
                                        عند إنشاء منحل جديد، يمكنك استخدام هذه القوالب لإنشاء عشرات الخلايا دفعة واحدة بنفس المواصفات.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleCreateTemplate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                <div className="md:col-span-1">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">اسم القالب</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="مثال: لانجستروث قياسي"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                        value={newTemplate.name}
                                        onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">نوع الخلية</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                        value={newTemplate.type}
                                        onChange={e => setNewTemplate({ ...newTemplate, type: e.target.value })}
                                    >
                                        <option value="LANGSTROTH">لانجستروث (Langstroth)</option>
                                        <option value="KENYAN">كيني (Kenyan)</option>
                                        <option value="WARRE">واري (Warre)</option>
                                        <option value="BALADI">بلدي (Baladi)</option>
                                        <option value="OTHER">أخرى</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">عدد الإطارات</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="30"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-medium"
                                        value={newTemplate.frames}
                                        onChange={e => setNewTemplate({ ...newTemplate, frames: parseInt(e.target.value) })}
                                    />
                                </div>
                                <button type="submit" className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl h-[50px] flex items-center justify-center gap-2">
                                    <Plus size={18} />
                                    <span>إضافة</span>
                                </button>
                            </form>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {loading ? (
                                    <div className="col-span-full text-center py-10 text-gray-400">جاري التحميل...</div>
                                ) : templates.length === 0 ? (
                                    <div className="col-span-full text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                        <Box className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 font-medium">لا توجد قوالب مضافة بعد</p>
                                    </div>
                                ) : (
                                    templates.map(template => (
                                        <div key={template.id} className="bg-white border border-gray-200 p-5 rounded-2xl flex items-center justify-between hover:border-brand-200 hover:shadow-lg hover:shadow-brand-500/5 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                                    <Box size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{template.name}</h4>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-100 px-2 py-0.5 rounded-md w-fit">
                                                        {template.type} • {template.frames} إطارات
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteTemplate(template.id)}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'general' && (
                        <div className="py-20 text-center text-gray-400">
                            <Settings className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <h3 className="text-lg font-bold">الإعدادات العامة</h3>
                            <p>قريباً...</p>
                        </div>
                    )}

                    {activeTab === 'dailyops' && <DailyOperationsSettings />}
                </div>
            </div>
        </div>
    );
}
