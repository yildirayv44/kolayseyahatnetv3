"use client";

import { useState } from "react";
import { Star, ThumbsUp, MessageCircle, Send } from "lucide-react";

interface Comment {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  likes_count: number;
  replies?: Comment[];
  hasLiked?: boolean;
}

interface CommentThreadProps {
  comments: Comment[];
  consultantId: number;
  onReply: (commentId: number, content: string) => Promise<void>;
  onLike: (commentId: number) => Promise<void>;
}

function CommentItem({
  comment,
  onReply,
  onLike,
  isReply = false,
}: {
  comment: Comment;
  onReply: (commentId: number, content: string) => Promise<void>;
  onLike: (commentId: number) => Promise<void>;
  isReply?: boolean;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Reply error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      await onLike(comment.id);
    } catch (error) {
      console.error("Like error:", error);
    }
  };

  return (
    <div className={`${isReply ? "ml-8 mt-3" : ""}`}>
      <div className="card">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-900">{comment.name}</h4>
              {!isReply && comment.rating && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= comment.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
            <time className="text-xs text-slate-500">
              {new Date(comment.created_at).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>
        </div>

        <p className="text-sm text-slate-700">{comment.comment}</p>

        <div className="mt-3 flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              comment.hasLiked
                ? "text-primary"
                : "text-slate-500 hover:text-primary"
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${comment.hasLiked ? "fill-current" : ""}`} />
            <span>{comment.likes_count || 0}</span>
          </button>

          {!isReply && (
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center gap-1 text-slate-500 transition-colors hover:text-primary"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Cevapla</span>
            </button>
          )}
        </div>

        {showReplyForm && (
          <div className="mt-4 space-y-2">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Cevabınızı yazın..."
              className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                onClick={handleReply}
                disabled={isSubmitting || !replyContent.trim()}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Gönderiliyor..." : "Gönder"}
              </button>
              <button
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent("");
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                İptal
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onLike={onLike}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentThread({
  comments,
  consultantId,
  onReply,
  onLike,
}: CommentThreadProps) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onLike={onLike}
        />
      ))}
    </div>
  );
}
