import nextPlugin from "@next/eslint-plugin-next";

const recommended = nextPlugin.configs.recommended;
const coreWebVitals = nextPlugin.configs["core-web-vitals"];

export default [
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...recommended.rules,
      ...coreWebVitals.rules,
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];
