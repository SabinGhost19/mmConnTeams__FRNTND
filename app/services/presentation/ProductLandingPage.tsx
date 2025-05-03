"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Video,
  Calendar,
  Briefcase,
  Users,
  FileText,
  Check,
  Zap,
  Globe,
  PieChart,
  Shield,
  Lock,
  CloudLightning,
  Server,
  Workflow,
  Smile,
  Coffee,
  Heart,
  LucideIcon,
} from "lucide-react";
import HeroCarousel from "./components/HeroCarousel";
import TeamCollaboration from "./components/TeamCollaboration";
import Footer from "../chatAsistant/components/Footer";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  color,
}) => (
  <div
    className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    style={{ borderColor: color }}
  >
    <div className="flex items-center mb-3 sm:mb-4">
      <div
        className="p-2 sm:p-3 rounded-full mr-3 sm:mr-4"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold" style={{ color: color }}>
        {title}
      </h3>
    </div>
    <p className="text-sm sm:text-base text-gray-600">{description}</p>
  </div>
);

interface IntegrationCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  icon: Icon,
  title,
  description,
}) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
    <div className="bg-blue-50 p-3 sm:p-4 rounded-full">
      <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
    </div>
    <div className="text-center sm:text-left">
      <h4 className="text-lg sm:text-xl font-semibold text-blue-800 mb-2">
        {title}
      </h4>
      <p className="text-sm sm:text-base text-gray-600">{description}</p>
    </div>
  </div>
);

const ProductLandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      icon: MessageCircle,
      title: "Advanced Messaging",
      description:
        "Seamless communication with instant messaging, group chats, and smart notifications.",
      color: "#0A21C0",
    },
    {
      icon: Video,
      title: "Video Conferencing",
      description:
        "High-quality video meetings with screen sharing, recording, and interactive collaboration tools.",
      color: "#4CAF50",
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description:
        "Intelligent calendar management with easy meeting scheduling and team availability tracking.",
      color: "#FF9800",
    },
    {
      icon: Briefcase,
      title: "Project Management",
      description:
        "Comprehensive project tracking, task assignment, and progress monitoring in one platform.",
      color: "#2196F3",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Enhance team productivity with real-time collaboration, shared workspaces, and team insights.",
      color: "#9C27B0",
    },
    {
      icon: FileText,
      title: "Document Sharing",
      description:
        "Secure document storage, sharing, and collaborative editing with version control.",
      color: "#795548",
    },
  ];

  const integrations = [
    {
      icon: Server,
      title: "Seamless Integrations",
      description:
        "Connect with your favorite tools and platforms effortlessly.",
    },
    {
      icon: Workflow,
      title: "Automated Workflows",
      description: "Streamline your processes with intelligent automation.",
    },
    {
      icon: CloudLightning,
      title: "Cloud Sync",
      description: "Real-time synchronization across all your devices.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      position: "Team Lead at TechInnovate",
      quote:
        "TeamSync transformed how our team collaborates. We've seen a 40% increase in project completion speed since we started using it.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Michael Chen",
      position: "Product Manager",
      quote:
        "The intuitive interface and powerful features make TeamSync the perfect solution for our distributed team across three time zones.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Priya Sharma",
      position: "Creative Director",
      quote:
        "I love how TeamSync brings our design team together. The real-time document collaboration is a game-changer for our creative process.",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center pl-12 sm:pl-0">
              <a
                href="/"
                className="text-xl sm:text-2xl font-bold text-blue-800 flex items-center"
              >
                <span className="mr-2">🚀</span> TeamSync
              </a>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
              <a
                href="#features"
                className="text-sm sm:text-base text-gray-700 hover:text-blue-600 transition-colors"
              >
                Features
              </a>
              <a
                href="#team-collaboration"
                className="text-sm sm:text-base text-gray-700 hover:text-blue-600 transition-colors"
              >
                Collaboration
              </a>
              <a
                href="#testimonials"
                className="text-sm sm:text-base text-gray-700 hover:text-blue-600 transition-colors"
              >
                Testimonials
              </a>
              <a
                href="/learnmore"
                className="px-4 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all flex items-center font-semibold text-sm sm:text-base"
              >
                <span className="mr-2">Learn More</span>{" "}
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all text-sm sm:text-base"
              >
                Log Out
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <div className="pt-16 sm:pt-20">
        <HeroCarousel />
      </div>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            TeamSync provides a comprehensive suite of tools to enhance team
            productivity and communication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>
      </section>

      {/* Team Collaboration Section */}
      <section id="team-collaboration" className="bg-gray-50 py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Enhanced Team Collaboration
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Work together seamlessly with our advanced collaboration tools.
            </p>
          </div>
          <TeamCollaboration />
        </div>
      </section>

      {/* Integrations Section */}
      <section className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            Seamless Integrations
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with your favorite tools and services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {integrations.map((integration, index) => (
            <IntegrationCard
              key={index}
              icon={integration.icon}
              title={integration.title}
              description={integration.description}
            />
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-50 py-8 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              What Our Users Say
            </h2>
            <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from teams who have transformed their collaboration with
              TeamSync.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover"
                  />
                  <div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductLandingPage;
