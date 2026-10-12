# Phase 2A: Authentication & Identity Hardening Design Spec

**Date:** 2026-10-12  
**Status:** Approved by User  
**Scope:** Eliminating authentication bypasses, account takeover vectors, and information disclosure across the Kaziniya DDSS backend and clients.

---

## 1. Context & Background

During an independent security audit of the Kaziniya DDSS repository, several critical authentication and data leak vulnerabilities were identified:

1. **`POST /api/auth/login` Accepts Missing Credentials & Shared Demo Passwords (P0):**
   - The handler evaluated `!password || ...` as valid, allowing unauthenticated login when no password was supplied.
   - It accepted a shared list of demo passwords and PINs.
   - It issued ad-hoc unverified timestamp tokens (`token-${user.id}-${Date.now()}`) rather than real Better Auth sessions.
   - It returned full user records containing plaintext `password` and `pin` fields.
2. **`POST /api/auth/register-owner` Unauthenticated Account Takeover (P0):**
   - If an unauthenticated registration request submitted an email belonging to an existing user, the handler updated that account, reset its role to `STORE_OWNER`, and updated its credentials without authentication.
   - Plaintext credentials and PINs were returned in the response payload.
3. **`GET /api/pharmacy/profile` Information Leakage:**
   - The endpoint had no authentication or role guard, exposing commercial bank account numbers (CBE, Telebirr merchant ID), taxpayer identification numbers (TIN), owner national IDs, and licensing details to anonymous public callers.
4. **`api/index.ts` Serverless Gateway Error Stack Trace Leakage:**
   - The 500 error catch block serialized raw exceptions and stack traces (`stack: err?.stack`) directly into the JSON client response.
5. **Mobile API Client (`mobile/lib/services/api_service.dart`) Default Identity Headers:**
   - The Flutter HTTP client sent a hardcoded default header `x-user-id: 'u-2'` on every outgoing request.

---

## 2. Goals & Non-Goals

### Goals
- **Enforce Strict Credentials on `POST /api/auth/login`:**
  - Require non-empty email/employeeId and password.
  - Authenticate against Better Auth (`auth.api.signInEmail`) or salted `scrypt` password hashes (`verifyPassword`).
  - Eliminate all shared demo password fallbacks.
  - Issue cryptographically verified Better Auth sessions that work seamlessly with `roleGuard.ts`.
  - Strip all sensitive credential fields (`password`, `pin`, `temporaryPassword`) from all responses.
- **Eliminate Account Takeover on `POST /api/auth/register-owner`:**
  - Reject registration requests with `409 Conflict` if the email already exists in `db.users` or `authDb`.
  - Enforce password strength (minimum 8 characters) and hash with `scrypt` via `hashPassword`.
  - Register the owner account in Better Auth (`auth.api.signUpEmail`).
  - Strip all sensitive credential fields from response payloads.
- **Protect Sensitive Pharmacy Profile on `GET /api/pharmacy/profile`:**
  - Unauthenticated visitors, customers, and dispensing staff receive only public business details (store name, hours, location, contact info).
  - Sensitive financial and administrative data (bank account numbers, TIN, national IDs, pharmacist licenses) is only exposed when authenticated as `STORE_OWNER` or `SUPER_ADMIN`.
- **Sanitize Production Error Responses in `api/index.ts`:**
  - Log complete error traces on the server.
  - Return clean, opaque `{ success: false, message: 'Internal server error' }` without stack traces to clients.
- **Clean Flutter Mobile API Client:**
  - Remove default `x-user-id` header from default options and logout routine.

### Non-Goals (Deferred to Subsequent Phases)
- **Phase 2B:** Enforcing server-authoritative POS pricing, positive integer quantities, and transactional FEFO allocation.
- **Phase 2C:** Migrating domain repositories to persistent PostgreSQL.

---

## 3. Detailed Component Designs

### 3.1. `POST /api/auth/login` Hardening

#### Request Flow
1. **Input Validation:**
   - Validate `identifier` (or `email`) and `password`. If either is missing or empty, return `400 Bad Request` (`{ success: false, message: 'Identifier and password are required' }`).
2. **User Lookup:**
   - Resolve user from `db.users` by email or employee ID (case-insensitive).
   - If not found, return `401 Unauthorized` (`{ success: false, message: 'Invalid credentials' }`). Avoid 404 to prevent user enumeration.
   - If user is inactive (`isActive === false`), return `403 Forbidden` (`{ success: false, message: 'Account is deactivated' }`).
3. **Password Verification:**
   - Attempt verification via Better Auth:
     ```typescript
     const signInResult = await auth.api.signInEmail({
       body: { email: user.email, password },
       headers: req.headers as any,
     });
     ```
   - If Better Auth sign-in succeeds, obtain the session token and set the session cookie.
   - Fallback for newly migrated or pre-seeded accounts: verify `password` using `verifyPassword(password, user.password)`. If valid, generate a session via `auth.api.signInEmail` or create a valid session entry in `authDb`.
   - If password does not match, return `401 Unauthorized` (`{ success: false, message: 'Invalid credentials' }`).
4. **Sanitized Response:**
   - Clone the user object and unconditionally strip:
     ```typescript
     const sanitizedUser = { ...user };
     delete sanitizedUser.password;
     delete sanitizedUser.pin;
     delete sanitizedUser.temporaryPassword;
     ```
   - Return `200 OK` with `{ success: true, token, user: sanitizedUser, mustChangePassword: !!user.mustChangePassword }`.

