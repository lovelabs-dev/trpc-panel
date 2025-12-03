import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import babel from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import copy from "rollup-plugin-copy";
import replace from "@rollup/plugin-replace";
import terser from "@rollup/plugin-terser";
import postcss from "rollup-plugin-postcss";
import path from "path";
const isWatching = process.env.ROLLUP_WATCH;

const onwarn = (warning, warn) => {
  if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
    return;
  }
  if (warning.code === "CIRCULAR_DEPENDENCY") {
    return;
  }
  if (warning.message.includes("use client")) {
    return;
  }
  if (warning.code === "SOURCEMAP_ERROR") {
    return;
  }
  if (warning.code === "THIS_IS_UNDEFINED") {
    return;
  }
  warn(warning);
};

export default [
  {
    input: "src/index.ts",
    onwarn,
    external: ["fs", "path", "url", "node:url", "node:path", "zod", "zod-to-json-schema"],
    plugins: [
      typescript({ tsconfig: "tsconfig.buildPanel.json", sourceMap: false, inlineSources: false, compilerOptions: { sourceRoot: undefined } }),
      json(),
      // resolve(),
      // babel({
      //     exclude: "node_modules/**",
      //     presets: ["@babel/env", "@babel/preset-react"],
      // }),
      // commonjs(),
    ],
    output: [
      { file: "lib/index.js", format: "cjs" },
      { file: "lib/index.mjs", format: "es" },
    ],
  },
  {
    input: "src/react-app/index.tsx",
    onwarn,
    output: {
      file: "lib/react-app/bundle.js",
      format: "umd",
      sourcemap: false,
      name: "trpc-panel",
    },
    plugins: [
      postcss({
        extract: path.resolve("lib/react-app/index.css"),
      }),
      nodeResolve({
        extensions: [".js", ".ts", ".tsx", "ts"],
      }),
      typescript({ tsconfig: "tsconfig.buildReactApp.json", sourceMap: false, inlineSources: false, compilerOptions: { sourceRoot: undefined } }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
        preventAssignment: false,
      }),
      babel({
        babelHelpers: "bundled",
        presets: [
          [
            "@babel/preset-react",
            {
              development: isWatching,
            },
          ],
        ],
      }),
      commonjs(),
      copy({
        targets: [
          {
            src: "src/react-app/index.html",
            dest: "lib/react-app",
          },
        ],
      }),
      !isWatching && terser(),
    ],
  },
];
