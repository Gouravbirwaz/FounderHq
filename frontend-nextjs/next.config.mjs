import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    eslint: {
        ignoreDuringBuilds: true,
    },
    turbopack: {
        resolveAlias: {
            tailwindcss: resolve(__dirname, 'node_modules/tailwindcss'),
        },
    },
};

export default nextConfig;