---

### 3.2. `POST /api/auth/register-owner` Hardening

#### Request Flow
1. **Input Validation:**
   - Require `ownerName`, `ownerEmail`, `password`, `storeName`, `tinNumber`, `streetAddress`.
   - Validate `password.length >= 8`. If shorter, return `400 Bad Request` (`{ success: false, message: 'Password must be at least 8 characters long.' }`).
2. **Account Conflict Check (Zero Overwrite Policy):**
   - Check if `ownerEmail` exists in `db.users` or `authDb`:
     ```typescript
     const emailLower = ownerEmail.toLowerCase().trim();
     const existsInDb = db.users.some(u => u.email.toLowerCase() === emailLower);
     if (existsInDb) {
       return res.status(409).json({
         success: false,
         message: 'An account with this email address already exists. Please sign in or use another email.',
       });
     }
     ```
3. **Cryptographic Password Storage & Better Auth Registration:**
   - Hash the password using `hashPassword(password)`.
   - Register account in Better Auth via `auth.api.signUpEmail` to enable session issuance.
   - Store sanitized owner in `db.users` with `role: 'STORE_OWNER'`, `password: hashedPassword`, and `status: 'ACTIVE'`.
4. **Sanitized Response:**
   - Strip `password`, `pin`, and `temporaryPassword` from both `user` and `owner` in the 201 response.

---

### 3.3. `GET /api/pharmacy/profile` Role-Based Sanitization

#### Request Flow
1. Resolve caller using `await getAuthenticatedUser(req)`.
2. Retrieve the raw pharmacy profile from `db.getPharmacyProfile()`.
3. If caller has role `STORE_OWNER` or `SUPER_ADMIN`:
   - Return the full profile including:
     - `tinNumber`, `efdaLicense`, `tradeLicenseNumber`, `vatNumber`
     - `ownerName`, `ownerTitle`, `ownerEmail`, `ownerPhone`, `ownerNationalId`, `ownerPharmacistLicense`
     - `bankName`, `bankAccountNumber`, `cbeAccountNumber`, `cbeAccountName`, `telebirrMerchantId`
     - `openingCashFloat`
4. If caller is unauthenticated, `CUSTOMER`, or `PHARMACIST`:
   - Return a sanitized public profile containing ONLY non-sensitive operational fields:
     - `storeName`, `storeNameAmharic`, `storeType`, `logoUrl`, `storeSlogan`
     - `phone`, `email`, `city`, `subcity`, `streetAddress`, `landmark`, `gpsCoordinates`
     - `operatingHours`, `is24Hours`, `coldChainAvailable`, `deliveryAvailable`
     - `receiptHeaderMessage`, `receiptFooterMessage`

---

### 3.4. `api/index.ts` Error Response Sanitization

#### Modification
Replace the error block in `api/index.ts`:
```typescript
catch (err: any) {
  console.error('[Vercel Serverless Gateway Error]', err);
  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      success: false,
      message: 'Internal server error',
    })
  );
}
```
Stack traces and raw exception details are strictly logged to the server stdout/stderr and never returned to the HTTP client.

---

### 3.5. Mobile API Client Sanitization (`mobile/lib/services/api_service.dart`)

#### Modification
- Remove `'x-user-id': 'u-2'` from default `BaseOptions.headers`.
- In `clearAuthHeaders()`, remove `_dio.options.headers['x-user-id'] = 'u-2'`.
- In `setAuthHeaders()`, attach only `Authorization: Bearer <token>`.

---

## 4. Verification & Testing Matrix

| Scenario | Expected Result |
| :--- | :--- |
| `POST /api/auth/login` with missing password | `400 Bad Request` |
| `POST /api/auth/login` with incorrect password | `401 Unauthorized` |
| `POST /api/auth/login` with shared demo password on non-demo user | `401 Unauthorized` |
| `POST /api/auth/login` with valid credentials | `200 OK`, returns verified Better Auth session token; response body contains NO `password` or `pin` |
| `POST /api/auth/register-owner` with existing user's email | `409 Conflict`, does NOT modify existing user |
| `POST /api/auth/register-owner` with password < 8 characters | `400 Bad Request` |
| `POST /api/auth/register-owner` with valid data | `201 Created`, creates new owner with hashed password, response body contains NO plaintext credentials |
| `GET /api/pharmacy/profile` anonymously | `200 OK`, response contains store info, but NO `bankAccountNumber`, `cbeAccountNumber`, `tinNumber`, or `ownerNationalId` |
| `GET /api/pharmacy/profile` as `STORE_OWNER` | `200 OK`, response contains full institutional profile including bank accounts and licenses |
| Full regression test suite (`bun test`) | 100% pass across all test files |
| TypeScript check (`bun x tsc --noEmit`) | 0 errors |
| Production build (`bun run build`) | Exit code 0 |

---

## 5. Security & Risk Assessment

- **Backward Compatibility:** Existing client applications and test suites will continue to authenticate through `/api/auth/login`, but will now receive verified Better Auth session tokens that satisfy `roleGuard.ts`.
- **Breaking Changes:** Any client attempting to log in without a password or relying on hardcoded demo fallback passwords will now be rejected.
