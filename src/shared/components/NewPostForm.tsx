'use client';

import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase';

type Props = { user: any };

export default function NewPostForm({ user }: Props) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('Please sign in to post');
    if (!content.trim() && !file) return alert('Write something or attach an image');

    setSubmitting(true);
    try {
      const dbInst = db;
      let imageURL: string | null = null;

      if (file) {
        const storageInst = storage;
        const storageRef = ref(storageInst, `posts/${user.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        imageURL = await getDownloadURL(storageRef);
      }

      await addDoc(collection(dbInst, 'posts'), {
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Student',
        content: content.trim(),
        imageURL: imageURL,
        createdAt: serverTimestamp(),
      });

      setContent('');
      setFile(null);
    } catch (error) {
      console.error('Error posting:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Correct JSX return (outside handleSubmit)
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <textarea
        className="w-full border rounded p-2"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a post..."
      />
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <button
        type="submit"
        disabled={submitting}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post'}
      </button>
    </form>
  );
}
