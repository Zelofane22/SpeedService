import nextConfig from 'eslint-config-next/core-web-vitals';

export default [
  ...nextConfig,
  {
    rules: {
      // Existing data-loading effects intentionally synchronize API state on mount.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
];
