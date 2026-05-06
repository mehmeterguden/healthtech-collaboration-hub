# HEALTH AI Platform – Use Case Information from Code

## 1. Project Overview for Use Case Diagram
HEALTH AI Platform, mühendisler ve sağlık profesyonelleri arasında işbirliğini kolaylaştırmayı amaçlayan bir co-creation (ortak üretim) platformudur. 
- **Sistemin Kullanım Amacı:** Sağlık alanındaki teknik problemleri veya veri setlerini paylaşmak, bu problemlere teknik çözümler (yapay zeka vb.) geliştirecek partnerler bulmak ve toplantılar aracılığıyla işbirliği başlatmak.
- **Ana Kullanıcılar:** Engineer (Teknik uzman), Healthcare Professional (Klinik uzman) ve Admin (Platform yöneticisi).
- **Ana İşlemler:** İlan (Post) yönetimi, arama ve filtreleme, ilgi belirtme (Interest), gizlilik sözleşmesi (NDA) onayı ve toplantı planlama (Meeting Request).

## 2. Actors Found in Code

### Guest / Unauthenticated User
- **Role name in code:** `Guest` (Temsili, oturum açmamış kullanıcı)
- **Description:** Sisteme henüz giriş yapmamış ziyaretçi.
- **Main permissions:** Kayıt olma, giriş yapma, şifre sıfırlama (başlatma).
- **Accessible pages/routes:** `/login`, `/register`, `/forgot-password`.
- **Related backend endpoints:** `POST /api/auth/login`, `POST /api/auth/register`.
- **Notes:** Kayıt sırasında `.edu` uzantılı e-posta zorunluluğu vardır.

### Engineer
- **Role name in code:** `engineer`
- **Description:** Teknik çözüm geliştiren, veri işleme ve yapay zeka konularında uzman kullanıcı.
- **Main permissions:** İlan oluşturma, ilanları arama, toplantı talep etme, ilgi belirtme.
- **Accessible pages/routes:** `/dashboard`, `/dashboard/posts`, `/dashboard/create-post`, `/dashboard/meetings`.
- **Related backend endpoints:** `POST /api/posts`, `POST /api/meetings`, `POST /api/posts/[id]/interests`.
- **Notes:** Healthcare Professional ile teknik olarak aynı yetkilere sahiptir.

### Healthcare Professional
- **Role name in code:** `healthcare`
- **Description:** Klinik ihtiyaçları, tıbbi verileri veya araştırma konularını platforma taşıyan uzman.
- **Main permissions:** İlan oluşturma (Klinik ihtiyaç bazlı), ilanları arama, toplantı yönetimi.
- **Accessible pages/routes:** `/dashboard`, `/dashboard/posts`, `/dashboard/meetings`.
- **Related backend endpoints:** `POST /api/posts`, `GET /api/posts`, `POST /api/meetings`.
- **Notes:** Engineer rolüyle aynı yetki setini paylaşır.

### Admin
- **Role name in code:** `admin`
- **Description:** Platformun moderasyonundan ve kullanıcı denetiminden sorumlu yönetici.
- **Main permissions:** Tüm kullanıcıları yönetme (askıya alma), tüm ilanları yönetme (silme), audit loglarını görüntüleme.
- **Accessible pages/routes:** `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/logs`.
- **Related backend endpoints:** `GET /api/admin/stats`, `POST /api/admin/users/[id]/suspend`, `DELETE /api/admin/posts/[id]`.
- **Notes:** `requireAdmin` kontrolü ile korunur.

## 3. Authentication and Account Use Cases

### Register
- **Related actor(s):** Guest
- **What the user does:** İsim, soyisim, `.edu` maili, şifre ve rol seçerek kayıt olur.
- **What the system does:** Kullanıcı oluşturur, şifreyi hashler, slug üretir ve session cookie set eder.
- **Frontend page/component:** `/register`
- **Backend endpoint/function:** `POST /api/auth/register`
- **Status:** Found
- **Notes:** Sadece `.edu` mailleri kabul edilir.

