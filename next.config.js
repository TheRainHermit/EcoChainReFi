/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // NOTE: No se incluyen rewrites porque `output: 'export'` (site estático)
  // no permite rutas personalizadas. Durante desarrollo apunta al backend
  // configurando la variable de entorno NEXT_PUBLIC_BACKEND_URL.
};

module.exports = nextConfig;
