# Oceanic Job 2.0 - Technical Documentation (Employee Module)

## 1. Architecture Overview

The HR Platform extension leverages the existing Next.js App Router architecture, integrating deeply with the database and authentication layers.

### Key Technologies
*   **Framework**: Next.js 15 (App Router)
*   **Database**: PostgreSQL (via Prisma ORM)
*   **Authentication**: NextAuth.js (Custom Role-Based Access Control)
*   **Styling**: Tailwind CSS + Shadcn UI
*   **PDF Generation**: jspdf (Client-side)

### Data Flow
1.  **Server Actions**: Handle mutations (creating employees, updating profiles). Located in `app/actions/employee.ts`.
2.  **Server Components**: Fetch data directly from Prisma (e.g., `getEmployeeData` in `page.tsx`).
3.  **Client Components**: Handle interactivity (PDF generation, Tabs navigation).

---

## 2. Database Schema

### Core Models

#### `Employee`
The central model linking specific HR data to a `User` and `Company`.
*   **`userId`** (@unique): Links to the login account.
*   **`companyId`**: The organization the employee belongs to.
*   **`departmentId`**: Organizational unit.
*   **`jobTitle`**, **`contractType`**, **`status`**: Professional details.
*   **`salary`**, **`currency`**: Compensation data.

#### `Department`
Grouping entity for employees.
*   **`managerId`**: Links to the department head (Employee).

#### `Document`
files associated with an employee (Contracts, Payslips).
*   **`type`**: Enum-like string ("PAYSLIP", "CONTRACT").
*   **`url`**: Path to the file (or mock URL in MVP).

### RBAC Implementation
We extended the `UserRole` enum in `schema.prisma`:
```prisma
enum UserRole {
  CANDIDATE
  EMPLOYER
  ADMIN
  EMPLOYEE  // New role
}
```
**Middleware Protection**:
*   `/employer/*` -> Requires `EMPLOYER` role.
*   `/employee/*` -> Requires `EMPLOYEE` role.

---

## 3. Key Workflows

### A. Automatic Hiring Flow
We implemented a "One-Click Hire" feature that converts a Candidate into an Employee.

**Path**: `app/actions/employee.ts` -> `hireCandidate(applicationId)`

**Logic**:
1.  Fetch `Application`, `Candidate` (User), and `Job`.
2.  Create `Employee` record using Candidate's name and Job's title/salary.
3.  Update `User.role` to `EMPLOYEE`.
4.  Update `Application.status` to `ACCEPTED`.
5.  Revalidate paths to update UI.

### B. Payslip Generation
**Path**: `components/payroll/PayslipDownloadButton.tsx`

**Logic**:
*   Client-side generation using `jspdf`.
*   Accepts a `PayslipData` object (calculated server-side).
*   Draws a professional-looking PDF canvas (Header, Salary Table, Footer).
*   Triggers browser download.

---

## 4. Developer Guide

### How to add a new Employee Tab?
1.  Open `components/employees/EmployeeProfileView.tsx`.
2.  Add a new `<TabsTrigger value="new-tab">`.
3.  Add a corresponding `<TabsContent value="new-tab">`.

### How to protect a new route?
1.  Open `middleware.ts`.
2.  Add the path to `employeeOnlyPaths` or `protectedPaths` arrays.
3.  The middleware automatically handles redirection based on role.

---

## 5. Leave Management (Module Congés)

### Overview
A complete workflow for requesting and approving time off.

### Schema
New `LeaveRequest` model with:
*   `type`: PAID_LEAVE, SICK_LEAVE, etc.
*   `status`: PENDING -> APPROVED/REJECTED.
*   `approverId`: Tracks who validated the request.

### Workflows

#### C. Request & Approval Cycle
1.  **Employee**: Submits request via `/employee/leaves`.
    *   Action: `requestLeave` (Creates record with status PENDING).
2.  **Manager**: Views dashboard at `/employer/leaves`.
    *   Action: `updateLeaveStatus` (Updates status to APPROVED/REJECTED).
    *   UI: Uses `LeaveApprovalList` component.

---

## 6. HR Analytics Dashboard

### Overview
Transforms the `/employer/dashboard` into a strategic cockpit.

### Key Metrics
*   **Total Payroll**: Sum of all `Employee.salary`. estimated monthly cost.
*   **Headcount Trend**: Line chart showing net employee growth over 6 months.
*   **Salary Distribution**: Bar chart analyzing costs by Department.

### Components
*   `HRStatsOverview`: Top-level KPI cards.
*   `SalaryDistributionChart`: Recharts BarChart integration.
*   `HeadcountTrend`: Recharts LineChart integration.


---

## 7. Notification System

### Overview
Real-time alerts for key actions (Leave requests, Hires, etc.).

### Architecture
*   **Database**: `Notification` model linked to `User`.
*   **UI**: `NotificationBell` (Client Component) + `NotificationProvider` (Context).
*   **Trigger**: Server Actions call `createNotification`.

### Key Workflows
1.  **Leave Request**: Manager receives INFO notification.
2.  **Leave Approval**: Employee receives SUCCESS/ERROR notification.
3.  **Hiring**: Candidate receives SUCCESS notification upon conversion to Employee.


---

## 8. Document Management

### Overview
Allows Employees and Employers to upload and store documents (Contracts, ID, etc.).

### Architecture
- **Storage**: Local filesystem `public/uploads/{companyId}/{employeeId}` (MVP). *To be replaced by S3 in production.*
- **Upload**: Server Action `uploadDocument` handles stream aggregation and file writing.
- **UI**: `UploadDocumentDialog` with progress state.

---

## 9. Internationalization (i18n)

### Overview
Full English/French support using `next-intl` to ensure the platform is accessible to a bilingual audience.

### Implementation
*   **Routing**: Localized routing (e.g., `/en/dashboard`, `/fr/dashboard`) handled by `next-intl` middleware.
*   **Translation Files**: JSON-based dictionaries located in `messages/en.json` and `messages/fr.json`.
*   **Components**: 
    - Server Components: `getTranslations`.
    - Client Components: `useTranslations` hook.

### Key Workflows
*   **Language Switcher**: Available in the Navigation bar, persists preference via cookies.
*   **Middleware**: Automatically detects browser locale on first visit.

---

## 10. Next Steps & Future Improvements
1.  **S3 Integration**: Replace `fs` with AWS S3 SDK for scalable storage.
2.  **Granular Permissions**: Restrict "Contract" deletion to HR only.
3.  **Deployment**: Configure Vercel or Docker for production hosting.



