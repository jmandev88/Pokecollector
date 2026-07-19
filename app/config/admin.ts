export const ADMIN_USER_IDS = [
  "53709d35-1e86-4030-a04c-e7f4ba70c525",
  "ce48a3d7-dbb9-4657-88ee-1fe1d338f6e4",
];

export function isAdminUser(userId?: string | null) {
  return Boolean(userId && ADMIN_USER_IDS.includes(userId));
}
