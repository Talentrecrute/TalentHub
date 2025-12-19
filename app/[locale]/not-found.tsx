'use client'

import { ArrowLeft, Briefcase, Building2, Home, RefreshCw, Search } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const navigationLinks = [
  { href: '/', icon: Home, label: 'Accueil', description: 'Retour à la page principale' },
  { href: '/jobs', icon: Search, label: 'Offres d\'emploi', description: 'Parcourir les opportunités' },
  { href: '/dashboard', icon: Briefcase, label: 'Tableau de bord', description: 'Gérer vos candidatures' },
  { href: '/companies', icon: Building2, label: 'Entreprises', description: 'Découvrir les employeurs' },
]

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200/30 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-teal-100/20 to-cyan-100/20 rounded-full blur-3xl animate-pulse-gentle" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(13,148,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(13,148,136,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Animated dots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-teal-400/40 rounded-full animate-float"
            style={{
              top: `${20 + i * 15}%`,
              left: `${10 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        {/* Logo with animation */}
        <div className="mb-8 animate-fade-in-down">
          <Link href="/" className="inline-block">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <Image
                src="/logo.svg"
                alt="Oceanic Job Logo"
                width={180}
                height={54}
                className="relative h-14 w-auto mx-auto transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
          </Link>
        </div>

        {/* 404 Number with animation */}
        <div className="relative mb-6 animate-fade-in">
          <h1 className="text-[150px] md:text-[200px] font-black leading-none bg-gradient-to-br from-teal-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent animate-gradient select-none">
            404
          </h1>
          {/* Glowing effect behind the number */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <div className="w-64 h-64 bg-gradient-to-r from-teal-400/30 to-cyan-400/30 rounded-full blur-3xl animate-pulse-gentle" />
          </div>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-3 animate-fade-in-up">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
            Oups ! Page introuvable
          </h2>
          <p className="text-slate-600 text-lg max-w-md mx-auto">
            La page que vous recherchez semble avoir disparu dans l&apos;océan. 
            Elle a peut-être été déplacée ou n&apos;existe plus.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12 animate-fade-in-up stagger-2">
          <button
            onClick={() => router.back()}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:border-teal-300 hover:shadow-md transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>
          <button
            onClick={() => router.refresh()}
            className="group inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:border-teal-300 hover:shadow-md transition-all duration-300"
          >
            <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Rafraîchir
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:shadow-teal-500/25 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>
        </div>

        {/* Navigation suggestions */}
        <div className="animate-fade-in-up stagger-3">
          <p className="text-sm text-slate-500 mb-6 font-medium uppercase tracking-wider">
            Ou explorez ces pages
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {navigationLinks.map((link, index) => (
              <Link
                key={link.href}
                href={link.href}
                className="group relative p-4 bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-lg hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                    <link.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-slate-800 group-hover:text-teal-600 transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {link.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Animated wave decoration at bottom */}
        <div className="mt-16 animate-fade-in stagger-4">
          <svg
            viewBox="0 0 200 20"
            className="w-48 h-auto mx-auto text-teal-300"
          >
            <path
              fill="currentColor"
              d="M0,10 Q25,0 50,10 T100,10 T150,10 T200,10 L200,20 L0,20 Z"
              className="animate-pulse-gentle"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
