import { db } from './config';
import { doc, setDoc, getDoc, updateDoc, increment, query, collection, where, getDocs } from 'firebase/firestore';

function generateReferralCode(userId: string): string {
  return userId.slice(0, 6).toUpperCase();
}

export async function createUserProfile(userId: string, email: string, referredBy?: string) {
  console.log('📝 Creating user profile for:', userId);
  console.log('📢 Referred by code:', referredBy);
  
  const userRef = doc(db, 'users', userId);
  const referralCode = generateReferralCode(userId);
  
  // Store the referral CODE directly (not UID)
  // So it matches what the influencer dashboard queries
  const userData = {
    uid: userId,
    email,
    referralCode: referralCode,
    referredBy: referredBy || null, // Store the referral code, not the UID
    createdAt: new Date(),
    totalReferrals: 0,
    totalEarnings: 0,
    role: 'user'
  };
  
  try {
    await setDoc(userRef, userData);
    console.log('✅ User profile created successfully');
    console.log('📄 User data saved:', userData);
    
    // If user was referred, create referral record and update referrer
    if (referredBy) {
      console.log('🎯 Updating referrer with code:', referredBy);
      
      // Find the referrer by their referral code
      const usersQuery = query(collection(db, 'users'), where('referralCode', '==', referredBy));
      const usersSnapshot = await getDocs(usersQuery);
      
      if (!usersSnapshot.empty) {
        const referrerDoc = usersSnapshot.docs[0];
        const referrerId = referrerDoc.id;
        
        // Create referral record
        const referralRef = doc(db, 'referrals', `${referrerId}_${userId}`);
        await setDoc(referralRef, {
          referrerId: referrerId,
          referredUserId: userId,
          status: 'pending',
          createdAt: new Date(),
          commission: 0
        });
        
        // Update referrer's totalReferrals count
        await updateDoc(doc(db, 'users', referrerId), {
          totalReferrals: increment(1)
        });
        
        console.log('✅ Referral record created and referrer updated');
        console.log('✅ Referrer totalReferrals updated for:', referrerId);
      } else {
        console.log('⚠️ Referrer not found with code:', referredBy);
      }
    }
    
    return userData;
  } catch (error) {
    console.error('❌ Error creating user profile:', error);
    throw error;
  }
}