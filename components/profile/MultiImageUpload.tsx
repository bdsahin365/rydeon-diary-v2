"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface MultiImageUploadProps {
    images: string[];
    onImagesChange: (newImages: string[]) => void;
    maxImages?: number;
    label?: string;
}

export default function MultiImageUpload({
    images = [],
    onImagesChange,
    maxImages = 10,
    label = "Images"
}: MultiImageUploadProps) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (images.length + files.length > maxImages) {
            toast.error(`You can only upload up to ${maxImages} images`);
            return;
        }

        setUploading(true);
        const newUrls: string[] = [];

        try {
            // Upload each file sequentially (or parallel promise.all)
            for (let i = 0; i < files.length; i++) {
                const formData = new FormData();
                formData.append("file", files[i]);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (res.ok) {
                    const data = await res.json();
                    newUrls.push(data.url);
                } else {
                    toast.error(`Failed to upload ${files[i].name}`);
                }
            }

            if (newUrls.length > 0) {
                onImagesChange([...images, ...newUrls]);
                toast.success("Images uploaded successfully");
            }
        } catch (error) {
            toast.error("Upload process failed");
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        const updated = images.filter((_, idx) => idx !== indexToRemove);
        onImagesChange(updated);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">{label} ({images.length}/{maxImages})</h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border group">
                        <Image
                            src={url}
                            alt={`Preview ${idx}`}
                            fill
                            className="object-cover"
                        />
                        <button
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-red-500/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}

                {/* Upload Button */}
                {images.length < maxImages && (
                    <div className="relative aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-md hover:bg-muted/50 transition-colors cursor-pointer">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                        ) : (
                            <>
                                <Plus className="h-6 w-6 text-muted-foreground mb-1" />
                                <span className="text-xs text-muted-foreground">Add Photos</span>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
