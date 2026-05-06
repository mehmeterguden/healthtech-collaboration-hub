# HEALTH AI Platform – User Guide Code Analysis

Bu doküman, HEALTH AI Platform projesinin kaynak kodları ve kullanıcı arayüzü incelenerek, User Guide dokümanını doldurmak ve gerekli ekran görüntülerini belirlemek amacıyla hazırlanmıştır.

## 1. General Platform Overview
HEALTH AI Platform (European HealthTech Co-Creation & Innovation Platform), mühendisler ve sağlık profesyonelleri arasında interdisipliner işbirliğini kolaylaştırmak için tasarlanmış güvenli bir ağdır.

- **Platform ne işe yarıyor?**: Sağlık teknolojisi geliştiren mühendisler ile klinik bilgiye sahip sağlık çalışanlarını bir araya getirerek proje fikirlerinin doğrulanmasını, ortaklık kurulmasını ve güvenli bir ortamda ilk temasın (meeting request) sağlanmasını sağlar.
- **Ana kullanıcı rolleri**:
    - **Engineer (Mühendis)**: Teknoloji geliştiriciler, klinik validasyona ihtiyaç duyanlar.
    - **Healthcare Professional (Sağlık Profesyoneli)**: Klinik uzmanlığı olan, yenilikçi fikirleri hayata geçirmek isteyenler.
    - **Admin**: Platform yönetimi, kullanıcı denetimi ve içerik moderasyonu yapan yetkililer.
- **Ana kullanıcı işlemleri**: Hesap oluşturma (.edu zorunluluğu), profil doldurma, ilan (post) oluşturma/yönetme, ilanları filtreleme, ilgi belirtme, toplantı talebi gönderme ve platform içi bildirim takibi.

---

## 2. User Roles and Permissions

| Feature | Guest | Engineer | Healthcare Professional | Admin | Notes |
|---|---|---|---|---|---|
| Register | Yes | Yes | Yes | No | Adminler özel yetkiyle tanımlanır. |
| Login | Yes | Yes | Yes | Yes | `/login` sayfasından yapılır. |
| Create Post | No | Yes | Yes | Yes | Dashboard üzerinden erişilir. |
| Search Posts | No | Yes | Yes | Yes | `/dashboard/posts` |
| Send Meeting Request | No | Yes | Yes | No | Kendi ilanına talep gönderilemez. |
| Admin Dashboard | No | No | No | Yes | `/admin` |

---

## 3. Feature Clarifications (Code Verified)

### 3.1 NDA Acceptance
- **Status**: **Partial / Mocked** (API Level)
- **Code Evidence**: `src/components/meetings/request-meeting-modal.tsx` içinde checkbox yoktur. Ancak `src/app/api/meetings/route.ts` dosyasında `ndaAccepted: true` değeri backend tarafında otomatik eklenir.
- **User Guide Wording**: "Toplantı talebi gönderdiğinizde, platformun standart Gizlilik Sözleşmesi (NDA) şartlarını otomatik olarak kabul etmiş sayılırsınız."

### 3.2 Meeting Link
- **Status**: **Found / Automatic (Mocked)**
- **Code Evidence**: `src/app/api/meetings/[id]/accept/route.ts` içinde toplantı onaylandığında `https://meet.healthai.edu/[random-id]` linki otomatik oluşturulur.
- **User Guide Wording**: "Toplantı talebi onaylandığında, sistem tarafından otomatik olarak bir görüşme linki oluşturulur ve Meetings sayfasında her iki tarafa da sunulur."

### 3.3 Email Verification
- **Status**: **Found / Mocked**
- **Code Evidence**: `/verify-email` sayfası mevcuttur. Gerçek email gönderilmez; demo kodu `123456` olarak sabitlenmiştir (`src/app/api/auth/register/route.ts`).
- **User Guide Wording**: "Kayıt sonrası demo sürümü için `123456` doğrulama kodunu kullanmanız gerekmektedir."

### 3.4 Forgot Password
- **Status**: **Mocked**
- **Code Evidence**: UI mevcuttur ancak backend gerçek bir sıfırlama yapmaz.
- **User Guide Wording**: "Bu özellik prototip aşamasında olup, gerçek e-posta gönderimi bir sonraki güncellemede aktif edilecektir."

### 3.5 Delete Account
- **Status**: **Found / Fully Functional**
- **Code Evidence**: `src/app/api/users/profile/route.ts` içinde `DELETE` metodu Prisma ile tüm kullanıcı verilerini siler.
- **User Guide Wording**: "Hesabınızı ve tüm verilerinizi Settings -> Privacy & Data sekmesinden kalıcı olarak silebilirsiniz."

### 3.6 Export Data
- **Status**: **Found / Functional**
- **Code Evidence**: `src/app/api/users/export/route.ts` tüm kullanıcı verilerini **JSON** formatında indirilebilir hale getirir.
- **User Guide Wording**: "Tüm verilerinizi JSON formatında bilgisayarınıza indirebilirsiniz."

### 3.7 Admin Routes
- **Dashboard**: `/admin`
- **Users**: `/admin/users`
- **Posts**: `/admin/posts`
- **Logs**: `/admin/logs`

### 3.8 Create Post Role Difference
- **High-Level Idea Field**: Sadece **Engineer** rolü için görünür (`src/app/dashboard/create-post/page.tsx:333`). Healthcare Professional bu alanı görmez.

---

## 4. Screenshot Plan for User Guide

| No | Suggested File Name | Page/Route | Description | Section |
|---|---|---|---|---|
| 1 | landing-hero | `/` | Ana sayfa genel görünümü | Intro |
| 2 | register-form | `/register` | Kayıt formu ve rol seçimi | Registration |
| 3 | verify-email-page | `/verify-email` | 6 haneli kod giriş ekranı | Registration |
| 4 | dashboard-home | `/dashboard` | İstatistik kartları ve dashboard | Dashboard |
| 5 | browse-posts | `/dashboard/posts` | İlan listesi ve filtreleme | Discovery |
| 6 | create-post-engineer | `/dashboard/create-post` | Mühendis için ilan formu (High-Level Idea dahil) | Posts |
| 7 | meeting-request-modal | `/dashboard/post/[id]` | Toplantı talebi ve slot seçimi | Meetings |
| 8 | scheduled-meeting-link | `/dashboard/meetings` | Onaylanmış toplantı ve otomatik link | Meetings |
| 9 | export-data-button | `/dashboard/settings` | Veri dışa aktarma butonu | Settings |
| 10 | admin-panel-overview | `/admin` | Yönetici paneli ve grafikler | Admin |

---
*Bu analiz HEALTH AI Platform kaynak kodları baz alınarak hazırlanmıştır.*
