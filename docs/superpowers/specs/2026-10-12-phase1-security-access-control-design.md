# Architectural Design Spec: Phase 1 — Security & Access Control Hardening

- **Date**: 2026-10-12
- **Project**: Kaziniya Digital Drug Store Solution (DDSS) & PIMS
- **Target**: Sub-Project 1 / Phase 1: Authentication, Authorization & Credential Hardening

---

## 1. Executive Summary

A comprehensive code audit identified critical vulnerabilities (P0) in the Kaziniya DDSS authentication and authorization layer:
1. **Authentication Bypass**: `getAuthenticatedUser()` trusts unverified `x-user-id` headers and defaults to the first user in the database (`u-superadmin`) when no valid user is resolved.
2. **Unguarded Routes**: Core operational endpoints for sales, inventory adjustments, and purchasing lack mandatory session checks.
3. **Insecure Credential Handling**: Plaintext passwords, insecure PIN fallbacks, and unauthenticated password change routines exist in source code.

This specification details the architectural redesign of the security layer, enforcing verified Better Auth session cookies / bearer tokens, strict role-based access control (RBAC), and secure credential handling.

---

## 2. Goals & Non-Goals

### Goals
- **Eliminate Unauthenticated Fallbacks**: Remove all automatic resolution to `users[0]` or hard-coded accounts. Unauthenticated calls to private endpoints must consistently receive `401 Unauthorized`.
- **Session-Based Identity Resolution**: Validate incoming requests using Better Auth session cookies (`req.headers.cookie`) or `Authorization: Bearer <session_token>` headers.
- **Strict Role Enforcement**: Apply explicit role middleware (`requireRole`, `requirePermission`) on all private routes across inventory, POS, purchasing, HR, and finance.
- **Cryptographic Credential Storage**: Eliminate plaintext password storage; enforce secure password hashing using Better Auth / Node `crypto.scrypt`.
- **Guarded Password Changes**: Require an active, authenticated session and verification of `currentPassword` before permitting credential updates.

### Non-Goals (Reserved for Subsequent Phases)
- Migration of the database layer to PostgreSQL (Phase 2).
- Real-time row-level locking for multi-cashier FEFO stock concurrency (Phase 3).
- Flutter mobile app refactor (Phase 4).

---

## 3. Architecture & Data Flow

```
[ Client Request ]
        │
        ▼
[ Express Router ]
        │
        ▼
[ roleGuard Middleware: getAuthenticatedUser() ]
        ├── 1. Extract Better Auth Cookie (Cookie: better-auth.session_token=...)
        ├── 2. Extract Bearer Token (Authorization: Bearer <token>)
        └── 3. If neither or invalid -> Reject with 401 Unauthorized
        │
        ▼
[ Session Validation via Better Auth Store / Database ]
        ├── Verify token against `session` table / store
        ├── Check `expiresAt`
        └── Load associated user record { id, email, role, isActive }
        │
        ▼
[ Route Role Guard: requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN']) ]
        ├── User Role In Allowed List?
        │     ├── YES -> next()
        │     └── NO  -> 403 Forbidden { success: false, message: 'Forbidden: Insufficient privileges' }
        ▼
[ Domain Route Handler (Sales, Inventory, Purchasing) ]
```

---

## 4. Detailed Component Changes

### 4.1 Authentication Middleware (`src/server/roleGuard.ts`)
- **Remove Header Spoofing**: Strip `req.headers['x-user-id']` as a standalone proof of identity.
- **Remove Default Fallback**: Remove `return db.users[0]` or any fallback user assignment.
- **Implement Dual Token Resolution**:
  ```typescript
  export async function getAuthenticatedUser(req: Request): Promise<User | null> {
    // 1. Resolve session from Better Auth cookie or Bearer header
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    
    const session = await auth.api.getSession({
      headers: req.headers as any
    });

    if (session?.user) {
      return findUserById(session.user.id);
    }
    
    return null;
  }
  ```
- **Middleware Functions**:
  - `requireAuth`: Verifies `req.user` exists, returning `401 Unauthorized` if null.
  - `requireRole(allowedRoles: UserRole[])`: Asserts `allowedRoles.includes(req.user.role)`, returning `403 Forbidden` if unauthorized.

