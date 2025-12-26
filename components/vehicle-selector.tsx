"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Car, Check, ChevronsUpDown, Plus } from "lucide-react"
import { Operator } from "@/types"
import { cn } from "@/lib/utils"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface VehicleSelectorProps {
    operator: Operator | null;
    value: string | null;
    onChange: (value: string) => void;
    onVehicleAdded: (vehicle: string, operator: Operator) => void;
    availableVehicles: string[];
}

export function VehicleSelector({ operator: _operator, value, onChange, onVehicleAdded, availableVehicles = [] }: VehicleSelectorProps) {
    const [open, setOpen] = React.useState(false) // For the combobox
    const [inputValue, setInputValue] = React.useState("")

    // Define "Popular" vehicles for quick access buttons.
    // We filter these from the availableVehicles prop if present, or just use defaults.
    // The requirement says: "Saloon, Estate, MPV, MPV 5, MPV 6, MPV 7, MPV 8, Exec"
    const popularVehicles = [
        "Saloon",
        "Estate",
        "MPV",
        "MPV 5",
        "MPV 6",
        "MPV 7",
        "MPV 8",
        "Exec"
    ];

    const handleSelect = (currentValue: string) => {
        onChange(currentValue)
        setOpen(false)
    }

    const handleAddCustom = () => {
        if (!inputValue.trim()) return;
        // Check if it already exists (case insensitive) to avoid duplicates via "Add" button
        const exists = availableVehicles.some(v => v.toLowerCase() === inputValue.trim().toLowerCase());
        if (!exists) {
            // In a real scenario, onVehicleAdded likely updates the backend.
            // Since we don't have the operator available here for the callback in a clean way (based on old code 'operator' prop usage),
            // we will assume the parent handles the "creation" via the 'onChange' if it's new, OR we call onVehicleAdded.
            // The previous code had:  onVehicleAdded: (vehicle: string, operator: Operator) => void;
            // But we are decoupling "adding a vehicle TYPE" from "adding a vehicle to an operator".
            // The requirement is "add custom vehicle type to database".
            // So we will just call onChange with the new value, and rely on the parent (JobEditSheet) to handle creating the type if it doesn't exist.
            // However, to follow the prop signature `onVehicleAdded` which seems specific to adding a vehicle to an *operator* (from previous context),
            // we might need to adjust.
            // Looking at JobEditSheet, onVehicleAdded updates the existingOperators. 
            // BUT, this task is about GLOBAL vehicle types.
            // So, the `onVehicleAdded` prop might be a bit of a legacy name for "adding a specific vehicle instance to an operator".
            // We should probably just call `onChange` and let the parent handle the "new type" logic or call a separate prop if provided.
            // For now, `onChange` is sufficient to set the value. The parent `JobEditSheet` needs to detect if this is a new type and save it.

            // Wait, the plan says: "Handle `onVehicleAdded` by calling `createVehicleType`" in JobEditSheet.
            // So I should trigger a callback. But `onVehicleAdded` requires an Operator. 
            // Let's modify the signature in the parent to support just a string, or just use a new callback `onTypeAdded`.
            // Given I can't easily change the parent's usage of `onVehicleAdded` without strict checking, 
            // I will stick to `onChange` for selection. 
            // Actually, `onVehicleAdded` in the old code was `(vehicle, updatedOperator)`.
            // This seems to be about adding a specific vehicle *asset* to an operator.
            // The current task is about Vehicle *Types* (Saloon, etc.).
            // So, I should probably just call `onChange(newValue)`. 
            // The parent will see the new value. The parent should be responsible for saving the new type if it's not in the list.
            // But to be explicit and allow "adding" without selecting, or to follow the "Custom" flow:
            onChange(inputValue.trim());
        } else {
            onChange(exists ? availableVehicles.find(v => v.toLowerCase() === inputValue.trim().toLowerCase()) || inputValue : inputValue);
        }
        setOpen(false);
    }

    return (
        <div className="space-y-3">
            {/* Popular / Standard Buttons */}
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {popularVehicles.map((v) => {
                    const isSelected = value === v;
                    return (
                        <Button
                            key={v}
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => onChange(v)}
                            className={cn(
                                "h-12 flex flex-col gap-0.5 items-center justify-center transition-all duration-200",
                                isSelected
                                    ? "border-primary bg-primary/10 text-primary hover:bg-primary/20 shadow-sm"
                                    : "hover:border-primary/50 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                            type="button"
                        >
                            <Car className={cn("w-4 h-4 transition-colors", isSelected ? "text-primary fill-primary/20" : "text-primary/40")} />
                            <span className="text-[10px] sm:text-xs font-medium leading-none truncate max-w-full px-1">{v}</span>
                        </Button>
                    );
                })}
            </div>

            {/* Combobox for Custom / All Types */}
            <div className="flex gap-2">
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={open}
                            className={cn("w-full justify-between h-12", !popularVehicles.includes(value || "") && value ? "border-primary bg-primary/5 text-primary" : "text-muted-foreground")}
                        >
                            <span className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                {value && !popularVehicles.includes(value) ? value : "Select or Add Custom Vehicle..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command>
                            <CommandInput placeholder="Search vehicle type..." value={inputValue} onValueChange={setInputValue} />
                            <CommandList>
                                <CommandEmpty>
                                    <div className="p-2 flex flex-col items-center gap-2">
                                        <p className="text-sm text-muted-foreground">No vehicle found.</p>
                                        <Button size="sm" className="w-full" onClick={handleAddCustom}>
                                            Create "{inputValue}"
                                        </Button>
                                    </div>
                                </CommandEmpty>
                                <CommandGroup heading="Available Types">
                                    {availableVehicles.map((framework) => (
                                        <CommandItem
                                            key={framework}
                                            value={framework}
                                            onSelect={handleSelect}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === framework ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {framework}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
}
