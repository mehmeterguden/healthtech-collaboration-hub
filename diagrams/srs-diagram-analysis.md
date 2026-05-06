# HEALTH AI Platform – SRS Diagram Analysis from Code

## 1. Project Overview for Diagrams
HEALTH AI Platform, mühendisler ve sağlık profesyonelleri arasında güvenli, yapılandırılmış partner discovery (partner bulma) sağlayan bir web platformudur.
- **Platformun amacı:** Kısa metin tabanlı ilanlar ile klinik ve teknik uzmanları bir araya getirmek, gizlilik sözleşmesi (NDA) onayı ile güvenli görüşme ayarlamaktır.
- **Ana kullanıcı rolleri:** Guest, Engineer, Healthcare Professional, Admin.
- **Ana modüller:** Auth & User Management, Post/Discovery, Meeting Request & NDA Workflow, Admin Moderation & Audit Logs.
- **Sistemin yapmadığı şeyler:** Belge deposu, medikal veri sistemi, dosya paylaşım servisi, proje yönetim sistemi, finansal işlem sistemi veya tıbbi tavsiye platformu DEĞİLDİR. İlanlara dosya yüklenemez, görüşmeler harici platformlarda (Zoom vb.) yapılır.
- **Kod ile SRS arasındaki belirgin farklar:** Kodda e-posta doğrulaması ve toplantı linki oluşturma işlemleri simüle (mock) edilmiştir. Gerçek API entegrasyonu (SendGrid, Zoom) şu an yoktur.

## 2. Actors for Use Case Diagram

### Guest
- **Role name in code:** `Guest` (Unauthenticated)
- **Description:** Sisteme kayıt olma veya giriş yapma aşamasındaki ziyaretçi.
- **Main permissions:** Sadece public rotalara (register, login) erişim.
- **Accessible frontend routes/pages:** `/register`, `/login`, `/verify-email`.
- **Related backend endpoints:** `POST /api/auth/register`, `POST /api/auth/login`.
- **Notes:** `.edu` e-posta zorunluluğu vardır.

### Engineer
- **Role name in code:** `engineer`
- **Description:** Teknik çözüm (AI, IoT vb.) uzmanı.
- **Main permissions:** İlan oluşturma, düzenleme, arama, toplantı talep etme, ilgi belirtme.
- **Accessible frontend routes/pages:** `/dashboard`, `/dashboard/posts`, `/dashboard/create-post`, `/dashboard/meetings`, `/dashboard/profile/[slug]`.
- **Related backend endpoints:** `GET /api/posts`, `POST /api/posts`, `POST /api/meetings`, vb.
- **Notes:** Healthcare Professional ile aynı sistem yetkilerine sahiptir, sadece ilgi alanları farklıdır.

### Healthcare Professional
- **Role name in code:** `healthcare`
- **Description:** Tıbbi veri veya klinik ihtiyaç paylaşan sağlık uzmanı.
- **Main permissions:** İlan oluşturma, arama, toplantı talep etme, ilgi belirtme.
- **Accessible frontend routes/pages:** `/dashboard`, `/dashboard/posts`, `/dashboard/create-post`, `/dashboard/meetings`, `/dashboard/profile/[slug]`.
- **Related backend endpoints:** Aynı endpointleri kullanır.
- **Notes:** Sistem mimarisinde Engineer aktörüyle paraleldir.

### Admin
- **Role name in code:** `admin`
- **Description:** Platform moderatörü.
- **Main permissions:** Kullanıcı askıya alma, ilan silme, sistem loglarını (audit) inceleme, istatistikleri görme.
- **Accessible frontend routes/pages:** `/dashboard/admin`, `/dashboard/admin/users`, `/dashboard/admin/posts`, `/dashboard/admin/logs`.
- **Related backend endpoints:** `GET /api/admin/stats`, `POST /api/admin/users/[id]/suspend`, `DELETE /api/admin/posts/[id]`.
- **Notes:** Sadece denetim yapar, kendi ilanı yoktur.

### External Email System
- **Role name in code:** `External Email System` (Mocked)
- **Description:** E-posta doğrulama ve bildirim mailleri gönderen sistem.
- **Main permissions:** N/A (Tetiklenen sistemdir)
- **Accessible frontend routes/pages:** N/A
- **Related backend endpoints:** `POST /api/auth/register` içerisinde simüle edilir.
- **Notes:** Use Case diagramında "External System" olarak gösterilmelidir.

