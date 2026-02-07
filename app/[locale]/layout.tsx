import AnimatedBackground from "@/components/animations/AnimatedBackground";
import KeyboardShortcuts from "@/components/keyboard/KeyboardShortcuts";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import Navigation from "@/components/layout/Navigation";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import OnboardingTour from "@/components/onboarding/OnboardingTour";
import CookieConsent from "@/components/privacy/CookieConsent";
import AuthProvider from "@/components/providers/AuthProvider";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://oceanic-job.com';

export async function generateMetadata({ params }: { params: Promise<{locale: string}> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'seo' });
  
  const title = locale === 'fr' 
    ? 'OceanicJob - Trouvez Votre Emploi Idéal' 
    : 'OceanicJob - Find Your Dream Job';
  const description = locale === 'fr'
    ? 'Plateforme de recrutement leader. Trouvez des milliers d\'offres d\'emploi, postulez en ligne et connectez-vous avec les meilleurs employeurs.'
    : 'Leading recruitment platform. Find thousands of job opportunities, apply online and connect with top employers.';
  
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | OceanicJob`
    },
    description,
    keywords: locale === 'fr' 
      ? ['emploi', 'recrutement', 'offres emploi', 'carrière', 'job', 'travail', 'CV', 'candidature', 'Madagascar', 'Afrique']
      : ['job', 'recruitment', 'job offers', 'career', 'employment', 'work', 'resume', 'application', 'Madagascar', 'Africa'],
    authors: [{ name: 'OceanicJob Team' }],
    creator: 'OceanicJob',
    publisher: 'OceanicJob',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        'fr': `${siteUrl}/fr`,
        'en': `${siteUrl}/en`,
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      alternateLocale: locale === 'fr' ? 'en_US' : 'fr_FR',
      url: `${siteUrl}/${locale}`,
      siteName: 'OceanicJob',
      title,
      description,
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'OceanicJob - Job Portal',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/twitter-image.png`],
      creator: '@talenthub',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: 'your-google-verification-code',
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d9488' },
    { media: '(prefers-color-scheme: dark)', color: '#0d9488' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  const messages = await getMessages();
  
  // JSON-LD structured data for organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'OceanicJob',
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    description: locale === 'fr' 
      ? 'Plateforme de recrutement leader connectant candidats et employeurs'
      : 'Leading recruitment platform connecting candidates and employers',
    sameAs: [
      'https://twitter.com/talenthub',
      'https://linkedin.com/company/talenthub',
      'https://facebook.com/talenthub'
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'OceanicJob',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/${locale}/jobs?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-96x96.png" type="image/png" sizes="96x96" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="OceanicJob" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <NextIntlClientProvider messages={messages}>
            <NotificationProvider>
              <div className="min-h-screen bg-slate-50 flex flex-col relative pb-16 lg:pb-0">
                {/* Animated background */}
                <AnimatedBackground variant="gradient" />
                <Navigation />
                <main className="flex-1 relative z-10">{children}</main>
                <Footer />
                <MobileBottomNav />
              </div>
              <Toaster position="top-right" />
              <KeyboardShortcuts />
              <PWAInstallPrompt />
              <CookieConsent />
              <OnboardingTour />
            </NotificationProvider>
          </NextIntlClientProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
