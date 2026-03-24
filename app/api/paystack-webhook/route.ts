// app/api/paystack-webhook/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    switch (body.event) {
      case 'charge.success':
        const { reference, metadata, customer, subaccount } = body.data;
        
        // Save order
        await addDoc(collection(db, 'orders'), {
          orderReference: reference,
          userId: metadata.userId,
          userEmail: customer.email,
          products: metadata.products,
          totalAmount: body.data.amount / 100,
          status: 'paid',
          paymentMethod: 'paystack',
          referralCode: metadata.referralCode,
          subaccount: subaccount?.subaccount_code,
          commission: subaccount ? (body.data.amount / 100) * 0.1 : 0, // 10%
          createdAt: new Date(),
          paidAt: new Date()
        });

        // If this was a referral sale, record commission
        if (metadata.referralCode && subaccount) {
          await addDoc(collection(db, 'commissions'), {
            referrerId: metadata.referralCode,
            orderReference: reference,
            amount: (body.data.amount / 100) * 0.1,
            status: 'paid', // Automatically paid via split
            paidAt: new Date()
          });
        }
        break;

      case 'transfer.success':
        // Log successful transfer to affiliate
        console.log('Affiliate paid:', body.data);
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook failed' },
      { status: 500 }
    );
  }
}