'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext'; // You'll need to create this

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export default function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Review[];
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please login to leave a review');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        userId: user.uid,
        userName: user.displayName || user.email,
        rating: userReview.rating,
        comment: userReview.comment,
        createdAt: new Date()
      });
      setUserReview({ rating: 5, comment: '' });
      // Refresh reviews
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', productId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
      alert('✅ Review submitted!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  if (loading) {
    return <div className="py-4">Loading reviews...</div>;
  }

  return (
    <div className="mt-8 border-t pt-8" style={{ borderColor: 'var(--border)' }}>
      <h3 className="text-xl font-bold mb-2">Reviews</h3>
      
      {/* Average Rating */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex">
            {[1,2,3,4,5].map((star) => (
              <svg key={star} className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-bold">{averageRating.toFixed(1)}</span>
          <span className="opacity-60">({reviews.length} reviews)</span>
        </div>
      )}

      {/* Review Form */}
      <form onSubmit={handleSubmitReview} className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--card-hover)' }}>
        <p className="font-semibold mb-3">Write a Review</p>
        <div className="flex items-center gap-2 mb-3">
          <label className="text-sm">Rating:</label>
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setUserReview({ ...userReview, rating: star })}
              className="text-2xl focus:outline-none"
            >
              <span className={star <= userReview.rating ? 'text-yellow-400' : 'text-gray-300'}>
                ★
              </span>
            </button>
          ))}
        </div>
        <textarea
          value={userReview.comment}
          onChange={(e) => setUserReview({ ...userReview, comment: e.target.value })}
          placeholder="Share your experience with this product..."
          className="w-full px-4 py-2 rounded-lg border focus:outline-none"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          rows={3}
        />
        <button
          type="submit"
          disabled={submitting}
          className="mt-2 px-6 py-2 rounded-lg font-medium transition"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--background)' }}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <p className="opacity-60">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{review.userName}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map((star) => (
                      <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs opacity-50">
                  {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                </span>
              </div>
              <p className="mt-2">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}