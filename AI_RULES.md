# 🧠 AI_RULES.md — قواعد الذكاء الاصطناعي لمشاريع Vibe Coding

> هذا الملف هو **عقد العمل** بين الذكاء الاصطناعي والمشروع.
> يُقرأ في بداية كل جلسة، ويُطبَّق دون استثناء.

---

## 📌 SECTION 0 — PRIME DIRECTIVES (لا تُكسر أبداً)

```
1. لا تكتب كوداً لم يُطلب منك صراحةً.
2. لا تخترع آليات أو patterns غير موجودة في المشروع.
3. لا تفترض — اسأل إذا كان السياق غامضاً.
4. الأمان ليس خياراً — هو شرط في كل سطر كود.
5. التوكنز غالية — لا تكرر ما هو موجود.
```

---

## 🗂️ SECTION 1 — PROJECT IDENTITY (هوية المشروع)

```yaml
# يجب أن يُملأ هذا القسم في بداية كل مشروع جديد
PROJECT_NAME: "FinTech (neonFin)"
STACK:
  frontend: "Next.js 15, React 19, Tailwind CSS"
  backend: "Next.js API Routes (App Router)"
  database: "Neon PostgreSQL with Drizzle ORM"
  auth: "Firebase Authentication (Session Cookies via Firebase Admin)"
  deployment: "Vercel / VPS"

ARCHITECTURE_PATTERN: "Multi-tenant SaaS"
CURRENT_PHASE: "MVP / Beta"
ACTIVE_MODULE: "Security & Dashboard Core"
```

### قواعد هوية المشروع:
- ❌ لا تكتب كوداً لا ينتمي إلى `STACK` المحدد أعلاه
- ❌ لا تقترح stack بديلة إلا إذا طُلب منك صراحةً
- ✅ كل كود يجب أن ينسجم مع `ARCHITECTURE_PATTERN` المحدد

---

## 💰 SECTION 2 — TOKEN ECONOMY (اقتصاد التوكنز)

### 2.1 — قواعد الإجابة

| الموقف | الإجراء الصحيح |
|--------|----------------|
| الكود موجود مسبقاً | أشِر إليه، لا تعد كتابته |
| تعديل بسيط | اكتب فقط الجزء المتغير مع السياق المحيط به |
| ملف كامل مطلوب | اكتبه كاملاً مرة واحدة فقط |
| شرح مطلوب | لا تكرر الكود داخل الشرح |

### 2.2 — قواعد الاستجابة

```
- الجواب القصير الدقيق > الجواب الطويل الفضفاض
- لا تضع مقدمات من نوع "بالتأكيد! سأساعدك في..."
- لا تلخص ما قلته في النهاية
- لا تعيد كتابة الكود بعد شرحه
- استخدم TODO comments بدلاً من كتابة boilerplate كامل
```

### 2.3 — قواعد الملفات

```
- لا تعيد كتابة ملف كامل لتعديل سطرين
- استخدم diff-style أو snippets محددة
- حدد رقم السطر أو اسم الدالة التي تتغير
- اكتب فقط: الدالة المتغيرة + السطور المحيطة (±5 سطور)
```

---

## 🚫 SECTION 3 — ANTI-HALLUCINATION RULES (منع الهلوسة)

### 3.1 — ما لا يجوز اختراعه

```
❌ لا تخترع أسماء packages لا تعرفها بيقين
❌ لا تخترع API endpoints غير موثقة
❌ لا تخترع database columns غير معرّفة في schema
❌ لا تخترع environment variables غير مذكورة
❌ لا تخترع functions من libraries لم تتحقق منها
❌ لا تخترع version numbers — ابحث أو اعترف بعدم اليقين
```

### 3.2 — بروتوكول عدم اليقين

```
إذا لم تكن متأكداً 100%:
  1. صرّح صراحةً: "لست متأكداً من هذا، يرجى التحقق"
  2. أعطِ البديل الأكثر احتمالاً مع تحذير
  3. أشِر إلى المصدر الرسمي للتحقق
  
لا تقدّم كوداً وهمياً على أنه حقيقي.
```

### 3.3 — تحقق من السياق

```
قبل كتابة أي كود، تأكد من:
  □ هل هذه الدالة/الملف موجود مسبقاً في المشروع؟
  □ هل هذه الـ dependency مذكورة في package.json / pubspec.yaml؟
  □ هل هذا الـ pattern يتوافق مع بنية المشروع الحالية؟
  □ هل schema قاعدة البيانات يدعم هذه العملية؟
```

---

## 🔒 SECTION 4 — SECURITY PRACTICES (قواعد الأمان)

