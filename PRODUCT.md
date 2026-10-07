# Kaziniya Digital Drug Store Solution (DDSS) & PIMS

## Overview
Kaziniya DDSS is a high-reliability pharmacy management, inventory, and clinical compliance system engineered for community drug stores, retail pharmacies, and biological distribution centers in Ethiopia.

## Platform
- **Type**: Web & Mobile-Responsive Application with RESTful API
- **Client**: React 19, TypeScript, TailwindCSS 4, Vite 6, Lucide Icons
- **Server**: Express with Bun runtime, TypeScript
- **Database**: PostgreSQL (Containerized) + SQLite Auth Storage via Bun
- **Authentication**: Better Auth with Role-Based Access Control (RBAC)

## Target Audience & User Roles
1. **Super Admin (`SUPER_ADMIN`)**: System-wide governance, EFDA regulatory oversight, multi-store network federation.
2. **Store Owner (`STORE_OWNER`)**: Business metrics, revenue, GMV, staff allocation, purchase orders, compliance filings.
3. **Pharmacist / Staff (`PHARMACIST`)**: Prescription dispensing, batch tracking, FEFO (First-Expired, First-Out) stock handling, inventory auditing.
4. **Customer (`CUSTOMER`)**: Product catalog lookup, prescription upload, store locator, inventory availability checks.

## Key Capabilities & Core Value
- **FEFO Inventory Automation**: Dynamic batch allocation prioritizing earliest expiration dates to minimize pharmacy wastage.
- **Regulatory Compliance**: Built for Ethiopian Food & Drug Authority (EFDA) licensing, batch tracking, and traceability.
- **National & Local Payment Integration**: Pre-configured for Telebirr, CBE POS, and cash transactions.
- **Multi-Node Pharmacy Network**: Federated inventory synchronization across Ethiopian regions and subcities.
- **Secure Authentication Layer**: Enterprise-grade sessions, password hashing, and role guards powered by Better Auth.

## Durable Constraints
- Clinical safety and stock count accuracy must never be compromised.
- High-contrast, glare-resistant UI suitable for busy dispensary counter environments.
- Offline-resilient and low-latency response times for POS counter workflows.