### Login
- **Related actor(s):** Guest
- **What the user does:** E-posta ve şifre ile giriş yapar.
- **What the system does:** Kimlik doğrulaması yapar, başarılı/başarısız girişi loglar, session cookie set eder.
- **Frontend page/component:** `/login`
- **Backend endpoint/function:** `POST /api/auth/login`
- **Status:** Found

### Email Verification
- **Related actor(s):** Guest
- **What the user does:** Kayıt sonrası e-postasına gelen kodu girer.
- **What the system does:** Kodu kontrol eder ve `isEmailVerified` alanını günceller.
- **Frontend page/component:** `/verify-email`
- **Backend endpoint/function:** `POST /api/auth/verify-email`
- **Status:** Partial
- **Notes:** Kodda `123456` statik olarak mocklanmıştır.

### Profile Update
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Biyografi, uzmanlık alanları ve lokasyon bilgilerini günceller.
- **What the system does:** Veritabanındaki kullanıcı bilgilerini günceller.
- **Frontend page/component:** `/dashboard/profile/[slug]`
- **Backend endpoint/function:** `PATCH /api/users/profile`
- **Status:** Found

### Account Suspension
- **Related actor(s):** Admin
- **What the user does:** Sorunlu bir kullanıcıyı askıya alır.
- **What the system does:** Kullanıcının `isActive` değerini false yapar ve oturumunu geçersiz kılar.
- **Frontend page/component:** `/dashboard/admin/users`
- **Backend endpoint/function:** `POST /api/admin/users/[id]/suspend`
- **Status:** Found

## 4. Post Management Use Cases

### Create Post
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Başlık, açıklama, alan (domain) ve gereksinimleri girerek ilan oluşturur.
- **What the system does:** Yeni bir `Post` kaydı oluşturur ve oluşturma işlemini loglar.
- **Frontend page/component:** `/dashboard/create-post`
- **Backend endpoint/function:** `POST /api/posts`
- **Status:** Found

### Edit Post
- **Related actor(s):** Author (Post Owner), Admin
- **What the user does:** Mevcut ilanın bilgilerini günceller.
- **What the system does:** İlan verilerini günceller ve log tutar.
- **Frontend page/component:** `/dashboard/post/[id]/edit` (Temsili)
- **Backend endpoint/function:** `PATCH /api/posts/[id]`
- **Status:** Found

### Delete Post
- **Related actor(s):** Author, Admin
- **What the user does:** İlanı sistemden tamamen kaldırır.
- **What the system does:** İlanı siler ve ilişkili tüm interest/meeting kayıtlarını temizler.
- **Frontend page/component:** `/dashboard/posts`
- **Backend endpoint/function:** `DELETE /api/posts/[id]`
- **Status:** Found

### Mark Partner Found
- **Related actor(s):** Author
- **What the user does:** İşbirliği ortağı bulunduğunda ilanı kapatır.
- **What the system does:** İlan statusunu `partner_found` olarak günceller.
- **Frontend page/component:** İlan detay sayfası
- **Backend endpoint/function:** `PATCH /api/posts/[id]` (status update)
- **Status:** Found

### Post Status Values Found
- **Status name:** `active` | **Meaning:** İlan yayında ve başvurulara açık.
- **Status name:** `draft` | **Meaning:** İlan henüz yayınlanmamış, hazırlık aşamasında.
- **Status name:** `meeting_scheduled` | **Meaning:** En az bir toplantı planlanmış.
- **Status name:** `partner_found` | **Meaning:** İşbirliği ortağı bulunmuş ve ilan kapanmış.
- **Status name:** `expired` | **Meaning:** İlanın süresi dolmuş.

## 5. Search and Matching Use Cases

