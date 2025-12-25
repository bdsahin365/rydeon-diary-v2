"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, Car, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import DocumentUpload from "@/components/profile/DocumentUpload";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResponsiveSheet } from "@/components/ui/responsive-sheet";
import VehicleForm from "@/components/vehicle/VehicleForm";
import VehicleImageEditor from "@/components/vehicle/VehicleImageEditor";

export default function VehicleManager() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newVehicleOpen, setNewVehicleOpen] = useState(false);

    // New Vehicle Form
    const [make, setMake] = useState("");
    const [model, setModel] = useState("");
    const [reg, setReg] = useState("");

    const fetchVehicles = async () => {
        try {
            const res = await fetch("/api/driver/vehicles");
            if (res.ok) {
                const data = await res.json();
                setVehicles(data);
            }
        } catch (error) {
            toast.error("Failed to load vehicles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleAddVehicle = async () => {
        try {
            const res = await fetch("/api/driver/vehicles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ make, model, registrationNumber: reg }),
            });

            if (res.ok) {
                toast.success("Vehicle added");
                setNewVehicleOpen(false);
                setMake(""); setModel(""); setReg("");
                fetchVehicles();
            } else {
                toast.error("Failed to add vehicle");
            }
        } catch (error) {
            toast.error("Error submitting form");
        }
    };

    // Sub-component for individual vehicle row/card to manage state isolation
    const VehicleCard = ({ vehicle }: { vehicle: any }) => {
        const [open, setOpen] = useState(false);
        const [images, setImages] = useState<any[]>(vehicle.images || []);

        const handleImageUpdate = async (newImages: any[]) => {
            // Optimistic update
            setImages(newImages);

            try {
                const res = await fetch(`/api/driver/vehicles/${vehicle._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ images: newImages }),
                });

                if (res.ok) {
                    toast.success("Vehicle images saved");
                } else {
                    toast.error("Failed to save changes");
                }
            } catch (error) {
                toast.error("Error saving changes");
            }
        };

        return (
            <Card className="mb-4">
                <CardHeader className="py-6 flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-xl">{vehicle.registrationNumber}</CardTitle>
                        <CardDescription>{vehicle.make} {vehicle.model}</CardDescription>
                    </div>
                    <Collapsible open={open} onOpenChange={setOpen}>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm">
                                {open ? <ChevronUp className="h-4 w-4" /> : "Manage"}
                                {open ? <span className="ml-2">Close</span> : <span className="ml-2"><ChevronDown className="h-4 w-4" /></span>}
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                </CardHeader>
                <Collapsible open={open} onOpenChange={setOpen}>
                    <CollapsibleContent>
                        <CardContent className="pb-6 space-y-6">

                            {/* Images Section */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm">Vehicle Gallery</h4>
                                <VehicleImageEditor
                                    initialImages={vehicle.images || []}
                                    onImagesChange={handleImageUpdate}
                                />
                            </div>

                            {/* Docs Section */}
                            <div className="space-y-4">
                                <h4 className="font-semibold text-sm">Compliance Documents</h4>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <DocumentUpload
                                        type="v5c_logbook"
                                        label="V5C Logbook"
                                        vehicleId={vehicle._id}
                                    />
                                    <DocumentUpload
                                        type="mot_certificate"
                                        label="MOT Certificate"
                                        vehicleId={vehicle._id}
                                    />
                                    <DocumentUpload
                                        type="insurance_certificate"
                                        label="Insurance Certificate"
                                        vehicleId={vehicle._id}
                                    />
                                    <DocumentUpload
                                        type="rental_agreement"
                                        label="Rental Agreement"
                                        description="If vehicle is hired"
                                        vehicleId={vehicle._id}
                                    />
                                </div>
                            </div>

                        </CardContent>
                    </CollapsibleContent>
                </Collapsible>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <PageHeader title="Vehicle Manager" subtitle="Manage your fleet" />
                <ResponsiveSheet
                    open={newVehicleOpen}
                    onOpenChange={setNewVehicleOpen}
                    title="Add New Vehicle"
                    description="Enter vehicle details and upload required photos."
                    trigger={<Button className="gap-2"><Plus className="h-4 w-4" /> Add Vehicle</Button>}
                >
                    <VehicleForm onSuccess={() => {
                        setNewVehicleOpen(false);
                        fetchVehicles();
                    }} />
                </ResponsiveSheet>
            </div>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : vehicles.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed rounded-lg bg-muted/10">
                    <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No vehicles added</h3>
                    <p className="text-muted-foreground">Add your first vehicle to get started.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {vehicles.map((v) => (
                        <VehicleCard key={v._id} vehicle={v} />
                    ))}
                </div>
            )}
        </div>
    );
}