### External Meeting Link Provider
- **Role name in code:** `External Meeting Provider` (Mocked)
- **Description:** Zoom/Teams gibi platformları temsil eder.
- **Main permissions:** N/A
- **Accessible frontend routes/pages:** N/A
- **Related backend endpoints:** `POST /api/meetings/[id]/accept` içerisinde mock URL (`https://meet.healthai.edu/...`) üretilir.
- **Notes:** Harici bir aktör olarak diyagrama konabilir.

## 3. Use Cases for Use Case Diagram

### 3.1 Authentication & Account Use Cases

#### Register
- **Related actor(s):** Guest
- **What the user does:** İsim, .edu e-posta, şifre ve rol seçerek kayıt olur.
- **What the system does:** Kullanıcı oluşturur, hashler ve session açar.
- **Frontend page/component:** `/register`
- **Backend endpoint/function:** `POST /api/auth/register`
- **Status:** Found
- **Notes:** -

#### Login
- **Related actor(s):** Guest
- **What the user does:** E-posta ve şifre ile giriş yapar.
- **What the system does:** Session cookie oluşturur ve login işlemi audit loga yazılır.
- **Frontend page/component:** `/login`
- **Backend endpoint/function:** `POST /api/auth/login`
- **Status:** Found
- **Notes:** -

#### Verify Email
- **Related actor(s):** Guest
- **What the user does:** Doğrulama kodu (123456) girer.
- **What the system does:** E-postayı doğrular.
- **Frontend page/component:** `/verify-email`
- **Backend endpoint/function:** N/A (Frontend mock)
- **Status:** Partial (Mocked)
- **Notes:** -

#### Manage Profile
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Bio, lokasyon ve uzmanlık günceller.
- **What the system does:** `User` tablosunu günceller.
- **Frontend page/component:** `/dashboard/profile/[slug]`
- **Backend endpoint/function:** `PATCH /api/users/profile` (Temsili, db üzerinden)
- **Status:** Found
- **Notes:** -

### 3.2 Post Management Use Cases

#### Create Post
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Proje fikrini (Title, Domain, Stage vs.) yazar. Dosya yükleyemez.
- **What the system does:** `Post` oluşturur ve audit log tutar.
- **Frontend page/component:** `/dashboard/create-post`
- **Backend endpoint/function:** `POST /api/posts`
- **Status:** Found
- **Notes:** -

#### Edit Own Post
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** İlan detaylarını değiştirir.
- **What the system does:** `Post` verisini günceller.
- **Frontend page/component:** Modal veya Edit page.
- **Backend endpoint/function:** `PATCH /api/posts/[id]`
- **Status:** Found
- **Notes:** -

#### Search and Filter Posts
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Kelime, şehir, domain ve aşamaya göre ilan arar.
- **What the system does:** Sonuçları filtreler ve döner.
- **Frontend page/component:** `/dashboard/posts`
- **Backend endpoint/function:** `GET /api/posts?search=...&domain=...`
- **Status:** Found
- **Notes:** -

#### View Post Details
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** İlanın tam metnini okur.
- **What the system does:** İlan detayını döner.
- **Frontend page/component:** `/dashboard/posts/[id]` (veya modal)
- **Backend endpoint/function:** `GET /api/posts/[id]`
- **Status:** Found
- **Notes:** -

### 3.3 Meeting Workflow Use Cases

#### Send Meeting Request
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** NDA'i kabul eder, mesaj yazar, 3 adet time slot seçer ve gönderir.
- **What the system does:** `MeetingRequest` oluşturur.
- **Frontend page/component:** `RequestMeetingModal` (in post view)
- **Backend endpoint/function:** `POST /api/meetings`
- **Status:** Found
- **Notes:** -

#### Accept NDA
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** İstek göndermeden önce onay kutusunu işaretler.
- **What the system does:** İstek verisine `ndaAccepted: true` ekler.
- **Frontend page/component:** `RequestMeetingModal`
- **Backend endpoint/function:** `POST /api/meetings` (payload içinde)
- **Status:** Partial (Simüle ediliyor)
- **Notes:** Sadece boolean alan olarak tutulur.

