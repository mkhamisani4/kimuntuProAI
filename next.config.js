/** @type {import('next').NextConfig} */
const nextConfig = {
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
        return config;
    },
}

module.exports = nextConfig
