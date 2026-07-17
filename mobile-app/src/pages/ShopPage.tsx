import { useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { ShoppingCart, Store, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const PRODUCTS = [
  { id: 1, name: 'عسل طبيعي 100%', price: '80 ر.س', category: 'عسل', emoji: '🍯', desc: 'عسل خالص من مناحل طبيعية' },
  { id: 2, name: 'شمع نحل', price: '45 ر.س', category: 'منتجات', emoji: '🕯️', desc: 'شمع طبيعي عالي الجودة' },
  { id: 3, name: 'ملكة نحل إيطالية', price: '200 ر.س', category: 'ملكات', emoji: '👑', desc: 'ملكات مختبرة ومضمونة' },
  { id: 4, name: 'خلايا خشبية', price: '350 ر.س', category: 'معدات', emoji: '📦', desc: 'خلايا يدوية الصنع' },
  { id: 5, name: 'دواء فاروا عضوي', price: '60 ر.س', category: 'علاج', emoji: '💊', desc: 'علاج عضوي آمن للنحل' },
  { id: 6, name: 'حقيبة نحال', price: '180 ر.س', category: 'معدات', emoji: '🎒', desc: 'حقيبة احترافية شاملة' },
];

const CATEGORIES = ['الكل', 'عسل', 'منتجات', 'ملكات', 'معدات', 'علاج'];

export default function ShopPage() {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [category, setCategory] = useState('الكل');

  const filtered = category === 'الكل' ? PRODUCTS : PRODUCTS.filter(p => p.category === category);

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Header title="السوق" subtitle="منتجات النحل" />

      <div className="flex gap-2 px-4 py-3">
        <button onClick={() => setTab('buy')}
          className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors', tab === 'buy' ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted')}>
          <ShoppingCart size={16} /> شراء
        </button>
        <button onClick={() => setTab('sell')}
          className={cn('flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors', tab === 'sell' ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted')}>
          <Store size={16} /> بيع
        </button>
      </div>

      <div className="flex-1 px-4">
        {tab === 'buy' ? (
          <>
            <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategory(cat)}
                  className={cn('flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
                    category === cat ? 'bg-honey text-white' : 'bg-bee-border text-bee-muted')}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {filtered.map(product => (
                <Card key={product.id}>
                  <div className="text-center">
                    <div className="text-4xl mb-2">{product.emoji}</div>
                    <h3 className="text-sm font-bold text-bee-text">{product.name}</h3>
                    <p className="text-xs text-bee-muted mt-1">{product.desc}</p>
                    <span className="inline-block text-xs text-bee-muted bg-bee-bg px-2 py-0.5 rounded-full mt-2">{product.category}</span>
                    <p className="text-honey font-bold mt-2">{product.price}</p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-bee-muted">
            <Store size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-bold">بيع منتجاتك</p>
            <p className="text-sm mt-1">يمكنك بيع منتجات النحل والمشاركة مع النحالين</p>
            <div className="mt-4 space-y-2 text-right">
              <Card>
                <p className="text-sm font-medium">🍯 عسل طبيعي</p>
                <p className="text-xs text-bee-muted">أضف منتجك للبيع</p>
              </Card>
              <Card>
                <p className="text-sm font-medium">👑 ملكات نحل</p>
                <p className="text-xs text-bee-muted">أضف ملكاتك للبيع</p>
              </Card>
              <Card>
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
