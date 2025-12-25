import { toast } from "sonner"

export const useToast = () => {
    return {
        toast: (props: {
            title?: string;
            description?: string;
            variant?: "default" | "destructive";
            className?: string;
            action?: { label: string; onClick: () => void }
        }) => {
            const options = {
                description: props.description,
                className: props.className,
                action: props.action,
            };

            if (props.variant === "destructive") {
                toast.error(props.title, options)
            } else {
                toast.success(props.title, options)
            }
        },
    }
}
