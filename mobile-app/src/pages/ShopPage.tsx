import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { ShoppingCart, Store, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const products = [
  { id: 1, name: 'عسل طبيعي 100%', price: '80 ر.س', category: 'عسل', image: '🍯', description: 'عسل خالص من مناحلنا الطبيعية' },
  { id: 2, name: 'شمع نحل', price: '45 ر.س', category: 'منتجات', image: '🕯️', description: 'شمع طبيعي عالي الجودة' },
  { id: 3, name: 'ملكة نحل إيطالية', price: '200 ر.س', category: 'ملكات', image: '👑', description: 'ملكات مختبرة ومضمونة' },
  { id: 4, name: 'خلايا خشبية (5 أطر)', price: '350 ر.س', category: 'معدات', image: '📦', description: 'خلايا يدوية الصنع' },
  { id: 5, name: 'دواء فاروا عضوي', price: '60 ر.س', category: 'علاج', image: '💊', description: 'علاج عضوي آمن للنحل' },
  { id: 6, name: 'حقيبة نحال', price: '180 ر.س', category: 'معدات', image: '🎒', description: 'حقيبة احترافية شاملة' },
];

export default function ShopPage() {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="السوق" />

      <div className="flex gap-2 px-4 py-3">
        <button
          onClick={() => setTab('buy')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
            tab === 'buy' ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'
          )}
        >
          <ShoppingCart size={16} />
          شراء
        </button>
        <button
          onClick={() => setTab('sell')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors',
            tab === 'sell' ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted'
          )}
        >
          <Store size={16} />
          بيع
        </button>
      </div>

      <div className="flex-1 px-4">
        {tab === 'buy' ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map(product => (
              <Card key={product.id}>
                <div className="text-center">
                  <div className="text-4xl mb-2">{product.image}</div>
                  <h3 className="text-sm font-bold text-bee-text">{product.name}</h3>
                  <p className="text-xs text-bee-muted mt-1">{product.description}</p>
                  <span className="inline-block text-xs text-bee-muted bg-bee-bg px-2 py-0.5 rounded-full mt-2">{product.category}</span>
                  <p className="text-honey font-bold mt-2">{product.price}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-bee-muted">
            <Store size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">بيع منتجاتك</p>
            <p className="text-sm mt-1">يمكنك بيع منتجات النحل وال Mitarbeit您的 منتجاتك</p>
            <div className="mt-4 space-y-2">
              <Card className="text-right">
                <p className="text-sm font-medium">🍯 عسل طبيع</p>
                <p className="text-xs text-bee-muted">أضف منتجك للبيع</p>
              </Card>
              <Card className="text-right">
                <p className="text-sm font-medium">👑 ملكات نحل</p>
                <p className="text-xs text-bee-muted">أضف ملكاتك للبيع</p>
              </Card>
              <Card className="text-right">
                <p className="text-sm font-medium">📦 معدات</p>
                <p className="text-xs text-bee-muted">أضف معداتك للبيع</p>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
