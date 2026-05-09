# Security Specification for Velammal Software Solutions

## Data Invariants
1. Internship and Project applications must have required fields (name, email, phone, college).
2. Users can create applications.
3. Only Admins can list and update applications.
4. Timestamps must be server-generated.
5. Payment status can only be updated by Admins.

## The Dirty Dozen Payloads
1. Create application without required fields (Target: Reject).
2. Create application with spoofed `createdAt` (Target: Reject).
3. Update application status as non-admin (Target: Reject).
4. List applications as non-admin (Target: Reject).
5. Inject 1.5KB string as Document ID (Target: Reject).
6. Create application with invalid email format (Target: Reject).
7. Modify `fullName` on an existing application as non-admin (Target: Reject).
8. Delete application as non-admin (Target: Reject).
9. Create application with anonymous account (if restricted) (Target: Reject).
10. Update payment screenshot as non-owner/non-admin after submission (Target: Reject).
11. Read another user's application details as non-admin (Target: Reject).
12. Bulk download applications via list query as non-admin (Target: Reject).

## The Test Runner
(Tests would go in `firestore.rules.test.ts`)
