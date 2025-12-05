    "use client";

    import { motion, AnimatePresence } from "framer-motion";
    import { useState, useEffect } from "react";
    import { useNavigate } from "react-router-dom";
    import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    setDoc,
    addDoc,
    deleteDoc,
    } from "firebase/firestore";
    import { db } from "@/lib/firebase";
    import { Button } from "@/shared/components/ui/button";
    import {Card,CardContent,CardHeader,CardTitle,} from "@/shared/components/ui/card";
    import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow,} from "@/shared/components/ui/table";
    import { Check, X, History, Loader2 } from "lucide-react";

    interface PendingOrganizer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    uid?: string;
    organizerName?: string;
    status: "pending" | "approved" | "denied" | "failed";
    }

    export default function PendingOrganizersPage() {
    const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizer[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
    const [confirmAction, setConfirmAction] = useState<{ action: 'approve' | 'deny'; organizer: PendingOrganizer } | null>(null);
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


    const handleApprove = async () => {
        if (!confirmAction || confirmAction.action !== 'approve') return;
        const { organizer } = confirmAction;
        setActionLoading({ ...actionLoading, [organizer.id]: true });

        try {
            if (!organizer.firstName || !organizer.lastName || !organizer.email) {
            throw new Error("Organizer data is incomplete.");
            }
            // If the pending organizer already has a UID (created during registration), use it as the document ID
            if (organizer.uid) {
            await setDoc(doc(db, "organizers", organizer.uid), {
                firstName: organizer.firstName,
                lastName: organizer.lastName,
                organizerName: organizer.organizerName,
                email: organizer.email,
                role: "organizer",
                status: "approved",
                createdAt: new Date(),
            }, { merge: true });
            } else {
            await addDoc(collection(db, "organizers"), {
            firstName: organizer.firstName,
            lastName: organizer.lastName,
            organizerName: organizer.organizerName,
            email: organizer.email,
            role: "organizer",
            status: "approved",
            createdAt: new Date(),
            });
            }
            await deleteDoc(doc(db, "pendingOrganizers", organizer.id));

            alert("Organizer approved successfully!");
            setConfirmAction(null);
        } catch (error: any) {
            console.error("Approval failed:", error);
            alert(`Error approving organizer: ${error.message}`);
        } finally {
            setActionLoading({ ...actionLoading, [organizer.id]: false });
        }
        };

    const handleDeny = async () => {
        if (!confirmAction || confirmAction.action !== 'deny') return;
        const { organizer } = confirmAction;
        setActionLoading({ ...actionLoading, [organizer.id]: true });
        try {
        const organizerRef = doc(db, "pendingOrganizers", organizer.id);
        await updateDoc(organizerRef, { status: "denied" });
        alert("Organizer denied.");
        setConfirmAction(null);
        } catch (error: any) {
        console.error("Failed to deny organizer:", error);
        alert("Error denying organizer.");
        } finally {
        setActionLoading({ ...actionLoading, [organizer.id]: false });
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
                        <TableHead className="text-zinc-600">Organizer Name</TableHead>
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
                            {organizer.organizerName}
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
                                onClick={() => setConfirmAction({ action: 'approve', organizer })}
                                disabled={actionLoading[organizer.id]}
                                className="text-green-500 hover:bg-green-100"
                            >
                                <Check className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setConfirmAction({ action: 'deny', organizer })}
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

        <AnimatePresence>
            {confirmAction && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
                        <h3 className="text-lg font-bold text-gray-900">
                            Confirm {confirmAction.action === 'approve' ? 'Approval' : 'Rejection'}
                        </h3>
                        <p className="text-sm text-gray-600 mt-2">
                            Are you sure you want to {confirmAction.action} the organizer "{confirmAction.organizer.firstName} {confirmAction.organizer.lastName}"?
                        </p>
                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setConfirmAction(null)} className="hover:bg-gray-200">Cancel</Button>
                            <Button
                                onClick={confirmAction.action === 'approve' ? handleApprove : handleDeny}
                                disabled={actionLoading[confirmAction.organizer.id]}
                                className={confirmAction.action === 'approve'
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-red-600 text-white hover:bg-red-700"
                                }
                            >
                                {actionLoading[confirmAction.organizer.id] ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    confirmAction.action === 'approve' ? 'Approve' : 'Reject'
                                )}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </div>
    );
    }
