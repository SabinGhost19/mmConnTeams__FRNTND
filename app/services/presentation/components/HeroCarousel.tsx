import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe } from "lucide-react";

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    {
      id: 1,
      title: "Collaborate Seamlessly",
      description:
        "Connect your team with powerful messaging, video meetings, and file sharing",
      imageUrl:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    },
    {
      id: 2,
      title: "Boost Team Productivity",
      description:
        "Keep your projects on track with integrated task management and scheduling",
      imageUrl:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    },
    {
      id: 3,
      title: "Work From Anywhere",
      description:
        "Stay connected with your team whether you're in the office or on the go",
      imageUrl:
        "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000); // Increased time to 5 seconds for better readability

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className="relative w-full h-[600px] overflow-hidden"
      style={{ backgroundColor: "#2C2E3A" }}
    >
      {carouselItems.map((item, index) => (
        <div
          key={item.id}
          className={`
            absolute inset-0 transition-opacity duration-1000 ease-in-out
            ${currentSlide === index ? "opacity-100" : "opacity-0"}
          `}
        >
          <div className="relative w-full h-full">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
              style={{ backgroundColor: "rgba(10, 33, 192, 0.6)" }}
            >
              <div className="text-center max-w-3xl px-4">
                <h1
                  className="text-6xl font-bold mb-6 text-white drop-shadow-md"
                  style={{ color: "white" }}
                >
                  {item.title}
                </h1>
                <p className="text-2xl mb-8 text-white">{item.description}</p>
                <div>
                  <Link
                    href="/login"
                    className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    style={{
                      backgroundColor: "white",
                      color: "#0A21C0",
                      boxShadow: "0 4px 6px rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${
                currentSlide === index
                  ? "bg-white w-6"
                  : "bg-gray-400 bg-opacity-60"
              }
            `}
          />
        ))}
      </div>
    </div>
  );
};
export default HeroCarousel;
