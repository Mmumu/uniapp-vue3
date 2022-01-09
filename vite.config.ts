import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  envPrefix: ['VUE_APP_BL', 'NODE_ENV'],
  define: {
    'process.env': JSON.stringify('development')
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: "@import 'src/style/global.scss'; @import 'src/style/animation.scss';"
      }
    }
  }
});
