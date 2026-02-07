'use client'

import * as React from "react";

// Simplified Tabs implementation
const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null)

function Tabs({ defaultValue, value, onValueChange, children, className }: any) {
    const [stateValue, setStateValue] = React.useState(defaultValue)
    
    // Controlled or uncontrolled
    const currentValue = value !== undefined ? value : stateValue
    const changeHandler = onValueChange || setStateValue

    return (
        <TabsContext.Provider value={{ value: currentValue, onValueChange: changeHandler }}>
            <div className={className}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

function TabsList({ className, children }: any) {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500 ${className || ''}`}>
            {children}
        </div>
    )
}

function TabsTrigger({ value, children, className }: any) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsTrigger must be used within Tabs")
    
    const isActive = context.value === value
    
    return (
        <button
            type="button"
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
            ${isActive ? 'bg-white text-slate-950 shadow-sm' : 'hover:bg-slate-200/50 hover:text-slate-900'} 
            ${className || ''}`}
            onClick={() => context.onValueChange(value)}
        >
            {children}
        </button>
    )
}

function TabsContent({ value, children, className }: any) {
    const context = React.useContext(TabsContext)
    if (!context) throw new Error("TabsContent must be used within Tabs")

    if (context.value !== value) return null

    return (
        <div className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 animated fadeIn ${className || ''}`}>
            {children}
        </div>
    )
}

export { Tabs, TabsContent, TabsList, TabsTrigger };

