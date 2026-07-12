# دليل المساهمة
# Contributing Guide

<div dir="rtl">

شكراً لاهتمامك بالمساهمة في مكتبة `@kingdom-of-bees/disease-manager`! نرحب بجميع أنواع المساهمات.

</div>

## 🤝 كيفية المساهمة

### 1. الإبلاغ عن الأخطاء (Bug Reports)

إذا وجدت خطأ، يرجى فتح [Issue جديد](https://github.com/kingdom-of-bees/disease-manager/issues/new) مع:
- وصف واضح للمشكلة
- خطوات إعادة إنتاج المشكلة
- السلوك المتوقع والسلوك الفعلي
- لقطات شاشة إن أمكن
- معلومات البيئة (المتصفح، نظام التشغيل، إلخ)

### 2. اقتراح ميزات جديدة (Feature Requests)

لاقتراح ميزة جديدة:
- افتح [Issue جديد](https://github.com/kingdom-of-bees/disease-manager/issues/new)
- اشرح الميزة المقترحة بالتفصيل
- اشرح لماذا هذه الميزة مفيدة
- أضف أمثلة للاستخدام إن أمكن

### 3. المساهمة بالكود (Code Contributions)

#### الخطوات:

1. **Fork المشروع**
   ```bash
   # انقر على زر Fork في GitHub
   ```

2. **استنساخ المشروع**
   ```bash
   git clone https://github.com/YOUR_USERNAME/disease-manager.git
   cd disease-manager
   ```

3. **تثبيت التبعيات**
   ```bash
   npm install
   cd packages/disease-manager
   npm install
   ```

4. **إنشاء فرع جديد**
   ```bash
   git checkout -b feature/your-feature-name
   ```

5. **إجراء التغييرات**
   - اتبع معايير الكود (انظر أدناه)
   - أضف اختبارات للكود الجديد
   - تأكد من نجاح جميع الاختبارات

6. **تشغيل الاختبارات**
   ```bash
   npm test
   npm run lint
   npm run typecheck
   ```

7. **Commit التغييرات**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

8. **Push إلى GitHub**
   ```bash
   git push origin feature/your-feature-name
   ```

9. **فتح Pull Request**
   - اذهب إلى صفحة المشروع على GitHub
   - انقر على "New Pull Request"
   - اشرح التغييرات بالتفصيل

## 📝 معايير الكود

### TypeScript
- استخدم TypeScript لجميع الكود
- تجنب استخدام `any`
- أضف تعليقات JSDoc للدوال العامة

### التسمية
- استخدم camelCase للمتغيرات والدوال
- استخدم PascalCase للأصناف والواجهات
- استخدم UPPER_CASE للثوابت

### التنسيق
- استخدم Prettier للتنسيق التلقائي
- استخدم ESLint للتحقق من الجودة
- اتبع قواعد المشروع الموجودة

### الاختبارات
- اكتب اختبارات لجميع الميزات الجديدة
- تأكد من نجاح جميع الاختبارات
- استهدف تغطية 80%+ للكود

### Commit Messages
اتبع [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## 🌍 الترجمة

نرحب بالمساهمات في الترجمة! حالياً ندعم:
- العربية (ar)
- الإنجليزية (en)
- الفرنسية (fr)

لإضافة لغة جديدة:
1. أضف ملف ترجمة في `src/i18n/translations/`
2. اتبع نفس هيكل الملفات الموجودة
3. أضف اللغة إلى `SupportedLocale` في `src/i18n/types.ts`

## 📚 إضافة بيانات جديدة

### إضافة مرض جديد
1. أضف المرض في الملف المناسب في `src/data/diseases/`
2. تأكد من إضافة جميع الحقول المطلوبة
3. أضف الترجمات للغات الثلاث
4. أضف اختبارات

### إضافة علاج جديد
1. أضف العلاج في الملف المناسب في `src/data/treatments/`
2. تأكد من إضافة جميع الحقول المطلوبة
3. أضف الترجمات للغات الثلاث
4. أضف اختبارات

## 🐛 تصحيح الأخطاء

عند تصحيح خطأ:
1. أضف اختبار يفشل يوضح الخطأ
2. صحح الخطأ
3. تأكد من نجاح الاختبار
4. أضف تعليق يشرح الإصلاح

## 📖 التوثيق

- حدّث README.md إذا لزم الأمر
- أضف تعليقات JSDoc للدوال الجديدة
- حدّث CHANGELOG.md
- أضف أمثلة للاستخدام

## ❓ الأسئلة

إذا كان لديك أي أسئلة:
- افتح [Discussion](https://github.com/kingdom-of-bees/disease-manager/discussions)
- أو راسلنا على [البريد الإلكتروني](mailto:contact@kingdom-of-bees.com)

## 📄 الترخيص

بالمساهمة في هذا المشروع، فإنك توافق على أن مساهماتك ستكون مرخصة بموجب ترخيص MIT.

---

<div dir="rtl">

شكراً لمساهمتك! 🙏

</div>
