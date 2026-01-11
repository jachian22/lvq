/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,

  // Note: Using custom [locale] routing instead of Next.js built-in i18n
  // to have full control over locale handling and URL structure
};

export default config;
