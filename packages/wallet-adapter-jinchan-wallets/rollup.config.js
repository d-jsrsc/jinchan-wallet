import typescript from "rollup-plugin-typescript2";
import external from "rollup-plugin-peer-deps-external";
// import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
// import { nodeResolve } from "@rollup/plugin-node-resolve";

import pkg from "./package.json";

export default {
  input: "src/index.ts",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "es",
      exports: "named",
      sourcemap: true,
    },
  ],
  plugins: [
    json(),
    external(),
    // nodeResolve(),
    typescript({
      rollupCommonJSResolveHack: true,
      exclude: "**/__tests__/**",
      clean: true,
    }),
    // commonjs({
    // include: ["node_modules/**"],
    // }),
  ],
};
