'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { Calendar, Mail, MapPin, Phone, Globe, ArrowRight, Sparkles } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Locale } from '@/app/i18n/config'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const params = useParams()
  const locale = (params.locale as Locale) || 'am'
  
  const t = useTranslations('footer')
  const tCommon = useTranslations('common')

  const getLocalizedPath = (path: string) => `/${locale}${path}`

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300 overflow-hidden">
      {/* Dense Background Patterns */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(255, 255, 255) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(255, 255, 255) 1px, transparent 1px)
          `,
          backgroundSize: '2rem 2rem'
        }}
      />
      
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(255, 255, 255) 1px, transparent 1px)',
          backgroundSize: '1.5rem 1.5rem'
        }}
      />

      {/* Gradient overlays with Ethiopian flag colors */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500/40 via-yellow-500/40 to-red-500/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative">
        {/* Newsletter Section - Compact */}
        <div className="mb-8 pb-6 border-b border-gray-700/50">
          <div className="max-w-xl mx-auto text-center">
            <Badge className="mb-2 bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
              <Sparkles className="w-2.5 h-2.5 mr-1" />
              {t('newsletter.badge')}
            </Badge>
            <h3 className="text-base md:text-lg font-bold text-white mb-1.5">
              {t('newsletter.title')}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {t('newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-3 py-1.5 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors text-xs"
              />
              <Button size="sm" className="px-4 h-8 shadow-lg shadow-primary/25 text-xs">
                {t('newsletter.subscribe')}
                <ArrowRight className="w-3 h-3 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href={getLocalizedPath('/')} className="flex items-center space-x-1.5 mb-3 group">
              <div className="relative">
                <Calendar className="h-5 w-5 text-primary transition-transform group-hover:scale-110" />
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                {tCommon('appName')}
              </span>
            </Link>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed max-w-sm">
              {t('description')}
            </p>
            
            {/* Language & Location Badge */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 text-[10px] h-5">
                <Globe className="w-2.5 h-2.5 mr-1" />
                {locale === 'am' ? 'አማርኛ' : 'English'}
              </Badge>
              <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 text-[10px] h-5">
                <MapPin className="w-2.5 h-2.5 mr-1" />
                {t('location')}
              </Badge>
              <Badge variant="outline" className="bg-gray-800/50 border-gray-600 text-gray-300 text-[10px] h-5">
                🇪🇹 {t('country')}
              </Badge>
            </div>

            {/* Social Links - Compact */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-medium">{t('follow')}</span>
              <div className="flex gap-1.5">
                <a 
                  href="#" 
                  className="w-7 h-7 rounded-lg bg-gray-800/50 border border-gray-600 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all group"
                  aria-label="Twitter"
                >
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-7 h-7 rounded-lg bg-gray-800/50 border border-gray-600 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all group"
                  aria-label="Facebook"
                >
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-7 h-7 rounded-lg bg-gray-800/50 border border-gray-600 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all group"
                  aria-label="Instagram"
                >
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-7 h-7 rounded-lg bg-gray-800/50 border border-gray-600 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all group"
                  aria-label="Telegram"
                >
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.122.099.155.232.171.326.016.093.036.306.02.472z"/>
                  </svg>
                </a>
                <a 
                  href="#" 
                  className="w-7 h-7 rounded-lg bg-gray-800/50 border border-gray-600 flex items-center justify-center hover:bg-primary/10 hover:border-primary/50 transition-all group"
                  aria-label="LinkedIn"
                >
                  <svg className="w-3 h-3 text-gray-300 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Platform - Compact */}
          <div>
            <h3 className="text-white font-semibold mb-2.5 text-xs">{t('platform.title')}</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href={getLocalizedPath('/events')} className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('platform.browseEvents')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/events/create')} className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('platform.createEvent')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/dashboard')} className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('platform.dashboard')}
                </Link>
              </li>
              <li>
                <Link href={getLocalizedPath('/upgrade')} className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('platform.pricing')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('platform.mobileApp')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources - Compact */}
          <div>
            <h3 className="text-white font-semibold mb-2.5 text-xs">{t('resources.title')}</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('resources.helpCenter')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('resources.documentation')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('resources.apiReference')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('resources.community')}
                </Link>
              </li>
              <li>
                <Link href="#" className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 group">
                  <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {t('resources.blog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - Compact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-white font-semibold mb-2.5 text-xs">{t('contact.title')}</h3>
            <ul className="space-y-2">
              <li className="group">
                <a 
                  href="mailto:support@eventhub.et" 
                  className="flex items-start gap-2 text-gray-400 hover:text-primary transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-gray-800/50 border border-gray-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/50 transition-all">
                    <Mail className="w-3 h-3 text-gray-300 group-hover:text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 mb-0.5">{t('contact.email')}</div>
                    <div className="text-xs truncate">support@eventhub.et</div>
                  </div>
                </a>
              </li>
              <li className="group">
                <a 
                  href="tel:+251911234567" 
                  className="flex items-start gap-2 text-gray-400 hover:text-primary transition-colors"
                >
                  <div className="w-6 h-6 rounded-md bg-gray-800/50 border border-gray-600 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 group-hover:border-primary/50 transition-all">
                    <Phone className="w-3 h-3 text-gray-300 group-hover:text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 mb-0.5">{t('contact.phone')}</div>
                    <div className="text-xs">+251 91 123 4567</div>
                  </div>
                </a>
              </li>
              <li className="group">
                <div className="flex items-start gap-2 text-gray-400">
                  <div className="w-6 h-6 rounded-md bg-gray-800/50 border border-gray-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-3 h-3 text-gray-300" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-500 mb-0.5">{t('contact.office')}</div>
                    <div className="text-xs leading-relaxed whitespace-pre-line">
                      {t('contact.address')}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-700/50 mb-4" />

        {/* Bottom Bar - Compact */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs mb-4">
          <div className="flex flex-col md:flex-row items-center gap-2 text-gray-500">
            <p>&copy; {currentYear} {tCommon('appName')}. {t('rights')}</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-[11px]">
            <Link href="#" className="text-gray-500 hover:text-primary transition-colors">
              {t('legal.privacy')}
            </Link>
            <Link href="#" className="text-gray-500 hover:text-primary transition-colors">
              {t('legal.terms')}
            </Link>
            <Link href="#" className="text-gray-500 hover:text-primary transition-colors">
              {t('legal.cookies')}
            </Link>
            <Link href="#" className="text-gray-500 hover:text-primary transition-colors">
              {t('legal.accessibility')}
            </Link>
          </div>
        </div>

        {/* Trust Indicators - Compact */}
        <div className="pt-4 border-t border-gray-700/50">
          <p className="text-center text-[10px] text-gray-600 mb-2">
            {t('securePayments')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-4 opacity-40 grayscale">
            {['Telebirr', 'CBE Birr', 'M-Pesa', 'Stripe'].map((payment, i) => (
              <div 
                key={i}
                className="text-gray-500 font-semibold text-[10px] hover:opacity-100 hover:grayscale-0 transition-all cursor-default"
              >
                {payment}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom gradient accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </footer>
  )
}