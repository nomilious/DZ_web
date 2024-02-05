import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import * as defaultConfig from 'vite'
import resolve from 'resolve'

// https://vitejs.dev/config/
export default defineConfig({
    // html: {
    //     template: './public/index.html',
    // },
    // resolve: {
    //     alias: {
    //         "@": fileURLToPath(new URL("./src", import.meta.url)),
    //         "index.html": fileURLToPath(new URL("./public/index.html", import.meta.url))
    //     },
    // },
    build: {
        outDir: "dist",
        assetsDir: "./",
        rollupOptions: {
            input: {
                index: fileURLToPath(new URL("./public/index.html", import.meta.url)),
            },
        }
    },
});
