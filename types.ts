export type UserProfile = {
uid: string;
displayName?: string | null;
photoURL?: string | null;
email?: string | null;
};


export type Post = {
id?: string;
authorId: string;
authorName: string;
content: string;
imageURL?: string | null;
createdAt: any; // Firestore timestamp
};