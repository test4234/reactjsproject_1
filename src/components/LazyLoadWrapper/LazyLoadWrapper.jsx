import React, { useEffect, useRef, useState } from "react";

const LazyLoadWrapper = ({ children, rootMargin = "200px", minHeight = 400 }) => {
  const ref = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [rootMargin, isVisible]);

  return (
    <div ref={ref} style={{ minHeight }}>
      {isVisible ? children : <div style={{ minHeight }} />}
    </div>
  );
};

export default LazyLoadWrapper;