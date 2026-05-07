# Document Request System

## 1. Project Overview
The **Document Request System** is a web-based application designed to make the proccessing of academic documents automated and centralized, instead of using traditional and manual system. it includes academic paper such as:
- Certificate of Enrollment
- Transcript of Records
- Good Moral Certificate
- Certificate of Grades

It allows students to request online, while admin can manage, update of status and upload released documents in real-time.

### 📂 Repository Structure
```text
DocumentRequestSystem/
├── client/              # Angular 17+ Frontend
├── server/              # Express.js Backend
├── screenshots/         # UI & API Testing Documentation
├── .gitignore           # Excluded files (node_modules, .env, etc.)
└── README.md            # Main Project Guide


##  2. Live Links

Frontend URL: [Ilagay Dito ang Link, e.g., https://isufst-drs.vercel.app]

Backend API URL: [Ilagay Dito ang Link, e.g., https://isufst-api.render.com]

## 3. Tech Stack

Frontend: Angular 17+, Tailwind CSS, TypeScript

Backend: Node.js, Express.js, 

TypeScriptDatabase & Storage: - Firestore: Real-time database for document requests.
Supabase Storage: Secure storage para sa uploaded files.
Firebase Authentication: User at Admin identity management.

4. Setup Instructions
Prerequisites
Node.js >= 18

Angular CLI: npm install -g @angular/cli

Firebase Account (Para sa Authentication)

Supabase Account (Para sa Database at Storage)

1. Clone the Repository

``` Bash
git clone https://github.com/roces123/DocumentRequestSystem.git
cd DocumentRequestSystem

2. Backend Setup

``` Bash
cd server-side
npm install
cp .env.example .env
# Edit .env and fill in: JWT_SECRET, SUPABASE_URL, SUPABASE_KEY, etc.
npm run dev
# Server runs at http://localhost:3000
# Swagger docs at http://localhost:3000/api-docs

3. Frontend Setup
Bash
cd client-side
npm install
ng serve
# App runs at http://localhost:4200

## 5. API Overview
Method    Endpoint               Description
POST      /api/auth/login        User/Admin authentication
GET       /api/requests          Get all document requests
POST      /api/requests          Submit new request
PATCH     /api/requests/:id      Update status in adminRemarks
DELETE    /api/requests/:id      Delete Request

6. Features Implemented

Real-time Dashboard: Live updates using Firestore snapshots.
Secure File Upload: Upload scanned file using Supabase Storage.
Admin Management: approves, rejects, and releases documents.
Status Tracking: Real-time tracking for students (Pending, Processing, Released).
RBAC (Role-Based Access Control): Separated access of admin and users/students.
Responsive UI: Mobile-friendly design using Tailwind CSS.

7. Screenshots

User Interface (UI)
Admin Dashboard
Caption: Main admin dashboard displaying all document requests.

Manage Request Page
Caption: Interface for updating request status and admin remarks.

Student Request Form
Caption: Student-side request submission form.

API Testing (Postman)GET Requests Endpoint
Caption: Testing GET /api/requests endpoint using Postman.

8. Security Notes

The following are never included in GitHub Repository for security:

serviceAccountKey.json

.env files

node_modules/

Sensitive credentials should NEVER be pushed to GitHub.