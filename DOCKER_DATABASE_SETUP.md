# 🐳 Docker Database Setup - Kaziniya Drug Store

This project is configured with a fully automated **PostgreSQL 16** database container and an **Adminer** web database management dashboard using Docker Compose.

---

## 📋 Services Overview

| Service | Container Name | Image | Port | Description |
|---|---|---|---|---|
| **PostgreSQL** | `kaziniya-postgres` | `postgres:16-alpine` | `5432` | Relational database containing FEFO batch tables, medicines, sales, and audit logs. |
| **Adminer** | `kaziniya-adminer` | `adminer:latest` | `8080` | Lightweight web dashboard to inspect, query, and manage tables in the browser. |

---

## 🚀 Quick Start Commands

You can manage the database containers using standard npm / bun scripts:

```bash
# Start PostgreSQL & Adminer in the background
bun run db:up
# or: npm run db:up
# or: docker compose up -d

# Check running container status
bun run db:ps
# or: docker compose ps

# View database logs in real time
bun run db:logs
# or: docker compose logs -f db

# Stop database containers
bun run db:down
# or: docker compose down
```

Or run the automated setup PowerShell script:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-docker-db.ps1
```

---

## 🔑 Database Credentials & Environment Configuration

The credentials are automatically populated in `.env` and `.env.example`:

- **Host:** `localhost` (from host machine) or `db` (within Docker network)
- **Port:** `5432`
- **Database:** `kaziniya_db`
- **Username:** `postgres`
- **Password:** `postgres`
- **Connection URI:** `postgresql://postgres:postgres@localhost:5432/kaziniya_db`

---

## 🌐 Web Database GUI (Adminer)

Once containers are started, open your web browser to:

👉 **[http://localhost:8080](http://localhost:8080)**

Log in with:
- **System:** `PostgreSQL`
- **Server:** `db`
- **Username:** `postgres`
- **Password:** `postgres`
- **Database:** `kaziniya_db`

---

## 🗄️ Database Schema & Initial Seeding

When the PostgreSQL container starts for the first time, Docker automatically executes `docker/init.sql` (`/docker-entrypoint-initdb.d/01-init.sql`).

This creates:
- **Enums:** `user_role`, `transaction_type`, `payment_method`
- **Tables:**
  1. `users` (Admin, Pharmacists)
  2. `categories` (Pain Relief, Antibiotics, Antimalarial, Vitamins, etc.)
  3. `suppliers` (MedPharm, Global Health Supplies, East Africa Pharma)
  4. `medicines` (Paracetamol, Amoxicillin, Coartem, Omeprazole, etc.)
  5. `medicine_batches` (FEFO enforcement with expiry dates and purchase/selling prices)
  6. `inventory_transactions` (Audit trail for stock receipts, sales, and adjustments)
  7. `purchases` (Procurement invoices)
  8. `sales` (POS sales transactions)
  9. `sale_items` (Batch-level sale breakdown)
  10. `audit_logs` (Security & operations log)
  11. `registered_pharmacy_nodes` (Ethiopian pharmacy network)
- **Indexes:** Fast lookups on barcode, medicine name, expiry date, sales timestamp.
- **Initial Seed Data:** Pre-populated with authentic seed data for testing immediately.

---

## 📦 Docker Desktop Installation Details

The official Docker Desktop 4.93.0 installer has been downloaded and verified on your system:
- **Installer Path:** `C:\Users\Nythor\Downloads\Docker Desktop_4.93.0_Machine_X64_exe_en-US.exe`

If Docker is not yet active:
1. Double-click the installer or run:
   ```powershell
   Start-Process "C:\Users\Nythor\Downloads\Docker Desktop_4.93.0_Machine_X64_exe_en-US.exe"
   ```
2. Accept the UAC prompt and follow the prompts (keep "Use WSL 2" checked).
3. Restart or log out if prompted by Windows, then start Docker Desktop from your Start Menu.
4. Run `bun run db:up` to spin up the database.
