// Performance optimization utilities

// Preload critical resources
export const preloadResources = () => {
  // Preload critical fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'font';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
};

// Optimize images
export const optimizeImages = () => {
  // Add loading="lazy" to images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
};

// Debounce function for performance
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for performance
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Cache API responses
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedFetch = async (url: string, options?: RequestInit) => {
  const cacheKey = `${url}-${JSON.stringify(options)}`;
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  
  const response = await fetch(url, options);
  const data = await response.json();
  
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
};

// Optimize scroll performance
export const optimizeScroll = () => {
  let ticking = false;
  
  const updateScroll = () => {
    // Handle scroll updates
    ticking = false;
  };
  
  const requestTick = () => {
    if (!ticking) {
      requestAnimationFrame(updateScroll);
      ticking = true;
    }
  };
  
  window.addEventListener('scroll', requestTick, { passive: true });
};

// Reduce layout thrashing
export const batchDOMUpdates = (updates: (() => void)[]) => {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
};

// Optimize animations
export const optimizeAnimations = () => {
  // Use transform and opacity for animations
  const style = document.createElement('style');
  style.textContent = `
    .optimized-animation {
      will-change: transform, opacity;
    }
  `;
  document.head.appendChild(style);
};

// Initialize performance optimizations
export const initializePerformance = () => {
  preloadResources();
  optimizeImages();
  optimizeScroll();
  optimizeAnimations();
}; 