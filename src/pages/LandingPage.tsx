import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Particles } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';
import type { IParticlesProps } from '@tsparticles/react';
import { 
  Image as ImageIcon, 
  PenTool as ContentIcon, 
  Share2 as SharingIcon, 
  Target as TargetIcon 
} from 'lucide-react';

interface ExtendedParticlesProps extends IParticlesProps {
  init?: (engine: Engine) => Promise<void>;
}

const particlesConfig = {
  particles: {
    number: { value: 80, density: { enable: true, value_area: 800 } },
    color: { value: "#ffffff" },
    shape: { type: "circle" },
    opacity: { value: 0.5, random: false },
    size: { value: 3, random: true },
    line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
    move: { 
      enable: true, 
      speed: 2, 
      direction: "none" as const, 
      random: false, 
      straight: false, 
      out_mode: "out", 
      bounce: false 
    }
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "repulse"
      },
      resize: {
        enable: true
      }
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4
      }
    }
  },
  retina_detect: true
};

const particlesProps: ExtendedParticlesProps = {
  id: "tsparticles",
  init: async (engine: Engine) => await loadSlim(engine),
  options: particlesConfig,
  className: "absolute inset-0 z-0"
};

const LandingPage: React.FC = () => {
  const features = [
    {
      title: "AI-Powered Image Generation",
      description: "Create stunning visuals with GPT-4o-mini powered AI",
      icon: ImageIcon,
      capabilities: [
        "Advanced AI image creation",
        "Platform-specific image sizing",
        "Style and mood customization",
        "OpenAI integration"
      ]
    },
    {
      title: "Advanced Content Creation",
      description: "Craft perfect posts powered by GPT-4o-mini",
      icon: ContentIcon,
      capabilities: [
        "AI-generated short-form content",
        "Contextual long-form articles",
        "Dynamic Twitter/X threads",
        "Personalized content templates",
        "Real-time language optimization"
      ]
    },
    {
      title: "Smart Social Sharing",
      description: "Optimize and distribute content with AI precision",
      icon: SharingIcon,
      capabilities: [
        "Direct multi-platform sharing",
        "Intelligent character count tracking",
        "Platform-specific content optimization",
        "Inline AI-assisted editing",
        "Supabase-powered analytics"
      ]
    },
    {
      title: "Multi-Platform AI Targeting",
      description: "Tailored content strategy for each social network",
      icon: TargetIcon,
      capabilities: [
        "Facebook strategic content",
        "Instagram visual optimization",
        "LinkedIn professional tone generation",
        "X/Twitter engagement maximization",
        "Discord community content crafting",
        "AI-driven audience insights"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Director",
      quote: "Our social media strategy went from good to extraordinary with AI-powered content generation!",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      name: "Mike Rodriguez",
      role: "Content Creator",
      quote: "The AI understands my brand's voice better than any human assistant ever could!",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      name: "Elena Chen",
      role: "Social Media Strategist",
      quote: "Multi-platform optimization has never been this seamless and intelligent.",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Particle Background */}
      <Particles {...particlesProps} />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-16 text-center">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-5xl font-bold mb-6 text-white"
        >
          AI-Powered Social Media Transformation
        </motion.h1>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl"
        >
          <TypeAnimation
            sequence={[
              "Create Engaging Posts",
              1000,
              "Boost Your Social Media Presence",
              1000,
              "Effortless Content Creation",
              1000
            ]}
            wrapper="p"
            cursor={true}
            repeat={0}
            className="text-xl text-white mb-4"
          />
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10"
          >
            <Link 
              to="/generate" 
              className="
                bg-white/10 backdrop-blur-lg
                text-white
                px-10 py-4 rounded-full text-lg 
                hover:bg-white/20
                transition-all duration-300
                inline-block shadow-lg hover:shadow-xl
                transform hover:-translate-y-1
                border border-white/20
                font-semibold
                focus:outline-none focus:ring-2 focus:ring-white/30
              "
            >
              Start Your Content Journey
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-16 text-white">
        <h2 className="text-3xl font-bold text-center mb-12">Unleash Your Content Potential</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl border border-white/20"
            >
              <div className="flex items-center mb-4">
                <feature.icon className="w-8 h-8 mr-3 text-white/80" strokeWidth={1.5} />
                <h3 className="text-xl font-semibold">{feature.title}</h3>
              </div>
              <p className="mb-4 text-white/70">{feature.description}</p>
              <div className="flex flex-wrap gap-2">
                {feature.capabilities.map((capability, idx) => (
                  <span 
                    key={idx} 
                    className="
                      bg-white/10 px-3 py-1 rounded-full 
                      text-sm text-white/80"
                  >
                    {capability}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 container mx-auto px-6 py-16 text-white text-center">
        <h2 className="text-3xl font-bold mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl"
            >
              <p className="italic mb-4">"{testimonial.quote}"</p>
              <div className="flex items-center justify-center">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-white/70">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 container mx-auto px-6 py-16 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 backdrop-blur-lg rounded-xl p-12"
        >
          <h2 className="text-4xl font-bold mb-6 text-white">Ready to Revolutionize Your Content?</h2>
          <p className="text-xl mb-8 text-white/70">Join thousands of creators who are transforming their social media strategy</p>
          <Link 
            to="/pricing" 
            className="
              bg-white/10 backdrop-blur-lg
              text-white
              px-12 py-4 rounded-full text-lg 
              hover:bg-white/20
              transition-all duration-300
              inline-block shadow-lg hover:shadow-xl
              transform hover:-translate-y-1
              border border-white/20
              font-semibold
              focus:outline-none focus:ring-2 focus:ring-white/30
            "
          >
            Start Your Free Trial
          </Link>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default LandingPage;
