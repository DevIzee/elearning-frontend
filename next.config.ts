/**
 * Next.js Configuration
 */

import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Créer le plugin i18n
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
