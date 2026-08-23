'use client'

import Navbar from '@/components/layout/Navbar'
import HeroSection from '@/components/landing/HeroSection'
import AboutSection from '@/components/landing/AboutSection'
import ServicesSection from '@/components/landing/ServicesSection'
import ProgramsSection from '@/components/landing/ProgramsSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PricingSection from '@/components/landing/PricingSection'
import StatsTestimonialSection from '@/components/landing/StatsTestimonialSection'
import FaqContactSection from '@/components/landing/FaqContactSection'
import Footer from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-white overflow-x-hidden selection:bg-brand-sky/20 selection:text-brand-blue">
      {/* Sticky Header */}
      <Navbar />

      {/* Main Landing Flow */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. About Us Section */}
        <AboutSection />

        {/* 3. Services Section */}
        <ServicesSection />

        {/* 3. Programs & Training */}
        <ProgramsSection />

        {/* 4. How It Works (5 steps) */}
        <HowItWorksSection />

        {/* 5. Pricing & Plans */}
        <PricingSection />

        {/* 6. Dark Stats & Testimonial Banner */}
        <StatsTestimonialSection />

        {/* 7. Side-by-side FAQ & Contact Form */}
        <FaqContactSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