#### Accept Meeting Request
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Gelen talebi görüntüler ve bir slot seçerek onaylar.
- **What the system does:** Status'ü `scheduled` yapar ve mock link oluşturur.
- **Frontend page/component:** `/dashboard/meetings`
- **Backend endpoint/function:** `POST /api/meetings/[id]/accept`
- **Status:** Found
- **Notes:** -

#### Decline Meeting Request
- **Related actor(s):** Engineer, Healthcare Professional
- **What the user does:** Talebi reddeder.
- **What the system does:** Status'ü `declined` yapar.
- **Frontend page/component:** `/dashboard/meetings`
- **Backend endpoint/function:** `POST /api/meetings/[id]/decline`
- **Status:** Found
- **Notes:** -

### 3.4 Admin Use Cases

#### View Admin Dashboard
- **Related actor(s):** Admin
- **What the admin does:** Genel metrikleri (kullanıcı sayısı, aktif ilanlar) görüntüler.
- **What the system does:** Verileri hesaplar ve sunar.
- **Frontend page/component:** `/dashboard/admin`
- **Backend endpoint/function:** `GET /api/admin/stats`
- **Status:** Found
- **Notes:** -

#### Suspend User
- **Related actor(s):** Admin
- **What the admin does:** İhlal yapan kullanıcıyı devre dışı bırakır.
- **What the system does:** `isActive` false yapar, audit log yazar.
- **Frontend page/component:** `/dashboard/admin/users`
- **Backend endpoint/function:** `POST /api/admin/users/[id]/suspend`
- **Status:** Found
- **Notes:** -

#### Remove Inappropriate Post
- **Related actor(s):** Admin
- **What the admin does:** İhlal içeren bir ilanı zorla siler.
- **What the system does:** İlanı siler, audit log yazar.
- **Frontend page/component:** `/dashboard/admin/posts`
- **Backend endpoint/function:** `DELETE /api/posts/[id]` (role kontrolü ile)
- **Status:** Found
- **Notes:** -

#### View Activity Logs (Audit Logs)
- **Related actor(s):** Admin
- **What the admin does:** Sistemdeki işlemleri (giriş, silme, oluşturma) izler.
- **What the system does:** `AuditLog` kayıtlarını listeler.
- **Frontend page/component:** `/dashboard/admin/logs`
- **Backend endpoint/function:** `GET /api/admin/logs`
- **Status:** Found
- **Notes:** -

### 3.5 System / Automatic Use Cases

#### Create Audit Log
- **Trigger:** Register, login, post create/delete, meeting actions, admin actions.
- **What the system does:** Veritabanına `AuditLog` kaydı atar.
- **Related endpoint/function:** `logAudit` in `src/lib/audit.ts`
- **Status:** Found
- **Notes:** -

#### Send In-app Notification
- **Trigger:** İlgi belirtme, toplantı isteği gelme veya kabul edilme.
- **What the system does:** `Notification` tablosuna kayıt oluşturur.
- **Related endpoint/function:** `prisma.notification.create` API routelarında kullanılıyor.
- **Status:** Found
- **Notes:** -

## 4. Actor–Use Case Mapping

| Actor | Related Use Cases |
|---|---|
| Guest | Register, Login, Verify Email |
| Engineer & Healthcare Pro | Create Post, Edit Own Post, Search and Filter Posts, View Post Details, Manage Profile, Send Meeting Request, Accept NDA, Accept Meeting Request, Decline Meeting Request |
| Admin | View Admin Dashboard, Suspend User, Remove Inappropriate Post, View Activity Logs |
| External Email System | Send Verification Email (Mock) |
| External Meeting Provider | Generate Meeting Link (Mock) |

*(Not: Engineer ve Healthcare Professional sistem izinleri açısından birebir aynıdır, diyagramda ortak bir `User` rolünden miras alabilirler.)*

## 5. Include / Extend Relationships for Use Case Diagram

