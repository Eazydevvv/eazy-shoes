import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { userId, bankDetails } = await request.json();

    console.log('🔑 Using Paystack key:', PAYSTACK_SECRET_KEY ? 'Present' : 'MISSING!');
    console.log('🏦 Bank details:', bankDetails);

    // Create recipient on Paystack
    const response = await fetch('https://api.paystack.co/transferrecipient', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'nuban',
        name: bankDetails.accountName,
        account_number: bankDetails.accountNumber,
        bank_code: bankDetails.bankCode,
        currency: 'NGN'
      })
    });

    const data = await response.json();
    console.log('📡 Paystack response:', data);

    if (data.status) {
      // Save recipient code to user
      await updateDoc(doc(db, 'users', userId), {
        recipientCode: data.data.recipient_code,
        bankDetailsSaved: true
      });

      return NextResponse.json({ 
        success: true, 
        recipientCode: data.data.recipient_code 
      });
    } else {
      // Log the actual error
      console.error('❌ Paystack error:', data.message);
      return NextResponse.json(
        { error: data.message || 'Failed to create recipient' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { error: 'Failed to create recipient: ' + (error as Error).message },
      { status: 500 }
    );
  }
}