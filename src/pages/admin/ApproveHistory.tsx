"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { ArrowLeft } from "lucide-react";

interface ApprovedOrganizer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: 'approved';
}

export default function ApprovedOrganizersHistoryPage() {
    const [approvedOrganizers, setApprovedOrganizers] = useState<ApprovedOrganizer[]>([]);
    const [loading, setLoading] = useState(true);
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
                                        <TableHead className="text-zinc-600">Name</TableHead>
                                        <TableHead className="text-zinc-600">Email</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {approvedOrganizers.map((organizer) => (
                                        <TableRow key={organizer.id} className="border-zinc-200 hover:bg-zinc-200">
                                            <TableCell className="font-medium text-black">{organizer.firstName} {organizer.lastName}</TableCell>
                                            <TableCell className="text-zinc-700">{organizer.email}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}