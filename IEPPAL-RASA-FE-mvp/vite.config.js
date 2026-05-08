import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    headers: {
      "Cache-Control": "no-store",
    },
    hmr: {
      overlay: true,
    },
  },
  preview: {
    host: "127.0.0.1",
    port: 4173,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      onwarn(warning, warn) {
        const message = warning?.message || "";

        if (
          message.includes('node_modules/onnxruntime-web/dist/ort-web.min.js') &&
          message.includes('Use of eval')
        ) {
          return;
        }

        warn(warning);
      },
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/react-router-dom/") ||
            id.includes("/react-router/")
          ) {
            return "react-vendor";
          }

          if (
            id.includes("/chart.js/") ||
            id.includes("/react-chartjs-2/") ||
            id.includes("/chartjs-adapter-date-fns/") ||
            id.includes("/@sgratzl/chartjs-chart-boxplot/")
          ) {
            return "charts";
          }

          if (id.includes("/firebase/")) {
            return "firebase";
          }

          if (
            id.includes("/react-datepicker/") ||
            id.includes("/date-fns/")
          ) {
            return "dates";
          }

          if (
            id.includes("/@xenova/transformers/") ||
            id.includes("/onnxruntime-common/") ||
            id.includes("/onnxruntime-web/")
          ) {
            return "ai";
          }

          if (
            id.includes("/jspdf/") ||
            id.includes("/jspdf-autotable/")
          ) {
            return "pdf";
          }

          if (id.includes("/html2canvas/")) {
            return "html2canvas";
          }

          if (id.includes("/xlsx/")) {
            return "spreadsheet";
          }
        },
      },
    },
  },
});
