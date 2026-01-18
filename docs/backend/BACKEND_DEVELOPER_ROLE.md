# 👨‍💻 Backend Developer Role & Operations Guide

**Role:** Senior Backend Engineer / Systems Architect
**Focus:** Reliability, Scalability, Security, and Feature Expansion
**Stack:** Node.js (Express), TypeScript, Prisma (ORM), Google Gemini AI

---

## 1. 🎯 Role Overview

The Backend Developer is the custodian of the platform's nervous system. Your primary responsibility is to ensure that the API server (`backend/server.ts`) is robust, secure, and capable of handling the complex multi-sided marketplace logic (Homeowners ↔ Contractors).

You are not just writing code; you are maintaining the **Trust Protocol** between parties (Escrow, Disputes, Contracts).

---

## 2. ⚙️ Daily Operations (Running the System)

### 2.1 Service Management
*   **Startup Routine**:
    *   Command: `npx tsx backend/server.ts`
    *   **Verify**: Check for `✅ Server running on port 3001` and `✅ Database initialized`.
    *   **Environment**: Ensure `.env` contains valid keys (or Mock keys) for `GEMINI_API_KEY`, `JWT_SECRET`.
*   **Health Monitoring**:
    *   Endpoint: `GET /health`
    *   **Metric**: Uptime should be continuous. CPU/Memory usage should be stable.
    *   **Action**: If memory spikes >500MB, investigate memory leaks in image processing or AI streams.

### 2.2 Data Management (Current: JSON / Future: PostgreSQL)
*   **Local JSON Mode**:
    *   Location: `backend/data/*.json`
    *   **Responsibility**: Ensure these files are not corrupted. If a file becomes invalid JSON, the server will crash on startup.
    *   **Fix**: Delete the corrupt file; the system auto-regenerates it.
*   **PostgreSQL Migration (Planned)**:
    *   **Task**: Manage Prisma schema changes.
    *   **Command**: `npx prisma migrate dev`
    *   **Responsibility**: Ensure data integrity during migration from JSON to SQL.

### 2.3 Log Analysis
*   **Access Logs**: Monitor `POST /api/auth/login` for failed attempts (Brute force detection).
*   **Error Logs**: Watch for `500 Internal Server Error`.
    *   *Critical*: Uncaught exceptions (process crash).
    *   *Warning*: Third-party API timeouts (Gemini/Stripe).

---

## 3. 🚀 Enhancement (Feature Development)

### 3.1 Adding New API Endpoints
Follow the **Service-Controller Pattern** to keep code clean.

**Step 1: Define Interface (`types.ts`)**
```typescript
export interface NewFeatureInput {
  field1: string;
  field2: number;
}
```

**Step 2: Create Service Logic (`backend/services/newService.ts`)**
```typescript
export class NewService {
  async performAction(userId: string, input: NewFeatureInput) {
    // 1. Validate
    // 2. Database Operation
    // 3. Return Result
  }
}
```

**Step 3: Register Route (`backend/server.ts`)**
```typescript
app.post('/api/new-feature', authMiddleware, async (req, res) => {
  try {
    const result = await newService.performAction(req.user.id, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### 3.2 AI Integration (Gemini)
*   **Location**: `backend/services/geminiService.ts` (or shared service).
*   **Task**: Create new prompts for specialized agents.
*   **Standard**: Always implement a **Mock Fallback** for development.
    ```typescript
    if (process.env.GEMINI_API_KEY === 'mock_key') {
      return MOCK_RESPONSE;
    }
    ```

### 3.3 Database Schema Updates
*   **File**: `prisma/schema.prisma` (once migrated).
*   **Workflow**:
    1.  Edit schema file.
    2.  Run `npx prisma generate` to update client.
    3.  Update `backend/services/*.ts` to use new fields.

---

## 4. 🛡️ Reliability & Maintenance

### 4.1 Upkeep Checklist (Weekly)
*   **[ ] Dependency Audit**: Run `npm audit`. Update critical security patches immediately.
*   **[ ] Data Backup**:
    *   *JSON Mode*: Zip `backend/data/` folder.
    *   *SQL Mode*: Run `pg_dump`.
*   **[ ] Log Rotation**: Ensure logs aren't filling up disk space (implement `winston-daily-rotate-file`).
*   **[ ] Token Rotation**: Check for expired Refresh Tokens in database and purge them.

### 4.2 Performance Tuning
*   **Caching**: Implement Redis for frequent reads (e.g., `GET /api/jobs` listings).
*   **Rate Limiting**: Adjust `express-rate-limit` configuration in `backend/middleware/index.ts` based on traffic analysis.
*   **Query Optimization**: Ensure database queries select only necessary fields (`select: { id: true, name: true }`) rather than `select *`.

### 4.3 Technical Debt Management
*   **Refactoring**: Identify "God Classes" (services > 500 lines) and break them down.
*   **Type Safety**: Strict adherence to TypeScript. No `any` types allowed in new code.
*   **Test Coverage**: Write unit tests for all new Service methods using `jest`.

---

## 5. 🔒 Security Responsibilities

### 5.1 API Security
*   **Input Validation**: Use `zod` or manual validation for **ALL** incoming request bodies. Never trust the frontend.
*   **Authentication**: Ensure `authMiddleware` is applied to all private routes.
*   **Authorization**: Verify resource ownership (e.g., "Can User A edit Job B?").
    ```typescript
    if (job.postedById !== currentUser.id) throw new Error("Unauthorized");
    ```

### 5.2 Data Protection
*   **PII**: Ensure passwords are hashed (`bcrypt`).
*   **Encryption**: Sensitive fields (SSN, Bank Details) must be encrypted at rest using `utils/encryption.ts`.
*   **Sanitization**: Strip sensitive data from API responses (never return `password` or `hash`).

---

## 6. 🔧 Troubleshooting Playbook

### Scenario A: "Server Crashing on Startup"
1.  **Check Logs**: Look for "JSON parse error" or "Port in use".
2.  **Fix JSON**: Delete corrupt file in `backend/data/`.
3.  **Fix Port**: Kill process on port 3001 (`npx kill-port 3001`).

### Scenario B: "Frontend gets 401 Unauthorized"
1.  **Check Token**: Is the JWT expired?
2.  **Check Secret**: Does `JWT_SECRET` in `.env` match what signed the token?
3.  **Check Header**: Is frontend sending `Authorization: Bearer <token>`?

### Scenario C: "AI Features Failing"
1.  **Check Key**: Is `GEMINI_API_KEY` valid?
2.  **Check Quota**: Have we hit Google Cloud API limits?
3.  **Fallback**: Enable Mock Mode in `.env` to restore service continuity.

---

## 7. 📅 Strategic Roadmap (Backend)

*   **Phase 1 (Immediate)**: Secure API endpoints, finalize Auth middleware.
*   **Phase 2 (Short-term)**: Migrate from JSON files to PostgreSQL.
*   **Phase 3 (Mid-term)**: Implement Redis caching and WebSocket notifications.
*   **Phase 4 (Long-term)**: Microservices split (separate Auth, Jobs, AI services).

---

*This document serves as the operational bible for the backend team. Adherence ensures system stability and developer sanity.*
