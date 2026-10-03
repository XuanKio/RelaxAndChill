import { SITE_BASE as basePath } from './site-path.mjs';
export default {
  output: 'export',
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  poweredByHeader: false,
  ...(process.env.NODE_ENV === 'development' ? {
    async rewrites() { return [{ source: '/create.html', destination: '/create' }]; }
  } : {})
};
