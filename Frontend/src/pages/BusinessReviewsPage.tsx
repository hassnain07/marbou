import React, { useState } from 'react';
import { Star, MessageCircle, Flag, X, MoreVertical, Send } from 'lucide-react';
import { BusinessSidebar } from '../components/BusinessSidebar';
import { businesses } from '@/data/mockData';
import { useRouter } from '@/router/Router';
import { useI18n } from '@/i18n/I18nContext';

interface Review {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  rating: number;
  title: string;
  content: string;
  date: Date;
  listingTitle: string;
  verified: boolean;
  reply?: {
    content: string;
    date: Date;
  };
}

interface RatingDistribution {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

export function BusinessReviewsPage() {
  const { path } = useRouter();
  const { t, lang } = useI18n();
  const pathParts = path.split('/').filter(Boolean);
  const bizId = pathParts.find(p => p.startsWith('biz-')) || 'biz-1';
  const business = businesses.find(b => b.id === bizId) || businesses[0];
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'rev-1',
      reviewerName: 'Amira Hassan',
      reviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amira',
      rating: 5,
      title: 'Excellent Service!',
      content: 'Great quality products and very responsive to my questions. Highly recommended!',
      date: new Date('2025-01-15'),
      listingTitle: 'Premium Electronics Pack',
      verified: true,
      reply: {
        content: 'Thank you so much for the kind words! We appreciate your business and hope to serve you again soon.',
        date: new Date('2025-01-16'),
      },
    },
    {
      id: 'rev-2',
      reviewerName: 'Mohammed Ali',
      reviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohammed',
      rating: 4,
      title: 'Good, but could be better',
      content: 'Product quality is good but shipping took longer than expected. Communication was excellent though.',
      date: new Date('2025-01-12'),
      listingTitle: 'Office Equipment Bundle',
      verified: true,
    },
    {
      id: 'rev-3',
      reviewerName: 'Fatima Ahmed',
      reviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
      rating: 5,
      title: 'Perfect!',
      content: 'Exactly what I was looking for. Fast delivery and great packaging.',
      date: new Date('2025-01-10'),
      listingTitle: 'Home Appliances Collection',
      verified: true,
      reply: {
        content: 'We\'re delighted you\'re satisfied! Your positive feedback motivates our team to maintain high standards.',
        date: new Date('2025-01-11'),
      },
    },
    {
      id: 'rev-4',
      reviewerName: 'Ahmed Ibrahim',
      reviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed',
      rating: 3,
      title: 'Average Experience',
      content: 'The product works but the customer service could be improved. Took a while to get a response.',
      date: new Date('2025-01-08'),
      listingTitle: 'Electronics Bundle',
      verified: true,
    },
    {
      id: 'rev-5',
      reviewerName: 'Sara Mohamed',
      reviewerAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
      rating: 5,
      title: 'Outstanding Quality',
      content: 'Best purchase I\'ve made! High quality, great price, and excellent support.',
      date: new Date('2025-01-05'),
      listingTitle: 'Premium Electronics Pack',
      verified: true,
    },
  ]);

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1) : '0';
  const ratingDistribution: RatingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  const filteredReviews = filter === 'all' ? reviews : reviews.filter(r => r.rating === filter);

  const handleReply = () => {
    if (!selectedReview || !replyText.trim()) return;

    setReviews(prev =>
      prev.map(r =>
        r.id === selectedReview.id
          ? {
              ...r,
              reply: {
                content: replyText.trim(),
                date: new Date(),
              },
            }
          : r
      )
    );
    setReplyText('');
    setSelectedReview(null);
  };

  const RatingBar = ({ rating, count }: { rating: number; count: number }) => {
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-primary-600 w-8">{rating}★</span>
        <div className="flex-1 h-2 bg-sand-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-warning-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="text-sm text-primary-600 w-12 text-right">{count}</span>
      </div>
    );
  };

  const ReviewCard = ({ review }: { review: Review }) => (
    <div className="card p-4 sm:p-6 mb-4">
      {/* Reviewer Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <img
            src={review.reviewerAvatar}
            alt={review.reviewerName}
            className="w-10 h-10 rounded-full flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-medium text-primary-700">{review.reviewerName}</p>
              {review.verified && (
                <span className="text-xs px-2 py-0.5 bg-success-100 text-success-700 rounded-full">
                  {lang === 'ar' ? 'تم التحقق' : 'Verified'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-primary-600">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < review.rating ? 'fill-warning-500 text-warning-500' : 'text-sand-200'}`}
                  />
                ))}
              </div>
              <span>{review.date.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-sand-100 rounded transition">
          <MoreVertical className="w-4 h-4 text-primary-400" />
        </button>
      </div>

      {/* Review Content */}
      <div className="mb-4">
        <h3 className="font-semibold text-primary-800 mb-1">{review.title}</h3>
        <p className="text-primary-700 text-sm mb-2">{review.content}</p>
        <p className="text-xs text-primary-500">
          {lang === 'ar' ? 'بخصوص' : 'About'}: <span className="font-medium">{review.listingTitle}</span>
        </p>
      </div>

      {/* Business Reply */}
      {review.reply && (
        <div className="mb-4 p-3 bg-primary-50 border border-primary-100 rounded-lg">
          <p className="text-xs font-medium text-primary-700 mb-2">
            {lang === 'ar' ? 'رد من المتجر' : 'Store Reply'}
          </p>
          <p className="text-sm text-primary-700 mb-2">{review.reply.content}</p>
          <p className="text-xs text-primary-500">{review.reply.date.toLocaleDateString()}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!review.reply && (
          <button
            onClick={() => setSelectedReview(review)}
            className="flex-1 px-3 py-2 bg-primary-50 hover:bg-primary-100 text-primary-600 text-sm rounded transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            {lang === 'ar' ? 'الرد' : 'Reply'}
          </button>
        )}
        <button className="flex-1 px-3 py-2 bg-sand-100 hover:bg-sand-200 text-primary-600 text-sm rounded transition flex items-center justify-center gap-2">
          <Flag className="w-4 h-4" />
          {lang === 'ar' ? 'الإبلاغ' : 'Report'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen">
      <BusinessSidebar activeTab="reviews" business={business} sidebarOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="fixed inset-0 z-30 bg-primary-950/30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sand-100 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-sand-50">
            <Star className="w-5 h-5 text-primary-600" />
          </button>
          <span className="font-bold text-primary-700">{t('reviewsReplies')}</span>
          <div className="w-9" />
        </div>

        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">{t('reviewsReplies')}</h1>
            <p className="text-sm text-primary-400">
              {lang === 'ar' ? 'اطلع على تقييمات العملاء والرد عليها' : 'View and respond to customer reviews'}
            </p>
          </div>

          {/* Rating Summary Card */}
          <div className="card p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Average Rating */}
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary-800 mb-2">{averageRating}</div>
                  <div className="flex justify-center gap-1 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.round(parseFloat(averageRating)) ? 'fill-warning-500 text-warning-500' : 'text-sand-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-primary-600">
                    {lang === 'ar' ? 'بناءً على' : 'Based on'} {totalReviews} {lang === 'ar' ? 'تقييم' : 'reviews'}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="md:col-span-2">
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <RatingBar key={rating} rating={rating} count={ratingDistribution[rating as keyof RatingDistribution]} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-sand-100 text-primary-600 hover:bg-sand-200'
              }`}
            >
              {lang === 'ar' ? 'الكل' : 'All'} ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map(rating => (
              <button
                key={rating}
                onClick={() => setFilter(rating as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-1 ${
                  filter === rating
                    ? 'bg-primary-600 text-white'
                    : 'bg-sand-100 text-primary-600 hover:bg-sand-200'
                }`}
              >
                {rating}★ ({ratingDistribution[rating as keyof RatingDistribution]})
              </button>
            ))}
          </div>

          {/* Reviews List */}
          {filteredReviews.length > 0 ? (
            <div>
              {filteredReviews.map(review => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Star className="w-12 h-12 text-primary-200 mx-auto mb-3" />
              <p className="text-primary-600 font-medium">
                {lang === 'ar' ? 'لا توجد تقييمات' : 'No reviews'}
              </p>
              <p className="text-sm text-primary-500 mt-1">
                {lang === 'ar' ? 'لم تتلقى أي تقييمات بعد' : 'You haven\'t received any reviews yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reply Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-sand-100">
              <h3 className="font-semibold text-primary-800">
                {lang === 'ar' ? 'الرد على التقييم' : 'Reply to Review'}
              </h3>
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText('');
                }}
                className="p-2 hover:bg-sand-100 rounded transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {/* Review Preview */}
              <div className="mb-6 p-4 bg-sand-50 rounded-lg border border-sand-100">
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={selectedReview.reviewerAvatar}
                    alt={selectedReview.reviewerName}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-primary-700">{selectedReview.reviewerName}</p>
                    <div className="flex gap-1 my-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < selectedReview.rating ? 'fill-warning-500 text-warning-500' : 'text-sand-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <h4 className="font-semibold text-primary-800 mb-1">{selectedReview.title}</h4>
                <p className="text-sm text-primary-700">{selectedReview.content}</p>
              </div>

              {/* Reply Input */}
              <div>
                <label className="block text-sm font-medium text-primary-800 mb-2">
                  {lang === 'ar' ? 'اكتب ردك' : 'Your Reply'}
                </label>
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={lang === 'ar' ? 'شارك ردك على هذا التقييم...' : 'Share your response to this review...'}
                  className="w-full px-4 py-3 border border-sand-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-primary-700 placeholder-primary-400"
                  rows={4}
                />
                <p className="text-xs text-primary-500 mt-2">
                  {lang === 'ar' ? 'يمكنك الرد مرة واحدة فقط على كل تقييم' : 'You can reply once to each review'}
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-sand-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedReview(null);
                  setReplyText('');
                }}
                className="px-4 py-2 border border-sand-200 text-primary-700 rounded-lg hover:bg-sand-50 transition font-medium"
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition font-medium flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {lang === 'ar' ? 'إرسال الرد' : 'Send Reply'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
