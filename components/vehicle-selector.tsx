"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X, Car, Check } from "lucide-react"
import { Operator } from "@/types"
import { cn } from "@/lib/utils"

interface VehicleSelectorProps {
    operator: Operator | null;
    value: string | null;
    onChange: (value: string) => void;
    onVehicleAdded: (vehicle: string, operator: Operator) => void;
}

export function VehicleSelector({ operator: _operator, value, onChange }: VehicleSelectorProps) {
    const [isAdding, setIsAdding] = React.useState(false);
    const [customVehicle, setCustomVehicle] = React.useState("");
    const [error, setError] = React.useState("");
    const standardVehicles = ["Saloon", "Estate", "MPV", "MPV+6", "MPV+8", "Exec"];
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (isAdding && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isAdding]);

    const handleAddCustom = () => {
        const trimmed = customVehicle.trim();

        if (!trimmed) {
            setError("Name cannot be empty");
            return;
        }

        if (trimmed.length < 2) {
            setError("Min 2 chars");
            return;
        }

        if (trimmed.length > 20) {
            setError("Max 20 chars");
            return;
        }

        onChange(trimmed);
        setCustomVehicle("");
        setError("");
        setIsAdding(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddCustom();
        } else if (e.key === 'Escape') {
            setIsAdding(false);
            setCustomVehicle("");
            setError("");
        }
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
                {standardVehicles.map((v) => {
                    const isSelected = value === v;
                    return (
                        <Button
                            key={v}
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => onChange(v)}
                            className={cn(
                                "h-14 flex flex-col gap-1 items-center justify-center transition-all duration-200",
                                isSelected
                                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 shadow-sm"
                                    : "hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                            type="button"
                        >
                            <Car className={cn("w-5 h-5 transition-colors", isSelected ? "text-primary fill-primary/20" : "text-rose-500 fill-rose-500/20")} />
                            <span className="text-xs font-medium leading-none">{v}</span>
                        </Button>
                    );
                })}

                {/* Custom Vehicle Display if selected and not standard */}
                {value && !standardVehicles.includes(value) && (
                    <Button
                        variant="default"
                        className="h-14 flex flex-col gap-1 items-center justify-center border-primary bg-primary/10 text-primary hover:bg-primary/20 shadow-sm transition-all duration-200"
                        type="button"
                        onClick={() => { }} // Already selected
                    >
                        <Car className="w-5 h-5 text-primary fill-primary/20" />
                        <span className="text-xs font-medium leading-none truncate max-w-full px-1">{value}</span>
                    </Button>
                )}

                {/* Add Custom Button / Input */}
                {isAdding ? (
                    <div className="col-span-1 md:col-span-1 h-14 relative group">
                        <Input
                            ref={inputRef}
                            value={customVehicle}
                            onChange={(e) => {
                                setCustomVehicle(e.target.value);
                                setError("");
                            }}
                            onKeyDown={handleKeyDown}
                            onBlur={() => !customVehicle && setIsAdding(false)}
                            className={cn(
                                "h-full w-full px-2 text-xs text-center border-dashed border-2 focus-visible:ring-1 focus-visible:ring-offset-0",
                                error ? "border-red-500 focus-visible:ring-red-500" : "border-muted-foreground/30 focus-visible:border-primary"
                            )}
                            placeholder="Type..."
                        />
                        {customVehicle && (
                            <div className="absolute -top-2 -right-2">
                                <Button
                                    size="icon"
                                    className="h-5 w-5 rounded-full shadow-sm"
                                    onClick={handleAddCustom}
                                    type="button"
                                >
                                    <Check className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                        {error && (
                            <span className="absolute -bottom-5 left-0 right-0 text-[10px] text-red-500 text-center bg-background/90 px-1 rounded border border-red-200 z-10 pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis">
                                {error}
                            </span>
                        )}
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        className="h-14 flex flex-col gap-1 items-center justify-center border-dashed border-2 border-muted hover:border-primary/50 hover:bg-muted/50 text-muted-foreground transition-all duration-200"
                        onClick={() => setIsAdding(true)}
                        type="button"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="text-xs font-medium leading-none">Custom</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
