/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
    // Load pdf-parse (and its bundled pdfjs-dist) via native Node.js require
    // instead of being bundled by webpack — avoids Object.defineProperty crash.
    serverExternalPackages: ['pdf-parse'],
    // Disable TypeScript errors during build (only show warnings)
    typescript: {
        ignoreBuildErrors: false, // Set to true to completely ignore TS errors
    },
    // Disable ESLint during build
    eslint: {
        ignoreDuringBuilds: false, // Set to true to completely ignore ESLint
    },
    images: {
        domains: [],
        unoptimized: false,
    },
    // Transpile local workspace packages and face-api.js (avoids 404 on dynamic chunk)
    transpilePackages: ['@kimuntupro/db', '@kimuntupro/ai-core', '@kimuntupro/rag-core', '@kimuntupro/shared', 'face-api.js'],
    // Ensure compatibility with Firebase
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
                encoding: false,
            };
        }
        // Force face-api.js to CommonJS so the es6 chunk is never requested (fixes 404)
        const faceApiCjs = path.resolve(__dirname, 'node_modules/face-api.js/build/commonjs/index.js');
        config.resolve.alias = {
            ...config.resolve.alias,
            'face-api.js': faceApiCjs,
            'face-api.js/build/es6/index.js': faceApiCjs,
        };
        // Handle .mjs files from node_modules
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto',
        });
        return config;
    },
}

module.exports = nextConfig
