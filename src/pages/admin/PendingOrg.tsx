    "use client";

    import { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    addDoc,
    deleteDoc,
    } from "firebase/firestore";
    import { db } from "@/lib/firebase";
    import { Button } from "@/shared/components/ui/button";
    import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    } from "@/shared/components/ui/card";
    import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    } from "@/shared/components/ui/table";
    import { Check, X, History } from "lucide-react";

    interface PendingOrganizer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    status: "pending" | "approved" | "denied" | "failed";
    }

    export default function PendingOrganizersPage() {
    const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();

    useEffect(() => {
        const q = query(collection(db, "pendingOrganizers"), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const organizersData = snapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as PendingOrganizer)
        );
        setPendingOrganizers(organizersData);
        setLoading(false);
        });

        return () => unsubscribe();
    }, []);


        const handleApprove = async (organizer: PendingOrganizer) => {
        setActionLoading((prev) => ({ ...prev, [organizer.id]: true }));

        try {
            // Validate required fields first
            if (!organizer.firstName || !organizer.lastName || !organizer.email) {
            throw new Error("Organizer data is incomplete.");
            }

            // 1️⃣ Add the approved organizer to "organizers" collection
            await addDoc(collection(db, "organizers"), {
            firstName: organizer.firstName,
            lastName: organizer.lastName,
            email: organizer.email,
            role: "organizer",
            status: "approved",
            createdAt: new Date(),
            });

            // 2️⃣ Delete the organizer from "pendingOrganizers"
            await deleteDoc(doc(db, "pendingOrganizers", organizer.id));

            // 3️⃣ Notify success
            alert("Organizer approved successfully!");
        } catch (error: any) {
            console.error("Approval failed:", error);
            alert(`Error approving organizer: ${error.message}`);
        } finally {
            setActionLoading((prev) => ({ ...prev, [organizer.id]: false }));
        }
        };

    const handleDeny = async (organizerId: string) => {
        setActionLoading((prev) => ({ ...prev, [organizerId]: true }));
        try {
        const organizerRef = doc(db, "pendingOrganizers", organizerId);
        await updateDoc(organizerRef, { status: "denied" });
        alert("Organizer denied.");
        } catch (error: any) {
        console.error("Failed to deny organizer:", error);
        alert("Error denying organizer.");
        } finally {
        setActionLoading((prev) => ({ ...prev, [organizerId]: false }));
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
            <h1 className="text-3xl font-bold text-black">Pending Organizers</h1>
            <p className="text-zinc-600 p-1">
                Review and approve new organizer account requests.
            </p>
            </div>
            <Button
            onClick={() => navigate("/admin/organizers/history")}
            className="bg-yellow-500 text-white hover:bg-yellow-700"
            >
            <History className="mr-2 h-4 w-4" />
            History
            </Button>
        </div>

        <Card className="border-zinc-200 bg-white shadow-lg">
            <CardHeader>
            <CardTitle className="text-zinc-900">
                Pending Requests ({pendingOrganizers.length})
            </CardTitle>
            </CardHeader>
            <CardContent>
            {pendingOrganizers.length === 0 ? (
                <p className="text-center text-zinc-500">
                No pending organizer requests.
                </p>
            ) : (
                <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                    <TableRow className="border-zinc-200 bg-white shadow-lg">
                        <TableHead className="text-zinc-600">Name</TableHead>
                        <TableHead className="text-zinc-600">Email</TableHead>
                        <TableHead className="text-right text-zinc-600">
                        Actions
                        </TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {pendingOrganizers.map((organizer) => (
                        <TableRow
                        key={organizer.id}
                        className="border-zinc-200 hover:bg-zinc-200"
                        >
                        <TableCell className="font-medium text-black">
                            {organizer.firstName} {organizer.lastName}
                        </TableCell>
                        <TableCell className="text-zinc-700">
                            {organizer.email}
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(organizer)}
                                disabled={actionLoading[organizer.id]}
                                className="text-green-500 hover:bg-green-100"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeny(organizer.id)}
                                disabled={actionLoading[organizer.id]}
                                className="text-red-500 hover:bg-red-100"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                            </div>
                        </TableCell>
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