| Main Use Case | Relationship | Related Use Case | Reason |
|---|---|---|---|
| Register | include | Verify Email | Kayıt olmak için e-posta doğrulaması gerekir. |
| Send Meeting Request | include | Accept NDA | İstek göndermeden önce NDA onayı zorunludur. |
| Send Meeting Request | include | Propose Time Slots | Kullanıcı zorunlu olarak tarih/saat seçmelidir. |
| Accept Meeting Request | include | Generate Meeting Link | Kabul sırasında sistem otomatik link oluşturur. |
| Search Posts | extend | Filter Posts | Arama işlemi isteğe bağlı olarak filtrelerle (domain, city) detaylandırılabilir. |
| Admin Removes Post | include | Create Audit Log | Kritik admin işlemi loglanmak zorundadır. |
| Login | extend | Create Audit Log | Giriş başarısız olduğunda veya başarılı olduğunda log tutulur. |

## 6. ER Diagram / Data Model Information

### User
- **Table/model name in code:** `User`
- **Purpose:** Platforma üye olan kişileri tutar.
- **Primary key:** `id` (String/CUID)
- **Fields:**
  - `email`: String, Unique
  - `password`: String
  - `role`: String (enum: admin, engineer, healthcare)
  - `firstName`, `lastName`, `institution`, `city`, `country`: String
  - `isActive`: Boolean, Default: true
  - `profileCompleteness`: Int
- **Relationships:** `posts`, `interests`, `notifications`, `sentRequests`, `receivedRequests`, `auditLogs`

### Post
- **Table/model name in code:** `Post`
- **Purpose:** Kullanıcıların açtığı proje veya ihtiyaç ilanlarını tutar.
- **Primary key:** `id`
- **Fields:**
  - `title`, `description`, `domain`: String
  - `projectStage`, `commitmentLevel`, `collaborationType`: String
  - `status`: String (enum: draft, active, meeting_scheduled, partner_found, expired)
  - `expiryDate`: DateTime, Optional
- **Foreign keys:** `authorId` -> `User.id`
- **Relationships:** `author`, `interests`, `meetingRequests`

### MeetingRequest
- **Table/model name in code:** `MeetingRequest`
- **Purpose:** İki kullanıcı arasındaki toplantı taleplerini ve NDA onayını tutar.
- **Primary key:** `id`
- **Fields:**
  - `message`: String
  - `proposedSlots`: String (JSON)
  - `selectedSlot`: String (JSON), Optional
  - `status`: String (enum: pending, accepted, declined, scheduled, completed, cancelled)
  - `ndaAccepted`: Boolean
  - `meetingLink`: String, Optional
- **Foreign keys:** `postId` -> `Post.id`, `requesterId` -> `User.id`, `receiverId` -> `User.id`
- **Relationships:** `post`, `requester`, `receiver`

### Notification
- **Table/model name in code:** `Notification`
- **Purpose:** Uygulama içi bildirimler.
- **Primary key:** `id`
- **Fields:** `type` (String), `message` (String), `isRead` (Boolean)
- **Foreign keys:** `userId` -> `User.id`

### AuditLog
- **Table/model name in code:** `AuditLog`
- **Purpose:** Sistemdeki kritik olayları izleme.
- **Primary key:** `id`
- **Fields:**
  - `actionType`: String
  - `targetEntity`, `targetId`: String
  - `ipAddress`: String, Optional
- **Foreign keys:** `userId` -> `User.id`, Optional

## 7. ER Diagram Relationship Summary

| Entity A | Relationship | Entity B | Foreign Key / Notes |
|---|---|---|---|
| User | 1:N | Post | `authorId` (User creates Posts) |
| User | 1:N | MeetingRequest | `requesterId` (User sends requests) |
| User | 1:N | MeetingRequest | `receiverId` (User receives requests) |
| Post | 1:N | MeetingRequest | `postId` (Meeting belongs to a Post) |
| User | 1:N | Interest | `userId` |
| Post | 1:N | Interest | `postId` |
| User | 1:N | Notification | `userId` |
| User | 1:N | AuditLog | `userId` (Action performed by User) |

## 8. Post Lifecycle Data

| Status | Meaning | Where Used in Code | Notes |
|---|---|---|---|
| draft | İlan taslak aşamasında, yayında değil. | `Post.status` | Varsayılan status olabilir. |
| active | İlan yayında, aramalarda çıkıyor. | `Post.status` | - |
| meeting_scheduled | En az bir toplantı planlanmış, ama açık. | `Post.status` | - |
| partner_found | Partner bulunmuş, ilan kapalı. | `Post.status` | Terminal state (Kapalı). |
| expired | İlanın süresi dolmuş. | `Post.status` | Auto-close veya tarih bitimi. |

