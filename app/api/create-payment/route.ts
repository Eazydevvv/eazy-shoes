// app/api/create-payment/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, amount, userId, referralCode, products } = await request.json();

    // Generate unique reference
    const reference = `EAZY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Here you would:
    // 1. Save order to database with status 'pending'
    // 2. Create Paystack transaction (optional - can be done frontend)
    // 3. Return reference

    return NextResponse.json({ 
      success: true, 
      reference,
      message: 'Payment initialized' 
    });

  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Payment failed' },
      { status: 500 }
    );
  }
}