### Search & Filter Posts
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Kelime bazlı arama yapar veya domain, lokasyon, aşama bazlı filtreleme yapar.
- **What the system does:** Veritabanında kriterlere uygun filtreleme yaparak sonuçları döner.
- **Frontend page/component:** `/dashboard/posts`, `PostFilters` bileşeni.
- **Backend endpoint/function:** `GET /api/posts?search=...&domain=...`
- **Status:** Found

### Local Matching
- **Related actor(s):** System (Auto Triggered)
- **What the system does:** Kullanıcının şehri ile ilanın şehri aynıysa "Local Match" etiketi gösterir.
- **Frontend page/component:** `PostCard` bileşeni.
- **Status:** Found
- **Notes:** Bu bir otomatik eşleştirme mantığıdır.

## 6. Meeting Request Use Cases

### Send Meeting Request
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Bir ilan için mesaj yazar ve uygun olduğu 3 farklı zaman dilimi önerir.
- **What the system does:** `MeetingRequest` oluşturur ve karşı tarafa bildirim (Notification) gönderir.
- **Frontend page/component:** `RequestMeetingModal`
- **Backend endpoint/function:** `POST /api/meetings`
- **Status:** Found

### Accept Meeting Request
- **Related actor(s):** Post Owner (Receiver)
- **What the user does:** Sunulan zaman dilimlerinden birini seçerek kabul eder.
- **What the system does:** Statusu `scheduled` yapar, bir toplantı linki üretir.
- **Frontend page/component:** `/dashboard/meetings`
- **Backend endpoint/function:** `POST /api/meetings/[id]/accept`
- **Status:** Found

### Accept NDA
- **Related actor(s):** System / User
- **What the user does:** Toplantı talebi gönderirken gizlilik sözleşmesini onaylar.
- **What the system does:** `ndaAccepted` alanını true yapar.
- **Status:** Partial
- **Notes:** Kodda toplantı oluşturulurken otomatik olarak `true` set edilmektedir.

### Meeting Request Status Values Found
- **Status name:** `pending` | **Meaning:** Onay bekleyen talep.
- **Status name:** `scheduled` | **Meaning:** Zaman dilimi seçilmiş ve onaylanmış.
- **Status name:** `declined` | **Meaning:** Talep reddedilmiş.
- **Status name:** `completed` | **Meaning:** Toplantı gerçekleşmiş.

## 7. Admin Use Cases

### View Platform Statistics
- **Related actor(s):** Admin
- **What the admin does:** Dashboard üzerinden toplam kullanıcı, aktif ilan ve eşleşme oranlarını görür.
- **What the system does:** Veritabanından toplamları hesaplar ve grafik verisi sunar.
- **Frontend page/component:** `/dashboard/admin`
- **Backend endpoint/function:** `GET /api/admin/stats`
- **Status:** Found

### View Audit Logs
- **Related actor(s):** Admin
- **What the admin does:** Sistemdeki tüm hareketleri (Girişler, silinen ilanlar vb.) listeler.
- **What the system does:** `AuditLog` tablosundaki verileri filtreleyerek getirir.
- **Frontend page/component:** `/dashboard/admin/logs`
- **Backend endpoint/function:** `GET /api/admin/logs`
- **Status:** Found

## 8. Activity Log / Audit Trail Use Cases

### Log Critical Actions
- **Related actor(s):** System (Automatic)
- **What triggers it:** Register, Login, Post Creation, Meeting Request gibi işlemler.
- **What the system logs:** `userId`, `userName`, `userRole`, `actionType`, `targetEntity`, `targetId`, `ipAddress`, `timestamp`.
- **Backend endpoint/function:** `logAudit` yardımcı fonksiyonu (`src/lib/audit.ts`).
- **Status:** Found

## 9. External System Use Cases

### External Meeting Link Provider
- **Related use case:** Accept Meeting Request
- **How it is used:** Toplantı onaylandığında otomatik olarak bir Zoom/Teams linki simüle edilir.
- **Triggering actor:** Post Owner
- **Status:** Partial (Mocked)

