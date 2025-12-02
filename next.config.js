/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Transpile local workspace packages
    transpilePackages: ['@kimuntupro/db', '@kimuntupro/ai-core', '@kimuntupro/rag-core', '@kimuntupro/shared'],
    // Ensure compatibility with Firebase
    webpack: (config, { isServer }) => {
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                net: false,
                tls: false,
            };
        }
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
