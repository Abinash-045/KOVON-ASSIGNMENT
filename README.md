# Kovon Backend Assignment.

A RESTful API for managing candidate applications and job postings with automatic eligibility scoring and shortlisting. Built with TypeScript, Express.js, and MongoDB.

### Table of Contents

- [Submission Checklist](#submission-checklist)
- [1. Setup Instructions](#1-setup-instructions)
- [2. Database Schema](#2-database-schema)
- [3. Architecture Explanation](#3-architecture-explanation)
- [4. Postman Collection](#4-postman-collection)
- [5. Sample Test Data](#5-sample-test-data)
- [Scripts](#scripts)
- [Error Responses](#error-responses)

---

## Submission Checklist

| Requirement | Location |
|-------------|----------|
| **1. GitHub repository** | This repository (full source code) |
| **2. README** | This file — Setup instructions, DB schema, Architecture below |
| **3. Postman collection** | `postman_collection.json` (root) |
| **4. Database schema** | DB schema section below; schema defined in `src/models/` (MongoDB) |
| **5. Sample test data** | Sample Test Data section below |

---

## 1. Setup Instructions

### Prerequisites

- **Node.js** v18 or higher  
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/atlas))  
- **npm** (or yarn)

### Steps

**1. Clone the repository**

```bash
git clone <repository-url>
cd <project-folder>
```

**2. Install dependencies**

```bash
npm install
```

**3. Environment configuration**

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017
DB_NAME=kovon
```

For MongoDB Atlas, set `MONGO_URI` to your connection string, for example:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/kovon?retryWrites=true&w=majority
DB_NAME=kovon
```

**4. Run the application**

- **Development** (with hot reload):

  ```bash
  npm run dev
  ```

- **Production**:

  ```bash
  npm run build
  npm start
  ```

**5. Verify**

- API base URL: `http://localhost:3000/api`
- Use the Postman collection or the sample requests in **Sample Test Data** to test.

---

## 2. Database Schema

The application uses **MongoDB**. Collections and field structure are defined below. TypeScript interfaces live in `src/models/` and act as the schema definition (no separate SQL file).

### Collections Overview

| Collection      | Purpose |
|-----------------|---------|
| `candidates`    | Candidate profiles (name, skill, experience, language score, document verification) |
| `jobs`          | Job postings (title, country, minimum experience and language score) |
| `applications`  | Job applications (candidateId, jobId, eligibilityScore, status) |

### Schema (BSON / Document Structure)

**`candidates`**

| Field              | Type     | Description / Constraints |
|--------------------|----------|----------------------------|
| `_id`              | ObjectId | Auto-generated             |
| `name`             | string   | Required                   |
| `skill`            | string   | Required                   |
| `experience`       | number   | Required, ≥ 0              |
| `languageScore`    | number   | Required, 0–100            |
| `documentsVerified`| boolean  | Required                   |
| `createdAt`        | Date     | Set on creation            |

**`jobs`**

| Field             | Type     | Description / Constraints |
|-------------------|----------|----------------------------|
| `_id`             | ObjectId | Auto-generated             |
| `title`           | string   | Required                   |
| `country`         | string   | Required                   |
| `minExperience`   | number   | Required, ≥ 0              |
| `minLanguageScore`| number   | Required, 0–100            |
| `createdAt`       | Date     | Set on creation            |

**`applications`**

| Field            | Type     | Description / Constraints |
|------------------|----------|----------------------------|
| `_id`            | ObjectId | Auto-generated             |
| `candidateId`    | ObjectId | Reference to `candidates._id` |
| `jobId`          | ObjectId | Reference to `jobs._id`   |
| `eligibilityScore` | number | Computed on create        |
| `status`         | string   | `"ELIGIBLE"` \| `"REJECTED"` \| `"SHORTLISTED"` |
| `createdAt`      | Date     | Set on creation            |

### Schema Files in Code

- `src/models/candidate.model.ts` — Candidate interface  
- `src/models/job.model.ts` — Job interface  
- `src/models/application.model.ts` — Application interface and `ApplicationStatus` type  

There is no SQL schema file; the database is MongoDB and the schema is defined by these models and the repository usage.

---

## 3. Architecture Explanation

### High-Level Flow

```
┌─────────────────┐
│   API Routes    │  HTTP endpoints (/api/candidates, /api/jobs, /api/applications)
└────────┬────────┘
         │
┌────────▼────────┐
│  Controllers    │  Parse request, validate input, call services, send response
└────────┬────────┘
         │
┌────────▼────────┐
│    Services     │  Business logic (eligibility, scoring, shortlisting rules)
└────────┬────────┘
         │
┌────────▼────────┐
│  Repositories   │  MongoDB CRUD (candidates, jobs, applications)
└────────┬────────┘
         │
┌────────▼────────┐
│    MongoDB      │  Single database (DB_NAME from .env), three collections
└─────────────────┘
```

### Design Choices

- **Layered architecture**: Routes → Controllers → Services → Repositories → DB. Each layer has a single responsibility.
- **No ORM**: Uses the official MongoDB driver; repositories encapsulate collection access.
- **Centralized errors**: `middlewares/errorHandler.ts` returns consistent JSON error responses (e.g. 400, 404, 500).
- **Eligibility in service layer**: When an application is created, the service loads candidate and job, computes eligibility and score, then the repository persists the application.

### Project Structure

```
src/
├── app.ts                      # Express app, /api mount, error handler, server start
├── config/
│   └── db.ts                   # connectDb(), getDb(), disconnectDb()
├── controllers/
│   ├── candidate.controller.ts
│   ├── job.controller.ts
│   └── application.controller.ts
├── middlewares/
│   └── errorHandler.ts
├── models/
│   ├── candidate.model.ts
│   ├── job.model.ts
│   └── application.model.ts
├── repositories/
│   ├── candidate.repository.ts
│   ├── job.repository.ts
│   └── application.repository.ts
├── routes/
│   ├── index.ts                # Mounts /candidates, /jobs, /applications
│   ├── candidate.routes.ts
│   ├── job.routes.ts
│   └── application.routes.ts
└── services/
    ├── candidate.service.ts
    ├── job.service.ts
    └── application.service.ts
```

### Key Business Rules (in Services)

- **Eligibility score** (on application create):  
  `(experience × 2) + (languageScore ÷ 10) + (documentsVerified ? 10 : 0)`
- **Status ELIGIBLE** when: candidate experience ≥ job minExperience, candidate languageScore ≥ job minLanguageScore, and documentsVerified === true; otherwise **REJECTED**.
- **Shortlist**: Only applications with status `ELIGIBLE` can be shortlisted (status becomes `SHORTLISTED`).
- **List applications**: Sorted by status priority (ELIGIBLE → REJECTED → SHORTLISTED), then by eligibility score (desc), then by candidate experience (desc).

---

## 4. Postman Collection

Use `postman_collection.json` in the project root. Import it into Postman to call all API endpoints with sample bodies. Base URL in the collection is `http://localhost:3000`.

### API Endpoints (Quick Reference)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/candidates` | Create candidate |
| POST   | `/api/jobs` | Create job |
| POST   | `/api/applications` | Submit application (body: `candidateId`, `jobId`) |
| GET    | `/api/applications?jobId=<id>` | List applications for a job (sorted) |
| PATCH  | `/api/applications/:id/shortlist` | Shortlist an ELIGIBLE application |

---

## 5. Sample Test Data

Use these payloads and steps to verify behaviour. Replace `<candidateId>`, `<jobId>`, and `<applicationId>` with IDs returned from previous requests.

### 5.1 Create a candidate (eligible for job below)

```http
POST http://localhost:3000/api/candidates
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "skill": "Nurse",
  "experience": 4,
  "languageScore": 75,
  "documentsVerified": true
}
```

Save the returned `_id` as `<candidateId>`.

### 5.2 Create a job

```http
POST http://localhost:3000/api/jobs
Content-Type: application/json

{
  "title": "Registered Nurse",
  "country": "Germany",
  "minExperience": 2,
  "minLanguageScore": 60
}
```

Save the returned `_id` as `<jobId>`.

### 5.3 Submit application (expected: ELIGIBLE)

```http
POST http://localhost:3000/api/applications
Content-Type: application/json

{
  "candidateId": "<candidateId>",
  "jobId": "<jobId>"
}
```

Expected: `status: "ELIGIBLE"`, `eligibilityScore` present.

### 5.4 Rejected candidate (low language score)

Create candidate:

```json
{
  "name": "Priya Patel",
  "skill": "Nurse",
  "experience": 3,
  "languageScore": 55,
  "documentsVerified": true
}
```

Apply to the same `<jobId>`. Expected: `status: "REJECTED"` (55 < minLanguageScore 60).

### 5.5 Rejected candidate (documents not verified)

Create candidate:

```json
{
  "name": "Amit Kumar",
  "skill": "Nurse",
  "experience": 5,
  "languageScore": 80,
  "documentsVerified": false
}
```

Apply to the same `<jobId>`. Expected: `status: "REJECTED"`.

### 5.6 Shortlist application

```http
PATCH http://localhost:3000/api/applications/<applicationId>/shortlist
```

- For an ELIGIBLE application: expected `status: "SHORTLISTED"`.
- For a REJECTED application: expected **400** with message that only ELIGIBLE applications can be shortlisted.

### 5.7 List applications for a job

```http
GET http://localhost:3000/api/applications?jobId=<jobId>
```

Expected order: ELIGIBLE (by score desc, then experience desc), then REJECTED, then SHORTLISTED.

---

## Scripts

| Command | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production server (`node dist/app.js`) |
| `npm test` | Placeholder (no test suite in repo) |

## Error Responses

Responses use a single `error` message field, e.g.:

```json
{ "error": "Error message description" }
```

- **400** — Validation / bad request (e.g. shortlisting non-ELIGIBLE application).  
- **404** — Candidate, job, or application not found.  
- **500** — Server error.

---

## License

ISC

---

**Built by [Abinash Behera](https://abinash-behera45.vercel.app/)**
