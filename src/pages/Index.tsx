import { HeroSection } from "@/components/landing/HeroSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { FeatureCards } from "@/components/landing/FeatureCards";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <DemoSection />
      <FeatureCards />
      <Footer />
    </div>
  );
};

export default Index;
