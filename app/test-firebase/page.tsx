// app/test-firebase/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

export default function TestFirebase() {
  const [status, setStatus] = useState('Testing Firebase connection...');

  useEffect(() => {
    async function testFirebase() {
      try {
        // Test Firestore
        const testCollection = collection(db, 'test');
        await getDocs(testCollection);
        
        // Test Auth
        const authStatus = auth.currentUser ? 'User logged in' : 'No user logged in';
        
        setStatus(`✅ Firebase connected successfully! 
          Firestore: OK
          Auth: ${authStatus}`);
      } catch (error) {
        setStatus(`❌ Firebase connection failed: ${error.message}`);
        console.error(error);
      }
    }

    testFirebase();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-black mb-4">Firebase Connection Test</h1>
          <p className="text-gray-700 whitespace-pre-line">{status}</p>
        </div>
      </div>
    </main>
  );
}