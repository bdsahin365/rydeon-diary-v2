"use client";

import { Button } from "@/components/ui/button";

export function BackButton() {
    return (
        <Button variant="outline" className="rounded-full" onClick={() => window.history.back()}>
            Go Back
        </Button>
    );
}
