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
    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
    style={{ borderColor: color }}
  >
    <div className="flex items-center mb-4">
      <div
        className="p-3 rounded-full mr-4"
        style={{
          backgroundColor: `${color}15`,
          color: color,
        }}
      >
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold" style={{ color: color }}>
        {title}
      </h3>
    </div>
    <p className="text-gray-600">{description}</p>
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
  <div className="bg-white rounded-xl p-6 shadow-lg flex items-center space-x-6">
    <div className="bg-blue-50 p-4 rounded-full">
      <Icon className="w-10 h-10 text-blue-600" />
    </div>
    <div>
      <h4 className="text-xl font-semibold text-blue-800 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
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
    <div className="ml-20 min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-20 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <a
              href="/"
              className="text-2xl font-bold text-blue-800 flex items-center"
            >
              <span className="mr-2">🚀</span> TeamSync
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="#features"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Features
            </a>
            <a
              href="#team-collaboration"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Collaboration
            </a>
            <a
              href="#testimonials"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Testimonials
            </a>
            <a
              href="/learnmore"
              className="px-8 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-all flex items-center font-semibold"
            >
              <span className="mr-2">Learn More</span>{" "}
              <Globe className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="px-6 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 transition-all"
            >
              Log Out
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <div className="pt-20">
        <HeroCarousel />
      </div>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Powerful Features for Modern Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            TeamSync provides a comprehensive suite of tools to enhance team
            productivity and communication.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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

      {/* Integrations Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Powerful Integrations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Connect, automate, and streamline your workflow with TeamSync.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {integrations.map((integration, index) => (
              <IntegrationCard
                key={index}
                icon={integration.icon}
                title={integration.title}
                description={integration.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team Collaboration Section (Replaces Pricing Section) */}
      <TeamCollaboration />

      {/* Security and Compliance */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-8 lg:mb-0">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Enterprise-Grade Security
            </h2>
            <div className="space-y-6">
              <div className="flex items-center">
                <Shield className="w-10 h-10 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Advanced Protection
                  </h3>
                  <p className="text-gray-600">
                    Military-grade encryption and multi-factor authentication to
                    keep your team's conversations private.
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Lock className="w-10 h-10 text-green-600 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">
                    Data Control
                  </h3>
                  <p className="text-gray-600">
                    Control who can access what with granular permissions and
                    data governance policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <PieChart className="w-64 h-64 mx-auto text-blue-500" />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Loved by Teams Everywhere
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what teams are saying about their experience with TeamSync.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600">{testimonial.position}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <Coffee className="w-8 h-8" />
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <Users className="w-8 h-8" />
              </div>
              <div className="bg-white bg-opacity-20 p-4 rounded-full">
                <Heart className="w-8 h-8" />
              </div>
            </div>
          </div>
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Team?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of teams who've already discovered a better way to
            work together. Start your free trial today.
          </p>
          <div>
            <a
              href="/login"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-100 transition-colors font-semibold"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProductLandingPage;