### 4.1 — Authentication & Authorization

```typescript
// ✅ دائماً تحقق من الهوية قبل أي عملية
const user = await verifyToken(req.headers.authorization);
if (!user) throw new UnauthorizedException();

// ✅ دائماً تحقق من الصلاحيات بعد التحقق من الهوية
if (user.role !== 'ADMIN') throw new ForbiddenException();

// ❌ لا تثق بأي بيانات من الـ client مباشرةً
const userId = req.body.userId; // خطر! قد يكون مزوراً
const userId = user.id;         // آمن — من الـ token المُتحقق منه
```

### 4.2 — Multi-Tenancy (إذا كان المشروع SaaS)

```
قاعدة صارمة: organization_id إلزامي في كل query
  
  ✅ صحيح:
  db.find({ where: { id: recordId, organization_id: user.org_id } })
  
  ❌ خطأ (IDOR vulnerability):
  db.find({ where: { id: recordId } })

لا تكتب أبداً query على جدول متعدد المستأجرين دون organization_id filter.
```

### 4.3 — Input Validation

```
القاعدة: كل مدخل من المستخدم هو مشبوه حتى يثبت العكس

  ✅ استخدم schema validation (Zod, Joi, class-validator)
  ✅ حدد max length لكل حقل نصي
  ✅ استخدم parameterized queries — لا تبنِ SQL بـ string concatenation
  ✅ Sanitize HTML إذا كان سيُعرض في DOM
  
  ❌ لا تستخدم eval() أبداً
  ❌ لا تمرر user input مباشرةً لأوامر shell
  ❌ لا تخزن passwords كـ plain text
```

### 4.4 — Data Exposure

```
  ✅ استخدم DTOs/Serializers — لا تُرجع raw database objects
  ✅ استبعد الحقول الحساسة: password, salt, internal_notes
  ✅ Paginate الـ responses الكبيرة
  
  ❌ لا تضع sensitive data في URL parameters
  ❌ لا تضع secrets في الكود — استخدم environment variables
  ❌ لا تسجّل (log) passwords أو tokens أو بيانات بطاقات الائتمان
```

### 4.5 — API Security Checklist

```
كل endpoint جديد يجب أن يمر على هذا الـ checklist:

  □ يتطلب authentication
  □ يتطلب authorization (role/permission check)
  □ يتحقق من organization_id (للـ multi-tenant)
  □ يُطبّق rate limiting
  □ يستخدم input validation
  □ لا يُعيد بيانات حساسة غير ضرورية
  □ يعتمد HTTPS فقط في الإنتاج
```

### 4.6 — Secrets Management

```
  ✅ كل secret في .env ومذكور في .env.example (بدون قيمة)
  ✅ .env في .gitignore — دائماً
  ✅ استخدم secret manager في الإنتاج (Vault, AWS Secrets Manager)
  
  ❌ لا تضع API keys في الكود مباشرةً
  ❌ لا تضع connection strings في الكود
  ❌ لا تضع JWT secrets hardcoded
```

---

## 🏗️ SECTION 5 — CODE QUALITY (جودة الكود)

### 5.1 — قواعد الملفات

```
  ✅ الحد الأقصى لأي ملف: 300 سطر — إذا تجاوز، قسّمه
  ✅ دالة واحدة = مسؤولية واحدة (Single Responsibility)
  ✅ أسماء واضحة تصف الغرض — لا اختصارات غامضة
  
  ❌ لا تكتب دوالاً بأكثر من 50 سطر دون تقسيمها
  ❌ لا تكرر كوداً — استخرج الـ shared logic إلى utility
```

### 5.2 — قواعد التعليقات

```
  ✅ علّق على "لماذا" لا "ماذا"
  ✅ TODO: للمهام المؤجلة مع وصف واضح
  ✅ FIXME: للمشاكل المعروفة
  ✅ SECURITY: للتنبيه على نقاط حساسة
  
  ❌ لا تعلّق على ما يفسّره الكود نفسه
```

### 5.3 — Error Handling

```
  ✅ كل async operation داخل try-catch
  ✅ رسائل خطأ واضحة للـ developer (logs)
  ✅ رسائل خطأ عامة للـ user (لا تكشف تفاصيل النظام)
  ✅ استخدم custom error classes/codes
  
  ❌ لا تستخدم catch(e) {} فارغة أبداً
  ❌ لا تكشف stack traces في الإنتاج
```

---

## 🧭 SECTION 6 — CONTEXT MANAGEMENT (إدارة السياق)

### 6.1 — بداية كل جلسة

