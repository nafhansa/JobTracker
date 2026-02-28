import nextPlugin from "@next/eslint-plugin-next";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "public/**",
      "scripts/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescriptPlugin,
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "@next/next/no-img-element": "warn",
    },
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      globals: {
        process: "readonly",
      },
    },
    plugins: {
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
];

export default eslintConfig;
