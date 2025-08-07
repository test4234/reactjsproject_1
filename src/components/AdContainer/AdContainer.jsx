// AdContainer.jsx

import React, { useState, useEffect, useRef } from "react";

// --- Reusable Core UI Components ---

// AdImage: Handles image loading, errors, and responsiveness
const AdImage = ({
  src,
  alt,
  className = "",
  onErrorText = "Image not available",
  style = {},
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  const handleError = () => {
    setError(true);
    setImgSrc(
      `https://placehold.co/80x80/cccccc/333333?text=${encodeURIComponent(onErrorText)}`,
    );
  };

  return (
    <div
      className={`flex items-center justify-center overflow-hidden ${className}`}
      style={style}
    >
      {error ? (
        <img
          src={imgSrc}
          alt={alt}
          className="object-contain w-full h-full rounded-md"
          style={style} // Pass style to the image tag
        />
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          className="object-cover w-full h-full"
          onError={handleError}
          style={style} // Pass style to the image tag
        />
      )}
    </div>
  );
};

// AdLinkButton: A styled button for calls-to-action
const AdLinkButton = ({ text, href, className = "", newTab = true, style = {} }) => (
  <a
    href={href}
    {...(newTab && { target: "_blank", rel: "noopener noreferrer" })}
    className={`inline-block px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-200 ${className}`}
    style={style}
  >
    {text}
  </a>
);

// AdBadge: For "Sponsored" or other labels
const AdBadge = ({ text, className = "", style = {} }) => (
  <span
    className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-full shadow-sm z-10 ${className}`}
    style={style}
  >
    {text}
  </span>
);

// --- Ad Type Components for Delivery Apps ---

// Single Product Ad
const ProductAdCard = ({ ad }) => (
  <div
    className="relative w-full max-w-xs mx-auto bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
    style={{ ...ad.styles?.container }}
  >
    {ad.label && <AdBadge text={ad.label} style={ad.styles?.badge} />}
    <a
      href={ad.product.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
    >
      <AdImage
        src={ad.product.imageUrl}
        alt={ad.product.name}
        className="w-full h-48 object-cover"
        style={ad.styles?.image}
      />
      <div className="p-4" style={ad.styles?.contentArea}>
        <h3 className="text-lg font-semibold text-gray-800 truncate" style={ad.styles?.title}>
          {ad.product.name}
        </h3>
        {ad.product.brand && (
          <p className="text-sm text-gray-500" style={ad.styles?.brand}>
            {ad.product.brand}
          </p>
        )}
        <div className="flex items-baseline mt-2">
          <span className="text-xl font-bold text-green-600" style={ad.styles?.price}>
            {ad.product.price}
          </span>
          {ad.product.originalPrice && (
            <span className="ml-2 text-sm text-gray-500 line-through" style={ad.styles?.originalPrice}>
              {ad.product.originalPrice}
            </span>
          )}
          {ad.product.discount && (
            <span className="ml-2 text-sm font-semibold text-red-500" style={ad.styles?.discount}>
              {ad.product.discount} Off
            </span>
          )}
        </div>
        {ad.product.rating && (
          <div className="flex items-center mt-2 text-sm text-gray-600" style={ad.styles?.ratingArea}>
            <span style={ad.styles?.ratingText}>⭐ {ad.product.rating}</span>
            {ad.product.reviewsCount && (
              <span className="ml-1" style={ad.styles?.reviewsCount}>({ad.product.reviewsCount})</span>
            )}
          </div>
        )}
      </div>
    </a>
    <div className="p-4 pt-0">
      <AdLinkButton
        text={ad.ctaText || "Shop Now"}
        href={ad.product.linkUrl}
        className="w-full"
        style={ad.styles?.button}
      />
    </div>
  </div>
);

// Carousel with full card images
const HorizontalBannerCarouselAd = ({ ad }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  useEffect(() => {
    if (ad.autoScrollIntervalMs) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % ad.banners.length);
      }, ad.autoScrollIntervalMs);
      return () => clearInterval(interval);
    }
  }, [ad.banners.length, ad.autoScrollIntervalMs]);

  useEffect(() => {
    if (carouselRef.current) {
      const scrollAmount = currentIndex * carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % ad.banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + ad.banners.length) % ad.banners.length,
    );
  };

  // Check if banners exist
  if (!ad.banners || ad.banners.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4" style={ad.styles?.container}>
        No banners configured.
      </div>
    );
  }

  return (
    <div
      className="relative mx-auto rounded-xl overflow-hidden shadow-xl bg-gray-100 flex items-center justify-center group"
      style={{
        width: ad.size?.width || "100%",
        height: ad.size?.height || "160px",
        ...ad.styles?.container
      }}
    >
      <div
        ref={carouselRef}
        className="flex w-full h-full overflow-x-scroll no-scrollbar snap-x snap-mandatory" // Using overflow-x-scroll for mobile gestures
        style={{ scrollBehavior: 'smooth' }}
      >
        {ad.banners.map((banner, idx) => (
          <a
            key={idx}
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-full h-full snap-center"
          >
            <AdImage
              src={banner.imageUrl}
              alt={banner.altText || ad.altText}
              className="w-full h-full transition-transform duration-300 group-hover:scale-105"
              style={ad.styles?.image}
            />
          </a>
        ))}
      </div>

      {/* Navigation and Indicators for Desktop */}
      {ad.banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden md:block absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none hover:bg-opacity-60 z-10"
            aria-label="Previous banner"
            style={ad.styles?.navButton}
          >
            &#10094;
          </button>
          <button
            onClick={nextSlide}
            className="hidden md:block absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-40 text-white p-2 rounded-full text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none hover:bg-opacity-60 z-10"
            aria-label="Next banner"
            style={ad.styles?.navButton}
          >
            &#10095;
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center space-x-2 z-10">
            {ad.banners.map((_, idx) => (
              <span
                key={idx}
                className={`block w-2.5 h-2.5 rounded-full transition-colors duration-300 ${currentIndex === idx ? "bg-white scale-125" : "bg-gray-400 bg-opacity-70"}`}
                style={ad.styles?.dotIndicator && { backgroundColor: currentIndex === idx ? ad.styles.dotIndicator.activeColor : ad.styles.dotIndicator.inactiveColor }}
              ></span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Multi-product ad
const CategoryProductCarouselAd = ({ ad }) => {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const cardWidth = parseInt(ad.itemSize?.width || "140px");
      const spacing = 16;
      const scrollAmount = cardWidth + spacing;

      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!ad.items || ad.items.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4" style={ad.styles?.container}>
        No items configured for this carousel.
      </div>
    );
  }

  const calculatedItemWidth = ad.itemsPerView
    ? `calc(${100 / ad.itemsPerView}% - 1rem)`
    : '140px';

  return (
    <div className="relative w-full py-4" style={ad.styles?.container}>
      {ad.title && (
        <h2 className="text-xl font-bold text-gray-800 mb-4 px-4" style={ad.styles?.title}>
          {ad.title}
        </h2>
      )}
      <div className="flex items-center">
        {/* Navigation buttons for desktop, hidden on mobile */}
        {ad.items.length > (ad.itemsPerView || 2) && (
          <>
            <button
              onClick={() => scroll('left')}
              className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 text-gray-700 p-2 rounded-full shadow-md z-10 hover:bg-opacity-100 transition-all duration-200 focus:outline-none"
              aria-label="Scroll left"
              style={ad.styles?.navButtonLeft}
            >
              &#10094;
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 text-gray-700 p-2 rounded-full shadow-md z-10 hover:bg-opacity-100 transition-all duration-200 focus:outline-none"
              aria-label="Scroll right"
              style={ad.styles?.navButtonRight}
            >
              &#10095;
            </button>
          </>
        )}
        <div
          ref={carouselRef}
          className="flex overflow-x-scroll no-scrollbar py-2 px-4 space-x-4 snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth', ...ad.styles?.carouselTrack }}
        >
          {ad.items.map((item, index) => (
            <a
              key={index}
              href={item.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex flex-col items-center text-center p-3 bg-white rounded-xl shadow-md snap-center transform hover:scale-105 transition-transform duration-200"
              style={{
                width: calculatedItemWidth,
                height: ad.itemSize?.height || "170px",
                ...ad.styles?.itemCard
              }}
            >
              <AdImage
                src={item.imageUrl}
                alt={item.name}
                className="mb-2 w-full h-24 object-cover rounded-md"
                style={ad.styles?.itemImage}
              />
              <span className="text-sm font-medium text-gray-800 truncate w-full" style={ad.styles?.itemName}>
                {item.name}
              </span>
              {item.price && (
                <span className="text-xs text-green-600 font-semibold" style={ad.styles?.itemPrice}>
                  {item.price}
                </span>
              )}
            </a>
          ))}
        </div>
      </div>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </div>
  );
};

// Static Image Ad
const FullWidthStaticBannerAd = ({ ad }) => (
  <a
    href={ad.linkUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="block w-full rounded-lg overflow-hidden shadow-lg bg-gray-100"
    style={{ height: ad.size?.height || "140px", ...ad.styles?.container }}
  >
    <AdImage src={ad.imageUrl} alt={ad.altText} className="w-full h-full" style={ad.styles?.image} />
  </a>
);

// Multi-Category Ad
const CategoryIconGridAd = ({ ad }) => (
  <div
    className="w-full p-4 grid grid-cols-3 gap-4 rounded-lg shadow-lg bg-white"
    style={{ ...ad.styles?.container }}
  >
    {ad.categories &&
      ad.categories.map((category, index) => (
        <a
          key={index}
          href={category.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center text-center p-2 rounded-md hover:bg-gray-50 transition-colors duration-200"
          style={ad.styles?.categoryItem}
        >
          <AdImage
            src={category.iconUrl}
            alt={category.name}
            className="mb-2 w-full h-24 object-cover rounded-md"
            style={{ ...ad.styles?.icon }}
          />
          <span className="text-xs font-medium text-gray-700" style={ad.styles?.categoryName}>
            {category.name}
          </span>
        </a>
      ))}
  </div>
);

// Video Ad
const VideoAdCard = ({ ad }) => (
  <div
    className="relative w-full max-w-md mx-auto bg-black rounded-lg shadow-lg overflow-hidden"
    style={{
      width: ad.size?.width || "320px",
      height: ad.size?.height || "180px",
      ...ad.styles?.container
    }}
  >
    <video
      controls={ad.controls !== false}
      autoPlay={ad.autoPlay || false}
      muted={ad.muted || false}
      loop={ad.loop || false}
      poster={ad.thumbnailUrl}
      className="w-full h-full object-contain"
      src={ad.videoUrl}
      title={ad.title}
      style={ad.styles?.video}
    >
      Your browser does not support the video tag.
    </video>
    {(ad.title || ad.description || ad.linkUrl) && (
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white" style={ad.styles?.overlay}>
        {ad.title && <h3 className="text-lg font-semibold" style={ad.styles?.title}>{ad.title}</h3>}
        {ad.description && (
          <p className="text-sm text-gray-300" style={ad.styles?.description}>{ad.description}</p>
        )}
        {ad.linkUrl && (
          <AdLinkButton
            text={ad.ctaText || "Learn More"}
            href={ad.linkUrl}
            className="mt-2 bg-blue-600 hover:bg-blue-700"
            style={ad.styles?.button}
          />
        )}
      </div>
    )}
  </div>
);


// --- Main AdContainer Component ---

const AdContainer = ({ adData }) => {
  if (!adData || !adData.type) {
    console.warn(
      "AdContainer: Missing or invalid adData. Ad will not be rendered.",
      adData,
    );
    return null;
  }

  // A common wrapper for consistent styling and margins around each ad
  const AdWrapper = ({ children, className = "", style = {} }) => (
    // Dynamic margin and padding applied from adData.styles?.wrapper
    <div
      className={`my-4 p-2 bg-white rounded-xl shadow-md border-gray-100 flex justify-center items-center ${className}`}
      style={style}
    >
      {children}
    </div>
  );

  // Map ad types to their respective components
  const adComponentMap = {
    ProductAdCard: ProductAdCard,
    HorizontalBannerCarousel: HorizontalBannerCarouselAd,
    CategoryProductCarousel: CategoryProductCarouselAd,
    FullWidthStaticBanner: FullWidthStaticBannerAd,
    CategoryIconGrid: CategoryIconGridAd,
    VideoAdCard: VideoAdCard,
  };

  const SpecificAdComponent = adComponentMap[adData.type];

  if (!SpecificAdComponent) {
    console.warn(
      `AdContainer: No component found for ad type "${adData.type}".`,
    );
    return (
      <AdWrapper style={adData.styles?.wrapper}>
        <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg shadow-sm">
          Unknown ad type: {adData.type}
        </div>
      </AdWrapper>
    );
  }

  return (
    <AdWrapper className={adData.wrapperClassName} style={adData.styles?.wrapper}>
      <SpecificAdComponent ad={adData} />
    </AdWrapper>
  );
};

export default AdContainer;