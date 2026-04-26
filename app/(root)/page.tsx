'use client';
import ClosingCTA from '@/components/rootComponents/ClosingCTA'
import FeatureBento from '@/components/rootComponents/FeatureBento'
import InteractiveCalculator from '@/components/rootComponents/InteractiveCalculator'
import TrustBanner from '@/components/rootComponents/TrustBanner'
import Hero from '@/components/rootComponents/Hero';
import SalarySection from '@/components/rootComponents/SalarySection';
import SecuritySection from '@/components/rootComponents/SecuritySection';
import InvestingSection from '@/components/rootComponents/InvestingSection '; 

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <SalarySection />
      <TrustBanner />
      <FeatureBento />
      <InteractiveCalculator />
      <SecuritySection />
      <InvestingSection />
      <ClosingCTA />  
    </main>
  );
}