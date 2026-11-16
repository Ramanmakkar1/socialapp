// Link-in-bio link counts per plan. Kept in its own tiny module so public
// marketing pages can read the numbers without pulling the database, billing
// and auth code in planLimits.ts into their server bundle.
export const BIO_LINK_LIMITS = {
  Free: 5,
  Pro: 20,
  Agency: 20,
} as const;