### 4.2 Route Protection Matrix (`src/server/routes/`)

| Route Pattern | Required Role / Guard | Purpose |
| :--- | :--- | :--- |
| `GET /health` | Public | System status and uptime check |
| `POST /api/auth/sign-in` | Public | User authentication endpoint |
| `POST /api/auth/sign-up` | Public / Super Admin | Registration endpoint |
| `POST /api/auth/change-password` | `requireAuth` + current password | Secure credential updates |
| `GET /api/catalog` | Public | Customer catalog browsing |
| `GET /api/medicines` | `requireAuth` (`PHARMACIST`+) | Enriched stock, cost & inventory details |
| `POST /api/medicines` | `requireRole(['STORE_OWNER', 'SUPER_ADMIN'])` | Medicine registration |
| `POST /api/sales` | `requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN'])` | Dispensing & counter sale execution |
| `POST /api/inventory/adjust` | `requireRole(['PHARMACIST', 'STORE_OWNER', 'SUPER_ADMIN'])` | Stock count discrepancy adjustments |
| `GET /api/purchases` | `requireRole(['STORE_OWNER', 'SUPER_ADMIN', 'SUPPLIER'])` | Wholesale purchase orders |
| `POST /api/purchases` | `requireRole(['STORE_OWNER', 'SUPER_ADMIN'])` | Inward GRN creation |
| `GET /api/reports/*` | `requireRole(['STORE_OWNER', 'SUPER_ADMIN'])` | Financial & P&L intelligence |
| `GET /api/fleet/*` | `requireRole(['SUPER_ADMIN'])` | Multi-store network administration |

### 4.3 Password Hashing & Management (`src/server/auth.ts` & `auth.routes.ts`)
- **Hashing Algorithm**: Use Better Auth's cryptographic scrypt/argon2 hashing for all user accounts.
- **Eliminate Plaintext Fallbacks**: Seeded users will have pre-hashed passwords; runtime registration will securely hash passwords prior to insertion.
- **Verification on Password Change**:
  ```typescript
  authRouter.post('/auth/change-password', requireAuth, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    // 1. Verify currentPassword against authenticated req.user password hash
    // 2. Enforce new password complexity (minimum 8 chars, uppercase, symbol)
    // 3. Hash newPassword and commit to database
    // 4. Invalidate existing sessions if required
  });
  ```

---

## 5. Security & Risk Analysis

- **Threat: Broken Object Level Authorization (BOLA)**:
  - Addressed by binding transactions to `req.user.id` resolved from the session, rather than trusting `req.body.cashierId` or `req.headers['x-user-id']`.
- **Threat: Session Hijacking & XSS**:
  - Addressed by setting `HttpOnly`, `SameSite=Lax`, and `Secure` cookie attributes on Better Auth session tokens.
- **Threat: Privilege Escalation**:
  - Addressed by prohibiting client-supplied role parameters during registration or profile updates unless authorized by a `SUPER_ADMIN`.

---

## 6. Verification & Testing Strategy

A dedicated test suite (`tests/securityHardening.test.ts`) will be implemented using `bun test` covering:
1. **Anonymous Rejection**: Confirm all private endpoints (`/api/sales`, `/api/medicines`, `/api/purchases`, `/api/reports`) return `401 Unauthorized` without credentials.
2. **Identity Forgery Resistance**: Confirm sending `x-user-id: u-superadmin` or arbitrary tokens returns `401 Unauthorized`.
3. **Role Enforcement**:
   - `PHARMACIST` accessing `/api/reports/profit` -> `403 Forbidden`.
   - `PHARMACIST` executing `/api/sales` -> `200 OK` / `201 Created`.
   - `STORE_OWNER` accessing `/api/fleet/pharmacies` -> `403 Forbidden`.
   - `SUPER_ADMIN` accessing `/api/fleet/pharmacies` -> `200 OK`.
4. **Password Change Security**:
   - Change attempt without session -> `401 Unauthorized`.
   - Change attempt with incorrect `currentPassword` -> `403 Forbidden` / `400 Bad Request`.
   - Valid change -> Successful hash update and subsequent login with new password.
