import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Banner {
  image: string | null;
  url: string;
}

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const validBanners = banners.filter(banner => banner.image);

  useEffect(() => {
    if (validBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === validBanners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [validBanners.length]);

  if (validBanners.length === 0) {
    return null;
  }

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? validBanners.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === validBanners.length - 1 ? 0 : currentIndex + 1);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.url) {
      window.open(banner.url, '_blank');
    }
  };

  return (
    <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-gray-100 mb-6">
      {/* Banner Image */}
      <div 
        className="w-full h-full cursor-pointer"
        onClick={() => handleBannerClick(validBanners[currentIndex])}
      >
        <img
          src={validBanners[currentIndex].image!}
          alt={`Banner ${currentIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navigation Arrows */}
      {validBanners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {validBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {validBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}