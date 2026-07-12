import { useState } from 'react';
import { Copy, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { fetchWithAuth } from '@/config';

interface InviteCodeGeneratorProps {
    apiaryId: string;
    apiaryName: string;
    open: boolean;
    onClose: () => void;
}

export function InviteCodeGenerator({ apiaryId, apiaryName, open, onClose }: InviteCodeGeneratorProps) {
    const [inviteCode, setInviteCode] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const generateCode = async () => {
        try {
            setLoading(true);
            const response = await fetchWithAuth(`/apiaries/${apiaryId}/invite`, {
                method: 'POST'
            });

            if (!response.ok) {
                throw new Error('فشل في توليد كود الدعوة');
            }

            const data = await response.json();
            setInviteCode(data.inviteCode);
        } catch (error) {
            console.error('Error generating invite code:', error);
            alert('حدث خطأ أثناء توليد كود الدعوة');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        const inviteUrl = `${window.location.origin}/join?code=${inviteCode}`;
        navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setInviteCode('');
        setCopied(false);
        onClose();
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>دعوة عامل للمنحل</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-muted-foreground mb-2">
                            المنحل: <span className="font-semibold text-foreground">{apiaryName}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            قم بتوليد كود دعوة ومشاركته مع العامل للانضمام للمنحل
                        </p>
                    </div>

                    {!inviteCode ? (
                        <Button
                            onClick={generateCode}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'جاري التوليد...' : 'توليد كود الدعوة'}
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <Input
                                    value={inviteCode}
                                    readOnly
                                    className="font-mono text-center text-lg"
                                />
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={generateCode}
                                    disabled={loading}
                                    title="توليد كود جديد"
                                >
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>

                            <Button
                                onClick={copyToClipboard}
                                className="w-full"
                                variant={copied ? "default" : "secondary"}
                            >
                                {copied ? (
                                    <>✓ تم النسخ</>
                                ) : (
                                    <>
                                        <Copy className="h-4 w-4 ml-2" />
                                        نسخ رابط الدعوة
                                    </>
                                )}
                            </Button>

                            <div className="text-xs text-muted-foreground bg-secondary p-3 rounded">
                                <p className="font-semibold mb-1">كيفية الاستخدام:</p>
                                <ol className="list-decimal list-inside space-y-1">
                                    <li>انسخ رابط الدعوة</li>
                                    <li>أرسله للعامل عبر واتساب أو بريد إلكتروني</li>
                                    <li>سيتمكن من الانضمام مباشرة</li>
                                </ol>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
