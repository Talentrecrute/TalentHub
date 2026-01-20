interface JobPostingSchemaProps {
  job: {
    id: string
    title: string
    description: string
    location: string
    employmentType: string
    locationType: string
    salaryMin?: number | null
    salaryMax?: number | null
    salaryCurrency?: string
    salaryPeriod?: string
    createdAt: Date | string
    expiresAt?: Date | string | null
    company: {
      name: string
      logo?: string | null
      website?: string | null
      location?: string | null
    }
  }
  locale?: string
}

export default function JobPostingSchema({ job, locale = 'fr' }: JobPostingSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oceanic-job.com'
  
  // Map employment types to Google's expected values
  const employmentTypeMap: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'FULL_TIME': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'PART_TIME': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'CONTRACT': 'CONTRACTOR',
    'internship': 'INTERN',
    'INTERNSHIP': 'INTERN',
    'freelance': 'CONTRACTOR',
    'FREELANCE': 'CONTRACTOR',
  }

  // Map location types
  const locationTypeMap: Record<string, string> = {
    'remote': 'TELECOMMUTE',
    'hybrid': 'TELECOMMUTE',
    'onsite': undefined as any,
  }

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: job.company.name,
      value: job.id,
    },
    datePosted: new Date(job.createdAt).toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company.name,
      sameAs: job.company.website || siteUrl,
      logo: job.company.logo || `${siteUrl}/logo.png`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || 'Madagascar',
        addressCountry: 'MG',
      },
    },
    employmentType: employmentTypeMap[job.employmentType] || 'FULL_TIME',
    url: `${siteUrl}/${locale}/jobs/${job.id}`,
  }

  // Add remote work info if applicable
  if (job.locationType === 'remote' || job.locationType === 'hybrid') {
    schema.jobLocationType = 'TELECOMMUTE'
    schema.applicantLocationRequirements = {
      '@type': 'Country',
      name: 'Madagascar',
    }
  }

  // Add salary info if available
  if (job.salaryMin || job.salaryMax) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.salaryCurrency || 'MGA',
      value: {
        '@type': 'QuantitativeValue',
        ...(job.salaryMin && job.salaryMax 
          ? { minValue: job.salaryMin, maxValue: job.salaryMax }
          : { value: job.salaryMin || job.salaryMax }
        ),
        unitText: job.salaryPeriod === 'monthly' ? 'MONTH' : 'YEAR',
      },
    }
  }

  // Add expiry date if available
  if (job.expiresAt) {
    schema.validThrough = new Date(job.expiresAt).toISOString()
  } else {
    // Default to 60 days from posting
    const defaultExpiry = new Date(job.createdAt)
    defaultExpiry.setDate(defaultExpiry.getDate() + 60)
    schema.validThrough = defaultExpiry.toISOString()
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
