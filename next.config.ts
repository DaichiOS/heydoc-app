import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	webpack: (config, { isServer }) => {
		// Exclude Node.js modules from client-side bundle
		if (!isServer) {
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				net: false,
				tls: false,
				crypto: false,
				stream: false,
				url: false,
				zlib: false,
				http: false,
				https: false,
				assert: false,
				os: false,
				path: false,
			}
		}
		return config
	},
	experimental: {
		serverComponentsExternalPackages: ['pg', 'drizzle-orm'],
	},
};

export default nextConfig;
