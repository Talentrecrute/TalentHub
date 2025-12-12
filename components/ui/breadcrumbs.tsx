import { Link } from '@/i18n/routing'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-sm text-slate-500 ${className}`}>
      <Link href="/" className="hover:text-teal-600 transition-colors">
        Home
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
          {item.href ? (
            <Link 
              href={item.href} 
              className="hover:text-teal-600 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-900 truncate max-w-[200px] md:max-w-none">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}
