// lib/utils/adminCheck.ts
// Simple admin emails list (you can add yours)
export const adminEmails = [
  'israelolalere2008@gmail.com', // ADD YOUR EMAIL HERE
  'admin@eazy.com'
];

export const isAdmin = (email: string | null): boolean => {
  if (!email) return false;
  return adminEmails.includes(email);
};