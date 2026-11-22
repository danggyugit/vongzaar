import type { NextConfig } from "next";

const config: NextConfig = {
  outputFileTracingIncludes: {
    "/api/og": ["./assets/**"],
  },
};

export default config;
