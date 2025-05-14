"use client";

import React, { useState } from "react";
import {
  MessageCircle,
  Video,
  Calendar,
  Users,
  FileText,
  Server,
  Shield,
  Lock,
  Search,
  Zap,
  PanelRight,
  Layers,
  Smartphone,
  ChevronDown,
  Check,
  Headphones,
  Globe,
  ArrowRight,
  Monitor,
  Clock,
  Share2,
  Briefcase,
} from "lucide-react";
import Footer from "../services/chatAsistant/components/Footer";

type FeatureItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

type TabKey = "communication" | "collaboration" | "security" | "integrations";

type CaseStudy = {
  industry: string;
  company: string;
  challenge: string;
  solution: string;
  results: string;
};

type FAQ = {
  question: string;
  answer: string;
};

const LearnMorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("communication");
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);
  const [hoveredFeatureIndex, setHoveredFeatureIndex] = useState<number | null>(
    null
  );
  const [hoveredCaseStudyIndex, setHoveredCaseStudyIndex] = useState<
    number | null
  >(null);

  const toggleFaq = (index: number): void => {
    if (expandedFaqs.includes(index)) {
      setExpandedFaqs(expandedFaqs.filter((i) => i !== index));
    } else {
      setExpandedFaqs([...expandedFaqs, index]);
    }
  };

  const features: Record<TabKey, FeatureItem[]> = {
    communication: [
      {
        icon: (
          <MessageCircle className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Chat & Messaging",
        description:
          "Instant team communication with advanced formatting, mentions, GIFs, and emojis. Structured conversations across channels and groups.",
      },
      {
        icon: (
          <Video className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        ),
        title: "HD Video Meetings",
        description:
          "High-quality video conferences with up to 1000 participants, recording, meeting notes, and automatic transcriptions.",
      },
      {
        icon: (
          <Share2 className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Screen Sharing",
        description:
          "Interactive presentations with remote control, real-time annotations, and collaboration on shared documents.",
      },
      {
        icon: (
          <Headphones className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Audio Calls",
        description:
          "Crystal-clear audio calls with noise suppression, conference mode, and integration with existing phone systems.",
      },
    ],
    collaboration: [
      {
        icon: (
          <FileText className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Collaborative Documents",
        description:
          "Real-time document editing with version history, comments, and permission-based access control.",
      },
      {
        icon: (
          <Calendar className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Smart Scheduling",
        description:
          "Integrated calendar with automatic availability detection, notifications, and synchronization with other calendar apps.",
      },
      {
        icon: (
          <Briefcase className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Project Management",
        description:
          "Track tasks, deadlines, assignments, and status for complex projects, with automatic progress reports.",
      },
      {
        icon: (
          <Layers className="w-12 h-12 text-green-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Wiki & Knowledge Base",
        description:
          "Structured organization of company information with fast search and secure access.",
      },
    ],
    security: [
      {
        icon: (
          <Lock className="w-12 h-12 text-purple-600 group-hover:scale-110 transition-transform" />
        ),
        title: "End-to-End Encryption",
        description:
          "Advanced data protection through encryption in transit and at rest, ensuring total confidentiality of communications.",
      },
      {
        icon: (
          <Shield className="w-12 h-12 text-purple-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Compliance & Regulations",
        description:
          "Platform compliant with GDPR, HIPAA, ISO 27001, and other international security and data protection standards.",
      },
      {
        icon: (
          <PanelRight className="w-12 h-12 text-purple-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Administrative Control",
        description:
          "Centralized management of users, permissions, and security policies at the organization level.",
      },
      {
        icon: (
          <Monitor className="w-12 h-12 text-purple-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Audit & Monitoring",
        description:
          "Detailed activity logs, security alerts, and tools for detecting abnormal behavior.",
      },
    ],
    integrations: [
      {
        icon: (
          <Server className="w-12 h-12 text-amber-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Native Integrations",
        description:
          "Seamless connection with Microsoft solutions, Google Workspace, Adobe, and other essential business applications.",
      },
      {
        icon: (
          <Zap className="w-12 h-12 text-amber-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Automation & Workflows",
        description:
          "Create automated workflows for repetitive tasks, approvals, and customized notifications.",
      },
      {
        icon: (
          <Globe className="w-12 h-12 text-amber-600 group-hover:scale-110 transition-transform" />
        ),
        title: "API & Extensibility",
        description:
          "Open platform for developers with robust APIs and framework for custom extensions.",
      },
      {
        icon: (
          <Smartphone className="w-12 h-12 text-amber-600 group-hover:scale-110 transition-transform" />
        ),
        title: "Mobile Experience",
        description:
          "Native apps for iOS and Android with full functionality and real-time notifications.",
      },
    ],
  };

  const faqs: FAQ[] = [
    {
      question:
        "What makes TeamSync different from other collaboration platforms?",
      answer:
        "TeamSync distinguishes itself through the seamless integration of communication, collaboration, and project management in a unified platform. We provide an uninterrupted experience without the need to switch between different applications. Additionally, our platform is built with an emphasis on enterprise-level security and scalability for teams of any size.",
    },
    {
      question: "How many users can be added to TeamSync?",
      answer:
        "TeamSync is designed to scale seamlessly from small teams to organizations with tens of thousands of users. There are no practical limits to the number of users, and performance remains optimal regardless of implementation size. Our pricing plans are structured to accommodate organizations of all sizes.",
    },
    {
      question: "What security measures does TeamSync implement?",
      answer:
        "We implement a comprehensive security model that includes: end-to-end encryption for all communications, multi-factor authentication, granular access controls, compliance with international standards (GDPR, HIPAA, ISO 27001), regular security audits, and infrastructure hosted in ISO 27001 certified data centers with 99.9% availability.",
    },
    {
      question: "How can I integrate TeamSync with existing systems?",
      answer:
        "TeamSync offers numerous integration options: predefined connectors for popular business applications (Microsoft 365, Google Workspace, Salesforce, etc.), fully documented RESTful APIs for custom integrations, webhooks for automation, and a marketplace of partner-developed integrations. Our implementation team can assist with complex and customized integrations.",
    },
    {
      question: "What are the technical requirements for using TeamSync?",
      answer:
        "TeamSync works in a browser on any modern device. For desktop, we recommend Chrome, Firefox, Edge, or Safari updated to recent versions. We provide native applications for Windows, macOS, iOS, and Android. The minimum requirements are modest: 1Mbps internet connection for audio calls and 3Mbps for HD video. For meetings with many participants, a faster connection is recommended.",
    },
  ];

  const caseStudies: CaseStudy[] = [
    {
      industry: "Tech",
      company: "InnovateTech",
      challenge:
        "Coordinating globally distributed teams and improving communication.",
      solution:
        "TeamSync implementation with dedicated channels and integration with existing systems.",
      results:
        "40% reduction in meeting time and 35% increase in team productivity.",
    },
    {
      industry: "Healthcare",
      company: "MediCare Systems",
      challenge:
        "Secure communication between departments while complying with HIPAA.",
      solution:
        "TeamSync with strict security policies and end-to-end encryption.",
      results:
        "100% compliance with regulations and 60% reduction in response time for critical situations.",
    },
    {
      industry: "Financial",
      company: "AlphaFinance",
      challenge:
        "Efficient collaboration between departments with full audit of actions.",
      solution:
        "TeamSync with document management modules and integration with internal systems.",
      results:
        "50% improvement in document processing time and 75% reduction in errors.",
    },
  ];

  // Updated and expanded testimonials
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
      position: "Product Manager at GlobalTech",
      quote:
        "The intuitive interface and powerful features make TeamSync the perfect solution for our distributed team across three time zones.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      name: "Priya Sharma",
      position: "Creative Director at DesignWorks",
      quote:
        "I love how TeamSync brings our design team together. The real-time document collaboration is a game-changer for our creative process.",
      avatar: "https://randomuser.me/api/portraits/women/63.jpg",
    },
    {
      name: "David Wilson",
      position: "CTO at FutureTech Solutions",
      quote:
        "Security was our main concern when looking for a collaboration platform. TeamSync exceeded our expectations with their enterprise-grade security features.",
      avatar: "https://randomuser.me/api/portraits/men/86.jpg",
    },
    {
      name: "Emma Rodriguez",
      position: "HR Director at GlobalHR",
      quote:
        "TeamSync has revolutionized our onboarding process. New team members can get up to speed quickly with access to all our knowledge bases and communication channels.",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
    },
    {
      name: "James Park",
      position: "Engineering Lead at BuildCorp",
      quote:
        "The ability to seamlessly switch between chat, video, and document editing has made our engineering standups and code reviews much more efficient.",
      avatar: "https://randomuser.me/api/portraits/men/54.jpg",
    },
    {
      name: "Alexandra Kim",
      position: "Marketing Director at BrandForward",
      quote:
        "We coordinate global marketing campaigns through TeamSync. The project management features coupled with real-time collaboration have been invaluable.",
      avatar: "https://randomuser.me/api/portraits/women/90.jpg",
    },
    {
      name: "Robert Johnson",
      position: "Operations Manager at LogisticsPro",
      quote:
        "The mobile experience is fantastic. I can stay connected with my team whether I'm in the warehouse or on the road visiting clients.",
      avatar: "https://randomuser.me/api/portraits/men/43.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white">
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center">
              <a
                href="/"
                className="text-2xl font-bold text-blue-800 flex items-center hover:text-blue-600 transition-colors"
              >
                <span className="mr-2">🚀</span> TeamSync
              </a>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8">
              <a
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors relative group text-sm sm:text-base"
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-blue-600 transition-colors relative group text-sm sm:text-base"
              >
                Features
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#case-studies"
                className="text-gray-700 hover:text-blue-600 transition-colors relative group text-sm sm:text-base"
              >
                Case Studies
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#testimonials"
                className="text-gray-700 hover:text-blue-600 transition-colors relative group text-sm sm:text-base"
              >
                Testimonials
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
              <a
                href="#faq"
                className="text-gray-700 hover:text-blue-600 transition-colors relative group text-sm sm:text-base"
              >
                FAQ
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
              </a>
              <a
                href="/login"
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-sm sm:text-base"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-40 sm:pt-32 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Transform how <br />
                <span className="text-blue-600 hover:text-blue-700 transition-colors">
                  your team collaborates
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto md:mx-0">
                TeamSync combines messaging, video meetings, file sharing, and
                project management in a unified and secure platform designed
                specifically for modern teams who need seamless collaboration.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="/login"
                  className="px-6 sm:px-8 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all transform hover:-translate-y-1 text-center"
                >
                  Get Started Free
                </a>
                <a
                  href="#features"
                  className="px-6 sm:px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 transition-all transform hover:-translate-y-1 text-center"
                >
                  Explore Features
                </a>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center mt-8 md:mt-0">
              <div className="relative group w-full max-w-md">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-white p-4 sm:p-6 rounded-xl shadow-xl transition-all group-hover:shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                    alt="TeamSync Dashboard"
                    className="w-full h-auto rounded-lg shadow-lg group-hover:scale-[1.02] transition-transform"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <section id="features" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Advanced Features for Modern Teams
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              TeamSync provides all the tools needed to transform how your team
              works, communicates, and collaborates.
            </p>
          </div>

          <div className="mb-12">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-8 mb-8 sm:mb-12">
              <button
                onClick={() => setActiveTab("communication")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all transform hover:-translate-y-1 text-sm sm:text-base ${
                  activeTab === "communication"
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md"
                }`}
              >
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Communication
                </div>
              </button>
              <button
                onClick={() => setActiveTab("collaboration")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all transform hover:-translate-y-1 text-sm sm:text-base ${
                  activeTab === "collaboration"
                    ? "bg-green-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-green-50 hover:text-green-600 shadow-md"
                }`}
              >
                <div className="flex items-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Collaboration
                </div>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all transform hover:-translate-y-1 text-sm sm:text-base ${
                  activeTab === "security"
                    ? "bg-purple-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 shadow-md"
                }`}
              >
                <div className="flex items-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Security
                </div>
              </button>
              <button
                onClick={() => setActiveTab("integrations")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all transform hover:-translate-y-1 text-sm sm:text-base ${
                  activeTab === "integrations"
                    ? "bg-amber-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-amber-50 hover:text-amber-600 shadow-md"
                }`}
              >
                <div className="flex items-center">
                  <Server className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Integrations
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {features[activeTab].map((feature, index) => (
                <div
                  key={index}
                  className={`group bg-white rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                    hoveredFeatureIndex === index
                      ? activeTab === "communication"
                        ? "border-2 border-blue-300"
                        : activeTab === "collaboration"
                        ? "border-2 border-green-300"
                        : activeTab === "security"
                        ? "border-2 border-purple-300"
                        : "border-2 border-amber-300"
                      : "border-2 border-transparent"
                  }`}
                  onMouseEnter={() => setHoveredFeatureIndex(index)}
                  onMouseLeave={() => setHoveredFeatureIndex(null)}
                >
                  <div className="mb-4 sm:mb-6">{feature.icon}</div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How TeamSync Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              An in-depth look at how TeamSync connects teams and optimizes
              workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-16">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-blue-50 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-blue-600 text-white font-bold text-lg sm:text-xl rounded-full absolute -top-4 sm:-top-5 -left-4 sm:-left-5 group-hover:bg-blue-700 group-hover:scale-110 transition-all">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 pt-2 group-hover:text-blue-600 transition-colors">
                Unified Communication
              </h3>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                Messages, video and audio calls, all in one intuitive platform.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-blue-50 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-blue-600 text-white font-bold text-lg sm:text-xl rounded-full absolute -top-4 sm:-top-5 -left-4 sm:-left-5 group-hover:bg-blue-700 group-hover:scale-110 transition-all">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 pt-2 group-hover:text-blue-600 transition-colors">
                Team Organization
              </h3>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                Structure by teams and channels for efficient and focused
                communication.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-blue-50 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-blue-600 text-white font-bold text-lg sm:text-xl rounded-full absolute -top-4 sm:-top-5 -left-4 sm:-left-5 group-hover:bg-blue-700 group-hover:scale-110 transition-all">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 pt-2 group-hover:text-blue-600 transition-colors">
                Real-Time Collaboration
              </h3>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                Simultaneous document editing and file sharing without
                interruptions to keep your team in perfect sync at all times.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg relative hover:shadow-xl transition-all transform hover:-translate-y-1 hover:bg-blue-50 group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-blue-600 text-white font-bold text-lg sm:text-xl rounded-full absolute -top-4 sm:-top-5 -left-4 sm:-left-5 group-hover:bg-blue-700 group-hover:scale-110 transition-all">
                4
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 pt-2 group-hover:text-blue-600 transition-colors">
                Automation & Integration
              </h3>
              <p className="text-sm sm:text-base text-gray-600 group-hover:text-gray-700 transition-colors">
                Connect with existing applications and automate repetitive
                processes.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all group">
            <div className="grid md:grid-cols-2">
              <div className="p-6 sm:p-12 flex items-center">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 group-hover:text-blue-600 transition-colors">
                    Complete Platform for Productive Teams
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                    TeamSync is the ultimate collaboration solution that brings
                    together everything your team needs to communicate
                    effectively, share ideas, and stay organized - all in one
                    beautiful, intuitive interface.
                  </p>
                  <ul className="space-y-3 sm:space-y-4">
                    <li className="flex items-start group/item">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 group-hover/item:scale-125 transition-transform" />
                      </div>
                      <p className="ml-3 text-base sm:text-lg text-gray-600 group-hover/item:text-gray-700 transition-colors">
                        <span className="font-medium text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          Structured workspaces
                        </span>{" "}
                        — Intuitive organization by teams, channels, and private
                        conversations
                      </p>
                    </li>
                    <li className="flex items-start group/item">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 group-hover/item:scale-125 transition-transform" />
                      </div>
                      <p className="ml-3 text-base sm:text-lg text-gray-600 group-hover/item:text-gray-700 transition-colors">
                        <span className="font-medium text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          Advanced file management
                        </span>{" "}
                        — Storage, versioning, and quick search across all
                        documents
                      </p>
                    </li>
                    <li className="flex items-start group/item">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 group-hover/item:scale-125 transition-transform" />
                      </div>
                      <p className="ml-3 text-base sm:text-lg text-gray-600 group-hover/item:text-gray-700 transition-colors">
                        <span className="font-medium text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          Interactive meetings
                        </span>{" "}
                        — Video conferences with collaboration features and
                        recording
                      </p>
                    </li>
                    <li className="flex items-start group/item">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 group-hover/item:scale-125 transition-transform" />
                      </div>
                      <p className="ml-3 text-base sm:text-lg text-gray-600 group-hover/item:text-gray-700 transition-colors">
                        <span className="font-medium text-gray-900 group-hover/item:text-blue-600 transition-colors">
                          Task management
                        </span>{" "}
                        — Easy tracking of projects and responsibilities
                      </p>
                    </li>
                  </ul>
                  <div className="mt-6 sm:mt-8">
                    <a
                      href="#"
                      className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 group/link"
                    >
                      See all features
                      <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover/link:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-1 group-hover:from-blue-600 group-hover:to-blue-800 transition-colors">
                <div className="h-full w-full bg-white p-2 rounded-lg">
                  <img
                    src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80"
                    alt="TeamSync in action"
                    className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-[1.02]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="case-studies" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Case Studies
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Discover how TeamSync transforms organizations across various
              industries.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {caseStudies.map((study, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform ${
                  hoveredCaseStudyIndex === index
                    ? "scale-105"
                    : "hover:scale-[1.02]"
                }`}
                onMouseEnter={() => setHoveredCaseStudyIndex(index)}
                onMouseLeave={() => setHoveredCaseStudyIndex(null)}
              >
                <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-colors">
                  <div className="bg-white p-4 sm:p-6">
                    <div className="text-sm font-semibold text-blue-600 mb-2">
                      {study.industry}
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-blue-600 transition-colors">
                      {study.company}
                    </h3>

                    <div className="mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 group-hover:text-blue-500 transition-colors">
                        CHALLENGE
                      </h4>
                      <p className="text-sm sm:text-base text-gray-800">
                        {study.challenge}
                      </p>
                    </div>

                    <div className="mb-3 sm:mb-4">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 group-hover:text-blue-500 transition-colors">
                        SOLUTION
                      </h4>
                      <p className="text-sm sm:text-base text-gray-800">
                        {study.solution}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-500 mb-1 group-hover:text-blue-500 transition-colors">
                        RESULTS
                      </h4>
                      <p className="text-sm sm:text-base text-gray-800">
                        {study.results}
                      </p>
                    </div>

                    <div className="mt-4 sm:mt-6">
                      <a
                        href="#"
                        className="text-blue-600 font-medium flex items-center hover:text-blue-800 group text-sm sm:text-base"
                      >
                        Read full case study
                        <ArrowRight className="ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <a
              href="#"
              className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 hover:text-blue-800 transition-colors transform hover:-translate-y-1 inline-block shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              View all case studies
            </a>
          </div>
        </div>
      </section>

      {/* Expanded Testimonials Section */}
      <section id="testimonials" className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Don't just take our word for it - see what teams of all sizes love
              about TeamSync
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full mr-3 sm:mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                      {testimonial.name}
                    </h4>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-700 italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Answers to the most common questions about TeamSync.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="mb-4 sm:mb-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 text-left focus:outline-none group"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-all duration-300 ${
                        expandedFaqs.includes(index)
                          ? "transform rotate-180 text-blue-600"
                          : "group-hover:text-blue-600"
                      }`}
                    />
                  </div>
                </button>
                {expandedFaqs.includes(index) && (
                  <div className="px-4 sm:px-6 pb-3 sm:pb-4 text-sm sm:text-base text-gray-600 animate-fadeIn">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Have another question?
            </p>
            <a
              href="#"
              className="px-6 sm:px-8 py-2 sm:py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all transform hover:-translate-y-1 text-sm sm:text-base"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
            Ready to Transform Your Team's Collaboration?
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">
            Join thousands of teams who have already discovered a better way to
            work together. Experience the TeamSync difference today with our
            user-friendly platform designed for teams of all sizes.
          </p>
          <a
            href="/login"
            className="inline-block px-6 sm:px-8 py-2 sm:py-3 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-100 transition-colors font-semibold text-base sm:text-lg"
          >
            Get Started Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearnMorePage;
