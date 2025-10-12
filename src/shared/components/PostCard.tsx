'use client';

import React, { useState } from "react";

type Comment = {
  id: string;
  authorName: string;
  text: string;
  createdAt: any;
};

type Post = {
  id: string;
  authorName: string;
  content: string;
  imageURL?: string;
  createdAt?: any;
  likes?: string[];
};

type Props = {
  post: Post;
  user: any;
};

export default function PostCard({ post, user }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");

  const toggleLike = () => {
    if (liked) {
      setLikesCount((c) => c - 1);
    } else {
      setLikesCount((c) => c + 1);
    }
    setLiked(!liked);
  };

  const submitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        authorName: user?.displayName || "Anonymous",
        text: commentText,
        createdAt: new Date(),
      },
    ]);
    setCommentText("");
  };

  return (
    <article className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200" />
        <div>
          <div className="font-semibold">{post.authorName}</div>
          <div className="text-xs text-slate-500">
            {new Date(post.createdAt?.toDate?.() || Date.now()).toLocaleString()}
          </div>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-wrap">{post.content}</p>

      {post.imageURL && (
        <div className="mt-3">
          <img
            src={post.imageURL}
            alt="post image"
            className="max-h-80 w-full object-cover rounded"
          />
        </div>
      )}

      <div className="mt-3 flex items-center gap-4">
        <button onClick={toggleLike} className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded ${
              liked ? "bg-cyan-600 text-white" : "bg-slate-100"
            }`}
          >
            Like
          </span>
          <span>{likesCount}</span>
        </button>
        <div>{comments.length} comments</div>
      </div>

      <div className="mt-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className="py-2 border-t border-slate-100 dark:border-slate-700"
          >
            <div className="text-sm font-semibold">{c.authorName}</div>
            <div className="text-sm">{c.text}</div>
            <div className="text-xs text-slate-400">
              {new Date(c.createdAt?.toDate?.() || Date.now()).toLocaleString()}
            </div>
          </div>
        ))}

        <form onSubmit={submitComment} className="mt-2 flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded border p-2 dark:bg-slate-700"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-cyan-600 text-white rounded"
          >
            Send
          </button>
        </form>
      </div>
    </article>
  );
}
