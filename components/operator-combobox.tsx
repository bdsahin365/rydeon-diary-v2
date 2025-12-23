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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
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
                <Command>
                    <CommandInput placeholder="Search operator..." value={inputValue} onValueChange={setInputValue} />
                    <CommandList>
                        <CommandEmpty>
                            <Button variant="ghost" className="w-full justify-start" onClick={() => {
                                const newOp: Operator = { name: inputValue, chargesCommission: false, id: Math.random().toString() };
                                onOperatorCreated(newOp);
                                onChange(inputValue);
                                setOpen(false);
                            }}>
                                <Plus className="mr-2 h-4 w-4" /> Create &quot;{inputValue}&quot;
                            </Button>
                        </CommandEmpty>
                        <CommandGroup>
                            {operators.map((operator) => (
                                <CommandItem
                                    key={operator.id || operator._id}
                                    value={operator.name}
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
            </PopoverContent>
        </Popover>
    )
}