## 9. Meeting Request Lifecycle Data

| Status | Meaning | Where Used in Code | Notes |
|---|---|---|---|
| pending | Talebi alan kişinin onayı bekleniyor. | `MeetingRequest.status` | - |
| scheduled | Zaman seçilmiş, meeting link üretilmiş. | `MeetingRequest.status` | Kabul edilince bu statüye geçer. |
| declined | İstek reddedilmiş. | `MeetingRequest.status` | - |
| completed | Toplantı başarıyla gerçekleşmiş. | `MeetingRequest.status` | - |
| cancelled | Toplantı sonradan iptal edilmiş. | `MeetingRequest.status` | - |

## 10. Wireframe / Mockup Information

### Registration / Role Selection Page
- **Route/path:** `/register`
- **Main purpose:** Kullanıcı hesabı oluşturma ve rol (Engineer/Healthcare) seçimi.
- **User roles who can access:** Guest
- **Main UI sections:** 3 adımlı sihirbaz (Account, Role, Profile).
- **Forms/inputs:** Email (.edu zorunlu), Password, First/Last Name, Institution, City, Country.
- **Buttons/actions:** Select Role (Card Buttons), Continue, Create Account.
- **Notes for wireframe designer:** ".edu only" ibaresini vurgulayın. Rol seçimi için iki büyük görsel kart çizin.

### Dashboard / Search Feed Page
- **Route/path:** `/dashboard/posts`
- **Main purpose:** İlanları listeleme ve arama.
- **User roles who can access:** Engineer, Healthcare Professional
- **Main UI sections:** Sol tarafta filtre menüsü (Sidebar), sağda arama çubuğu ve ilan kartları listesi.
- **Forms/inputs:** Search input, Checkboxes (Domain, Stage).
- **Cards/tables/modals:** "Post Card" bileşeni (Title, snippet, yazar, domain rozeti).
- **Notes for wireframe designer:** "Local Match" etiketi ilan kartlarında belirgin olmalı.

### Create Post Page
- **Route/path:** `/dashboard/create-post`
- **Main purpose:** Yeni ilan oluşturma.
- **User roles who can access:** Engineer, Healthcare Professional
- **Main UI sections:** Form blokları (Basic Info, Collaboration Details, Location & Expiry).
- **Forms/inputs:** Text inputs, Textarea (Description), Select Dropdowns (Domain, Stage), Switch (Auto-close).
- **Notes for wireframe designer:** Dosya yükleme (File Upload) alanı kesinlikle OLMAMALIDIR.

### Meeting Request Modal (Meeting Workflow Screen)
- **Route/path:** `RequestMeetingModal` componenti (Post detay sayfasında açılır).
- **Main purpose:** Toplantı talep etme ve NDA kabulü.
- **User roles who can access:** Engineer, Healthcare Professional
- **Main UI sections:** Mesaj alanı, NDA onay checkbox'ı, 3 adet tarih/saat seçici alanı (Proposed Slots).
- **Forms/inputs:** Textarea, Date/Time pickers, Checkbox.
- **Buttons/actions:** "Send Request" butonu.
- **Notes for wireframe designer:** NDA Checkbox zorunlu alan olarak gösterilmelidir.

### Meetings Page (Management)
- **Route/path:** `/dashboard/meetings`
- **Main purpose:** Gelen ve giden toplantı taleplerini yönetme.
- **User roles who can access:** Engineer, Healthcare Professional
- **Main UI sections:** Sekmeler (Incoming, Outgoing, Scheduled, Past).
- **Cards/tables/modals:** "Meeting Card" bileşeni (Karşıdaki kişi, tarih seçenekleri, durum rozeti).
- **Buttons/actions:** Accept (Select time slot from proposed), Decline, Cancel, Join Now (Video icon).
- **Notes for wireframe designer:** Gelen taleplerde 3 tarih/saat seçeneği radyo butonu tarzında gösterilmelidir.

### Admin Dashboard (Logs & Users)
- **Route/path:** `/dashboard/admin`
- **Main purpose:** Sistemin sağlığını izleme.
- **User roles who can access:** Admin
- **Main UI sections:** En üstte metrik kartları (Total Users vb.), altta iki tablo (Recent Users, Recent Audit Logs).
- **Buttons/actions:** Suspend User, Delete Post.
- **Notes for wireframe designer:** Basit bir tablo ve stat kartları çizilmelidir.

