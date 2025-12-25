"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Clipboard, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function ShareProfile() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Sharing Options
    const [shareProfile, setShareProfile] = useState(true);
    const [shareDocs, setShareDocs] = useState(true);
    const [shareVehicle, setShareVehicle] = useState(true);
    const [expiry, setExpiry] = useState("7");

    const handleGenerate = async () => {
        setLoading(true);
        const sections = [];
        if (shareProfile) sections.push('profile_overview');
        if (shareDocs) sections.push('documents');
        if (shareVehicle) sections.push('vehicle');

        try {
            const res = await fetch("/api/driver/share", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sections,
                    expiresInDays: parseInt(expiry),
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setGeneratedLink(data.url);
                toast.success("Link generated successfully");
            } else {
                toast.error(data.error || "Failed to generate link");
            }
        } catch (error) {
            toast.error("Network error");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Copied to clipboard");
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Share2 className="h-4 w-4" /> Share Profile
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Secure Profile</DialogTitle>
                    <DialogDescription>
                        Generate a temporary, secure link to share your compliance data.
                    </DialogDescription>
                </DialogHeader>

                {!generatedLink ? (
                    <div className="space-y-6 py-4">
                        <div className="space-y-4">
                            <h4 className="text-sm font-medium">What to include?</h4>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="share-profile">Personal Information</Label>
                                <Switch id="share-profile" checked={shareProfile} onCheckedChange={setShareProfile} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="share-docs">Compliance Documents</Label>
                                <Switch id="share-docs" checked={shareDocs} onCheckedChange={setShareDocs} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="share-vehicle">Vehicle Details</Label>
                                <Switch id="share-vehicle" checked={shareVehicle} onCheckedChange={setShareVehicle} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Link Expiry</Label>
                            <Select value={expiry} onValueChange={setExpiry}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select expiry" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">24 Hours</SelectItem>
                                    <SelectItem value="7">7 Days</SelectItem>
                                    <SelectItem value="30">30 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleGenerate} className="w-full" disabled={loading || (!shareProfile && !shareDocs && !shareVehicle)}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Link
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-muted rounded-md text-center">
                            <p className="text-sm text-muted-foreground mb-2">Here is your secure link:</p>
                            <code className="text-xs break-all bg-background p-2 rounded block mb-2 border">
                                {generatedLink}
                            </code>
                        </div>
                        <div className="flex gap-2">
                            <Button className="flex-1" onClick={copyToClipboard}>
                                {copied ? <Check className="mr-2 h-4 w-4" /> : <Clipboard className="mr-2 h-4 w-4" />}
                                {copied ? "Copied" : "Copy Link"}
                            </Button>
                            <Button variant="secondary" onClick={() => setGeneratedLink(null)}>
                                Create New
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
