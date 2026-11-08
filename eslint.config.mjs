import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTypescript from "eslint-config-next/typescript.js";

export default [
  nextVitals,
  nextTypescript,
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];
