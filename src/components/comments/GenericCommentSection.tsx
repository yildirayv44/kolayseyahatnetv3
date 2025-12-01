"use client";

import { useState } from "react";
import { CommentThread } from "./CommentThread";
import { Star, Send } from "lucide-react";

interface Comment {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  likes_count: number;
  replies?: Comment[];
}

interface GenericCommentSectionProps {
  initialComments: Comment[];
  entityId: number;
  entityType: "blog" | "country" | "consultant";
  showRating?: boolean;
}

export function GenericCommentSection({
  initialComments,
  entityId,
  entityType,
  showRating = false,
}: GenericCommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    comment: "",
    rating: 5,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const endpoint = `/api/comments/${entityType}`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [`${entityType}_id`]: entityId,
          ...formData,
        }),
      });

      if (response.ok) {
        setFormData({ name: "", email: "", comment: "", rating: 5 });
        setShowForm(false);
        // Show success message
        alert("Yorumunuz başarıyla gönderildi! Onaylandıktan sonra görünecektir.");
      }
    } catch (error) {
      console.error("Comment submit error:", error);
      alert("Yorum gönderilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (commentId: number, content: string) => {
    try {
      const response = await fetch(`/api/comments/${entityType}/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          [`${entityType}_id`]: entityId,
          name: "Misafir",
          email: "guest@example.com",
          comment: content,
        }),
      });

      if (response.ok) {
        alert("Cevabınız gönderildi! Onaylandıktan sonra görünecektir.");
      }
    } catch (error) {
      console.error("Reply error:", error);
      throw error;
    }
  };

  const handleLike = async (commentId: number) => {
    try {
      const response = await fetch(`/api/comments/${entityType}/${commentId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const { liked } = await response.json();

        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes_count: liked ? comment.likes_count + 1 : comment.likes_count - 1,
                hasLiked: liked,
              };
            }
            return comment;
          })
        );
      }
    } catch (error) {
      console.error("Like error:", error);
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full rounded-lg border-2 border-dashed border-slate-200 p-4 text-sm text-slate-600 transition-colors hover:border-primary hover:text-primary"
        >
          + Yorum Ekle
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h3 className="font-semibold text-slate-900">Yorum Yaz</h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Adınız *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              type="email"
              placeholder="E-posta *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {showRating && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-700">Puanınız:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= formData.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <textarea
            placeholder="Yorumunuz *"
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            required
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Gönderiliyor..." : "Gönder"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length > 0 && (
        <CommentThread
          comments={comments}
          consultantId={entityId}
          onReply={handleReply}
          onLike={handleLike}
        />
      )}
    </div>
  );
}
