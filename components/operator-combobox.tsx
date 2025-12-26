"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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
import {
    Drawer,
    DrawerContent,
    DrawerTrigger,
    DrawerTitle,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Operator } from "@/types"

interface OperatorComboboxProps {
    operators: Operator[];
    value: string;
    onChange: (value: string) => void;
    onOperatorCreated: (operator: Operator) => void;
}

export function OperatorCombobox({ operators, value, onChange, onOperatorCreated }: OperatorComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")
    const isMobile = useMediaQuery("(max-width: 768px)")

    const OperatorList = () => (
        <div
            onMouseDown={(e) => {
                // Prevent input from losing focus on desktop
                if (!isMobile) {
                    const target = e.target as HTMLElement;
                    if (!target.closest('input')) {
                        e.preventDefault();
                    }
                }
            }}
            onTouchStart={(e) => {
                // Prevent input from losing focus on mobile
                const target = e.target as HTMLElement;
                if (!target.closest('input')) {
                    e.preventDefault();
                }
            }}
        >
            <Command>
                <CommandInput
                    placeholder="Search operator..."
                    value={inputValue}
                    onValueChange={setInputValue}
                    autoFocus
                    aria-label="Search for operator"
                />
                <CommandList role="listbox" aria-label="Operator list">
                    <CommandEmpty>
                        {inputValue ? (
                            <div className="space-y-2 p-2">
                                <p className="text-sm text-muted-foreground text-center">No operators found</p>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start min-h-[44px]"
                                    onPointerDown={(e) => {
                                        e.preventDefault();
                                    }}
                                    onClick={() => {
                                        const newOp: Operator = { name: inputValue, chargesCommission: false, id: Math.random().toString() };
                                        onOperatorCreated(newOp);
                                        onChange(inputValue);
                                        setOpen(false);
                                    }}
                                    aria-label={`Create new operator: ${inputValue}`}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Create &quot;{inputValue}&quot;
                                </Button>
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                {operators.length === 0 ? "Create your first operator" : "Start typing to search"}
                            </div>
                        )}
                    </CommandEmpty>
                    <CommandGroup>
                        {operators.length > 0 && inputValue && (
                            <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                {operators.filter(op => op.name.toLowerCase().includes(inputValue.toLowerCase())).length} operator(s) found
                            </div>
                        )}
                        {operators.map((operator) => (
                            <CommandItem
                                key={operator.id || operator._id}
                                value={operator.name}
                                className="min-h-[44px]"
                                role="option"
                                aria-selected={value === operator.name}
                                onPointerDown={(e) => {
                                    // Prevent input from losing focus
                                    e.preventDefault();
                                }}
                                onSelect={(currentValue) => {
                                    onChange(currentValue === value ? "" : currentValue)
                                    setOpen(false)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === operator.name ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {operator.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command>
            {isMobile && (
                <div className="px-4 pb-2 text-xs text-center text-muted-foreground">
                    Press Escape to close
                </div>
            )}
        </div>
    );

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={setOpen}>
                <DrawerTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select operator"
                        className="w-full justify-between h-10"
                    >
                        <span className="truncate text-left">
                            {value
                                ? operators.find((op) => op.name === value)?.name || value
                                : "Select operator..."}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </DrawerTrigger>
                <DrawerContent onPointerDownOutside={(e) => e.preventDefault()} className="max-h-[90vh] flex flex-col fixed bottom-0 left-0 right-0">
                    <div className="sr-only">
                        <DrawerTitle>Select Operator</DrawerTitle>
                    </div>
                    <div className="mt-4 border-t flex-1 overflow-y-auto min-h-[50vh]">
                        <OperatorList />
                    </div>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select operator"
                    className="w-full justify-between"
                    suppressHydrationWarning
                >
                    {value
                        ? operators.find((op) => op.name === value)?.name || value
                        : "Select operator..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <OperatorList />
            </PopoverContent>
        </Popover>
    )
}