```
قبل أي كود، الذكاء الاصطناعي يجب أن يُعلن:

  "📍 الجلسة الحالية:
   - المشروع: [اسم المشروع]
   - المودول: [اسم المودول]
   - المهمة: [وصف المهمة بجملة واحدة]
   - القيود: [أي قيود تقنية معروفة]"
```

### 6.2 — التتبع داخل الجلسة

```
عند إنجاز كل مهمة فرعية:
  ✅ أعلن: "✅ أُنجز: [وصف ما تم]"
  ✅ حدد: "⏭️ التالي: [المهمة القادمة]"
  ✅ نبّه: "⚠️ انتبه: [أي side effects أو تبعيات]"
```

### 6.3 — عند الانتقال بين المودولات

```
إذا انتقلنا لمودول مختلف، أعلن صراحةً:
  "🔄 تغيير السياق: ننتقل من [المودول القديم] إلى [المودول الجديد]
   الملفات المتأثرة: [قائمة الملفات]"
```

### 6.4 — عند نسيان السياق

```
إذا لم تتذكر تفاصيل المشروع:
  1. اعترف صراحةً: "أحتاج مراجعة السياق"
  2. اطلب: schema، أو structure، أو الـ file المعني
  3. لا تخمّن ولا تخترع
```

---

## ⛔ SECTION 7 — FORBIDDEN PATTERNS (الأنماط المحظورة)

```
هذه الأنماط محظورة دائماً، بغض النظر عن السياق:

  🚫 SQL Injection:        "SELECT * FROM users WHERE id = " + userId
  🚫 XSS:                  innerHTML = userContent (بدون sanitization)
  🚫 Hardcoded secrets:    const API_KEY = "sk-abc123..."
  🚫 IDOR:                 db.find({ id: req.params.id }) (بدون tenant check)
  🚫 Mass Assignment:      user.update(req.body) (بدون whitelist)
  🚫 Insecure Direct Ref:  readFile(req.params.filename) (بدون validation)
  🚫 Weak Crypto:          MD5/SHA1 للـ passwords
  🚫 God Functions:        دالة واحدة تتجاوز 100 سطر وتفعل كل شيء
  🚫 Silent Failures:      catch(e) {} (ابتلاع الأخطاء)
  🚫 Console.log secrets:  console.log("Token:", jwtToken)
```

---

## 🔄 SECTION 8 — CHANGE PROTOCOL (بروتوكول التغييرات)

```
قبل أي تغيير جوهري في البنية:

  1. أعلن: "هذا تغيير جوهري يؤثر على [X, Y, Z]"
  2. اعرض: قائمة بالملفات التي ستتأثر
  3. انتظر: موافقة صريحة قبل البدء
  4. نفّذ: مرحلة واحدة في كل مرة
  5. تحقق: هل المرحلة السابقة تعمل قبل التالية؟
```

### Schema Changes (تغييرات قاعدة البيانات)

```
  ❌ لا تعدّل schema مباشرةً دون migration
  ✅ أنشئ migration file لكل تغيير
  ✅ الـ migrations يجب أن تكون reversible (up + down)
  ✅ اختبر migration على بيانات تجريبية أولاً
```

---

## 📋 SECTION 9 — QUICK REFERENCE (مرجع سريع)

```
قبل كتابة أي كود، مرّ على هذه الأسئلة:

  □ هل هذا الكود مطلوب صراحةً؟
  □ هل يتناسب مع stack المشروع؟
  □ هل تحققت من أن الدالة/الحزمة موجودة فعلاً؟
  □ هل أضفت input validation؟
  □ هل أضفت authorization check؟
  □ هل أضفت organization_id filter (للـ multi-tenant)؟
  □ هل الكود يكشف بيانات حساسة؟
  □ هل هناك تكرار يمكن تجنبه؟
  □ هل الملف يتجاوز 300 سطر؟
  □ هل error handling موجود؟

إذا أجبت بـ "لا" على أي سؤال أمني → أوقف وصحّح.
```

---

## 🔖 SECTION 10 — VERSION & MAINTENANCE

```yaml
RULES_VERSION: "1.0.0"
CREATED: "2025"
REVIEW_TRIGGER: "كل milestone رئيسي أو عند تغيير الـ stack"
OWNER: "Marwan Ahmed"

CHANGELOG:
  - v1.0.0: النسخة الأولى الشاملة
```

---

> **تذكير نهائي:**
> هذه القواعد ليست اقتراحات — هي حدود العمل.
> الذكاء الاصطناعي الذي يكسر أياً منها يُنتج كوداً خطيراً أو ميتاً.
> الهدف: كود يعمل، آمن، وقابل للصيانة — ليس كوداً كثيراً.