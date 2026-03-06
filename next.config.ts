import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      buffer: "buffer",
      stream: "stream-browserify",
      events: "events",
      timers: "timers-browserify",
    },
  },
};

export default nextConfig;
