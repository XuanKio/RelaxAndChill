const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
export default {
  output: 'export',
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
  ...(process.env.NODE_ENV === 'development' ? {
    async rewrites() { return [{ source: '/create.html', destination: '/create' }]; }
  } : {})
};
