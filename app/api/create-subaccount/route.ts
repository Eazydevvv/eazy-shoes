// app/api/create-subaccount/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/config';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, bankDetails } = body;

    console.log('Received request:', { userId, bankDetails });

    if (!userId || !bankDetails) {
      return NextResponse.json(
        { error: 'Missing userId or bankDetails' },
        { status: 400 }
      );
    }

    // Save bank details to Firestore
    await setDoc(doc(db, 'bankDetails', userId), {
      ...bankDetails,
      userId,
      updatedAt: new Date()
    });

    // Update user record
    await updateDoc(doc(db, 'users', userId), {
      bankDetailsSaved: true,
      updatedAt: new Date()
    });

    console.log('Bank details saved for:', userId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Bank details saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving bank details:', error);
    return NextResponse.json(
      { error: 'Failed to save bank details: ' + (error as Error).message },
      { status: 500 }
    );
  }
}