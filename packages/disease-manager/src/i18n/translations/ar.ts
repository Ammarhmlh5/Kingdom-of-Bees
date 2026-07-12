/**
 * Arabic Translations
 * الترجمات العربية
 */

import type { TranslationDictionary } from '../types';

export const ar: TranslationDictionary = {
  common: {
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    search: 'بحث',
    filter: 'تصفية',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    confirm: 'تأكيد',
    back: 'رجوع',
    next: 'التالي',
    previous: 'السابق',
    close: 'إغلاق',
    submit: 'إرسال',
    reset: 'إعادة تعيين',
    clear: 'مسح',
    select: 'اختيار',
    upload: 'رفع',
    download: 'تحميل',
    export: 'تصدير',
    import: 'استيراد',
    print: 'طباعة',
    refresh: 'تحديث',
    settings: 'الإعدادات',
    help: 'مساعدة',
    about: 'حول',
    logout: 'تسجيل الخروج',
    login: 'تسجيل الدخول',
  },

  diseases: {
    title: 'الأمراض',
    list: 'قائمة الأمراض',
    details: 'تفاصيل المرض',
    search: 'البحث عن مرض',
    category: 'الفئة',
    severity: 'مستوى الخطورة',
    symptoms: 'الأعراض',
    causes: 'الأسباب',
    treatment: 'العلاج',
    prevention: 'الوقاية',
    
    categories: {
      brood: 'أمراض الحضنة',
      adult: 'أمراض النحل البالغ',
      parasite: 'الطفيليات',
      virus: 'الفيروسات',
      queen: 'مشاكل الملكة',
    },

    severity_levels: {
      low: 'منخفض',
      medium: 'متوسط',
      high: 'عالي',
      critical: 'حرج',
    },

    // أمراض الحضنة
    american_foulbrood: 'تعفن الحضنة الأمريكي',
    european_foulbrood: 'تعفن الحضنة الأوروبي',
    chalkbrood: 'الحضنة الطباشيرية',
    sacbrood: 'الحضنة الكيسية',

    // أمراض النحل البالغ
    nosema: 'النوزيما',
    amoeba: 'الأميبا',
    paralysis: 'الشلل',

    // الطفيليات
    varroa: 'الفاروا',
    tracheal_mites: 'عث القصبة الهوائية',
    small_hive_beetle: 'خنفساء الخلية الصغيرة',
    wax_moth: 'دودة الشمع',

    // الفيروسات
    dwv: 'فيروس الجناح المشوه',
    abpv: 'فيروس شلل النحل الحاد',
    cbpv: 'فيروس شلل النحل المزمن',
  },

  diagnosis: {
    title: 'التشخيص',
    start: 'بدء التشخيص',
    wizard: 'معالج التشخيص',
    symptoms_selection: 'اختيار الأعراض',
    image_upload: 'رفع صورة',
    results: 'نتائج التشخيص',
    possible_diseases: 'الأمراض المحتملة',
    confidence: 'مستوى الثقة',
  },

  alerts: {
    title: 'التنبيهات',
    list: 'قائمة التنبيهات',
    create: 'إنشاء تنبيه',
    dismiss: 'إلغاء',
    delete: 'حذف',
    dismiss_all: 'إلغاء الكل',
    no_alerts: 'لا توجد تنبيهات',
    settings: 'إعدادات التنبيهات',
    total: 'الإجمالي',
    pending: 'معلق',
    sent: 'مرسل',
    critical: 'حرج',
    scheduledFor: 'مجدول لـ',
    justNow: 'الآن',
    minutesAgo: 'منذ {{count}} دقيقة',
    hoursAgo: 'منذ {{count}} ساعة',
    daysAgo: 'منذ {{count}} يوم',
    
    types: {
      inspection_reminder: 'تذكير بالفحص',
      treatment_reminder: 'تذكير بالعلاج',
      disease_outbreak: 'تفشي مرض',
      weather_warning: 'تحذير طقس',
      emergency: 'حالة طوارئ',
      inventory_low: 'مخزون منخفض',
      expiry_warning: 'تحذير انتهاء صلاحية',
      safety_period: 'فترة أمان',
      harvest_ready: 'جاهز للحصاد',
      custom: 'تنبيه مخصص',
    },

    priorities: {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      critical: 'حرجة',
    },

    statuses: {
      pending: 'معلق',
      sent: 'مرسل',
      dismissed: 'ملغى',
      expired: 'منتهي',
    },

    entities: {
      hive: 'خلية',
      treatment: 'علاج',
      disease: 'مرض',
      inspection: 'فحص',
      inventory: 'مخزون',
    },

    channels: {
      push: 'إشعارات فورية',
      email: 'بريد إلكتروني',
      sms: 'رسالة نصية',
      in_app: 'داخل التطبيق',
    },

    settings_labels: {
      enabled_types: 'أنواع التنبيهات المفعلة',
      quiet_hours: 'الساعات الهادئة',
      notification_channels: 'قنوات الإشعارات',
      priority_threshold: 'الحد الأدنى للأولوية',
      auto_expire_days: 'انتهاء الصلاحية التلقائي (أيام)',
    },

    messages: {
      created: 'تم إنشاء التنبيه بنجاح',
      dismissed: 'تم إلغاء التنبيه',
      dismissed_all: 'تم إلغاء جميع التنبيهات',
      deleted: 'تم حذف التنبيه',
      settings_updated: 'تم تحديث الإعدادات',
      type_disabled: 'نوع التنبيه معطل',
      below_threshold: 'الأولوية أقل من الحد الأدنى',
      in_quiet_hours: 'تم جدولة التنبيه بعد الساعات الهادئة',
    },

    recurring: {
      title: 'التنبيهات المتكررة',
      schedule: 'جدولة تنبيه متكرر',
      cancel: 'إلغاء تنبيه متكرر',
      frequency: 'التكرار',
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      time: 'الوقت',
      day_of_week: 'يوم الأسبوع',
      day_of_month: 'يوم الشهر',
    },

    statistics: {
      title: 'إحصائيات التنبيهات',
      total: 'الإجمالي',
      pending: 'معلقة',
      sent: 'مرسلة',
      dismissed: 'ملغاة',
      expired: 'منتهية',
      by_type: 'حسب النوع',
      by_priority: 'حسب الأولوية',
    },
    recommendations: 'التوصيات',
    save_results: 'حفظ النتائج',
    symptoms: 'الأعراض',
    addSymptom: 'إضافة عرض',
    severity: 'الشدة',
    possibleDiseases: 'الأمراض المحتملة',
    nextSteps: 'الخطوات التالية',
    overallSeverity: 'مستوى الخطورة الإجمالي',
    analysisDate: 'تاريخ التحليل',
    noResults: 'لا توجد نتائج',
    
    steps: {
      symptoms: 'الأعراض',
      images: 'الصور',
      analysis: 'التحليل',
      results: 'النتائج',
    },

    wizard: {
      selectCategory: 'اختر فئة المرض',
      categoryDescription: 'حدد الفئة التي تنتمي إليها الأعراض الملاحظة',
      selectSymptoms: 'حدد الأعراض الملاحظة',
      symptomsDescription: 'اختر جميع الأعراض التي لاحظتها في الخلية',
      uploadImages: 'رفع الصور (اختياري)',
      imagesDescription: 'أضف صوراً واضحة للأعراض لتحسين دقة التشخيص',
      reviewAndAnalyze: 'مراجعة وتحليل',
      analysisDescription: 'راجع المعلومات المدخلة قبل بدء التحليل',
      results: 'نتائج التشخيص',
      category: 'الفئة',
      symptoms: 'الأعراض',
      images: 'الصور',
      analysis: 'التحليل',
      symptomsCount: 'عدد الأعراض',
      imagesCount: 'عدد الصور',
      selectedSymptoms: 'الأعراض المحددة',
      commonSymptoms: 'الأعراض الشائعة',
      uploadedImages: 'الصور المرفوعة',
      addImages: 'إضافة صور',
      imagesOptional: 'الصور اختيارية لكنها تحسن دقة التشخيص',
      analyzing: 'جاري التحليل...',
      analyze: 'تحليل',
    },

    image_quality: {
      good: 'جودة جيدة',
      acceptable: 'جودة مقبولة',
      poor: 'جودة ضعيفة',
      blur: 'الصورة غير واضحة',
      lighting: 'الإضاءة غير مناسبة',
      resolution: 'الدقة منخفضة',
    },

    errors: {
      noSymptoms: 'يجب إضافة عرض واحد على الأقل',
      analysisFailed: 'فشل التحليل، يرجى المحاولة مرة أخرى',
    },
  },

  treatments: {
    title: 'العلاجات',
    list: 'قائمة العلاجات',
    schedule: 'جدولة',
    scheduleNew: 'جدولة علاج جديد',
    scheduleTimeline: 'الجدول الزمني للعلاجات',
    noSchedules: 'لا توجد جداول علاج',
    details: 'تفاصيل العلاج',
    treatment: 'العلاج',
    selectTreatment: 'اختر العلاج',
    treatmentInfo: 'معلومات العلاج',
    type: 'نوع العلاج',
    dosage: 'الجرعة',
    duration: 'المدة',
    safetyPeriod: 'فترة الأمان',
    cost: 'التكلفة',
    totalCost: 'التكلفة الإجمالية',
    instructions: 'التعليمات',
    sideEffects: 'الآثار الجانبية',
    startDate: 'تاريخ البدء',
    numberOfDoses: 'عدد الجرعات',
    intervalDays: 'الفترة بين الجرعات (أيام)',
    notesPlaceholder: 'أضف ملاحظات إضافية...',
    totalDoses: 'إجمالي الجرعات',
    completedDoses: 'الجرعات المكتملة',
    doses: 'الجرعات',
    dose: 'الجرعة',
    
    types: {
      chemical: 'كيميائي',
      organic: 'عضوي',
      biological: 'بيولوجي',
      mechanical: 'ميكانيكي',
      thermal: 'حراري',
    },

    status: {
      active: 'نشط',
      scheduled: 'مجدول',
      in_progress: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
      paused: 'متوقف مؤقتاً',
      overdue: 'متأخر',
    },

    doseStatus: {
      pending: 'معلق',
      completed: 'مكتمل',
      overdue: 'متأخر',
      missed: 'فائت',
      cancelled: 'ملغي',
    },
  },

  alerts: {
    title: 'التنبيهات',
    list: 'قائمة التنبيهات',
    create: 'إنشاء تنبيه',
    settings: 'إعدادات التنبيهات',
    
    types: {
      inspection_reminder: 'تذكير بالفحص',
      treatment_reminder: 'تذكير بالعلاج',
      disease_outbreak: 'تفشي مرض',
      weather_warning: 'تحذير طقس',
      emergency: 'طوارئ',
      inventory_low: 'مخزون منخفض',
      expiry_warning: 'تحذير انتهاء صلاحية',
    },

    priority: {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
      critical: 'حرجة',
    },

    status: {
      pending: 'معلق',
      sent: 'مرسل',
      dismissed: 'مرفوض',
      expired: 'منتهي',
    },
  },

  hives: {
    title: 'الخلايا',
    list: 'قائمة الخلايا',
    details: 'تفاصيل الخلية',
    health: 'الصحة',
    records: 'السجلات',
    history: 'التاريخ',
    statistics: 'الإحصائيات',
    
    health_status: {
      excellent: 'ممتاز',
      good: 'جيد',
      fair: 'مقبول',
      poor: 'ضعيف',
      critical: 'حرج',
    },
  },

  sync: {
    title: 'المزامنة',
    status: 'حالة المزامنة',
    online: 'متصل',
    offline: 'غير متصل',
    syncing: 'جاري المزامنة...',
    synced: 'مزامن',
    pending: 'معلق',
    error: 'خطأ',
    lastSync: 'آخر مزامنة',
    never: 'لم تتم المزامنة بعد',
    justNow: 'الآن',
    minutesAgo: 'منذ {{count}} دقيقة',
    hoursAgo: 'منذ {{count}} ساعة',
    daysAgo: 'منذ {{count}} يوم',
    pendingOperations: 'عمليات معلقة',
    syncNow: 'مزامنة الآن',
    autoSync: 'مزامنة تلقائية',
    conflicts: 'تعارضات',
    
    messages: {
      syncSuccess: 'تمت المزامنة بنجاح',
      syncFailed: 'فشلت المزامنة',
      noConnection: 'لا يوجد اتصال بالإنترنت',
      conflictsResolved: 'تم حل التعارضات',
    },
    
    conflictResolution: {
      title: 'حل التعارضات',
      resolve: 'حل التعارض',
      useLocal: 'استخدام النسخة المحلية',
      useRemote: 'استخدام النسخة البعيدة',
      merge: 'دمج',
      latest: 'استخدام الأحدث',
    },
  },

  errors: {
    network_error: 'خطأ في الاتصال بالشبكة',
    database_error: 'خطأ في قاعدة البيانات',
    not_found: 'غير موجود',
    unauthorized: 'غير مصرح',
    validation_error: 'خطأ في التحقق',
    unknown_error: 'خطأ غير معروف',
    try_again: 'حاول مرة أخرى',
  },

  validation: {
    required: 'هذا الحقل مطلوب',
    invalid_email: 'البريد الإلكتروني غير صالح',
    invalid_phone: 'رقم الهاتف غير صالح',
    min_length: 'الحد الأدنى {{min}} أحرف',
    max_length: 'الحد الأقصى {{max}} أحرف',
    min_value: 'الحد الأدنى {{min}}',
    max_value: 'الحد الأقصى {{max}}',
  },

  dates: {
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    this_week: 'هذا الأسبوع',
    last_week: 'الأسبوع الماضي',
    this_month: 'هذا الشهر',
    last_month: 'الشهر الماضي',
    this_year: 'هذا العام',
    last_year: 'العام الماضي',
  },

  time: {
    seconds: {
      zero: 'لا ثواني',
      one: 'ثانية واحدة',
      two: 'ثانيتان',
      few: '{{count}} ثوانٍ',
      many: '{{count}} ثانية',
      other: '{{count}} ثانية',
    },
    minutes: {
      zero: 'لا دقائق',
      one: 'دقيقة واحدة',
      two: 'دقيقتان',
      few: '{{count}} دقائق',
      many: '{{count}} دقيقة',
      other: '{{count}} دقيقة',
    },
    hours: {
      zero: 'لا ساعات',
      one: 'ساعة واحدة',
      two: 'ساعتان',
      few: '{{count}} ساعات',
      many: '{{count}} ساعة',
      other: '{{count}} ساعة',
    },
    days: {
      zero: 'لا أيام',
      one: 'يوم واحد',
      two: 'يومان',
      few: '{{count}} أيام',
      many: '{{count}} يوماً',
      other: '{{count}} يوم',
    },
  },

  hiveRecord: {
    title: 'سجل الخلية',
    history: 'السجل',
    timeline: 'الخط الزمني',
    statistics: 'الإحصائيات',
    report: 'التقرير',
    
    // Disease History
    diseaseHistory: 'سجل الأمراض',
    activeDiseases: 'الأمراض النشطة',
    resolvedDiseases: 'الأمراض المحلولة',
    diseaseStatus: {
      active: 'نشط',
      treating: 'قيد العلاج',
      resolved: 'تم الحل',
      chronic: 'مزمن',
    },
    diseaseOutcome: {
      recovered: 'تعافى',
      improved: 'تحسن',
      unchanged: 'لم يتغير',
      worsened: 'ساءت الحالة',
      fatal: 'مميت',
    },
    
    // Treatment History
    treatmentHistory: 'سجل العلاجات',
    activeTreatments: 'العلاجات النشطة',
    completedTreatments: 'العلاجات المكتملة',
    effectiveness: 'الفعالية',
    sideEffects: 'الآثار الجانبية',
    
    // Inspection History
    inspectionHistory: 'سجل الفحوصات',
    lastInspection: 'آخر فحص',
    nextInspection: 'الفحص القادم',
    condition: 'الحالة',
    hiveCondition: {
      excellent: 'ممتازة',
      good: 'جيدة',
      fair: 'مقبولة',
      poor: 'سيئة',
      critical: 'حرجة',
    },
    population: 'التعداد',
    resources: 'الموارد',
    health: 'الصحة',
    weather: 'الطقس',
    actionsTaken: 'الإجراءات المتخذة',
    
    // Images
    images: 'الصور',
    imageGallery: 'معرض الصور',
    uploadImage: 'رفع صورة',
    imageContext: {
      disease: 'مرض',
      treatment: 'علاج',
      inspection: 'فحص',
      general: 'عام',
    },
    
    // Notes
    notes: 'الملاحظات',
    addNote: 'إضافة ملاحظة',
    noteContext: {
      disease: 'مرض',
      treatment: 'علاج',
      inspection: 'فحص',
      general: 'عام',
    },
    priority: {
      low: 'منخفضة',
      medium: 'متوسطة',
      high: 'عالية',
    },
    
    // Statistics
    totalDiseases: 'إجمالي الأمراض',
    totalTreatments: 'إجمالي العلاجات',
    totalInspections: 'إجمالي الفحوصات',
    totalImages: 'إجمالي الصور',
    totalNotes: 'إجمالي الملاحظات',
    totalCost: 'التكلفة الإجمالية',
    averageEffectiveness: 'متوسط الفعالية',
    healthScore: 'درجة الصحة',
    healthTrend: {
      improving: 'تتحسن',
      stable: 'مستقرة',
      declining: 'تتراجع',
    },
    mostCommonDisease: 'المرض الأكثر شيوعاً',
    
    // Reports
    generateReport: 'إنشاء تقرير',
    reportType: {
      daily: 'يومي',
      weekly: 'أسبوعي',
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي',
      custom: 'مخصص',
    },
    reportFormat: {
      json: 'JSON',
      csv: 'CSV',
      pdf: 'PDF',
    },
    includeSections: 'تضمين الأقسام',
    includeDiseases: 'تضمين الأمراض',
    includeTreatments: 'تضمين العلاجات',
    includeInspections: 'تضمين الفحوصات',
    includeImages: 'تضمين الصور',
    includeNotes: 'تضمين الملاحظات',
    includeStatistics: 'تضمين الإحصائيات',
    
    // Search and Filter
    searchRecords: 'البحث في السجلات',
    filterByDate: 'تصفية حسب التاريخ',
    filterByDisease: 'تصفية حسب المرض',
    filterByTreatment: 'تصفية حسب العلاج',
    filterByCondition: 'تصفية حسب الحالة',
    hasImages: 'يحتوي على صور',
    hasNotes: 'يحتوي على ملاحظات',
    
    // Messages
    noRecords: 'لا توجد سجلات',
    noDiseases: 'لا توجد أمراض',
    noTreatments: 'لا توجد علاجات',
    noInspections: 'لا توجد فحوصات',
    noImages: 'لا توجد صور',
    noNotes: 'لا توجد ملاحظات',
    recordCreated: 'تم إنشاء السجل بنجاح',
    recordUpdated: 'تم تحديث السجل بنجاح',
    recordDeleted: 'تم حذف السجل بنجاح',
    reportGenerated: 'تم إنشاء التقرير بنجاح',
  },
};
