// utils/facebookPixel.js
export const fbTrack = (event, params = {}) => {
  if (window.fbq) {
    window.fbq('track', event, params);
  }
};
