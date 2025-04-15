import React from "react";
import {
  Users,
  MessageCircle,
  Video,
  FileText,
  Calendar,
  Star,
  Share2,
  Database,
  Zap,
  Smile,
} from "lucide-react";

interface TeamFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const TeamFeature: React.FC<TeamFeatureProps> = ({
  icon,
  title,
  description,
  color,
}) => (
  <div
    className="bg-white rounded-xl shadow-lg p-6 border-t-4 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2"
    style={{ borderColor: color }}
  >
    <div className="flex items-center mb-4">
      <div
        className="p-3 rounded-full mr-4"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold" style={{ color }}>
        {title}
      </h3>
    </div>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TeamCollaboration: React.FC = () => {
  const teamFeatures = [
    {
      icon: <Users className="w-7 h-7" />,
      title: "Team Spaces",
      description:
        "Create dedicated spaces for different teams, projects, or departments to streamline communication and collaboration.",
      color: "#4C5AFF",
    },
    {
      icon: <MessageCircle className="w-7 h-7" />,
      title: "Real-time Chat",
      description:
        "Communicate instantly with team members through direct messages, group chats, and channels with rich formatting.",
      color: "#00A3FF",
    },
    {
      icon: <Video className="w-7 h-7" />,
      title: "HD Video Meetings",
      description:
        "Connect face-to-face with crystal-clear video, screen sharing, and interactive collaboration tools.",
      color: "#FF5757",
    },
    {
      icon: <FileText className="w-7 h-7" />,
      title: "Document Collaboration",
      description:
        "Create, edit, and share documents in real-time with your team, with version history and commenting.",
      color: "#32CD32",
    },
    {
      icon: <Calendar className="w-7 h-7" />,
      title: "Smart Scheduling",
      description:
        "Plan meetings and events with intelligent scheduling that finds the perfect time for everyone.",
      color: "#FF9500",
    },
    {
      icon: <Star className="w-7 h-7" />,
      title: "Personalized Experience",
      description:
        "Customize your workspace with themes, notifications, and preferences to work your way.",
      color: "#9E6CFF",
    },
    {
      icon: <Share2 className="w-7 h-7" />,
      title: "External Sharing",
      description:
        "Securely collaborate with partners, clients, and guests with controlled access to specific channels.",
      color: "#00B894",
    },
    {
      icon: <Database className="w-7 h-7" />,
      title: "Knowledge Base",
      description:
        "Build a searchable company knowledge base with wikis, FAQs, and important resources.",
      color: "#FFC107",
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Smart Notifications",
      description:
        "Stay on top of important conversations with AI-powered notifications that understand your priorities.",
      color: "#6C5CE7",
    },
  ];

  return (
    <section id="team-collaboration" className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Transform How Your Team Works Together
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            TeamSync brings your team closer, makes communication seamless, and
            enhances productivity with powerful collaboration tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamFeatures.map((feature, index) => (
            <TeamFeature
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              color={feature.color}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-blue-50 rounded-full mb-8">
            <Smile className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            Join thousands of happy teams already using TeamSync
          </h3>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Experience a new way of working together that your team will love.
          </p>
          <a
            href="#"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors text-lg font-semibold"
          >
            Get Started for Free
          </a>
        </div>
      </div>
    </section>
  );
};

export default TeamCollaboration;
