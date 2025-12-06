interface CompanyAvatarProps {
  companyName: string
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function CompanyAvatar({ 
  companyName, 
  logoUrl, 
  size = 'md',
  className = '' 
}: CompanyAvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl'
  }

  // Get initials from company name
  const getInitials = (name: string) => {
    if (!name) return '?'
    
    const words = name.trim().split(' ')
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Generate a consistent color based on company name
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-700',
      'bg-gradient-to-br from-teal-500 to-teal-700',
      'bg-gradient-to-br from-purple-500 to-purple-700',
      'bg-gradient-to-br from-pink-500 to-pink-700',
      'bg-gradient-to-br from-indigo-500 to-indigo-700',
      'bg-gradient-to-br from-green-500 to-green-700',
      'bg-gradient-to-br from-orange-500 to-orange-700',
      'bg-gradient-to-br from-red-500 to-red-700',
    ]
    
    // Simple hash function to get consistent color for same name
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  if (logoUrl) {
    return (
      <img 
        src={logoUrl} 
        alt={companyName} 
        className={`${sizeClasses[size]} rounded-lg object-cover flex-shrink-0 ${className}`}
      />
    )
  }

  return (
    <div 
      className={`${sizeClasses[size]} rounded-lg ${getAvatarColor(companyName)} flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className="font-bold text-white">
        {getInitials(companyName)}
      </span>
    </div>
  )
}
