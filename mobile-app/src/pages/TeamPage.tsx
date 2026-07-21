import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus, Mail, Calendar, Trash2, Shield, User, X, Loader2 } from 'lucide-react';
import apiClient from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface TeamMember {
  userId: string;
  name: string;
  email: string;
  role: 'owner' | 'assistant';
  joinedAt: string | null;
}

const roleConfig: Record<string, { bg: string; label: string; icon: React.JSX.Element }> = {
  owner: { bg: 'bg-honey/10 text-honey', label: 'المالك', icon: <Shield size={12} /> },
  assistant: { bg: 'bg-blue-100 text-blue-700', label: 'مساعد', icon: <User size={12} /> },
};

export default function TeamPage() {
  const { id: apiaryId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<{ open: boolean; userId: string; name: string }>({ open: false, userId: '', name: '' });

  useEffect(() => { loadMembers(); }, [apiaryId]);

  const loadMembers = async () => {
    if (!apiaryId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/apiaries/${apiaryId}/members`);
      const membersData = response.data?.data !== undefined ? response.data.data : response.data;
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !apiaryId) return;
    setInviting(true);
    try {
      await apiClient.post(`/apiaries/${apiaryId}/members`, { email: inviteEmail.trim() });
      toast.success('تم إرسال الدعوة بنجاح');
      setInviteOpen(false);
      setInviteEmail('');
      loadMembers();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'خطأ في إرسال الدعوة');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (memberUserId: string) => {
    if (!apiaryId) return;
    try {
      await apiClient.delete(`/apiaries/${apiaryId}/members/${memberUserId}`);
      setMembers(prev => prev.filter(m => m.userId !== memberUserId));
      toast.success('تم إزالة العضو');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="الفريق" subtitle="جاري التحميل..." />
        <div className="flex-1 px-4 py-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse"><div className="h-16 bg-bee-border/50 rounded-lg" /></Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="الفريق" subtitle={`${members.length} أعضاء`} />

      <div className="flex-1 px-4 py-4 space-y-4">
        {members.length === 0 ? (
          <div className="text-center py-12 text-bee-muted">
            <User size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">لا يوجد أعضاء</p>
            <p className="text-sm">ادعُ أعضاء للبدء</p>
          </div>
        ) : (
          members.map(member => (
            <Card key={member.userId}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-bee-border flex items-center justify-center text-sm font-bold text-bee-text">
                    {member.name?.charAt(0) || '?'}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm">{member.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-bee-muted">
                      <Mail size={12} />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${roleConfig[member.role]?.bg || 'bg-gray-100 text-gray-600'}`}>
                        {roleConfig[member.role]?.icon || <User size={12} />}
                        {roleConfig[member.role]?.label || member.role}
                      </span>
                      {member.joinedAt && (
                        <div className="flex items-center gap-1 text-[10px] text-bee-muted">
                          <Calendar size={10} />
                          {new Date(member.joinedAt).toLocaleDateString('ar-SA')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {member.role !== 'owner' && (
                  <button onClick={() => setRemoveConfirm({ open: true, userId: member.userId, name: member.name })}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <button onClick={() => setInviteOpen(true)}
        className="fixed bottom-24 left-4 w-14 h-14 bg-honey text-white rounded-full shadow-lg flex items-center justify-center hover:bg-honey-dark active:scale-95 transition-all z-40">
        <Plus size={28} />
      </button>

      {inviteOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">دعوة عضو</h3>
              <button onClick={() => setInviteOpen(false)} className="p-1 text-bee-muted hover:text-bee-text">
                <X size={20} />
              </button>
            </div>
            <div>
              <label className="text-sm font-medium text-bee-text block mb-1">البريد الإلكتروني</label>
              <input type="email" placeholder="example@email.com" dir="ltr" value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-bee-border text-sm text-left" />
            </div>
            <Button fullWidth onClick={handleInvite} disabled={!inviteEmail.trim() || inviting}>
              {inviting ? <Loader2 className="animate-spin" size={16} /> : <Mail size={16} />}
              {inviting ? 'جاري الإرسال...' : 'إرسال الدعوة'}
            </Button>
          </div>
        </div>
      )}

      {removeConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">تأكيد الإزالة</h3>
              <button onClick={() => setRemoveConfirm({ open: false, userId: '', name: '' })} className="p-1 text-bee-muted hover:text-bee-text">
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-bee-text mb-6">
              هل أنت متأكد من إزالة <strong>"{removeConfirm.name}"</strong> من الفريق؟
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={() => setRemoveConfirm({ open: false, userId: '', name: '' })}>
                إلغاء
              </Button>
              <Button variant="danger" fullWidth onClick={async () => {
                await handleRemove(removeConfirm.userId);
                setRemoveConfirm({ open: false, userId: '', name: '' });
              }}>
                إزالة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
