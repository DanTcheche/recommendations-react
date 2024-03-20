import path from "path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import type { ConfigEnv, UserConfigExport } from "vite";

const config = ({ mode }: ConfigEnv): UserConfigExport => {
  // Load and merge environment variables
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };

  const {
    SENTRY_AUTH_TOKEN,
    VITE_SENTRY_ORGANIZATION,
    VITE_SENTRY_PROJECT,
    VITE_APP_ENV,
    VITE_APP_URL,
  } = process.env;

  const baseConfig = {
    plugins: [
      react(),
      sentryVitePlugin({
        authToken: SENTRY_AUTH_TOKEN,
        org: VITE_SENTRY_ORGANIZATION,
        project: VITE_SENTRY_PROJECT,
      }),
    ].filter(Boolean),
    build: {
      sourcemap: true,
      manifest: true,
      rollupOptions: {
        input: { main: path.resolve(__dirname, "index.html") },
        output: {
          assetFileNames: ({ name }: { name: string }) => {
            if (name.endsWith(".png") || name.endsWith(".svg")) {
              return "assets/[name][extname]";
            }

            // default value
            // ref: https://rollupjs.org/guide/en/#outputassetfilenames
            return "assets/[name]-[hash][extname]";
          },
        },
      },
    },
    server: {
      open: true,
      origin: VITE_APP_ENV === "local" ? VITE_APP_URL : "",
    },
    resolve: {
      alias: [{ find: "@", replacement: path.resolve(__dirname, "./src") }],
    },
  };

  return defineConfig(baseConfig);
};

export default config;
