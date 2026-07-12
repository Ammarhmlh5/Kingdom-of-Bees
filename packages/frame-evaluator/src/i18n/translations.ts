export type Language = 'ar' | 'en';

export interface Translations {
  honey: string;
  brood: string;
  beeBread: string;
  empty: string;
  broodAge: {
    eggs: string;
    larvae: string;
    pupae: string;
    capped: string;
    mixed: string;
  };
  validation: {
    totalExceeds: string;
    totalBelow: string;
    broodAgeRequired: string;
    lowResources: string;
    unusualDistribution: string;
  };
  actions: {
    save: string;
    cancel: string;
    undo: string;
    redo: string;
    apply: string;
  };
  labels: {
    percentage: string;
    total: string;
    errors: string;
    warnings: string;
    suggestions: string;
  };
}

export const translations: Record<Language, Translations> = {
  ar: {
    honey: 'العسل',
    brood: 'الحضنة',
    beeBread: 'خبز النحل',
    empty: 'فارغ',
    broodAge: {
      eggs: 'بيض',
      larvae: 'يرقات',
      pupae: 'عذارى',
      capped: 'مغلقة',
      mixed: 'مختلط',
    },
    validation: {
      totalExceeds: 'المجموع يتجاوز 100%',
      totalBelow: 'المجموع أقل من 100%',
      broodAgeRequired: 'يجب تحديد عمر الحضنة عندما تكون نسبة الحضنة > 0%',
      lowResources: 'موارد منخفضة: العسل وخبز النحل أقل من 20%',
      unusualDistribution: 'توزيع غير عادي: نسبة عالية من المساحة الفارغة',
    },
    actions: {
      save: 'حفظ',
      cancel: 'إلغاء',
      undo: 'تراجع',
      redo: 'إعادة',
      apply: 'تطبيق',
    },
    labels: {
      percentage: 'النسبة المئوية',
      total: 'المجموع',
      errors: 'أخطاء',
      warnings: 'تحذيرات',
      suggestions: 'اقتراحات',
    },
  },
  en: {
    honey: 'Honey',
    brood: 'Brood',
    beeBread: 'Bee Bread',
    empty: 'Empty',
    broodAge: {
      eggs: 'Eggs',
      larvae: 'Larvae',
      pupae: 'Pupae',
      capped: 'Capped',
      mixed: 'Mixed',
    },
    validation: {
      totalExceeds: 'Total exceeds 100%',
      totalBelow: 'Total is below 100%',
      broodAgeRequired: 'Brood age must be specified when brood percentage > 0%',
      lowResources: 'Low resources: Honey and bee bread below 20%',
      unusualDistribution: 'Unusual distribution: High percentage of empty space',
    },
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      undo: 'Undo',
      redo: 'Redo',
      apply: 'Apply',
    },
    labels: {
      percentage: 'Percentage',
      total: 'Total',
      errors: 'Errors',
      warnings: 'Warnings',
      suggestions: 'Suggestions',
    },
  },
};
