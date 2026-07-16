export function getDiseaseAdvice(diseaseName: string): { description: string; treatment: string; prevention: string } {
  const diseases: Record<string, { description: string; treatment: string; prevention: string }> = {
    'varroa': {
      description: 'طفيلي خارجي يهاجم النحل الطازج والبالغ',
      treatment: 'علاج كيميائي (Apivar, Bayvarol) أو علاج حراري',
      prevention: 'فحص دوري، تبديل الأطر القديمة، استخدام ملكات مقاومة',
    },
    'nosema': {
      description: 'عدوى فطرية تصيب الأمعاء',
      treatment: 'Fumagillin أو علاج طبيعي بعصيدة الثوم',
      prevention: 'تهوية جيدة، تجنب الرطوبة العالية',
    },
    'american_foulbrood': {
      description: 'بكتيريا خطيرة تصيب يرقات النحل',
      treatment: 'احراق الخلايا المصابة (إلزامي في بعض المناطق)',
      prevention: 'شراء ملكات من مصادر موثوقة، تعقيم الأدوات',
    },
    'chalkbrood': {
      description: 'فطر يحول اليرقات إلى مادة بيضاء',
      treatment: 'تحسين التهوية، تقليل الرطوبة',
      prevention: 'اختيار ملكات قوية، تجنب الإطارات القديمة',
    },
    'wax_moth': {
      description: 'حشرة تصيب خلايا النحل الضعيفة',
      treatment: 'تجميد الإطارات المصابة، معالجة كيميائية',
      prevention: 'الحفاظ على خلايا قوية، تخزين الإطارات في مكان بارد',
    },
  };

  const key = diseaseName.toLowerCase().replace(/\s+/g, '_');
  return diseases[key] || {
    description: 'لم يتم التعرف على هذا المرض في قاعدة البيانات',
    treatment: 'استشر خبير نحل محلي للتشخيص الدقيق',
    prevention: 'الحفاظ على نظافة المنحل والتفقد الدوري',
  };
}

export function getSeasonalAdvice(month: number): string[] {
  const advice: Record<number, string[]> = {
    1: ['الشتاء: لا تزعج النحل، تأكد من التخزين الكافٍ'],
    2: ['الشتاء المتأخر: راقب الوزن، أضف تغذية إذا لزم'],
    3: ['الربيع: فتحة التهوية، مراقبة ظهور الملكة'],
    4: ['الربيع: بداية التفريخ، فحص أول بيض'],
    5: ['الربيع المتأخر: تأسيس خلايا جديدة، تقسيم الأسر'],
    6: ['الصيف: مواد التكثير، زيادة التخزين'],
    7: ['الصيف: جمع العسل، علاج فاروا قبل الحصاد'],
    8: ['الصيف المتأخر: حصاد العسل، تجهيز للشتاء'],
    9: ['الخريف: تقليل الخلايا، زيادة التغذية'],
    10: ['الخريف: فحص الملكة، علاج فاروا'],
    11: ['الخريف المتأخر: تأمين الخلايا من البرد'],
    12: ['الشتاء: مراقبة سلبية، لا تفتح الخلايا'],
  };
  return advice[month] || ['لا توجد نصائح لهذا الشهر'];
}
