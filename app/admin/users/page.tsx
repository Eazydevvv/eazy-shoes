'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  id: string;
  uid: string;
  email: string;
  role: string;
  influencer?: boolean;
  influencerName?: string;
  referralCode: string;
  totalEarnings: number;
  totalReferrals: number;
  createdAt: any;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
      alert('✅ User deleted');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: role
      });
      setUsers(users.map(u => 
        u.id === userId ? { ...u, role: role } : u
      ));
      setEditingUser(null);
      alert('✅ User role updated');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const makeInfluencer = async (userId: string) => {
    const name = prompt('Enter influencer username (for URL):');
    if (!name) return;
    
    try {
      await updateDoc(doc(db, 'users', userId), {
        influencer: true,
        influencerName: name.toLowerCase().replace(/\s/g, ''),
        role: 'influencer'
      });
      fetchUsers();
      alert('✅ User is now an influencer!');
    } catch (error) {
      console.error('Error making influencer:', error);
      alert('Failed to make influencer');
    }
  };

  const removeInfluencer = async (userId: string) => {
    if (!confirm('Remove influencer status?')) return;
    try {
      await updateDoc(doc(db, 'users', userId), {
        influencer: false,
        influencerName: null,
        role: 'user'
      });
      fetchUsers();
      alert('✅ Influencer status removed');
    } catch (error) {
      console.error('Error removing influencer:', error);
      alert('Failed to remove influencer');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <div className="text-sm opacity-60">Total: {users.length} users</div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">User</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Role</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Referral Code</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Influencer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Earnings</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6">
                    <div className="font-medium">{user.email}</div>
                    <div className="text-xs opacity-60">UID: {user.uid?.slice(0, 8)}...</div>
                  </td>
                  <td className="py-4 px-6">
                    {editingUser === user.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="px-2 py-1 border rounded"
                        >
                          <option value="user">User</option>
                          <option value="creator">Creator</option>
                          <option value="influencer">Influencer</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => updateUserRole(user.id, editRole)}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✅
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ❌
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'creator' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'influencer' || user.influencer ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono text-sm">{user.referralCode}</td>
                  <td className="py-4 px-6">
                    {user.influencer ? (
                      <span className="text-green-600">✅ {user.influencerName || 'Yes'}</span>
                    ) : (
                      <button
                        onClick={() => makeInfluencer(user.id)}
                        className="text-blue-500 hover:underline text-sm"
                      >
                        Make Influencer
                      </button>
                    )}
                  </td>
                  <td className="py-4 px-6 font-bold text-green-600">₦{user.totalEarnings?.toLocaleString() || 0}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2 flex-wrap">
                      {user.influencer && (
                        <button
                          onClick={() => removeInfluencer(user.id)}
                          className="text-yellow-500 hover:text-yellow-700 text-sm"
                        >
                          Remove Inf
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingUser(user.id);
                          setEditRole(user.role || 'user');
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}