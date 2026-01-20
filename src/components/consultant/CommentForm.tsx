"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";

interface CommentFormProps {
  consultantId: number;
  consultantName: string;
}

export function CommentForm({ consultantId, consultantName }: CommentFormProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Auto-fill user data if logged in
  useEffect(() => {
    getCurrentUser().then(user => {
      if (user) {
        setUserId(user.id);
        setUserName(user.name || "");
        setUserEmail(user.email || "");
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    const formData = new FormData(e.currentTarget);
    const data = {
      user_id: consultantId,
      comment_user_id: userId,
      comment: formData.get("comment") as string,
      rating: rating,
    };

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSubmitStatus("success");
        (e.target as HTMLFormElement).reset();
        setRating(5);
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Comment submission error:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        {consultantName} Hakkında Yorum Yap
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Değerlendirme
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
            Adınız <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            disabled={!!userId}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-600"
            placeholder="Adınız Soyadınız"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
            E-posta <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            disabled={!!userId}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-slate-50 disabled:text-slate-600"
            placeholder="ornek@email.com"
          />
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comment" className="mb-2 block text-sm font-medium text-slate-700">
            Yorumunuz <span className="text-red-500">*</span>
          </label>
          <textarea
            id="comment"
            name="comment"
            required
            rows={4}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Deneyimlerinizi paylaşın..."
          />
        </div>

        {/* Submit Status */}
        {submitStatus === "success" && (
          <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
            ✓ Yorumunuz başarıyla gönderildi! Onaylandıktan sonra yayınlanacaktır.
          </div>
        )}

        {submitStatus === "error" && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            ✗ Bir hata oluştu. Lütfen tekrar deneyin.
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? "Gönderiliyor..." : "Yorum Gönder"}
        </button>

        <p className="text-xs text-slate-500">
          Yorumunuz moderasyon sonrası yayınlanacaktır.
        </p>
      </form>
    </div>
  );
}
