"use client";

import { useState } from "react";
import { CommentThread } from "./CommentThread";

interface Comment {
  id: number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
  likes_count: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  initialComments: Comment[];
  consultantId: number;
}

export function CommentSection({ initialComments, consultantId }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);

  const handleReply = async (commentId: number, content: string) => {
    try {
      const response = await fetch(`/api/comments/consultant/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultant_id: consultantId,
          name: "Misafir", // TODO: Get from user session
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
      const response = await fetch(`/api/comments/consultant/${commentId}/like`, {
        method: "POST",
      });

      if (response.ok) {
        const { liked } = await response.json();
        
        // Update local state
        setComments((prev) =>
          prev.map((comment) => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes_count: liked
                  ? comment.likes_count + 1
                  : comment.likes_count - 1,
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
    <CommentThread
      comments={comments}
      consultantId={consultantId}
      onReply={handleReply}
      onLike={handleLike}
    />
  );
}
