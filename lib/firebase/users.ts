// lib/firebase/users.ts
import { db } from './config';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

function generateReferralCode(userId: string): string {
  // Take first 6 characters of userId and make it uppercase
  return userId.slice(0, 6).toUpperCase();
}

export async function createUserProfile(userId: string, email: string, referredBy?: string) {
  const userRef = doc(db, 'users', userId);
  const referralCode = generateReferralCode(userId);
  
  // Check if user already exists
  const existingUser = await getDoc(userRef);
  
  if (existingUser.exists()) {
    // User exists, make sure they have a referral code
    const data = existingUser.data();
    if (!data.referralCode) {
      await updateDoc(userRef, {
        referralCode: referralCode
      });
    }
    return existingUser.data();
  }
  
  // Create new user
  const userData = {
    uid: userId,
    email,
    referralCode: referralCode,
    referredBy: referredBy || null,
    createdAt: new Date(),
    totalReferrals: 0,
    totalEarnings: 0,
    role: 'user'
  };
  
  await setDoc(userRef, userData);
  console.log('✅ User created with referral code:', referralCode);
  
  // If user was referred, create referral record
  if (referredBy) {
    const referralRef = doc(db, 'referrals', `${referredBy}_${userId}`);
    await setDoc(referralRef, {
      referrerId: referredBy,
      referredUserId: userId,
      status: 'pending',
      createdAt: new Date(),
      commission: 0
    });
    
    const referrerRef = doc(db, 'users', referredBy);
    await updateDoc(referrerRef, {
      totalReferrals: increment(1)
    });
  }
  
  return userData;
}