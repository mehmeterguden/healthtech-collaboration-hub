# HEALTH AI Demo Video Information

## 1. Demo Accounts

| Role | Email | Password | Notes |
|---|---|---|---|
| Engineer | `engineer@healthai.edu` | `password123` | Alex Chen, MIT Medical Engineering |
| Healthcare | `doctor@healthai.edu` | `password123` | Dr. Sarah Williams, Istanbul Medical School |
| Admin | `admin@healthai.edu` | `password123` | Full access to logs, users, and posts |

## 2. Important Routes

| Feature | Route | Notes |
|---|---|---|
| Home | `/` | Landing page |
| Register | `/register` | Sign up with .edu email |
| Verify Email | `/verify-email?code=123456` | Direct verification link |
| Login | `/login` | Access the platform |
| Dashboard | `/dashboard` | Main overview |
| Browse Posts | `/dashboard/posts` | Discover projects |
| My Posts | `/dashboard/my-posts` | Manage your own listings |
| Create Post | `/dashboard/create-post` | Post a new project |
| Edit Post | `/dashboard/edit-post/[id]` | Modify an existing post |
| Post Detail | `/dashboard/post/[id]` | View full project info |
| Meetings | `/dashboard/meetings` | Manage requests & slots |
| Profile | `/dashboard/profile` | Public profile view |
| Settings | `/dashboard/settings` | GDPR, Password, Delete Account |
| Notifications | `/dashboard/notifications` | Notification history |
| Admin Dashboard | `/admin/posts` | Default admin landing |
| Admin Users | `/admin/users` | Manage/Suspend users |
| Admin Posts | `/admin/posts` | View/Remove posts |
| Admin Logs | `/admin/logs` | Audit trail & CSV export |

## 3. Registration Flow
- **Non-.edu email error**: Try registering with `test@gmail.com`. It will show: *"Only institutional .edu email addresses are allowed"*.
- **Valid demo email**: `newuser@itu.edu.tr` or any `.edu` domain.
- **Password format**: At least 8 characters recommended (code checks for length in settings, but registration is flexible). Use `password123`.
- **Role selection**: Engineer or Healthcare Professional.
- **Verification code**: `123456` (Mock code for all demo users).
- **Redirection**: Redirects to `/dashboard` immediately after successful registration (auto-login).

## 4. Post Creation Demo Data

| Field | Example Value |
|---|---|
| Title | Real-time AI Suture Tracking |
| Domain | Surgical Robotics |
| Required Expertise | Computer Vision, OpenCV, Surgery |
| Project Stage | Prototype |
| Commitment Level | High |
| Collaboration Type | Research Partner |
| Confidentiality Level | Public Short Pitch |
| City | Istanbul |
| Country | Turkey |
| Description | Developing a vision-based system to track surgical needles in real-time. |
| High-Level Idea | Using YOLOv8 to identify suture needles in laparoscopic video feeds. |
| Expiry Date | Select any date 1 month from today. |

## 5. Draft / Publish / Edit Flow
- **Save as Draft**: Button is on the bottom left of the Create Post form.
- **Draft status**: Appears as a yellow "DRAFT" badge in "My Posts".
- **Publish**: Click "Publish Post" (bottom right) in the creation or edit form.
- **Active status**: Appears as a green "ACTIVE" badge in "My Posts" and "Browse Posts".
- **Edit button**: Pen icon (`Edit`) next to the post in "My Posts".
- **Recommendation**: Change the "Commitment Level" from "Medium" to "High" to show an update.

## 6. Search & Filtering Demo

| Filter | Value to Use | Expected Result |
|---|---|---|
| Domain | Cardiology Imaging | Shows the ECG AI post |
| City | Ankara | Shows posts from Ankara (e.g. Elena Vasquez) |
| Status | Meeting Scheduled | Shows posts currently in discussion |
| Expertise | Machine Learning | Shows all AI/ML related projects |

## 7. Meeting Request Workflow
- **Post Owner**: `engineer@healthai.edu` (Alex Chen).
- **Requester**: `doctor@healthai.edu` (Dr. Sarah Williams).
- **Post**: "IoT Remote Patient Monitoring Platform" (ID: `demo-post-eng-2`).
- **Button Name**: `Express Interest` (opens modal) or `Request Meeting` (direct).
- **Message**: "I am interested in your IoT project and can help with clinical protocols."
- **Time Slots**: Click the calendar to add multiple slots (e.g., 12 May 10:00, 14 May 15:00).
- **NDA Checkbox**: Yes, "I agree to the non-disclosure terms" checkbox is present.
- **Status after send**: `Pending` (Amber badge).
- **Acceptance**: Post owner (`Alex`) goes to `/dashboard/meetings` -> "Incoming" -> Click a slot -> Click `Confirm`.
- **Meeting Link**: Appears inside the meeting card under "Scheduled" tab after confirmation.
- **Post Status**: Changes to `Meeting Scheduled` automatically.

## 8. Admin Panel Demo
- **Admin**: `admin@healthai.edu` / `password123`.
- **Users Filter**: Use the "Status" filter to show "Active" vs "Suspended".
- **Posts Filter**: Use "Domain" filter to find "Surgical Robotics".
- **Remove Post**: Trash icon in the table or "Remove Post" inside the View Modal.
- **Safety**: You can click the Trash icon to open the confirmation dialog, then click "Cancel".
- **Logs Filter**: Use "Action" filter -> `Post Created`.
- **Export**: "Export CSV" button (top right). It downloads a **CSV** file.

## 9. Profile, GDPR and Notifications
- **Profile Page**: `/dashboard/profile` (shows public view).
- **Settings**: `/dashboard/settings` (contains Privacy & Data).
- **Delete Account**: Bottom of Settings page. Opens a confirmation modal.
- **Safety**: Open the modal, show the password field, but click "Cancel".
- **Export Data**: "Export" button in "Privacy & Data" section. Downloads `healthai-my-data.json`.
- **Notifications**: `/dashboard/notifications` or the Bell icon in the header.
- **Demo Notification**: Accept a meeting or send a request; a notification will be generated instantly.

## 10. Simple English Script

### Part 1: Registration & Login
"First, I will register a new account. I must use a .edu email address. I choose my role as an Engineer and complete my registration. Now I am in the dashboard."

### Part 2: Post Creation
"Now, I will create a new project post. I enter my title, domain, and project details. I can save it as a draft or publish it immediately for everyone to see."

### Part 3: Search & Filtering
"On the Browse Posts page, I can find projects by filtering. For example, I can filter by domain like Cardiology or by city. It is very fast and easy to find partners."

### Part 4: Meeting Request
"I found an interesting project. I will send a meeting request. I propose three different time slots and accept the NDA. The project owner will receive a notification."

### Part 5: Admin Panel
"As an admin, I can manage the whole platform. I can see all users, filter them by role, and check the audit logs. I can also export all logs as a CSV file for reporting."

### Part 6: Profile & GDPR
"Finally, in the settings, I can manage my privacy. I can export all my personal data as a JSON file, satisfying GDPR requirements. I can also delete my account if I wish."

## 11. Risky Actions
- **DO NOT** click "Delete Permanently" in the account deletion modal.
- **DO NOT** click "Remove Post" in the Admin Panel unless it's a test post you created.
- **DO NOT** suspend the `admin@healthai.edu` account or the primary demo accounts.
- **DO NOT** change the admin password unless you record it.
