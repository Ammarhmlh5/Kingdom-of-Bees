import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Sprout, MessageCircle, Cloud, BookOpen } from 'lucide-react';

export default function ExplorePage() {
  const navigate = useNavigate();

  const features = [
    { icon: Sprout, label: 'الأزهار والنباتات', desc: 'تقويم إزهار النباتات', path: '/flora', color: 'text-green-500' },
    { icon: MessageCircle, label: 'المستشار الذكي', desc: 'اسأل خبير النحل AI', path: '/advisor', color: 'text-blue-500' },
    { icon: Cloud, label: 'حالة الطقس', desc: 'تنبؤات الطقس للمنحل', path: '/weather', color: 'text-cyan-500' },
    { icon: BookOpen, label: 'دليل النحال', desc: 'مقالات ونصائح', path: '/guide', color: 'text-purple-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="استكشف" />

      <div className="flex-1 px-4 py-4">
        <div className="space-y-3">
          {features.map(({ icon: Icon, label, desc, path, color }) => (
            <Card key={path} onClick={() => navigate(path)}>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm">{label}</h3>
                  <p className="text-xs text-bee-muted">{desc}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
