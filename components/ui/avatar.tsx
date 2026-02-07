import { User } from "lucide-react"
import * as React from "react"

// Simplified Avatar component that doesn't rely on Radix UI for now
// to avoid "module not found" errors if dependencies aren't installed.

const Avatar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ''}`} {...props} />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(({ className, src, ...props }, ref) => {
    if (!src) return null
    return (
        <img ref={ref} src={src} className={`aspect-square h-full w-full object-cover ${className || ''}`} {...props} />
    )
})
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
  <div ref={ref} className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-slate-500 font-medium ${className || ''}`} {...props}>
    {children || <User className="h-4 w-4" />}
  </div>
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarFallback, AvatarImage }

