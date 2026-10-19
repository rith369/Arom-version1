/*
 * Reviews of professionals (BACKEND-HANDOFF.md section 30). A user with a
 * completed session writes one review per professional: 1 to 5 stars and an
 * optional comment. Reviews are anonymous: nobody but the writer knows who
 * wrote one. The professional can reply; admins can hide a review.
 */

export const MAX_REVIEW_COMMENT = 1000;
export const MAX_REVIEW_REPLY = 1000;
export const MAX_HIDE_REASON = 300;

/** A review as everyone sees it on the public profile. */
export interface PublicReview {
  id: string;
  rating: number;
  comment: string;
  reply: string;
  repliedAt: string | null;
  createdAt: string;
}

/** Average and count of visible reviews. */
export interface ReviewSummary {
  average: number;
  count: number;
}

/** The signed in user's own review of one professional. */
export interface MyReview {
  professionalSlug: string;
  rating: number;
  comment: string;
  reply: string;
  repliedAt: string | null;
  // Set when the AROM team hid it. Only the writer and the professional see why.
  hiddenReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MyReviewsResponse {
  reviews: MyReview[];
}

/** A review in the professional's own list. */
export interface ProReview extends PublicReview {
  hidden: boolean;
  hiddenReason: string;
}

export interface ProReviewsResponse {
  reviews: ProReview[];
}

/** A review in the admin list. Never says who wrote it. */
export interface AdminReview extends PublicReview {
  professionalSlug: string;
  professionalName: string;
  hiddenAt: string | null;
  hiddenReason: string;
}

export interface AdminReviewsResponse {
  reviews: AdminReview[];
}

export function summarize(reviews: { rating: number }[]): ReviewSummary {
  if (reviews.length === 0) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}
