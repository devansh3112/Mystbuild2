import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, DollarSign, Upload, Pen, FileText, ArrowDown } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import Navbar from "@/components/Navbar";
import WorkflowStep from "@/components/WorkflowStep";
import FeatureCard from "@/components/FeatureCard";
import RoleCard from "@/components/RoleCard";
import TestimonialCard from "@/components/TestimonialCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const Landing: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // Change active step based on scroll position
      const scrollY = window.scrollY;
      const howItWorksSection = document.getElementById('how-it-works');
      
      if (howItWorksSection) {
        const sectionTop = howItWorksSection.offsetTop;
        const sectionHeight = howItWorksSection.offsetHeight;
        const scrollPosition = scrollY - sectionTop;
        
        if (scrollPosition > 0) {
          if (scrollPosition < sectionHeight / 3) {
            setActiveStep(1);
          } else if (scrollPosition < (sectionHeight * 2) / 3) {
            setActiveStep(2);
          } else if (scrollPosition < sectionHeight) {
            setActiveStep(3);
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Adjust offset for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <header className="pt-28 pb-16 md:pt-36 md:pb-24 bg-gradient-to-br from-white to-gray-50">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <ScrollReveal animation="fade-in" className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-playfair font-bold leading-tight">
                From Manuscript to Masterpiece
              </h1>
              <p className="text-lg text-muted-foreground">
                Your all-in-one platform for seamless editing, real-time tracking, and secure publishing.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button className="bg-brand-red hover:bg-brand-red/90 shadow-md hover:shadow-lg transition-all" size="lg" asChild>
                  <Link to="/signup">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" onClick={() => scrollToSection('how-it-works')}>
                  How It Works <ArrowDown className="ml-2" />
                </Button>
              </div>
            </ScrollReveal>
            
            <ScrollReveal animation="fade-in" delay={0.3} className="hidden md:block">
              <div className="relative">
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src="/images/ChatGPT_Image_May_18__2025__01_26_27_AM-removebg-preview.png" 
                    alt="Manuscript editing platform"
                    className="w-full h-auto"
                    loading="lazy"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 p-4 bg-white rounded-lg shadow-lg border border-border animate-float">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                    <span className="text-sm font-medium">Editing in progress...</span>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </header>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container px-6 mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-playfair font-semibold mb-4">How It Works</h2>
              <p className="text-muted-foreground">Our streamlined three-step process takes your manuscript from draft to publication with ease.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-[25%] right-[25%] h-0.5 bg-gray-200 -z-10"></div>
            
            <WorkflowStep 
              number={1}
              title="Upload & Pay"
              description="Upload your manuscript and make secure payment through our platform."
              icon={<Upload className="h-8 w-8" />}
              isActive={activeStep === 1}
              delay={0.1}
            />
            
            <WorkflowStep 
              number={2}
              title="Assigned Editor Works"
              description="Our professional editors work on your manuscript with real-time tracking."
              icon={<Pen className="h-8 w-8" />}
              isActive={activeStep === 2}
              delay={0.2}
            />
            
            <WorkflowStep 
              number={3}
              title="You Approve, We Print"
              description="Review the final edit, approve, and we handle the publishing process."
              icon={<CheckCircle className="h-8 w-8" />}
              isActive={activeStep === 3}
              delay={0.3}
            />
          </div>

          <ScrollReveal animation="fade-in" delay={0.4} className="mt-12">
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div className="progress-value w-2/3"></div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="container px-6 mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-playfair font-semibold mb-4">Key Features</h2>
              <p className="text-muted-foreground">Everything you need for a seamless manuscript editing and publishing experience.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<FileText />}
              title="Real-time Tracking"
              description="Monitor the editing progress of your manuscript in real-time."
              delay={0.1}
            />
            
            <FeatureCard 
              icon={<DollarSign />}
              title="Secure Payments"
              description="Integrated Paystack and MPesa payment options for your convenience."
              delay={0.2}
            />
            
            <FeatureCard 
              icon={<Pen />}
              title="Editor Collaboration"
              description="Direct communication with professional editors throughout the process."
              delay={0.3}
            />
            
            <FeatureCard 
              icon={<CheckCircle />}
              title="Final Approval"
              description="Review and approve the final manuscript before publication."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="py-20 bg-white">
        <div className="container px-6 mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-playfair font-semibold mb-4">Built for Everyone in the Process</h2>
              <p className="text-muted-foreground">Tailored experiences for all stakeholders in the publishing workflow.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <RoleCard 
              icon={<Upload className="h-6 w-6" />}
              role="Writer"
              actions={[
                "Simple manuscript uploads",
                "Track editing progress",
                "Communicate with editors",
                "Review and approve final edits"
              ]}
              color="writer"
              delay={0.1}
            />
            
            <RoleCard 
              icon={<Pen className="h-6 w-6" />}
              role="Editor"
              actions={[
                "Manage editing assignments",
                "Chapter-by-chapter workflow",
                "Collaborative editing tools",
                "Direct writer communication"
              ]}
              color="editor"
              delay={0.2}
            />
            
            <RoleCard 
              icon={<FileText className="h-6 w-6" />}
              role="Admin"
              actions={[
                "Assign editors to manuscripts",
                "Monitor overall progress",
                "Manage payment processing",
                "Oversee publication pipeline"
              ]}
              color="admin"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container px-6 mx-auto">
          <ScrollReveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-playfair font-semibold mb-4">What Our Users Say</h2>
              <p className="text-muted-foreground">Hear from authors, editors, and publishers who use Mystery Publishers.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="fade-in" delay={0.2}>
            <Carousel className="w-full max-w-5xl mx-auto">
              <CarouselContent>
                <CarouselItem>
                  <TestimonialCard 
                    quote="Mystery Publishers streamlined my entire publishing process. I could track the progress of my manuscript and communicate directly with my editor."
                    author="Sarah Johnson"
                    role="Author"
                    imageUrl="/images/testimonial-1.jpg"
                  />
                </CarouselItem>
                
                <CarouselItem>
                  <TestimonialCard 
                    quote="The platform makes it easy to manage multiple manuscripts simultaneously. The chapter-by-chapter workflow is particularly effective."
                    author="Michael Chen"
                    role="Senior Editor"
                    imageUrl="/images/testimonial-2.jpg"
                  />
                </CarouselItem>
                
                <CarouselItem>
                  <TestimonialCard 
                    quote="As a publishing admin, I can easily assign editors, track progress, and manage the entire publication pipeline all in one place."
                    author="Rebecca Torres"
                    role="Publishing Manager"
                    imageUrl="/images/testimonial-3.jpg"
                  />
                </CarouselItem>
              </CarouselContent>
              <div className="flex justify-center mt-8">
                <CarouselPrevious className="relative static translate-y-0 mr-2" />
                <CarouselNext className="relative static translate-y-0" />
              </div>
            </Carousel>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-red/10 to-brand-black/5">
        <div className="container px-6 mx-auto">
          <ScrollReveal animation="zoom-in">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-playfair font-semibold mb-6">
                Join hundreds of authors simplifying their journey to print.
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Start your publishing journey today with Mystery Publishers platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="bg-brand-red hover:bg-brand-red/90 hover:scale-105 transition-all shadow-md" size="lg" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
                <Button variant="outline" size="lg" className="hover:scale-105 transition-all" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t">
        <div className="container px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-xl font-playfair font-bold text-brand-red mb-4">
                Mystery Publishers
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                The complete platform for manuscript editing and publishing, designed to streamline the journey from manuscript to masterpiece.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground mb-4 md:mb-0">
              © {new Date().getFullYear()} Mystery Publishers. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
