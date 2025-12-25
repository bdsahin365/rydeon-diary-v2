"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Loader2, Camera, Check, X, Trash2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const REQUIRED_VIEWS = [
    'Front View',
    'Rear View',
    'NS View',
    'OS View',
    'Dashboard View',
    'Front Seat',
    'Rear Cabin',
    'Luggage Area'
];

interface VehicleImageEditorProps {
    initialImages?: { label: string; url: string }[];
    onImagesChange: (images: { label: string; url: string }[]) => void;
    readonly?: boolean;
}

export default function VehicleImageEditor({
    initialImages = [],
    onImagesChange,
    readonly = false
}: VehicleImageEditorProps) {
    // Convert array to map for easier rendering
    const [imageMap, setImageMap] = useState<Record<string, string>>({});
    const [uploadingState, setUploadingState] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const map: Record<string, string> = {};
        if (Array.isArray(initialImages)) {
            initialImages.forEach(img => {
                if (img && img.label && img.url) map[img.label] = img.url;
            });
        }
        setImageMap(map);
    }, [initialImages]);

    const handleUpload = async (label: string, file: File) => {
        setUploadingState(prev => ({ ...prev, [label]: true }));
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();
                const newMap = { ...imageMap, [label]: data.url };
                setImageMap(newMap);

                // Notify parent
                const newArray = Object.entries(newMap).map(([l, u]) => ({ label: l, url: u }));
                onImagesChange(newArray);

                toast.success(`${label} uploaded`);
            } else {
                toast.error("Upload failed");
            }
        } catch (error) {
            toast.error("Upload error");
        } finally {
            setUploadingState(prev => ({ ...prev, [label]: false }));
        }
    };

    const handleRemove = (label: string) => {
        const newMap = { ...imageMap };
        delete newMap[label];
        setImageMap(newMap);

        const newArray = Object.entries(newMap).map(([l, u]) => ({ label: l, url: u }));
        onImagesChange(newArray);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {REQUIRED_VIEWS.map((view) => (
                    <div key={view} className="space-y-2">
                        <Label className="text-xs text-muted-foreground">{view}</Label>

                        {imageMap[view] ? (
                            <div className="relative aspect-video rounded-md overflow-hidden border bg-muted group">
                                <Image
                                    src={imageMap[view]}
                                    alt={view}
                                    fill
                                    className="object-cover"
                                />
                                {!readonly && (
                                    <>
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                type="button"
                                                onClick={() => handleRemove(view)}
                                                className="text-white bg-red-500 p-2 rounded-full hover:bg-red-600 transition-colors"
                                                title="Remove Image"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5">
                                            <Check className="h-3 w-3 text-white" />
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="relative aspect-video rounded-md border-2 border-dashed flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group">
                                {uploadingState[view] ? (
                                    <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                                ) : (
                                    <>
                                        <Camera className="h-6 w-6 text-muted-foreground mb-1 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] text-muted-foreground">Tap to add</span>
                                        {!readonly && (
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => {
                                                    if (e.target.files?.[0]) handleUpload(view, e.target.files[0]);
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
