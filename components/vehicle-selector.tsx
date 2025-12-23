"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { Operator } from "@/types"

interface VehicleSelectorProps {
    operator: Operator | null;
    value: string | null;
    onChange: (value: string) => void;
    onVehicleAdded: (vehicle: string, operator: Operator) => void;
}

export function VehicleSelector({ operator: _operator, value, onChange }: VehicleSelectorProps) {
    const [customVehicle, setCustomVehicle] = React.useState("");
    const standardVehicles = ["Saloon", "Estate", "MPV", "MPV+6", "MPV+8", "Exec"];

    const handleAddCustom = () => {
        if (customVehicle.trim()) {
            onChange(customVehicle.trim());
            setCustomVehicle("");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {standardVehicles.map((v) => (
                    <Button
                        key={v}
                        variant={value === v ? "default" : "outline"}
                        onClick={() => onChange(v)}
                        className="h-9"
                        type="button"
                    >
                        <span className="mr-2">🚗</span>
                        {v}
                    </Button>
                ))}
                {value && !standardVehicles.includes(value) && (
                    <Button variant="default" className="h-9" type="button">
                        <span className="mr-2">🚙</span>
                        {value}
                    </Button>
                )}
            </div>
            <div className="flex gap-2">
                <Input
                    placeholder="Add custom vehicle..."
                    value={customVehicle}
                    onChange={(e) => setCustomVehicle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustom();
                        }
                    }}
                />
                <Button variant="outline" size="icon" onClick={handleAddCustom} type="button">
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
