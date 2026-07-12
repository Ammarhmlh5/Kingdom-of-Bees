import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { createApiary } from '@/services/apiaries';

interface CreateApiaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateApiaryModal({ isOpen, onClose, onSuccess }: CreateApiaryModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'STATIONARY',
        region: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await createApiary(formData);
            if (result && result.success) {
                onSuccess();
                onClose();
                setFormData({ name: '', type: 'STATIONARY', region: '', description: '' });
            } else {
                setError(result?.message || 'فشل إنشاء المنحل');
            }
        } catch (err: any) {
            setError(err.message || 'حدث خطأ غير متوقع');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إضافة منحل جديد">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-bold">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">اسم المنحل</label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="مثال: منحل الوادي"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">نوع المنحل</label>
                    <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    >
                        <option value="STATIONARY">ثابت (Stationary)</option>
                        <option value="MIGRATORY">متنقل (Migratory)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">المنطقة</label>
                    <input
                        type="text"
                        value={formData.region}
                        onChange={e => setFormData({ ...formData, region: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        placeholder="مثال: الرياض"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">وصف</label>
                    <textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all h-24 resize-none"
                        placeholder="معلومات إضافية عن المنحل..."
                    />
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                    >
                        إلغاء
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'جاري الحفظ...' : 'حفظ المنحل'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
