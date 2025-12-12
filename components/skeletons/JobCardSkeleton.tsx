import { Skeleton } from "@/components/ui/skeleton"

export default function JobCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 h-full relative">
      <div className="flex items-start gap-4 mb-4">
        <Skeleton className="w-[48px] h-[48px] rounded-lg" />
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        
        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="w-4 h-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  )
}
