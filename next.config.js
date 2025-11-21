/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  webpack: (config, { isServer }) => {
    // Exclude pdfjs-dist from server-side bundle completely
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('pdfjs-dist');
      } else {
        config.externals = [config.externals, 'pdfjs-dist'];
      }
    }
    
    // For client-side, ensure pdfjs-dist is treated as an external or handled properly
    if (!isServer) {
      // Ignore canvas and other Node.js-specific modules that pdfjs-dist might try to use
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        stream: false,
      };
    }
    
    return config;
  },
}

export default nextConfig
