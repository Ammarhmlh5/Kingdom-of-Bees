import * as React from "react"
import { cn } from "@/lib/utils"
// Simplified custom Select implementation to match Radix API without dependency

interface SelectContextValue {
    value?: string;
    onValueChange?: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
}
const SelectContext = React.createContext<SelectContextValue>({} as any);

export const Select = ({ children, onValueChange, defaultValue, value }: any) => {
    const [open, setOpen] = React.useState(false);
    const [currValue, setCurrValue] = React.useState(value || defaultValue);

    React.useEffect(() => {
        if (value !== undefined) setCurrValue(value);
    }, [value]);

    const handleValueChange = (val: string) => {
        setCurrValue(val);
        if (onValueChange) onValueChange(val);
        setOpen(false);
    };

    return (
        <SelectContext.Provider value={{ value: currValue, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative w-full">{children}</div>
        </SelectContext.Provider>
    );
};

export const SelectTrigger = React.forwardRef<HTMLButtonElement, any>(
    ({ className, children, ...props }, ref) => {
        const { setOpen, open } = React.useContext(SelectContext);
        return (
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);
SelectTrigger.displayName = "SelectTrigger"

export const SelectValue = ({ placeholder, className }: any) => {
    const { value } = React.useContext(SelectContext);
    // We need to map value to label effectively, but context only has value. 
    // For simplicity in this polyfill, we might just show value or we need children inspection.
    // Limitation: This simple polyfill might just show the ID if we don't look up the label.
    // Start with showing value, user can enhance later.
    return <span className={className}>{value || placeholder}</span>
}

export const SelectContent = ({ children, className }: any) => {
    const { open } = React.useContext(SelectContext);
    if (!open) return null;
    return (
        <div className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-1", className)}>
            <div className="p-1">{children}</div>
        </div>
    );
}

export const SelectItem = React.forwardRef<HTMLDivElement, any>(
    ({ className, children, value, ...props }, ref) => {
        const { onValueChange, value: selectedValue } = React.useContext(SelectContext);
        return (
            <div
                ref={ref}
                onClick={(e) => {
                    e.stopPropagation(); // prevent closing immediately before set?
                    if (onValueChange) onValueChange(value);
                }}
                className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    selectedValue === value && "bg-accent",
                    className
                )}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {selectedValue === value && <span className="h-2 w-2 rounded-full bg-current" />}
                </span>
                <span className="truncate">{children}</span>
            </div>
        );
    }
);
SelectItem.displayName = "SelectItem"
