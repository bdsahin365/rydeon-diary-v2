"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { Operator } from "@/types"

interface VehicleSelectorProps {
    operator: Operator | null;
    value: string | null;
    onChange: (value: string) => void;
    onVehicleAdded: (vehicle: string, operator: Operator) => void;
}

export function VehicleSelector({ operator: _operator, value, onChange }: VehicleSelectorProps) {
    const [customVehicle, setCustomVehicle] = React.useState("");
    const [error, setError] = React.useState("");
    const standardVehicles = ["Saloon", "Estate", "MPV", "MPV+6", "MPV+8", "Exec"];

    const handleAddCustom = () => {
        const trimmed = customVehicle.trim();

        if (!trimmed) {
            setError("Vehicle name cannot be empty");
            return;
        }

        if (trimmed.length < 2) {
            setError("Vehicle name must be at least 2 characters");
            return;
        }

        if (trimmed.length > 20) {
            setError("Vehicle name must be 20 characters or less");
            return;
        }

        onChange(trimmed);
        setCustomVehicle("");
        setError("");
    };

    const handleClear = () => {
        onChange("");
        setCustomVehicle("");
        setError("");
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                {standardVehicles.map((v) => (
                    <Button
                        key={v}
                        variant={value === v ? "default" : "outline"}
                        onClick={() => onChange(v)}
                        className="h-10 min-h-[44px]"
                        type="button"
                        aria-pressed={value === v}
                        aria-label={`Select ${v} vehicle`}
                    >
                        <span className="mr-2">🚗</span>
                        {v}
                    </Button>
                ))}
                {value && !standardVehicles.includes(value) && (
                    <Button
                        variant="default"
                        className="h-10 min-h-[44px]"
                        type="button"
                        aria-pressed={true}
                        aria-label={`Current selection: ${value}`}
                    >
                        <span className="mr-2">🚙</span>
                        {value}
                    </Button>
                )}
            </div>
            <div className="space-y-2">
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label htmlFor="custom-vehicle" className="sr-only">Custom vehicle type</label>
                        <Input
                            id="custom-vehicle"
                            placeholder="Add custom vehicle..."
                            value={customVehicle}
                            onChange={(e) => {
                                setCustomVehicle(e.target.value);
                                setError("");
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddCustom();
                                }
                            }}
                            aria-invalid={!!error}
                            aria-describedby={error ? "vehicle-error" : undefined}
                            className={error ? "border-red-500" : ""}
                        />
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleAddCustom}
                        type="button"
                        disabled={!customVehicle.trim()}
                        className="min-w-[44px] min-h-[44px]"
                        aria-label="Add custom vehicle"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    {value && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleClear}
                            type="button"
                            className="min-w-[44px] min-h-[44px]"
                            aria-label="Clear vehicle selection"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                {error && (
                    <p id="vehicle-error" className="text-xs text-red-500" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