## 11. Recommended Wireframes for SRS

| Priority | Wireframe Name | Why It Is Needed | Related SRS Section |
|---|---|---|---|
| 1 | Registration / Role Selection | .edu kısıtlamasını ve rol seçimini göstermek için. | User Registration |
| 2 | Search Feed & Post Cards | Ana ürün ekranıdır, arama filtrelerini gösterir. | Search & Matching |
| 3 | Create Post Form | Sadece metin odaklı girişi kanıtlar. | Post Creation |
| 4 | Meeting Request Modal | NDA onay kutusunu ve slot önermeyi gösterir. | Meeting Workflow |
| 5 | Meetings Management | Kabul/red ve Join link süreçlerini görselleştirir. | Meeting Management |
| 6 | Admin Dashboard | Log ve denetim tablolarını göstermek için. | Admin Interfaces |

## 12. External Systems for Diagrams

### SendGrid / Email Service
- **Related feature:** Registration, Password Reset.
- **How it is used:** E-posta doğrulama kodları gönderir.
- **Real integration or mocked:** Mocked.
- **Should appear in Use Case Diagram?** Yes (External System Actor).

### Zoom / Microsoft Teams
- **Related feature:** Scheduled Meetings.
- **How it is used:** Kabul edilen toplantılar için video görüşme linki oluşturur.
- **Real integration or mocked:** Mocked.
- **Should appear in Use Case Diagram?** Yes (External System Actor).

## 13. Code vs SRS / Project Brief Gap Analysis

| Expected Feature | Found in Code? | Status | Notes |
|---|---|---|---|
| .edu registration | Yes | Found | Kayıtta endpoint kontrolü var. |
| Email verification | Partial | Mocked | Arayüz var ama kod 123456 olarak sabit. |
| Text-only post creation | Yes | Found | Sadece metin ve dropdown alanları var. |
| File upload prevention | Yes | Found | Arayüzde veya veritabanında dosya/resim alanı yok. |
| NDA acceptance before meeting | Yes | Found | Payload'da `ndaAccepted` alanı var. (Mock) |
| Post lifecycle states | Yes | Found | `draft, active, partner_found, expired` kullanılıyor. |
| Admin audit logs | Yes | Found | `AuditLog` modeli tam olarak implamente edilmiş. |
| User suspension | Yes | Found | Admin `/suspend` endpoint'i aktif. |
| GDPR/privacy constraints | Partial | Found | Şifre hashing mevcut, veriler DB'de saklanıyor. |

## 14. Final Diagram Preparation Summary

### Use Case Diagram – Final Content
- **Recommended actors:** Guest, User (Engineer/Healthcare), Admin, EmailSystem, MeetingProvider.
- **Recommended use cases:** Register, Manage Profile, Create Post, Search Posts, Send Meeting Request, Manage Meetings, View Audit Logs, Suspend User.
- **Recommended include/extend relationships:** Send Meeting Request `<<include>>` Accept NDA. Search Posts `<<extend>>` Filter by Domain. Register `<<include>>` Verify Email.
- **Things to avoid:** Tüm ufak profil güncellemelerini ayrı use case yapmayın. `User` genel aktörü altında toplayıp diyagramı sade tutun.

### ER Diagram – Final Content
- **Recommended entities:** User, Post, MeetingRequest, AuditLog.
- **Recommended relationships:** User (1) - (N) Post, User (1) - (N) MeetingRequest, Post (1) - (N) MeetingRequest.
- **Optional entities:** Notification, Interest (Diagram kalabalıklaşırsa atlanabilir).
- **Important fields to show:** `User.role`, `User.email`, `Post.status`, `MeetingRequest.status`, `MeetingRequest.ndaAccepted`, `AuditLog.actionType`.

### Wireframes – Final Content
- **Recommended wireframes:** Register, Search Feed, Create Post, Meeting Modal, Meeting Manager, Admin Dashboard.
- **Main UI elements to show in each:** NDA Checkbox, 3 Time Slots inputs, "Local Match" badge, "partner_found" statüsü, .edu e-posta alanı.
- **Screens that can be skipped if time is limited:** Profil sayfası, Login sayfası, Bildirim listesi.
