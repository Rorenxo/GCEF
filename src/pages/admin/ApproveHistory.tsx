"use client"

import { useState, useEffect } from "react";
import type { Timestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { collection, query, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { ArrowLeft, Trash2, Loader2, User } from "lucide-react";

interface ApprovedOrganizer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt?: Timestamp;
    photoURL?: string;
}

export default function ApprovedOrganizersHistoryPage() {
    const [approvedOrganizers, setApprovedOrganizers] = useState<ApprovedOrganizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmOrg, setDeleteConfirmOrg] = useState<ApprovedOrganizer | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
    const q = query(collection(db, "organizers")); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const organizersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
        } as ApprovedOrganizer));
        setApprovedOrganizers(organizersData);
        setLoading(false);
    });

    return () => unsubscribe();
    }, []);

    const handleDeleteOrganizer = async () => {
        if (!deleteConfirmOrg) return;
        setDeletingId(deleteConfirmOrg.id);
        try {
            await deleteDoc(doc(db, "organizers", deleteConfirmOrg.id));
            alert("Organizer deleted successfully.");
            setDeleteConfirmOrg(null);
        } catch (error) {
            console.error("Error deleting organizer:", error);
            alert("Failed to delete organizer. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-800 border-t-zinc-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-black">Approved Organizers History</h1>
                    <p className="text-zinc-600 p-1">List of all previously approved organizer accounts.</p>
                </div>
                <Button 
                    onClick={() => navigate('/admin/pending-organizers')}
                    className="  bg-red-600 text-white red-600 hover:bg-red-800 hover:text-white"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Pending Requests
                </Button>

            </div>

            <Card className="border-zinc-200 bg-white shadow-lg">
                <CardHeader>
                    <CardTitle className="text-zinc-900">Approved Accounts ({approvedOrganizers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {approvedOrganizers.length === 0 ? (
                        <p className="text-center text-zinc-500">No approved organizers yet.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-200 hover:bg-zinc-100">
                                        <TableHead className="text-zinc-600 w-[50px]">No.</TableHead>
                                        <TableHead className="text-zinc-600">Name</TableHead>
                                        <TableHead className="text-zinc-600">Email</TableHead>
                                        <TableHead className="text-zinc-600">Date Approved</TableHead>
                                        <TableHead className="text-right text-zinc-600">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {approvedOrganizers.map((organizer, index) => (
                                        <TableRow key={organizer.id} className="border-zinc-200 hover:bg-zinc-200">
                                            <TableCell className="font-medium text-black">{index + 1}</TableCell>
                                            <TableCell className="font-medium text-black">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                        {organizer.photoURL ? (
                                                            <img src={organizer.photoURL} alt={`${organizer.firstName} ${organizer.lastName}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <span>{organizer.firstName || ''} {organizer.lastName || ''}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-zinc-700">{organizer.email}</TableCell>
                                            <TableCell className="text-zinc-700">{organizer.createdAt ? organizer.createdAt.toDate().toLocaleDateString() : 'N/A'}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    onClick={() => setDeleteConfirmOrg(organizer)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-600 hover:bg-red-100 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AnimatePresence>
                {deleteConfirmOrg && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                            <h3 className="text-lg font-bold text-gray-900">Confirm Deletion</h3>
                            <p className="text-sm text-gray-600 mt-2">
                                Are you sure you want to delete the organizer "{deleteConfirmOrg.firstName} {deleteConfirmOrg.lastName}"? This will permanently remove their account and cannot be undone.
                            </p>
                            <div className="mt-6 flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setDeleteConfirmOrg(null)} className="hover:bg-gray-200">Cancel</Button>
                                <Button
                                    onClick={handleDeleteOrganizer}
                                    disabled={!!deletingId}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                >
                                    {deletingId === deleteConfirmOrg.id ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</>
                                    ) : "Delete"}
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}