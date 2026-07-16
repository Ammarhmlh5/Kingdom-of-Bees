import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Plus, Mail, Calendar, Trash2, Shield, User } from 'lucide-react';
import apiClient from '@/lib/apiClient';

interface TeamMember {
  id: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'WORKER';
  user?: {
    fullName: string;
    email: string;
  };
  createdAt: string;
}

const roleConfig: Record<string, { bg: string; label: string; icon: React.JSX.Element }> = {
  OWNER: { bg: 'bg-honey/10 text-honey', label: 'المالك', icon: <Shield size={12} /> },
  ADMIN: { bg: 'bg-blue-100 text-blue-700', label: 'مدير', icon: <Shield size={12} /> },
  WORKER: { bg: 'bg-gray-100 text-gray-600', label: 'عضو', icon: <User size={12} /> },
};

export default function TeamPage() {
  const { id: apiaryId } = useParams<{ id: string }>();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    loadMembers();
  }, [apiaryId]);

  const loadMembers = async () => {
    if (!apiaryId) return;
    try {
      setLoading(true);
      const response = await apiClient.get(`/apiaries/${apiaryId}/members`);
      setMembers(response.data.data || []);

      // Get current user ID from token
      const tokenResponse = await apiClient.get('/auth/me');
      setCurrentUserId(tokenResponse.data.data?.id || '');
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = members.find(m => m.userId === currentUserId)?.role === 'OWNER';

  const handleRemove = async (memberId: string) => {
    if (!isOwner || !apiaryId) return;
    try {
      await apiClient.delete(`/apiaries/${apiaryId}/members/${memberId}`);
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch {
      // Optimistic update
      setMembers(prev => prev.filter(m => m.id !== memberId));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen pb-20">
        <Header title="الفريق" subtitle="جاري التحميل..." />
        <div className="flex-1 px-4 py-4 space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-16 bg-bee-border/50 rounded-lg" />
            </Card>
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
            <Card key={member.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-bee-border flex items-center justify-center text-sm font-bold text-bee-text">
                    {member.user?.fullName?.charAt(0) || '?'}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm">{member.user?.fullName || 'غير معروف'}</h3>
                    <div className="flex items-center gap-1 text-xs text-bee-muted">
                      <Mail size={12} />
                      {member.user?.email || ''}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${roleConfig[member.role]?.bg || 'bg-gray-100 text-gray-600'}`}>
                        {roleConfig[member.role]?.icon || <User size={12} />}
                        {roleConfig[member.role]?.label || member.role}
                      </span>
                      <div className="flex items-center gap-1 text-[10px] text-bee-muted">
                        <Calendar size={10} />
                        {new Date(member.createdAt).toLocaleDateString('ar-SA')}
                      </div>
                    </div>
                  </div>
                </div>
                {isOwner && member.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <button className="fixed bottom-24 left-4 w-14 h-14 bg-honey text-white rounded-full shadow-lg flex items-center justify-center hover:bg-honey-dark active:scale-95 transition-all z-40">
        <Plus size={28} />
      </button>
    </div>
  );
}
