import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

interface JoinApiaryDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ApiaryInfo {
    id: string;
    name: string;
    address: string;
    type: string;
    owner: {
        fullName: string;
    };
}

export function JoinApiaryDialog({ open, onClose, onSuccess }: JoinApiaryDialogProps) {
    const [step, setStep] = useState<'search' | 'register'>('search');
    const [inviteCode, setInviteCode] = useState('');
    const [apiaryInfo, setApiaryInfo] = useState<ApiaryInfo | null>(null);
    const [loading, setLoading] = useState(false);

    // Registration form
    const [fullName, setFullName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const searchApiary = async () => {
        if (!inviteCode.trim()) {
            alert('الرجاء إدخال كود الدعوة');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch(`http://localhost:4000/api/apiaries/search?inviteCode=${inviteCode}`);

            if (!response.ok) {
                throw new Error('كود الدعوة غير صالح');
            }

            const data = await response.json();
            setApiaryInfo(data);
            setStep('register');
        } catch (error: any) {
            alert(error.message || 'حدث خطأ أثناء البحث');
        } finally {
            setLoading(false);
        }
    };

    const joinApiary = async () => {
        if (!fullName || !identifier || !password) {
            alert('الرجاء ملء جميع الحقول');
            return;
        }

        try {
            setLoading(true);
            const response = await fetch('http://localhost:4000/api/apiaries/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inviteCode,
                    fullName,
                    identifier,
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'فشل الانضمام');
            }

            const data = await response.json();

            // Save auth data
            localStorage.setItem('auth_token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            alert(data.message || 'تم الانضمام بنجاح!');
            handleClose();
            onSuccess();

            // Reload to update auth context
            window.location.reload();
        } catch (error: any) {
            alert(error.message || 'حدث خطأ أثناء الانضمام');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setStep('search');
        setInviteCode('');
        setApiaryInfo(null);
        setFullName('');
        setIdentifier('');
        setPassword('');
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>الانضمام لمنحل</DialogTitle>
                </DialogHeader>

                {step === 'search' ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-4">
                                أدخل كود الدعوة الذي حصلت عليه من مالك المنحل
                            </p>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="BEE-XXXXXX"
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    className="font-mono"
                                />
                                <Button
                                    onClick={searchApiary}
                                    disabled={loading}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Apiary Info Card */}
                        <Card className="p-4 bg-secondary/50">
                            <h3 className="font-semibold text-lg mb-2">{apiaryInfo?.name}</h3>
                            <div className="text-sm text-muted-foreground space-y-1">
                                <p>📍 {apiaryInfo?.address || 'غير محدد'}</p>
                                <p>👤 المالك: {apiaryInfo?.owner.fullName}</p>
                                <p>🏷️ النوع: {apiaryInfo?.type === 'FIXED' ? 'ثابت' : 'متنقل'}</p>
                            </div>
                        </Card>

                        {/* Registration Form */}
                        <div className="space-y-3">
                            <p className="text-sm font-semibold">معلومات الدخول:</p>

                            <Input
                                placeholder="الاسم الكامل"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />

                            <Input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                            />

                            <Input
                                type="password"
                                placeholder="كلمة المرور"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            <p className="text-xs text-muted-foreground">
                                إذا كان لديك حساب، سيتم تسجيل دخولك تلقائياً
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setStep('search')}
                                className="flex-1"
                            >
                                رجوع
                            </Button>
                            <Button
                                onClick={joinApiary}
                                disabled={loading}
                                className="flex-1"
                            >
                                <UserPlus className="h-4 w-4 ml-2" />
                                {loading ? 'جاري الانضمام...' : 'انضمام ودخول'}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
