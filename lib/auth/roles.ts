// lib/auth/roles.ts
//
// Who counts as an admin. A SUPER_ADMIN is an admin who can't be removed
// from the website (see app/actions/admins.ts) — everywhere else they have
// exactly the same access as an ADMIN.
//
// Always check with isAdminRole(), never role === "ADMIN" (that would lock
// super admins out).

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"] as const;

/** True for ADMIN and SUPER_ADMIN. */
export const isAdminRole = (role: string | null | undefined): boolean =>
  role === "ADMIN" || role === "SUPER_ADMIN";

/** True only for SUPER_ADMIN (the protected admins). */
export const isSuperAdmin = (role: string | null | undefined): boolean =>
  role === "SUPER_ADMIN";
