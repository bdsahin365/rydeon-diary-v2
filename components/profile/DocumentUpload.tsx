"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface DocumentUploadProps {
    type: string;
    label: string;
    description?: string;
    existingDoc?: any;
    vehicleId?: string;
    onUploadComplete?: () => void;
}

export default function DocumentUpload({
    type,
    label,
    description,
    existingDoc,
    vehicleId,
    onUploadComplete
}: DocumentUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(existingDoc?.fileUrl || null);
    const [status, setStatus] = useState(existingDoc?.status || 'missing');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            // 1. Upload File
            const formData = new FormData();
            formData.append("file", file);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!uploadRes.ok) throw new Error("File upload failed");
            const { url } = await uploadRes.json();
            setPreview(url); // Optimistic update

            // 2. Save Metadata
            const docRes = await fetch("/api/driver/documents", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    fileUrl: url,
                    vehicleId,
                    expiryDate: null, // TODO: Add date picker for user to input expiry
                }),
            });

            if (!docRes.ok) throw new Error("Failed to save document record");
            const newDoc = await docRes.json();

            setStatus(newDoc.status);
            toast.success(`${label} uploaded successfully`);
            if (onUploadComplete) onUploadComplete();

        } catch (error) {
            console.error(error);
            toast.error("Upload failed. Please try again.");
            setPreview(existingDoc?.fileUrl || null); // Revert
        } finally {
            setUploading(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'verified': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'uploaded': return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
            case 'rejected': return 'bg-red-100 text-red-800 hover:bg-red-100';
            case 'expired': return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
            default: return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
        }
    };

    return (
        <Card className="w-full">
            <CardHeader className="pb-2 pt-6 px-6">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-medium">{label}</CardTitle>
                    {status !== 'missing' && (
                        <Badge className={`${getStatusColor(status)} border-0 capitalize`}>
                            {status.replace('_', ' ')}
                        </Badge>
                    )}
                </div>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </CardHeader>
            <CardContent className="pb-6 px-6">
                {preview ? (
                    <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
                        {preview.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                            <Image
                                src={preview}
                                alt={label}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center flex-col text-muted-foreground">
                                <FileText className="h-10 w-10 mb-2" />
                                <span className="text-xs">Document Uploaded</span>
                            </div>
                        )}

                        {/* Status Overlay if needed */}
                        {status === 'rejected' && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                <Badge variant="destructive">Rejected</Badge>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed rounded-md bg-muted/50 border-muted-foreground/25">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">Tap to upload</p>
                    </div>
                )}
            </CardContent>
            <CardFooter className="pt-0">
                <div className="relative w-full">
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        onChange={handleFileChange}
                        disabled={uploading}
                    />
                    <Button variant="outline" className="w-full" disabled={uploading}>
                        {uploading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                            </>
                        ) : (
                            status === 'missing' ? 'Upload Document' : 'Replace Document'
                        )}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
