import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

const WITHDRAWAL_FEE = 100; // ₦100 fee

export async function POST(request: Request) {
  try {
    const { userId, amount } = await request.json();

    console.log('📝 Withdrawal request:', { userId, amount });

    // Get user's current earnings
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const currentBalance = userData.totalEarnings || 0;

    console.log('💰 Current balance:', currentBalance);

    // Check minimum
    if (amount < 50) {
      return NextResponse.json({ error: 'Minimum withdrawal is ₦50' }, { status: 400 });
    }

    // Check if enough balance (amount + fee)
    const totalNeeded = amount + WITHDRAWAL_FEE;
    if (totalNeeded > currentBalance) {
      return NextResponse.json({ 
        error: `Insufficient funds. Need ₦${totalNeeded} (₦${amount} + ₦${WITHDRAWAL_FEE} fee). Balance: ₦${currentBalance}` 
      }, { status: 400 });
    }

    // Check bank details
    const bankDetailsQuery = await getDocs(
      query(collection(db, 'bankDetails'), where('userId', '==', userId))
    );

    if (bankDetailsQuery.empty) {
      return NextResponse.json({ error: 'Add bank details first' }, { status: 400 });
    }

    // Create withdrawal request
    await addDoc(collection(db, 'withdrawals'), {
      userId,
      amount: amount,
      fee: WITHDRAWAL_FEE,
      netAmount: amount,
      status: 'pending',
      bankDetails: bankDetailsQuery.docs[0].data(),
      requestedAt: new Date()
    });

    // DEDUCT amount + fee
    const newBalance = currentBalance - totalNeeded;
    await updateDoc(userRef, {
      totalEarnings: newBalance
    });

    console.log(`✅ Withdrawal: ₦${amount} + ₦${WITHDRAWAL_FEE} fee deducted. New balance: ₦${newBalance}`);

    return NextResponse.json({ 
      success: true, 
      newBalance,
      message: `Withdrawal of ₦${amount} submitted! Fee: ₦${WITHDRAWAL_FEE}. New balance: ₦${newBalance}`
    });

  } catch (error) {
    console.error('❌ Withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to request withdrawal' },
      { status: 500 }
    );
  }
}