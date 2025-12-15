import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

// GET - Get job recommendations based on candidate profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get candidate profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        skills: true,
        experience: true,
        location: true,
        applications: {
          select: { jobId: true }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get already applied job IDs
    const appliedJobIds = user.applications.map(a => a.jobId)

    // Parse user skills
    let userSkills: string[] = []
    try {
      userSkills = user.skills ? JSON.parse(user.skills) : []
    } catch {
      userSkills = user.skills?.split(',').map(s => s.trim()) || []
    }

    // Get open jobs not already applied
    const jobs = await prisma.job.findMany({
      where: {
        status: 'OPEN',
        id: { notIn: appliedJobIds }
      },
      include: {
        company: true
      },
      take: 50
    })

    // Score each job based on matching
    const scoredJobs = jobs.map(job => {
      let score = 0

      // Parse job requirements
      let requirements: string[] = []
      try {
        requirements = job.requirements ? JSON.parse(job.requirements) : []
      } catch {
        requirements = job.requirements?.split(',').map(s => s.trim()) || []
      }

      // Skill matching (most important)
      userSkills.forEach(skill => {
        const skillLower = skill.toLowerCase()
        
        // Check requirements
        requirements.forEach(req => {
          if (req.toLowerCase().includes(skillLower)) {
            score += 10
          }
        })
        
        // Check title
        if (job.title.toLowerCase().includes(skillLower)) {
          score += 15
        }
        
        // Check description
        if (job.description.toLowerCase().includes(skillLower)) {
          score += 5
        }
      })

      // Location matching
      if (user.location && job.location) {
        if (job.location.toLowerCase().includes(user.location.toLowerCase())) {
          score += 8
        }
      }

      // Remote jobs bonus (always attractive)
      if (job.locationType === 'remote') {
        score += 5
      }

      // Recent jobs bonus
      const daysSincePosted = Math.floor(
        (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSincePosted <= 7) {
        score += 3
      }

      return { ...job, score }
    })

    // Sort by score and return top recommendations
    const recommendations = scoredJobs
      .filter(j => j.score > 0) // Only return jobs with some match
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Top 10 recommendations

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