### External Email Service
- **Related use case:** Email Verification / Forgot Password
- **How it is used:** Sisteme kayıt olan kullanıcıya veya şifre sıfırlayana e-posta gönderimi.
- **Status:** Partial (Mocked)

## 10. User Role Permissions Summary

| Feature / Use Case | Guest | Engineer | Healthcare Prof. | Admin | Notes |
|---|---|---|---|---|---|
| Register | Yes | No | No | No | Sadece .edu maili |
| Login | Yes | No | No | No | |
| Create Post | No | Yes | Yes | No* | Admin sadece moderasyon yapar |
| Edit Own Post | No | Yes | Yes | Yes | Admin her ilanı düzenleyebilir |
| View Posts | No | Yes | Yes | Yes | |
| Search/Filter Posts | No | Yes | Yes | Yes | |
| Send Meeting Request | No | Yes | Yes | No | |
| Accept NDA | No | Yes | Yes | No | |
| Accept/Decline Meeting | No | Yes | Yes | No | |
| Mark Partner Found | No | Yes | Yes | No | |
| View Admin Dashboard | No | No | No | Yes | |
| Remove Post | No | No | No | Yes | Tüm postlar için geçerli |
| Suspend User | No | No | No | Yes | |
| View Activity Logs | No | No | No | Yes | |

## 11. Final Use Case Diagram Content Recommendation

### Recommended Actors
- **Guest:** Kayıt ve giriş işlemleri için.
- **User (General Actor):** Engineer ve Healthcare Professional için ortak parent aktör.
- **Admin:** Yönetimsel işlemler için.
- **External Email System:** Bildirimler için.

### Recommended Use Cases
- Register / Login / Logout
- Manage Profile
- Create / Edit / Search Posts
- Express Interest
- Send Meeting Request (Includes Accept NDA)
- Manage Meeting Requests (Accept/Decline)
- View Admin Dashboard
- Moderate Content (Delete Post / Suspend User)
- View System Audit Logs

## 12. Possible Include / Extend Relationships

| Main Use Case | Relationship | Included/Extended Use Case | Reason |
|---|---|---|---|
| Send Meeting Request | include | Accept NDA | Toplantı isteği göndermeden önce NDA onayı zorunludur. |
| Accept Meeting Request | include | Select Time Slot | Alıcı sunulan slotlardan birini seçmek zorundadır. |
| Create Post | include | Validate Input | Gerekli alanların (Başlık, Domain vb.) doluluğu kontrol edilir. |
| Login | extend | Create Audit Log | Her başarılı veya başarısız giriş denetim kaydı oluşturur. |
| Search Posts | extend | Filter by Domain | Arama işlemi isteğe bağlı olarak filtrelerle detaylandırılır. |

## 13. Expected but Missing Use Cases

| Expected Use Case | Found in Code? | Evidence / Notes |
|---|---|---|
| **Real Email Verification** | Partial | Kodda OTP gönderimi yok, sadece `123456` kontrolü var. |
| **Document Upload** | No | Postlara dosya veya doküman ekleme özelliği kodda yok. |
| **Real NDA Signing** | No | Sadece veritabanında bir Boolean alan var, imza süreci yok. |
| **Password Reset** | Partial | Endpoint var (`/forgot-password`) ama mail gönderim kodu eksik. |

## 14. Final Notes for Diagram Creator
- **Aktör Mirası:** Engineer ve Healthcare Professional kodda aynı yetkilere sahip olduğu için bir "Authorized User" aktörü tanımlayıp bu iki aktörü ondan miras aldırabilirsiniz.
- **Otomatik İşlemler:** Bildirim (Notification) gönderme ve Audit Log tutma işlemleri neredeyse tüm ana use case'lerin arkasında otomatik olarak çalışır.
- **Güvenlik:** Admin yetkileri `requireAdmin` kontrolü ile kesin bir şekilde ayrılmıştır, bu ayrımı diyagramda net göstermek önemlidir.
