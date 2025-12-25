"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Camera, Check } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import VehicleImageEditor from "./VehicleImageEditor";

interface VehicleFormProps {
    onSuccess: () => void;
}

const REQUIRED_VIEWS = [
    'Front View', 'Rear View', 'NS View', 'OS View',
    'Dashboard View', 'Front Seat', 'Rear Cabin', 'Luggage Area'
];

export default function VehicleForm({ onSuccess }: VehicleFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        make: "",
        model: "",
        registrationNumber: "",
        year: "",
        color: ""
    });

    // Map view label to uploaded URL
    const [images, setImages] = useState<Record<string, string>>({});

    const handleImageUpload = async (label: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);

        try {
            // Optimistic UI could show a spinner here
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) {
                const data = await res.json();
                setImages(prev => ({ ...prev, [label]: data.url }));
                toast.success(`${label} uploaded`);
            } else {
                toast.error("Upload failed");
            }
        } catch (error) {
            toast.error("Upload error");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Transform images map to array of objects
        const imagesArray = Object.entries(images).map(([label, url]) => ({ label, url }));

        try {
            const res = await fetch("/api/driver/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    images: imagesArray
                }),
            });

            if (res.ok) {
                toast.success("Vehicle created successfully");
                onSuccess();
            } else {
                toast.error("Failed to create vehicle");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="reg">Registration</Label>
                    <Input
                        id="reg"
                        placeholder="AB12 CDE"
                        required
                        value={formData.registrationNumber}
                        onChange={e => setFormData({ ...formData, registrationNumber: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                        id="year"
                        placeholder="2023"
                        type="number"
                        value={formData.year}
                        onChange={e => setFormData({ ...formData, year: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="make">Make</Label>
                    <Input
                        id="make"
                        placeholder="Toyota"
                        required
                        value={formData.make}
                        onChange={e => setFormData({ ...formData, make: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="model">Model</Label>
                    <Input
                        id="model"
                        placeholder="Prius"
                        required
                        value={formData.model}
                        onChange={e => setFormData({ ...formData, model: e.target.value })}
                    />
                </div>
                <div className="space-y-2 col-span-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                        id="color"
                        placeholder="Silver"
                        value={formData.color}
                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-semibold text-sm border-b pb-2">Vehicle Photos</h3>
                <VehicleImageEditor
                    onImagesChange={(imgs) => {
                        // Convert back to map for local state if needed, or just store the array
                        // Ideally we change state to just use the array
                        const map: Record<string, string> = {};
                        imgs.forEach(i => map[i.label] = i.url);
                        setImages(map);
                    }}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Vehicle
            </Button>
        </form>
    );
}
