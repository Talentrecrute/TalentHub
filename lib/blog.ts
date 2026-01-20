import { prisma } from '@/lib/prisma'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'

const BLOG_DIR = path.join(process.cwd(), 'content/blog')

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  authorImage?: string
  image?: string
  category: string
  tags: string[]
  readingTime: string
  content: string
  locale: string
  source: 'file' | 'database'
}

export interface BlogPostMeta {
  slug: string
  title: string
  description: string
  date: string
  author: string
  authorImage?: string
  image?: string
  category: string
  tags: string[]
  readingTime: string
  locale: string
  source: 'file' | 'database'
}

function getLocaleDir(locale: string): string {
  return path.join(BLOG_DIR, locale)
}

// Get posts from MDX files
function getFilePosts(locale: string): BlogPostMeta[] {
  const localeDir = getLocaleDir(locale)
  
  if (!fs.existsSync(localeDir)) {
    return []
  }

  const files = fs.readdirSync(localeDir).filter(file => file.endsWith('.mdx'))
  
  return files.map(file => {
    const slug = file.replace('.mdx', '')
    const filePath = path.join(localeDir, file)
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const { data, content } = matter(fileContent)
    const stats = readingTime(content)

    return {
      slug,
      title: data.title || '',
      description: data.description || '',
      date: data.date || new Date().toISOString(),
      author: data.author || 'OceanicJob',
      authorImage: data.authorImage,
      image: data.image,
      category: data.category || 'Général',
      tags: data.tags || [],
      readingTime: stats.text,
      locale,
      source: 'file' as const
    }
  })
}

// Get posts from database
async function getDbPosts(locale: string): Promise<BlogPostMeta[]> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        locale,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: { name: true, image: true }
        }
      },
      orderBy: { publishedAt: 'desc' }
    })

    return posts.map(post => {
      const stats = readingTime(post.content)
      return {
        slug: post.slug,
        title: post.title,
        description: post.description,
        date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        author: post.author.name || 'OceanicJob',
        authorImage: post.author.image || undefined,
        image: post.image || undefined,
        category: post.category,
        tags: post.tags ? JSON.parse(post.tags) : [],
        readingTime: stats.text,
        locale: post.locale,
        source: 'database' as const
      }
    })
  } catch (error) {
    console.error('Error fetching DB posts:', error)
    return []
  }
}

export async function getAllPosts(locale: string = 'fr'): Promise<BlogPostMeta[]> {
  const filePosts = getFilePosts(locale)
  const dbPosts = await getDbPosts(locale)
  
  const allPosts = [...filePosts, ...dbPosts]
  
  // Sort by date (newest first)
  return allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Get single post from file
function getFilePost(slug: string, locale: string): BlogPost | null {
  const filePath = path.join(getLocaleDir(locale), `${slug}.mdx`)
  
  if (!fs.existsSync(filePath)) {
    return null
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)
  const stats = readingTime(content)

  return {
    slug,
    title: data.title || '',
    description: data.description || '',
    date: data.date || new Date().toISOString(),
    author: data.author || 'OceanicJob',
    authorImage: data.authorImage,
    image: data.image,
    category: data.category || 'Général',
    tags: data.tags || [],
    readingTime: stats.text,
    content,
    locale,
    source: 'file'
  }
}

// Get single post from database
async function getDbPost(slug: string, locale: string): Promise<BlogPost | null> {
  try {
    const post = await prisma.blogPost.findFirst({
      where: {
        slug,
        locale,
        status: 'PUBLISHED'
      },
      include: {
        author: {
          select: { name: true, image: true }
        }
      }
    })

    if (!post) return null

    const stats = readingTime(post.content)
    return {
      slug: post.slug,
      title: post.title,
      description: post.description,
      date: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
      author: post.author.name || 'OceanicJob',
      authorImage: post.author.image || undefined,
      image: post.image || undefined,
      category: post.category,
      tags: post.tags ? JSON.parse(post.tags) : [],
      readingTime: stats.text,
      content: post.content,
      locale: post.locale,
      source: 'database'
    }
  } catch (error) {
    console.error('Error fetching DB post:', error)
    return null
  }
}

export async function getPostBySlug(slug: string, locale: string = 'fr'): Promise<BlogPost | null> {
  // Try file first
  const filePost = getFilePost(slug, locale)
  if (filePost) return filePost
  
  // Try database
  return await getDbPost(slug, locale)
}

export async function getAllCategories(locale: string = 'fr'): Promise<string[]> {
  const posts = await getAllPosts(locale)
  const categories = [...new Set(posts.map(post => post.category))]
  return categories
}

export async function getPostsByCategory(category: string, locale: string = 'fr'): Promise<BlogPostMeta[]> {
  const allPosts = await getAllPosts(locale)
  return allPosts.filter(post => post.category === category)
}

export async function getRelatedPosts(currentSlug: string, locale: string = 'fr', limit: number = 3): Promise<BlogPostMeta[]> {
  const currentPost = await getPostBySlug(currentSlug, locale)
  if (!currentPost) return []

  const allPosts = (await getAllPosts(locale)).filter(post => post.slug !== currentSlug)
  
  // Ensure tags are arrays
  const currentTags = Array.isArray(currentPost.tags) ? currentPost.tags : []
  
  // Score posts by shared tags and category
  const scoredPosts = allPosts.map(post => {
    let score = 0
    if (post.category === currentPost.category) score += 5
    
    const postTags = Array.isArray(post.tags) ? post.tags : []
    postTags.forEach(tag => {
      if (currentTags.includes(tag)) score += 2
    })
    return { ...post, score }
  })

  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
