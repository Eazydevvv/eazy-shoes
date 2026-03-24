// app/admin/orders/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import Link from 'next/link';

interface Order {
  id: string;
  orderReference: string;
  userId: string;
  userEmail: string;
  totalAmount: number;
  status: 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  deliveryAddress: {
    fullName: string;
    phone: string;
    hostel: string;
    roomNumber: string;
    landmark?: string;
  };
  products: any[];
  referralCode?: string;
  createdAt: any;
  paidAt: any;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus as any } : order
      ));
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'paid': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'shipped': return 'bg-purple-100 text-purple-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:border-black outline-none"
          >
            <option value="all">All Orders</option>
            <option value="paid">Paid</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow p-4">
          <p className="text-sm text-yellow-600">Paid</p>
          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'paid').length}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow p-4">
          <p className="text-sm text-blue-600">Processing</p>
          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'processing').length}</p>
        </div>
        <div className="bg-purple-50 rounded-xl shadow p-4">
          <p className="text-sm text-purple-600">Shipped</p>
          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'shipped').length}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-4">
          <p className="text-sm text-green-600">Delivered</p>
          <p className="text-2xl font-bold">{orders.filter(o => o.status === 'delivered').length}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Order #</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Customer</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Amount</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Products</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Delivery</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Date</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Status</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition">
                  <td className="py-4 px-6 font-mono text-sm">
                    {order.orderReference?.slice(0, 12)}...
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium">{order.deliveryAddress?.fullName}</div>
                    <div className="text-sm text-gray-500">{order.userEmail}</div>
                    <div className="text-sm text-gray-500">{order.deliveryAddress?.phone}</div>
                  </td>
                  <td className="py-4 px-6 font-bold">₦{order.totalAmount}</td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      {order.products?.map((p, i) => (
                        <div key={i}>
                          {p.productName} x{p.quantity}
                          {p.size && <span className="text-gray-500 ml-1">(Size: {p.size})</span>}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div>{order.deliveryAddress?.hostel}</div>
                      <div className="text-gray-500">Rm {order.deliveryAddress?.roomNumber}</div>
                      {order.deliveryAddress?.landmark && (
                        <div className="text-gray-400 text-xs">{order.deliveryAddress.landmark}</div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {new Date(order.paidAt?.toDate()).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:border-black outline-none disabled:opacity-50"
                    >
                      <option value="paid">Paid</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>
    </div>
  );
}