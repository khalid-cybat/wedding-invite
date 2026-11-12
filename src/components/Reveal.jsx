import { useEffect, useRef, useState } from "react";

export default function Reveal({ as: Element = "div", className = "", children, ...props }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setIsVisible(true);
      observer.unobserve(entry.target);
    }, { threshold: 0.12 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <Element
      {...props}
      ref={elementRef}
      className={`${className} reveal${isVisible ? " is-visible" : ""}`.trim()}
    >
      {children}
    </Element>
  );
}
