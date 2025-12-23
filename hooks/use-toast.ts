import { toast } from "sonner"

export const useToast = () => {
    return {
        toast: (props: { title?: string; description?: string; variant?: "default" | "destructive"; className?: string }) => {
            if (props.variant === "destructive") {
                toast.error(props.title, { description: props.description, className: props.className })
            } else {
                toast.success(props.title, { description: props.description, className: props.className })
            }
        },
    }
}
