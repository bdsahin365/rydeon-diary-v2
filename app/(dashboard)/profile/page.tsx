"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShieldCheck, Mail, Phone, MapPin, Car, FileText, Lock } from "lucide-react";
import { toast } from "sonner";
import DocumentUpload from "@/components/profile/DocumentUpload";
import ShareProfile from "@/components/profile/ShareProfile";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";
import VehicleManager from "@/app/(dashboard)/vehicle-manager/page"; // We can reuse the manager or parts of it
import { Progress } from "@/components/ui/progress";

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [profileRes, docsRes] = await Promise.all([
                fetch("/api/driver/profile"),
                fetch("/api/driver/documents")
            ]);

            if (profileRes.ok) {
                const p = await profileRes.json();
                if (p.exists !== false) setProfile(p);
            }

            if (docsRes.ok) {
                const d = await docsRes.json();
                setDocuments(d);
            }
        } catch (error) {
            toast.error("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    };

    const getDocByType = (type: string) => documents.find(d => d.type === type);

    const [personalForm, setPersonalForm] = useState({
        phoneNumber: "",
        line1: "",
        city: "",
        postcode: ""
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (profile) {
            setPersonalForm({
                phoneNumber: profile.phoneNumber || "",
                line1: profile.address?.line1 || "",
                city: profile.address?.city || "",
                postcode: profile.address?.postcode || ""
            });
        }
    }, [profile]);

    const handleSavePersonal = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/driver/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phoneNumber: personalForm.phoneNumber,
                    address: {
                        line1: personalForm.line1,
                        city: personalForm.city,
                        postcode: personalForm.postcode
                    }
                }),
            });

            if (res.ok) {
                toast.success("Personal details updated");
                fetchData(); // Refresh data
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("Error saving changes");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="container py-8 max-w-6xl space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Driver Profile</h1>
                    <p className="text-muted-foreground">Manage your identity, compliance, and security.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-medium">Compliance Score</p>
                        <p className="text-2xl font-bold text-primary">{profile?.completionStatus || 0}%</p>
                    </div>
                    <ShareProfile />
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">

                {/* Scrollable Tabs Wrapper - Matches JobFilters/Diary style */}
                <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:pb-0 scrollbar-hide">
                    <TabsList className="inline-flex h-auto p-1 bg-muted/40 border rounded-lg min-w-max">
                        <TabsTrigger value="overview" className="px-4 py-2">Overview</TabsTrigger>
                        <TabsTrigger value="personal" className="px-4 py-2">Personal</TabsTrigger>
                        <TabsTrigger value="documents" className="px-4 py-2">Documents</TabsTrigger>
                        <TabsTrigger value="vehicles" className="px-4 py-2">Vehicles</TabsTrigger>
                        <TabsTrigger value="security" className="px-4 py-2">Security</TabsTrigger>
                    </TabsList>
                </div>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 py-6">
                                <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pb-6">
                                <div className="text-2xl font-bold">{profile?.completionStatus || 0}%</div>
                                <Progress value={profile?.completionStatus || 0} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {profile?.completionStatus === 100 ? "Fully Compliant" : "Action Required"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 py-6">
                                <CardTitle className="text-sm font-medium">Documents Uploaded</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pb-6">
                                <div className="text-2xl font-bold">{documents.length}</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    out of 4 mandatory
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 py-6">
                                <CardTitle className="text-sm font-medium">Security</CardTitle>
                                <Lock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="pb-6">
                                <div className="text-2xl font-bold">Good</div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    Password last changed...
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* PERSONAL INFO TAB */}
                <TabsContent value="personal">
                    <Card>
                        <CardHeader className="py-6">
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your contact details and address.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pb-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Phone className="h-4 w-4" /> Phone Number
                                    </label>
                                    <Input
                                        placeholder="+44 7..."
                                        value={personalForm.phoneNumber}
                                        onChange={e => setPersonalForm({ ...personalForm, phoneNumber: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Mail className="h-4 w-4" /> Email
                                    </label>
                                    <Input disabled value={profile?.userId?.email || profile?.email || "loading..."} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4" /> Address
                                    </label>
                                    <Input
                                        placeholder="Line 1"
                                        className="mb-2"
                                        value={personalForm.line1}
                                        onChange={e => setPersonalForm({ ...personalForm, line1: e.target.value })}
                                    />
                                    <Input
                                        placeholder="City"
                                        className="mb-2"
                                        value={personalForm.city}
                                        onChange={e => setPersonalForm({ ...personalForm, city: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Postcode"
                                        className="w-1/3"
                                        value={personalForm.postcode}
                                        onChange={e => setPersonalForm({ ...personalForm, postcode: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleSavePersonal} disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DOCUMENTS TAB */}
                <TabsContent value="documents">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Identity & Licensing</h3>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <DocumentUpload
                                    type="profile_photo"
                                    label="Profile Photo"
                                    description="Clear photo of your face, no sunglasses."
                                    existingDoc={getDocByType('profile_photo')}
                                    onUploadComplete={fetchData}
                                />
                                <DocumentUpload
                                    type="driving_licence_front"
                                    label="DVLA Driving Licence"
                                    description="Front of your UK photocard licence."
                                    existingDoc={getDocByType('driving_licence_front')}
                                    onUploadComplete={fetchData}
                                />
                                <DocumentUpload
                                    type="tfl_badge"
                                    label="TfL Badge (Card)"
                                    description="Your Private Hire Driver ID Badge."
                                    existingDoc={getDocByType('tfl_badge')}
                                    onUploadComplete={fetchData}
                                />
                                <DocumentUpload
                                    type="tfl_paper_licence"
                                    label="TfL Paper Licence"
                                    description="The full paper counterpart licence document."
                                    existingDoc={getDocByType('tfl_paper_licence')}
                                    onUploadComplete={fetchData}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Financial</h3>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                <DocumentUpload
                                    type="payout_details"
                                    label="Bank Statement"
                                    description="Recent statement showing header for proof of address/account."
                                    existingDoc={getDocByType('payout_details')}
                                    onUploadComplete={fetchData}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* VEHICLES TAB */}
                <TabsContent value="vehicles">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                            <div>
                                <h3 className="font-semibold flex items-center gap-2"><Car className="h-4 w-4" /> Vehicle Management</h3>
                                <p className="text-sm text-muted-foreground">Manage your fleet and compliance docs.</p>
                            </div>
                            {/* Reusing the vehicle manager logic/component here or linking to it */}
                        </div>
                        {/* We could embed the full manager, but for now let's just render the component logic if we exported it nicely. 
                            Since VehicleManager is a page, we might need to adjust it to be a component or just iframe it conceptually.
                            For simplicty in this refactor, I will just Import the Page component as it is client side.
                        */}
                        <VehicleManager />
                    </div>
                </TabsContent>

                {/* SECURITY TAB */}
                <TabsContent value="security">
                    <div className="grid gap-6 md:grid-cols-2">
                        <ChangePasswordForm />
                        <Card>
                            <CardHeader className="py-6">
                                <CardTitle>Session Management</CardTitle>
                                <CardDescription>Manage your active sessions.</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <p className="text-sm text-muted-foreground mb-4">You are currently logged in on this device.</p>
                                <Button variant="outline" className="w-full text-red-500 hover:text-red-600">
                                    Log out of all other devices
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
