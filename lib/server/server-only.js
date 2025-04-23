// This file is used to mark modules as server-only
// Next.js will ensure they're not included in client bundles

export const ensureServerOnly = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Server-only module was imported on the client');
  }
};

// This is intentionally exported as the default
export default 'This module is for server-side only';