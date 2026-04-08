# Software Requirements Specification (SRS)

**Project Name:** HEALTH AI Co-Creation & Innovation Platform  
**Course:** SENG 384 Software Project IV  
**Group No / Name:** Mehmet Can Ergüden  
**Group Members:** Mehmet Can Ergüden  
**Submission Date:** 08/04/2026  
**Version:** 1.0  

## Revision History
| Date | Version | Change Description | Author |
| :--- | :--- | :--- | :--- |
| 08/04/2026 | 1.0 | Initial version | Mehmet Can Ergüden |

---

## Table of Contents
1. [Introduction](#1-introduction)
   - 1.1 Purpose
   - 1.2 Scope
   - 1.3 Definitions and Abbreviations
   - 1.4 Intended Audience
2. [Overall Description](#2-overall-description)
   - 2.1 Product Perspective
   - 2.2 User Roles
   - 2.3 Assumptions and Dependencies
   - 2.4 Constraints
3. [Functional Requirements](#3-functional-requirements)
   - 3.1 User Registration & Access Control
   - 3.2 Post Management
   - 3.3 Search & Matching
   - 3.4 Meeting Request Workflow
   - 3.5 Administrative Dashboard
   - 3.6 Activity Logging & Audit Trail
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Use Cases](#5-use-cases)
6. [Data Model](#6-data-model)
7. [Interface Requirements](#7-interface-requirements)
   - 7.1 User Interface (UI)
   - 7.2 External System Interfaces
8. [Requirements Traceability Matrix](#8-requirements-traceability-matrix)
9. [Appendices](#9-appendices)

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to define the system-level requirements for the HEALTH AI Co-Creation & Innovation Platform. It serves as a comprehensive guide for developers, administrators, and project stakeholders by outlining the system's functionalities, technical constraints, non-functional demands, and targeted platform goals necessary to build a secure and intuitive user partner discovery experience.

### 1.2 Scope
The HEALTH AI platform enables structured partner discovery between healthcare professionals and engineers. Through announcement-based matchmaking and secure meeting initiation layers, it builds trust and streamlines cross-disciplinary innovation. It intentionally does not provide financial transactions, contract management, medical advice, patient data management, or a file-sharing repository.

### 1.3 Definitions and Abbreviations
- **SRS:** Software Requirements Specification
- **RBAC:** Role-Based Access Control
- **GDPR:** General Data Protection Regulation
- **NDA:** Non-Disclosure Agreement
- **WCAG:** Web Content Accessibility Guidelines
- **IP:** Intellectual Property

### 1.4 Intended Audience
This document is prepared for the project development team, system administrators, usability testers, and course instructors assessing the SENG 384 project deliverables.

---

## 2. Overall Description

### 2.1 Product Perspective
Multidisciplinary health technology innovation currently relies mostly on coincidence or pre-existing personal networks, which slows down progress. Engineers lack crucial clinical domain context, while doctors often lack the technical resources to pilot innovative ideas. HEALTH AI eliminates this randomness by providing a robust environment for initiating secure and structured first contacts, focusing entirely on match discovery and ensuring no sensitive IP or patient info is exposed.

### 2.2 User Roles
| Role | Description | Key Permissions |
| :--- | :--- | :--- |
| **Engineer** | Developer or technical researcher seeking medical or workflow insights for healthcare software/hardware projects. | Register, Create/Edit posts, View medical posts, Send/Accept meeting requests, Close posts. |
| **Healthcare Professional** | Clinician, doctor, or domain expert aiming to implement an innovation idea or solve a daily medical workflow friction. | Register, Create/Edit posts, View engineering posts, Send/Accept meeting requests, Close posts. |
| **Admin** | Manager ensuring platform safety, rule compliance, and correct content distribution. | View all posts, Remove violating posts, View platform statistics, Suspend/Deactivate users, Access activity audit logs. |

### 2.3 Assumptions and Dependencies
- **Institutional Emails:** It is assumed that legitimate users possess an institutional `.edu` email address for platform registration limits.
- **External Communications:** Meetings take place externally on platforms like Zoom or Microsoft Teams without direct video/audio integrations into the system itself.

### 2.4 Constraints
- The platform strictly acts as a facilitator for first-contact and absolutely prohibits the upload of medical records, technical documentation files, or patient data.
- No financial functionalities or official contract management features are to be included.
- Must guarantee GDPR compliance avoiding excessive user tracking.

---

## 3. Functional Requirements

### 3.1 User Registration & Access Control
| ID | Requirement Description | Priority | Source |
| :--- | :--- | :--- | :--- |
| FR-01 | The system shall restrict registration to institutional `.edu` email addresses only, preventing sign-ups from personal providers. | High | Brief 4.1 |
| FR-02 | The system shall implement an email verification mechanism before activating an account. | High | Brief 4.1 |
| FR-03 | The user shall be able to explicitly select their role during registration (Engineer / Healthcare Professional / Admin). | High | Brief 4.1 |
| FR-04 | The system shall enforce Role-Based Access Control (RBAC) across all system functionalities and APIs. | High | Brief 4.1 |

### 3.2 Post Management
| ID | Requirement Description | Priority | Source |
| :--- | :--- | :--- | :--- |
| FR-10 | The system shall allow users to create posts defining working domain, desired expertise, project stage, and required commitment. | High | Brief 4.2 |
| FR-11 | The system shall let creators specify the confidentiality level of a post (e.g., "Public short pitch" vs. "Details in meeting only"). | Medium | Brief 4.2 |
| FR-12 | The system shall manage the lifecycle states of posts: Draft, Active, Meeting Scheduled, Partner Found (Closed), and Expired. | High | Brief 4.2 |
| FR-13 | The system shall strictly prevent the capability to upload files, especially targeting technical/IP documentation and patient data. | High | Brief 4.2 |

### 3.3 Search & Matching
| ID | Requirement Description | Priority | Source |
| :--- | :--- | :--- | :--- |
| FR-20 | The system shall allow users to filter posts by domain, required expertise, city, country, project stage, and current status. | High | Brief 4.3 |
| FR-21 | The system shall automatically highlight city-based localized matches to users and outline shared expertise match tags. | Medium | Brief 4.3 |

### 3.4 Meeting Request Workflow
| ID | Requirement Description | Priority | Source |
| :--- | :--- | :--- | :--- |
| FR-30 | The system shall integrate a Non-Disclosure Agreement (NDA) acceptance step prior to finalizing any meeting request initialization. | High | Brief 4.4 |
| FR-31 | The system shall allow request receivers to formally accept or decline meeting requests and propose distinct time slots. | High | Brief 4.4 |
| FR-32 | The system shall allow participants to cancel a meeting request before confirmation. | Low | Brief 4.4 |

### 3.5 Administrative Dashboard
| ID | Requirement Description | Priority | Source |
| :--- | :--- | :--- | :--- |
| FR-40 | The system shall provide a dashboard for Admins to view all registered users, filter them by role, and assess profile completeness. | High | Brief 4.5 |
| FR-41 | The admin dashboard shall allow authorized personnel to suspend user accounts and forcibly remove inappropriate posts. | High | Brief 4.5 |

### 3.6 Activity Logging & Audit Trail
| ID | Requirement Description | Priority | Source |
| :--- | :--- | :--- | :--- |
| FR-50 | The platform shall maintain a tamper-resistant event log tracking logins, post interactions, meeting setups, and admin activities. | High | Brief 4.6 |
| FR-51 | Event logs shall include user IDs, timestamps, roles, and target entities without collecting patient data or violating HIPAA/GDPR constraints. Retention strictly capped at 24 months. | High | Brief 4.6 |

---

## 4. Non-Functional Requirements

| ID | Requirement | Metric / Target | Category |
| :--- | :--- | :--- | :--- |
| NFR-01 | Search results shall be compiled and returned within a specified, strict time window. | < 1.5 seconds | Performance |
| NFR-02 | The page content and interface load time shall be limited tightly to prevent user frustration. | < 3 seconds | Performance |
| NFR-03 | The backend infrastructure shall scale efficiently up to high usage simultaneously. | 1000 concurrent users | Performance |
| NFR-04 | User connections must be protected thoroughly over an encrypted HTTP layer. | HTTPS mandatory | Security |
| NFR-05 | The user interface must be immediately understandable for first-time visitors traversing the platform. | < 20 seconds learnability | Usability |
| NFR-06 | Announcement creation steps must be heavily optimized to prevent complex, tedious configurations. | ≤ 3 steps, < 3 minutes | Usability |
| NFR-07 | General platform interactions and layouts shall adequately support visual accessibility needs and multiple devices. | WCAG 2.1 compliance | Accessibility |

---

## 5. Use Cases

### 5.1 UC-01: Engineer Creates a Post
**Name:** UC-01: Engineer Creates a Post  
**Actor(s):** Engineer  
**Precondition:** The engineer must be logged in to the application and verified.  
**Main Flow:**  
1. The engineer clicks the "New Post" button.  
2. Fills in the required fields (working domain, short pitch explanation, clinical expertise required, project stage, and level of commitment).  
3. Chooses a confidentiality level and defines an expiry timeline.  
4. Clicks the "Publish" button.  
5. The system saves the post and alters its status to "Active".  
**Postcondition:** The post is populated on the platform search indexes and becomes visible to Healthcare Professionals.  
**Alternative Flow:**  
2a. If essential text fields (e.g. medical field needed) are empty, the system displays a visual error flag and prevents continuing.

### 5.2 UC-02: Healthcare Professional Sends Meeting Request
**Name:** UC-02: User Explores and Requests Meeting  
**Actor(s):** Healthcare Professional (or Engineer, vice versa)  
**Precondition:** The user is authenticated and navigating the dashboard feed.  
**Main Flow:**  
1. The user filters ongoing posts and finds an "Active" counterpart post.  
2. The user clicks "Send Meeting Request".  
3. The system generates an initial interaction prompt including the platform's standard digital NDA text.  
4. The user accepts the NDA securely and submits a brief introductory context string alongside desired time slots.  
5. The system emits an alert to the post owner that a connection is intended.  
**Postcondition:** A pending connection transaction is created. The post owner receives a request requiring an accept/decline action.  
**Alternative Flow:**  
4a. If the user disagrees with the NDA checkboxes, the system cancels the meeting request modal immediately.

### 5.3 UC-03: Admin Removes Violating Post
**Name:** UC-03: Admin Moderates Content  
**Actor(s):** System Admin  
**Precondition:** An admin is securely logged into the RBAC dashboard section.  
**Main Flow:**  
1. Administrator navigates to the "Post Management" tab.  
2. Filters reports by "City" or selects a post that potentially breached rules.  
3. Reviews the content and manually toggles the "Remove Inappropriate Post" action.  
4. The system safely deletes the record context from the public dashboard and flags the activity internally.  
**Postcondition:** The inappropriate content represents as "Removed" for the users, resolving the risk.  
**Alternative Flow:**  
3a. Admin may issue a warning directly to the creator before deleting the post.

### 5.4 UC-04: Mark Partner Found
**Name:** UC-04: Mark Partner Found  
**Actor(s):** Engineer / Healthcare Professional (Post Creator)  
**Precondition:** The user successfully finalized an external meeting through earlier platform interactions.  
**Main Flow:**  
1. The user navigates to "My Posts" within their account portal.  
2. Accesses the respective targeted post.  
3. Modifies the state by clicking "Mark as Partner Found".  
4. The system switches the global post state definitively to CLOSED.  
**Postcondition:** The post stops receiving new incoming connections and exists purely as historical statistics/archives.  
**Alternative Flow:** None.

---

## 6. Data Model

| Entity | Key Fields | Relationships |
| :--- | :--- | :--- |
| **User** | UserID (PK), Email, PasswordHash, Role, Country, IsVerified | 1:N with Post, 1:N with MeetingRequest, 1:N with ActivityLog |
| **Post** | PostID (PK), UserID (FK), Title, Domain, RequiredExpertise, ProjectStage, ConfidentialityLevel, Expiration, Status | N:1 with User, 1:N with MeetingRequest |
| **MeetingRequest**| RequestID (PK), SenderID (FK), ReceiverID (FK), PostID (FK), Status, NDAAccepted, Timeslots | N:1 with User, N:1 with Post |
| **ActivityLog** | LogID (PK), Timestamp, UserID (FK), Role, ActionType, TargetEntityID, Status | N:1 with User |

---

## 7. Interface Requirements

### 7.1 User Interface (UI)
The graphical approach centers heavily around simplicity, trust, and premium responsiveness. Main pages include:
- **Registration Flow:** Edu-mail capture with dynamic role-select cards.
- **Search Feed / Dashboard:** A structured, grid-style layout displaying brief announcements with highly visible tags for required domain expertise, location (highlighting local matches), and interaction statuses.
- **Post Details Modal:** Extended textual explanation interface housing the meeting initiation sequence + NDA forms securely.
- **Post Editor:** An optimized form spanning across a maximum of 3 segments assuring < 3min execution.
- **Admin Hub:** Analytics charts mixed with tabular lists mapping user and post anomalies.

### 7.2 External System Interfaces
- **Email Forwarding Interface:** Connects to an external SMTP service provider like SendGrid for executing role verifications, `.edu` confirmation, and offline alerting.
- **External Video Conferncing:** Users conduct video meetings outside the platform; the interface will gracefully encourage transferring confirmed calendar slots straight into MS Teams / Zoom environments locally for users.

---

## 8. Requirements Traceability Matrix

| Req. ID | Requirement Summary | Source (Brief) | Related Use Case |
| :--- | :--- | :--- | :--- |
| FR-01 | .edu email restriction | Brief 4.1 | - |
| FR-03 | Role selection options | Brief 4.1 | - |
| FR-04 | RBAC enforcement | Brief 4.1 | UC-03 |
| FR-10 | Post creation details setup | Brief 4.2 | UC-01 |
| FR-12 | Post lifecycle states toggling | Brief 4.2 | UC-01, UC-04 |
| FR-13 | No technical / patient data uploads allowed | Brief 4.2 | UC-01 |
| FR-20 | Search functionality constraints | Brief 4.3 | UC-02 |
| FR-30 | Start meeting with digital NDA logic | Brief 4.4 | UC-02 |
| FR-41 | Admin user & post management constraints | Brief 4.5 | UC-03 |
| FR-50 | Audit Trail generation & storage | Brief 4.6 | UC-01, UC-02, UC-03 |

---

## 9. Appendices
- **Appendix A - Use Case Diagrams:** (Visual reference of User/Admin actors correlating to respective functional permissions).
- **Appendix B - ER Diagram:** (Visual mapping representing table relationships drawn explicitly in Section 6).
- **Appendix C - Wireframes:** (Baseline UI component templates for search feeds, forms, and admin modules ensuring UCAG guidelines).  
