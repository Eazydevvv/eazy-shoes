// lib/utils/referral.ts
export function generateReferralCode(userId: string): string {
  // Create a simple referral code using user ID and random chars
  const prefix = 'EAZY';
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const userPart = userId.slice(-4).toUpperCase();
  
  return `${prefix}${userPart}${randomPart}`;
}

export function extractUserIdFromReferral(code: string): string | null {
  // This will be used when someone clicks a referral link
  // Format: EAZY{userPart}{random}
  if (!code.startsWith('EAZY')) return null;
  
  // Extract the user part (last 4 chars of user ID)
  const userPart = code.substring(4, 8);
  return userPart; // In real app, you'd lookup the full userId from this
}