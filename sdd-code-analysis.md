# HEALTH AI Platform – SDD Code Analysis

## 1. Project and Technology Overview
Sistem, modern bir web mimarisi olan **Next.js (v15.1)** framework'ü üzerine kurulu, TypeScript ile geliştirilmiş bir full-stack uygulamadır.

- **Proje türü:** Full-stack (Next.js App Router).
- **Kullanılan frameworkler:** Next.js (Frontend & API), Tailwind CSS (Styling), Radix UI (Component primitives), Framer Motion (Animations), Recharts (Charts).
- **Kullanılan programlama dili:** TypeScript.
- **Package manager:** npm.
- **Database teknolojisi:** SQLite (Development/Demo).
- **ORM veya database access yöntemi:** Prisma.
- **Authentication/session yöntemi:** Custom JWT-based Session management via HTTP-only cookies (`jose` library).
- **Deployment için görünen config:** `Dockerfile` ve `docker-compose.yml` mevcut (containerized deployment'a hazır).
- **Kod yapısındaki ana klasörler:**
    - `src/app`: Page components ve API route handlers (Next.js App Router).
    - `src/components`: Reusable UI components (ui, layout, posts, admin).
    - `src/lib`: Core logic (auth, database client, audit logging, api client, zustand store).
    - `src/types`: TypeScript interface ve type tanımları.
    - `prisma`: Database schema ve migration/seed scriptleri.
- **Genel mimari yaklaşım:** **Full-stack Monolith** (Next.js App Router mimarisi). Frontend ve Backend aynı kod tabanında, API rotaları üzerinden iletişim kuran bir yapıdadır. Client-side state yönetimi için **Zustand** kullanılmaktadır.
- **Kod ile SRS/brief arasındaki önemli farklar:**
    - E-posta gönderimi ve doğrulaması simüle edilmiştir (Mocked).
    - Toplantı linki oluşturma işlemi simüle edilmiştir (Mocked).
    - Dosya yükleme özelliği (File Upload) kodda ve şemada hiç yer almamaktadır (Brief ile uyumlu).
    - NDA süreci dijital imza değil, metin onaylı bir boolean alan olarak tutulmaktadır.

## 2. Architectural Design Information

### 2.1 Architectural Overview
- **Genel Mimari:** Client-Server mimarisi üzerine kurulu Full-stack Next.js uygulaması.
- **Frontend/Backend:** Aynı projede (Next.js mono-repo).
- **API Yapısı:** RESTful API Route Handlers (`src/app/api/...`).
- **Client-Server İlişkisi:** Frontend, Next.js API rotalarına fetch (api.ts üzerinden) istekleri atar. Server tarafında Prisma ORM ile veritabanına erişilir.
- **Request Flow:** Browser -> Next.js Middleware (Auth check) -> API Route Handler -> Prisma -> SQLite -> API Response -> Frontend Component.
- **Modüller:** Auth, Post, Meeting ve Admin modülleri API rotaları ve bunlara karşılık gelen Dashboard alt sayfaları olarak ayrılmıştır.
- **Architectural Pattern:** **Next.js App Router Architecture** (Component-based Presentation + Server-side API Handlers).

### 2.2 Layer Information

| Layer | Responsibility | Technology Choice | Evidence from Code |
|---|---|---|---|
| Presentation | User interface, state management | React (Next.js), Tailwind CSS, Zustand | `src/app/dashboard/page.tsx`, `src/lib/store.ts` |
| Business Logic | Input validation, lifecycle management, RBAC | TypeScript, Middleware, Jose (JWT) | `src/middleware.ts`, `src/lib/auth.ts`, `src/app/api/...` |
| Data Access | Database queries, models mapping | Prisma ORM | `src/lib/db.ts`, `prisma/schema.prisma` |
| Database | Persistent data storage | SQLite | `prisma/dev.db` (local development) |
| External Services | Communication (Email, Meetings) | Simulated (Mocked) | `src/app/api/auth/register/route.ts` (Mock email code) |

### 2.3 Architecture Diagram Information
- **Client / Browser:** React Frontend.
- **Frontend Application:** Next.js Components.
- **Backend/API Layer:** Next.js API Route Handlers.
- **Business Modules:** Auth, Post, Meeting, Admin, Notification, Audit.
- **ORM/Data Access:** Prisma Client.
- **Database:** SQLite.
- **External Email Service:** Mocked (Logic resides in registration route).
- **External Meeting Provider:** Mocked (Logic generates random URL in accept route).
- **Authentication/Session Store:** JWT inside Browser Cookies (HTTP-only).

---

## 3. Deployment Design Information

### Deployment Nodes
| Node | Purpose | Technology / Platform | Evidence | Notes |
|---|---|---|---|---|
| Web Container | Next.js App Runner | Node.js / Docker | `Dockerfile`, `package.json` | Vercel veya Node server üzerinde çalışabilir. |
| Database Node | Local storage | SQLite | `prisma/schema.prisma` | Docker container içinde dosya tabanlı saklanır. |

### Deployment Connections
| Source | Target | Protocol / Method | Purpose |
|---|---|---|---|
| User Browser | Web Container | HTTPS / HTTP | User interaction |
| Web Container | Database Node | File System (SQLite) | Data persistence via Prisma |

### Environment Variables
| Variable Name | Purpose | Required? | Notes |
|---|---|---|---|
| `DATABASE_URL` | Prisma connection string | Yes | `file:./dev.db` |
| `JWT_SECRET` | Security for signing session tokens | Yes | Found in `middleware.ts` and `src/lib/auth.ts` |

---

## 4. Component Design Information

### AuthModule
- Responsibility: User registration, login, logout, session verification.
- Related frontend pages: `/register`, `/login`, `/verify-email`.
- Related backend routes: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`, `/api/auth/logout`.
- Related services: `src/lib/auth.ts`, `jose` JWT signing.
- Related database models: `User`.
- Security: HTTP-only cookies, password hashing (bcrypt).

### PostModule
- Responsibility: Creation, editing, status management and search.
- Related frontend pages: `/dashboard/posts`, `/dashboard/create-post`, `/dashboard/post/[id]`.
- Related backend routes: `/api/posts`, `/api/posts/[id]`.
- Related database models: `Post`.
- Security: RequireAuth, Only author can edit/delete.

### MeetingModule
- Responsibility: Sending requests, NDA acceptance, slot management, acceptance logic.
- Related frontend pages: `/dashboard/meetings`, `RequestMeetingModal.tsx`.
- Related backend routes: `/api/meetings`, `/api/meetings/[id]/accept`, `/api/meetings/[id]/decline`.
- Related database models: `MeetingRequest`, `Post`.
- Security: NDA acceptance boolean check.

### AdminModule
- Responsibility: User suspension, post removal, viewing logs/stats.
- Related frontend pages: `/admin`, `/admin/users`, `/admin/posts`, `/admin/logs`.
- Related backend routes: `/api/admin/...`.
- Related database models: `User`, `Post`, `AuditLog`.
- Security: `requireAdmin` guard.

### AuditModule
- Responsibility: Logging all state-changing actions.
- Related services: `src/lib/audit.ts`.
- Related database models: `AuditLog`.
- Security: Automatic logging in API handlers.

---

## 5. Component Interaction Information

| Source Component | Target Component | Interaction / Call | Trigger | Notes |
|---|---|---|---|---|
| Frontend UI | AuthModule | POST /api/auth/register | User clicks Register | Creates user with status inactive. |
| Frontend UI | AuthModule | POST /api/auth/login | User enters credentials | Returns session cookie. |
| PostModule | MeetingModule | POST /api/meetings | User sends request | Validates NDA acceptance first. |
| MeetingModule | PostModule | PATCH /api/posts/[id] | Accepting meeting | Changes post status to `meeting_scheduled`. |
| AdminModule | UserModule | POST /api/admin/users/[id]/suspend | Admin clicks suspend | Updates `isActive` to false. |
| Any API Route | AuditModule | `logAudit()` | State change success | Writes to `AuditLog` table. |

---

## 6. Database Design Information

### Table: User
- Purpose: Stores account and profile information.
- Primary key: `id` (String/CUID).
- Fields: `email`, `password`, `firstName`, `lastName`, `role`, `institution`, `city`, `country`, `expertise` (JSON string), `bio`, `isActive` (Boolean), `slug`.

### Table: Post
- Purpose: Stores collaboration offers.
- Primary key: `id`.
- Fields: `title`, `description`, `domain`, `projectStage`, `commitmentLevel`, `collaborationType`, `confidentialityLevel`, `city`, `status` (Enum).
- Foreign keys: `authorId` -> `User.id`.

### Table: MeetingRequest
- Purpose: Stores requests and scheduled meetings.
- Primary key: `id`.
- Fields: `message`, `proposedSlots` (JSON), `selectedSlot` (JSON), `status` (Enum), `ndaAccepted` (Boolean), `meetingLink`.
- Foreign keys: `postId`, `requesterId`, `receiverId`.

### Table: AuditLog
- Purpose: Trail of system actions for security.
- Fields: `actionType`, `targetEntity`, `targetId`, `userId`, `userName`, `userRole`, `ipAddress`, `timestamp`.

---

## 7. ER Diagram Relationship Summary

| Entity A | Relationship | Entity B | Foreign Key | Description |
|---|---|---|---|---|
| User | 1:N | Post | `authorId` | One user can author many posts. |
| User | 1:N | MeetingRequest | `requesterId` | One user can send many requests. |
| User | 1:N | MeetingRequest | `receiverId` | One user can receive many requests. |
| Post | 1:N | MeetingRequest | `postId` | One post can have multiple meeting requests. |
| User | 1:N | AuditLog | `userId` | Logs are linked to the performing user. |
| User | 1:N | Notification | `userId` | User receives notifications. |

---

## 8. API Design Information (Sample)

| Method | Endpoint | Description | Auth Required | Role |
|---|---|---|---|---|
| POST | /api/auth/login | Creates session | No | Guest |
| GET | /api/posts | List/Search posts | Yes | Any User |
| POST | /api/posts | Create new post | Yes | Engineer/Healthcare |
| POST | /api/meetings | Request meeting | Yes | Any User |
| GET | /api/admin/logs | View audit trail | Yes | Admin |

---

## 9. UI Design Information

### Dashboard Feed
- Route/path: `/dashboard/posts`
- Access level: Authenticated.
- Main UI sections: Sidebar filters, Search bar, Post Grid.
- Actions: Search, Filter, View Details.

### Post Detail Page
- Route/path: `/dashboard/post/[id]`
- Main sections: Post text, Author info, Interest/Meeting button.
- Actions: Express Interest, Send Meeting Request (Modal).

---

## 10. Navigation Flow Information

| From Screen | User Action | To Screen / Modal | Access Rule |
|---|---|---|---|
| Landing | Click Login | Login Page | Public |
| Register | Complete Form | Verify Email Page | Public |
| Dashboard | Click "New Post" | Create Post Page | Auth |
| Posts Feed | Click Post Card | Post Detail Page | Auth |
| Post Detail | Click "Request" | Meeting Modal | Auth |

---

## 11. Security Design Information

| Security Requirement | Design Decision / Code Evidence | Related File | Status |
|---|---|---|---|
| Authentication | JWT in HTTP-only Cookie | `src/lib/auth.ts` | Found |
| Password Security | bcrypt hashing (rounds=10) | `src/app/api/auth/register/route.ts` | Found |
| Email Restriction | `.edu` suffix check | `src/app/api/auth/register/route.ts` | Found |
| Role-based Access | Admin middleware check | `src/middleware.ts` | Found |
| Data Privacy | Audit logs on all state changes | `src/lib/audit.ts` | Found |
| File Security | No file upload logic | - | Found (Safe by omission) |

---

## 12. State Diagram Information – Post Lifecycle

- **States:** `draft`, `active`, `meeting_scheduled`, `partner_found`, `expired`.
- **Transitions:**
    - `active` -> `meeting_scheduled` (Trigger: Meeting Request Accepted).
    - `meeting_scheduled` -> `partner_found` (Trigger: User manual update or meeting completion).
    - `active` -> `partner_found` (Trigger: Manual update).

---

## 13. State Diagram Information – Meeting Request Lifecycle

- **States:** `pending`, `accepted`, `declined`, `scheduled`, `completed`, `cancelled`.
- **Transitions:**
    - `pending` -> `scheduled` (Trigger: Receiver clicks "Accept" and chooses slot).
    - `scheduled` -> `completed` (Trigger: Manual/System update).

---

## 14. SRS–SDD Traceability Information (Highlights)

| SRS Ref | Requirement Summary | Code Evidence | Status |
|---|---|---|---|
| FR-01 | .edu email registration | `src/app/api/auth/register/route.ts` line 16 | Found |
| FR-04 | RBAC (Admin/User) | `src/middleware.ts` line 37 | Found |
| FR-13 | No file upload | `prisma/schema.prisma` (No blob/file field) | Found |
| FR-30 | NDA before meeting | `RequestMeetingModal.tsx` and API check | Found |
| FR-50 | Audit Logging | `src/lib/audit.ts` | Found |

---

## 15. Mocked / Partial / Missing Features

| Feature | Found in Code? | Status | What is Missing |
|---|---|---|---|
| Email Delivery | Partial | Mocked | No real SMTP/SendGrid integrated. |
| Email Verification | Partial | Mocked | Hardcoded "123456" code. |
| Zoom/Teams Link | Partial | Mocked | Generates fake `https://meet.healthai.edu/...` URL. |
| Data Export | Partial | Mocked | JSON data URL export, no CSV file generation logic. |

---

## 16. Final SDD Preparation Summary

- **Architecture:** Use **Full-stack Monolith** diagrams with Next.js App Router focus.
- **Components:** Auth, Post, Meeting ve Admin modülleri üzerine "Component Diagram" çizin.
- **Security:** JWT ve HTTP-only cookie kullanımını vurgulayın. `.edu` kısıtlamasını SDD'de netleştirin.
- **Status Diagrams:** Hem Post hem Meeting için ayrı state diagramları hazırlayın. Post statüsünün toplantı kabulüyle (`meeting_scheduled`) tetiklendiğini unutmayın.
- **Traceability:** Audit logging ve RBAC özelliklerinin SRS'deki FR-50 ve FR-04 ile birebir örtüştüğünü gösterin.
