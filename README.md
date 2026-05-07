<div align="center">
  <img src="https://img.icons8.com/fluency/96/medical-heart.png" alt="HealthAI Logo" width="80" />
  <h1>⚕️ Health AI Co-Creation & Innovation Platform</h1>
  <p><strong>Bridging the Gap Between Clinical Expertise and Engineering Excellence</strong></p>

  <div>
    <img src="https://img.shields.io/badge/Next.js-15.1-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/SQLite-Database-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  </div>

  <br />

  <p align="center">
    <a href="#-the-vision">Vision</a> •
    <a href="#-demonstration-video">Demo</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-project-documentation">Documentation</a> •
    <a href="#-technical-stack">Stack</a> •
    <a href="#-getting-started">Setup</a>
  </p>
</div>

---

## 🌐 The Vision

The **Health AI Co-Creation Platform** is a specialized networking and innovation hub designed to connect **Healthcare Professionals** and **Technical Engineers**. 

In the modern medical landscape, breakthrough innovations often stall because clinical experts lack technical resources, while engineers struggle to find real-world medical validation. Our platform eliminates this friction by providing a **secure, structured, and high-trust ecosystem** where multidisciplinary teams can discover partners, exchange ideas under NDAs, and initiate high-impact collaborations.

---

## 🎥 Demonstration Video

Experience the platform in action. This video walkthrough covers the entire user journey, from registration with `.edu` verification to creating posts and scheduling meetings.

<div align="center">
  <a href="https://www.youtube.com/watch?v=CUkxzkFtIuA">
    <img src="https://img.youtube.com/vi/CUkxzkFtIuA/maxresdefault.jpg" alt="Health AI Demo Video" style="width:100%; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.2);">
    <br />
    <sub>▶ Click to watch the project demonstration</sub>
  </a>
</div>

---

## ✨ Key Features

### 👨‍⚕️ For Healthcare Professionals
- **Pitch Your Ideas:** Share clinical challenges or innovation concepts with a technical audience.
- **Find Technical Partners:** Search for engineers with specific expertise (AI, Robotics, Web, etc.).
- **Localized Matching:** Discover potential collaborators in your city.

### 💻 For Engineers & Researchers
- **Discover Medical Projects:** Browse curated clinical collaboration requests.
- **Expertise Tagging:** Highlight your technical skills to attract the right medical partners.
- **Secure Onboarding:** Structured meeting requests with built-in digital NDA acceptance.

### 🛡️ Core Platform Security
- **Institutional Guardrails:** Registration is strictly restricted to verified `.edu` email addresses.
- **Data Privacy:** No medical records or patient data are allowed; the platform focuses entirely on partner discovery.
- **Full Audit Trail:** Every state-changing action is logged for administrative transparency.
- **GDPR Compliance:** Users can export or permanently delete their data at any time.

---

## 📄 Project Documentation

The project is backed by comprehensive engineering documentation covering the entire Software Development Life Cycle (SDLC).

| Document | Description | Link |
| :--- | :--- | :--- |
| **User Guide** | Step-by-step instructions for all user roles and platform features. | [📄 View User Guide](./HealthAI_UserGuide.docx) |
| **SRS (Requirements)** | Software Requirements Specification detailing functional and non-functional demands. | [📄 View SRS](./HealthAI_SRS.docx) |
| **SDD (Architecture)** | Software Design Document covering system architecture, ER diagrams, and API design. | [📄 View SDD](./HealthAI_SDD.docx) |

---

## 🏗️ Technical Stack

Built with a focus on **Type-Safety**, **Performance**, and **Scalability**.

- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) (Lightweight Global Store)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Backend:** Next.js API Routes (Serverless ready)
- **Database:** [SQLite](https://sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Authentication:** Custom JWT-based session management with HTTP-only cookies
- **UI Components:** [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mehmeterguden/healthtech-collaboration-hub.git
   cd healthtech-collaboration-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Access the platform:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

<div align="center">
  <p><strong>SENG 384 — Software Project IV</strong></p>
  <p>Developed with ❤️ by Mehmet Can Ergüden</p>
</div>
