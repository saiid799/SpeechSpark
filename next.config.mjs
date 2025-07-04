/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize chunk loading and performance
  experimental: {
    optimizePackageImports: ['@clerk/nextjs', 'lucide-react', 'framer-motion'],
  },
  
  // Improve build performance
  transpilePackages: ['@clerk/nextjs'],
  
  webpack(config, { dev, isServer }) {
    // Audio file handling
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      use: [
        {
          loader: "url-loader",
          options: {
            name: "[name]-[hash].[ext]",
          },
        },
      ],
    });

    // Optimize chunk loading in development
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            clerk: {
              test: /[\\/]node_modules[\\/]@clerk[\\/]/,
              name: 'clerk',
              priority: 10,
              chunks: 'all',
            },
          },
        },
      };
    }

    return config;
  },
};

export default nextConfig;
