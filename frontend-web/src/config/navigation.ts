import {
    LayoutDashboard,
    Map as MapIcon,
    Store,
    Users,
    Settings,
    Search,
    FileBarChart,
    Sprout
} from 'lucide-react';

export interface NavItemType {
    label: string;
    href: string;
    icon: any;
    children?: { label: string; href: string; icon?: any }[];
}

export const navItems: NavItemType[] = [
    {
        label: 'الرئيسية',
        href: '/',
        icon: LayoutDashboard,
        children: [
            { label: 'لوحة المعلومات', href: '/' },
            { label: 'التحليلات', href: '/analytics', icon: FileBarChart },
            { label: 'تقارير الإنتاج', href: '/analytics/production', icon: Sprout }
        ]
    },
    {
        label: 'المناحل',
        href: '/apiaries',
        icon: MapIcon,
        children: [
            { label: 'قائمة المناحل', href: '/apiaries' },
            { label: 'خريطة المواقع', href: '/apiaries/map', icon: MapIcon },
            { label: 'تتبع الدفعات', href: '/traceability/batches', icon: Search }
        ]
    },
    {
        label: 'المتجر',
        href: '/marketplace',
        icon: Store
    },
    {
        label: 'فريق العمل',
        href: '/team',
        icon: Users
    },
    {
        label: 'الإعدادات',
        href: '/settings',
        icon: Settings,
        children: [
            { label: 'قوالب الخلايا', href: '/settings' },
            { label: 'مكتبة الأمراض', href: '/diseases' }
        ]
    },
];
