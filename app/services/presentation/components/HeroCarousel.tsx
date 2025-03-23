import { useState, useEffect } from "react";
import Link from "next/link";

const HeroCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselItems = [
    {
      id: 1,
      title: "Innovative Design Solutions",
      description: "Transforming ideas into cutting-edge visual experiences",
      imageUrl:
        "https://wallpapers.com/images/hd/creative-cloud-storage-technology-clip-art-cho1olksva7l9xi5.jpg",
    },
    {
      id: 2,
      title: "Creative Technology Frontiers",
      description: "Pushing boundaries of interactive digital experiences",
      imageUrl:
        "https://c0.wallpaperflare.com/preview/757/377/153/business-office-meetings-marketing.jpg",
    },
    {
      id: 3,
      title: "Next-Generation Visualization",
      description: "Crafting immersive and dynamic visual narratives",
      imageUrl:
        "https://as1.ftcdn.net/jpg/03/25/80/02/1000_F_325800248_w9sG5xSOXAK7S0zZaRIhIR3RW6RtT3WF.webp",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 2000);

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
            absolute inset-0 transition-opacity duration-500 ease-in-out
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
              style={{ backgroundColor: "rgba(12, 15, 44, 0.7)" }}
            >
              <div className="text-center max-w-3xl px-4">
                <h1
                  className="text-6xl font-bold mb-6 text-white drop-shadow-md"
                  style={{ color: "white" }}
                >
                  {item.title}
                </h1>
                <p className="text-2xl mb-8" style={{ color: "#B3B4BD" }}>
                  {item.description}
                </p>
                <div className="space-x-4">
                  <button
                    className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: "#0A21C0",
                      color: "white",
                      boxShadow: "0 4px 6px rgba(10, 33, 192, 0.3)",
                      transform: "hover:scale-105",
                    }}
                  >
                    Get Started
                  </button>
                  <Link
                    href="/learnmore"
                    className="px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-300"
                    style={{
                      backgroundColor: "transparent",
                      color: "#B3B4BD",
                      border: "2px solid #B3B4BD",
                      transform: "hover:scale-105",
                    }}
                  >
                    Learn More
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
              ${currentSlide === index ? "bg-[#0A21C0] w-6" : "bg-[#B3B4BD]"}
            `}
          />
        ))}
      </div>
    </div>
  );
};
export default HeroCarousel;
