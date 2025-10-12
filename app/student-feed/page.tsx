'use client';


import React, { useEffect, useState } from 'react';
import useAuth from '../../src/shared/components/useStudentAuth';
import NewPostForm from '../../src/shared/components/NewPostForm';
import PostCard from '../../src/shared/components/PostCard';
import { db, initFirebase } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Post } from '../../types';


initFirebase();


export default function StudentFeedPage() {
const { user, loading } = useAuth();
const router = useRouter();
const [posts, setPosts] = useState<Post[]>([]);


useEffect(() => {
if (!loading && !user) {
router.push('/login'); // redirect to login if not signed in
}
}, [user, loading, router]);


useEffect(() => {
const dbInst = db();
const q = query(collection(dbInst, 'posts'), orderBy('createdAt', 'desc'));
const unsub = onSnapshot(q, (snap) => {
setPosts(
snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Post[]
);
});
return () => unsub();
}, []);


if (loading) return <div className="p-6">Loading...</div>;


return (
<main className="max-w-3xl mx-auto p-4">
<h1 className="text-2xl font-bold mb-4">GCEF Student Feed</h1>
<div className="space-y-4">
<NewPostForm user={user} />
{posts.map((p) => (
<PostCard key={p.id} post={p} currentUser={user} />
))}
</div>
</main>
);
}