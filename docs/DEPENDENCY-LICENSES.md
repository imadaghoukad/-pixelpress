# Dependency licenses

Generated from the installed lockfile by `npm run licenses`. No unknown license expressions were found.

The shipped browser application uses MIT-licensed libraries and the ISC-licensed Lucide icon set. Tailwind output is built locally. No third-party runtime CDN, paid encoder, or WASM binary is used.

Next.js includes optional native build/server packages. Sharp and its native libraries are used only for development fixture generation and assertions in this static application; the original LGPL/MPL/Apache notices remain in their npm distributions. They are not included in the exported browser application. ESLint, Vitest, and Playwright are development tools.

## Direct dependencies

| Package                   | Version | License    | Use                 |
| ------------------------- | ------- | ---------- | ------------------- |
| @eslint/js                | 9.39.5  | MIT        | Development         |
| @playwright/test          | 1.63.0  | Apache-2.0 | Development         |
| @tailwindcss/postcss      | 4.3.3   | MIT        | Development         |
| @types/node               | 22.20.5 | MIT        | Development         |
| @types/react              | 19.3.0  | MIT        | Development         |
| @types/react-dom          | 19.3.0  | MIT        | Development         |
| class-variance-authority  | 0.7.1   | Apache-2.0 | Application / build |
| clsx                      | 2.1.1   | MIT        | Application / build |
| eslint                    | 9.39.5  | MIT        | Development         |
| eslint-plugin-react-hooks | 7.1.1   | MIT        | Development         |
| fflate                    | 0.8.3   | MIT        | Application / build |
| lucide-react              | 0.577.0 | ISC        | Application / build |
| next                      | 16.3.8  | MIT        | Application / build |
| prettier                  | 3.9.9   | MIT        | Development         |
| radix-ui                  | 1.6.7   | MIT        | Application / build |
| react                     | 19.3.0  | MIT        | Application / build |
| react-dom                 | 19.3.0  | MIT        | Application / build |
| sharp                     | 0.35.5  | Apache-2.0 | Development         |
| tailwind-merge            | 3.7.0   | MIT        | Application / build |
| tailwindcss               | 4.3.3   | MIT        | Development         |
| typescript                | 5.9.3   | Apache-2.0 | Development         |
| typescript-eslint         | 8.71.0  | MIT        | Development         |
| vitest                    | 4.1.11  | MIT        | Development         |

## Full dependency inventory

| Package path                                                      | Version      | License                                  |
| ----------------------------------------------------------------- | ------------ | ---------------------------------------- |
| @alloc/quick-lru                                                  | 5.3.0        | MIT                                      |
| @babel/code-frame                                                 | 7.29.7       | MIT                                      |
| @babel/compat-data                                                | 7.29.7       | MIT                                      |
| @babel/core                                                       | 7.29.7       | MIT                                      |
| @babel/generator                                                  | 7.29.8       | MIT                                      |
| @babel/helper-compilation-targets                                 | 7.29.7       | MIT                                      |
| @babel/helper-globals                                             | 7.29.7       | MIT                                      |
| @babel/helper-module-imports                                      | 7.29.7       | MIT                                      |
| @babel/helper-module-transforms                                   | 7.29.7       | MIT                                      |
| @babel/helper-string-parser                                       | 7.29.7       | MIT                                      |
| @babel/helper-validator-identifier                                | 7.29.7       | MIT                                      |
| @babel/helper-validator-option                                    | 7.29.7       | MIT                                      |
| @babel/helpers                                                    | 7.29.7       | MIT                                      |
| @babel/parser                                                     | 7.29.9       | MIT                                      |
| @babel/template                                                   | 7.29.7       | MIT                                      |
| @babel/traverse                                                   | 7.29.8       | MIT                                      |
| @babel/types                                                      | 7.29.8       | MIT                                      |
| @emnapi/core                                                      | 1.10.0       | MIT                                      |
| @emnapi/runtime                                                   | 1.11.3       | MIT                                      |
| @emnapi/wasi-threads                                              | 1.2.1        | MIT                                      |
| @eslint-community/eslint-utils                                    | 4.10.1       | MIT                                      |
| @eslint-community/eslint-utils/node_modules/eslint-visitor-keys   | 3.4.3        | Apache-2.0                               |
| @eslint-community/regexpp                                         | 4.12.2       | MIT                                      |
| @eslint/config-array                                              | 0.21.2       | Apache-2.0                               |
| @eslint/config-helpers                                            | 0.4.2        | Apache-2.0                               |
| @eslint/core                                                      | 0.17.0       | Apache-2.0                               |
| @eslint/eslintrc                                                  | 3.3.7        | MIT                                      |
| @eslint/js                                                        | 9.39.5       | MIT                                      |
| @eslint/object-schema                                             | 2.1.7        | Apache-2.0                               |
| @eslint/plugin-kit                                                | 0.4.1        | Apache-2.0                               |
| @floating-ui/core                                                 | 1.8.0        | MIT                                      |
| @floating-ui/dom                                                  | 1.8.0        | MIT                                      |
| @floating-ui/react-dom                                            | 2.1.9        | MIT                                      |
| @floating-ui/utils                                                | 0.2.12       | MIT                                      |
| @humanfs/core                                                     | 0.19.2       | Apache-2.0                               |
| @humanfs/node                                                     | 0.16.8       | Apache-2.0                               |
| @humanfs/types                                                    | 0.15.0       | Apache-2.0                               |
| @humanwhocodes/module-importer                                    | 1.0.1        | Apache-2.0                               |
| @humanwhocodes/retry                                              | 0.4.3        | Apache-2.0                               |
| @img/colour                                                       | 1.1.0        | MIT                                      |
| @img/sharp-darwin-arm64                                           | 0.35.5       | Apache-2.0                               |
| @img/sharp-darwin-x64                                             | 0.35.5       | Apache-2.0                               |
| @img/sharp-freebsd-wasm32                                         | 0.35.5       | Apache-2.0                               |
| @img/sharp-freebsd-wasm32/node_modules/@img/sharp-wasm32          | 0.35.5       | Apache-2.0 AND LGPL-3.0-or-later AND MIT |
| @img/sharp-libvips-darwin-arm64                                   | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-darwin-x64                                     | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linux-arm                                      | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linux-arm64                                    | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linux-ppc64                                    | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linux-riscv64                                  | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linux-s390x                                    | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linux-x64                                      | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linuxmusl-arm64                                | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-libvips-linuxmusl-x64                                  | 1.3.4        | LGPL-3.0-or-later                        |
| @img/sharp-linux-arm                                              | 0.35.5       | Apache-2.0                               |
| @img/sharp-linux-arm64                                            | 0.35.5       | Apache-2.0                               |
| @img/sharp-linux-ppc64                                            | 0.35.5       | Apache-2.0                               |
| @img/sharp-linux-riscv64                                          | 0.35.5       | Apache-2.0                               |
| @img/sharp-linux-s390x                                            | 0.35.5       | Apache-2.0                               |
| @img/sharp-linux-x64                                              | 0.35.5       | Apache-2.0                               |
| @img/sharp-linuxmusl-arm64                                        | 0.35.5       | Apache-2.0                               |
| @img/sharp-linuxmusl-x64                                          | 0.35.5       | Apache-2.0                               |
| @img/sharp-webcontainers-wasm32                                   | 0.35.5       | Apache-2.0                               |
| @img/sharp-webcontainers-wasm32/node_modules/@img/sharp-wasm32    | 0.35.5       | Apache-2.0 AND LGPL-3.0-or-later AND MIT |
| @img/sharp-win32-arm64                                            | 0.35.5       | Apache-2.0 AND LGPL-3.0-or-later         |
| @img/sharp-win32-ia32                                             | 0.35.5       | Apache-2.0 AND LGPL-3.0-or-later         |
| @img/sharp-win32-x64                                              | 0.35.5       | Apache-2.0 AND LGPL-3.0-or-later         |
| @jridgewell/gen-mapping                                           | 0.3.13       | MIT                                      |
| @jridgewell/remapping                                             | 2.3.5        | MIT                                      |
| @jridgewell/resolve-uri                                           | 3.1.2        | MIT                                      |
| @jridgewell/sourcemap-codec                                       | 1.6.0        | MIT                                      |
| @jridgewell/trace-mapping                                         | 0.3.31       | MIT                                      |
| @napi-rs/wasm-runtime                                             | 1.2.5        | MIT                                      |
| @next/env                                                         | 16.3.8       | MIT                                      |
| @next/swc-darwin-arm64                                            | 16.3.8       | MIT                                      |
| @next/swc-darwin-x64                                              | 16.3.8       | MIT                                      |
| @next/swc-linux-arm64-gnu                                         | 16.3.8       | MIT                                      |
| @next/swc-linux-arm64-musl                                        | 16.3.8       | MIT                                      |
| @next/swc-linux-x64-gnu                                           | 16.3.8       | MIT                                      |
| @next/swc-linux-x64-musl                                          | 16.3.8       | MIT                                      |
| @next/swc-win32-arm64-msvc                                        | 16.3.8       | MIT                                      |
| @next/swc-win32-x64-msvc                                          | 16.3.8       | MIT                                      |
| @oxc-project/types                                                | 0.152.0      | MIT                                      |
| @playwright/test                                                  | 1.63.0       | Apache-2.0                               |
| @radix-ui/number                                                  | 1.1.3        | MIT                                      |
| @radix-ui/primitive                                               | 1.1.7        | MIT                                      |
| @radix-ui/react-accessible-icon                                   | 1.1.15       | MIT                                      |
| @radix-ui/react-accordion                                         | 1.2.20       | MIT                                      |
| @radix-ui/react-alert-dialog                                      | 1.1.23       | MIT                                      |
| @radix-ui/react-arrow                                             | 1.1.15       | MIT                                      |
| @radix-ui/react-aspect-ratio                                      | 1.1.15       | MIT                                      |
| @radix-ui/react-avatar                                            | 1.2.6        | MIT                                      |
| @radix-ui/react-checkbox                                          | 1.3.11       | MIT                                      |
| @radix-ui/react-collapsible                                       | 1.1.20       | MIT                                      |
| @radix-ui/react-collection                                        | 1.1.15       | MIT                                      |
| @radix-ui/react-compose-refs                                      | 1.1.5        | MIT                                      |
| @radix-ui/react-context                                           | 1.2.2        | MIT                                      |
| @radix-ui/react-context-menu                                      | 2.3.7        | MIT                                      |
| @radix-ui/react-dialog                                            | 1.1.23       | MIT                                      |
| @radix-ui/react-direction                                         | 1.1.4        | MIT                                      |
| @radix-ui/react-dismissable-layer                                 | 1.1.19       | MIT                                      |
| @radix-ui/react-dropdown-menu                                     | 2.1.24       | MIT                                      |
| @radix-ui/react-focus-guards                                      | 1.1.6        | MIT                                      |
| @radix-ui/react-focus-scope                                       | 1.1.16       | MIT                                      |
| @radix-ui/react-form                                              | 0.1.16       | MIT                                      |
| @radix-ui/react-hover-card                                        | 1.1.23       | MIT                                      |
| @radix-ui/react-id                                                | 1.1.4        | MIT                                      |
| @radix-ui/react-label                                             | 2.1.15       | MIT                                      |
| @radix-ui/react-menu                                              | 2.1.24       | MIT                                      |
| @radix-ui/react-menubar                                           | 1.1.24       | MIT                                      |
| @radix-ui/react-navigation-menu                                   | 1.2.22       | MIT                                      |
| @radix-ui/react-one-time-password-field                           | 0.1.16       | MIT                                      |
| @radix-ui/react-password-toggle-field                             | 0.1.11       | MIT                                      |
| @radix-ui/react-popover                                           | 1.1.23       | MIT                                      |
| @radix-ui/react-popper                                            | 1.3.7        | MIT                                      |
| @radix-ui/react-portal                                            | 1.1.17       | MIT                                      |
| @radix-ui/react-presence                                          | 1.1.10       | MIT                                      |
| @radix-ui/react-primitive                                         | 2.1.10       | MIT                                      |
| @radix-ui/react-progress                                          | 1.1.16       | MIT                                      |
| @radix-ui/react-radio-group                                       | 1.4.7        | MIT                                      |
| @radix-ui/react-roving-focus                                      | 1.1.19       | MIT                                      |
| @radix-ui/react-scroll-area                                       | 1.2.18       | MIT                                      |
| @radix-ui/react-select                                            | 2.3.7        | MIT                                      |
| @radix-ui/react-separator                                         | 1.1.15       | MIT                                      |
| @radix-ui/react-slider                                            | 1.4.7        | MIT                                      |
| @radix-ui/react-slot                                              | 1.3.3        | MIT                                      |
| @radix-ui/react-switch                                            | 1.3.7        | MIT                                      |
| @radix-ui/react-tabs                                              | 1.1.21       | MIT                                      |
| @radix-ui/react-toast                                             | 1.2.23       | MIT                                      |
| @radix-ui/react-toggle                                            | 1.1.18       | MIT                                      |
| @radix-ui/react-toggle-group                                      | 1.1.19       | MIT                                      |
| @radix-ui/react-toolbar                                           | 1.1.19       | MIT                                      |
| @radix-ui/react-tooltip                                           | 1.2.16       | MIT                                      |
| @radix-ui/react-use-callback-ref                                  | 1.1.4        | MIT                                      |
| @radix-ui/react-use-controllable-state                            | 1.2.6        | MIT                                      |
| @radix-ui/react-use-effect-event                                  | 0.0.5        | MIT                                      |
| @radix-ui/react-use-escape-keydown                                | 1.1.5        | MIT                                      |
| @radix-ui/react-use-is-hydrated                                   | 0.1.3        | MIT                                      |
| @radix-ui/react-use-layout-effect                                 | 1.1.4        | MIT                                      |
| @radix-ui/react-use-previous                                      | 1.1.4        | MIT                                      |
| @radix-ui/react-use-rect                                          | 1.1.4        | MIT                                      |
| @radix-ui/react-use-size                                          | 1.1.4        | MIT                                      |
| @radix-ui/react-visually-hidden                                   | 1.2.11       | MIT                                      |
| @radix-ui/rect                                                    | 1.1.3        | MIT                                      |
| @rolldown/binding-android-arm-eabi                                | 1.2.12       | MIT                                      |
| @rolldown/binding-android-arm64                                   | 1.2.12       | MIT                                      |
| @rolldown/binding-darwin-arm64                                    | 1.2.12       | MIT                                      |
| @rolldown/binding-darwin-x64                                      | 1.2.12       | MIT                                      |
| @rolldown/binding-freebsd-x64                                     | 1.2.12       | MIT                                      |
| @rolldown/binding-linux-arm-gnueabihf                             | 1.2.12       | MIT                                      |
| @rolldown/binding-linux-arm64-gnu                                 | 1.2.12       | MIT                                      |
| @rolldown/binding-linux-arm64-musl                                | 1.2.12       | MIT                                      |
| @rolldown/binding-linux-ppc64-gnu                                 | 1.2.12       | MIT                                      |
| @rolldown/binding-linux-s390x-gnu                                 | 1.2.12       | MIT                                      |
| @rolldown/binding-linux-x64-gnu                                   | 1.2.12       | MIT                                      |
| @rolldown/binding-linux-x64-musl                                  | 1.2.12       | MIT                                      |
| @rolldown/binding-openharmony-arm64                               | 1.2.12       | MIT                                      |
| @rolldown/binding-win32-arm64-msvc                                | 1.2.12       | MIT                                      |
| @rolldown/binding-win32-x64-msvc                                  | 1.2.12       | MIT                                      |
| @rolldown/pluginutils                                             | 1.0.1        | MIT                                      |
| @standard-schema/spec                                             | 1.1.0        | MIT                                      |
| @swc/helpers                                                      | 0.5.23       | Apache-2.0                               |
| @tailwindcss/node                                                 | 4.3.3        | MIT                                      |
| @tailwindcss/oxide                                                | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-android-arm64                                  | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-darwin-arm64                                   | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-darwin-x64                                     | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-freebsd-x64                                    | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-linux-arm-gnueabihf                            | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-linux-arm64-gnu                                | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-linux-arm64-musl                               | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-linux-x64-gnu                                  | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-linux-x64-musl                                 | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-wasm32-wasi                                    | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/core          | 1.11.1       | MIT                                      |
| @tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/runtime       | 1.11.1       | MIT                                      |
| @tailwindcss/oxide-wasm32-wasi/node_modules/@emnapi/wasi-threads  | 1.2.2        | MIT                                      |
| @tailwindcss/oxide-wasm32-wasi/node_modules/@napi-rs/wasm-runtime | 1.1.4        | MIT                                      |
| @tailwindcss/oxide-wasm32-wasi/node_modules/@tybys/wasm-util      | 0.10.2       | MIT                                      |
| @tailwindcss/oxide-wasm32-wasi/node_modules/tslib                 | 2.8.1        | 0BSD                                     |
| @tailwindcss/oxide-win32-arm64-msvc                               | 4.3.3        | MIT                                      |
| @tailwindcss/oxide-win32-x64-msvc                                 | 4.3.3        | MIT                                      |
| @tailwindcss/postcss                                              | 4.3.3        | MIT                                      |
| @tybys/wasm-util                                                  | 0.10.4       | MIT                                      |
| @types/chai                                                       | 5.2.3        | MIT                                      |
| @types/deep-eql                                                   | 4.0.2        | MIT                                      |
| @types/estree                                                     | 1.0.9        | MIT                                      |
| @types/json-schema                                                | 7.0.15       | MIT                                      |
| @types/node                                                       | 22.20.5      | MIT                                      |
| @types/react                                                      | 19.3.0       | MIT                                      |
| @types/react-dom                                                  | 19.3.0       | MIT                                      |
| @typescript-eslint/eslint-plugin                                  | 8.71.0       | MIT                                      |
| @typescript-eslint/eslint-plugin/node_modules/ignore              | 7.0.12       | MIT                                      |
| @typescript-eslint/parser                                         | 8.71.0       | MIT                                      |
| @typescript-eslint/project-service                                | 8.71.0       | MIT                                      |
| @typescript-eslint/scope-manager                                  | 8.71.0       | MIT                                      |
| @typescript-eslint/tsconfig-utils                                 | 8.71.0       | MIT                                      |
| @typescript-eslint/type-utils                                     | 8.71.0       | MIT                                      |
| @typescript-eslint/types                                          | 8.71.0       | MIT                                      |
| @typescript-eslint/typescript-estree                              | 8.71.0       | MIT                                      |
| @typescript-eslint/typescript-estree/node_modules/balanced-match  | 4.0.4        | MIT                                      |
| @typescript-eslint/typescript-estree/node_modules/brace-expansion | 5.0.12       | MIT                                      |
| @typescript-eslint/typescript-estree/node_modules/minimatch       | 10.2.6       | BlueOak-1.0.0                            |
| @typescript-eslint/typescript-estree/node_modules/semver          | 7.8.5        | ISC                                      |
| @typescript-eslint/utils                                          | 8.71.0       | MIT                                      |
| @typescript-eslint/visitor-keys                                   | 8.71.0       | MIT                                      |
| @typescript-eslint/visitor-keys/node_modules/eslint-visitor-keys  | 5.0.1        | Apache-2.0                               |
| @vitest/expect                                                    | 4.1.11       | MIT                                      |
| @vitest/mocker                                                    | 4.1.11       | MIT                                      |
| @vitest/pretty-format                                             | 4.1.11       | MIT                                      |
| @vitest/runner                                                    | 4.1.11       | MIT                                      |
| @vitest/snapshot                                                  | 4.1.11       | MIT                                      |
| @vitest/spy                                                       | 4.1.11       | MIT                                      |
| @vitest/utils                                                     | 4.1.11       | MIT                                      |
| acorn                                                             | 8.19.0       | MIT                                      |
| acorn-jsx                                                         | 5.3.2        | MIT                                      |
| ajv                                                               | 6.15.0       | MIT                                      |
| ansi-styles                                                       | 4.3.0        | MIT                                      |
| argparse                                                          | 2.0.1        | Python-2.0                               |
| aria-hidden                                                       | 1.2.6        | MIT                                      |
| assertion-error                                                   | 2.0.1        | MIT                                      |
| balanced-match                                                    | 1.0.2        | MIT                                      |
| baseline-browser-mapping                                          | 2.11.27      | Apache-2.0                               |
| brace-expansion                                                   | 1.1.21       | MIT                                      |
| browserslist                                                      | 4.29.3       | MIT                                      |
| callsites                                                         | 3.1.0        | MIT                                      |
| caniuse-lite                                                      | 1.0.30001814 | CC-BY-4.0                                |
| chai                                                              | 6.3.0        | MIT                                      |
| chalk                                                             | 4.1.2        | MIT                                      |
| class-variance-authority                                          | 0.7.1        | Apache-2.0                               |
| client-only                                                       | 0.0.1        | MIT                                      |
| clsx                                                              | 2.1.1        | MIT                                      |
| color-convert                                                     | 2.0.1        | MIT                                      |
| color-name                                                        | 1.1.4        | MIT                                      |
| concat-map                                                        | 0.0.1        | MIT                                      |
| convert-source-map                                                | 2.0.0        | MIT                                      |
| cross-spawn                                                       | 7.0.6        | MIT                                      |
| csstype                                                           | 3.2.3        | MIT                                      |
| debug                                                             | 4.4.3        | MIT                                      |
| deep-is                                                           | 0.1.4        | MIT                                      |
| detect-libc                                                       | 2.1.2        | Apache-2.0                               |
| detect-node-es                                                    | 1.1.0        | MIT                                      |
| electron-to-chromium                                              | 1.5.444      | ISC                                      |
| enhanced-resolve                                                  | 5.26.0       | MIT                                      |
| es-module-lexer                                                   | 2.3.2        | MIT                                      |
| escalade                                                          | 3.2.0        | MIT                                      |
| escape-string-regexp                                              | 4.0.0        | MIT                                      |
| eslint                                                            | 9.39.5       | MIT                                      |
| eslint-plugin-react-hooks                                         | 7.1.1        | MIT                                      |
| eslint-scope                                                      | 8.4.0        | BSD-2-Clause                             |
| eslint-visitor-keys                                               | 4.2.1        | Apache-2.0                               |
| espree                                                            | 10.4.0       | BSD-2-Clause                             |
| esquery                                                           | 1.7.0        | BSD-3-Clause                             |
| esrecurse                                                         | 4.3.0        | BSD-2-Clause                             |
| estraverse                                                        | 5.3.0        | BSD-2-Clause                             |
| estree-walker                                                     | 3.0.3        | MIT                                      |
| esutils                                                           | 2.0.3        | BSD-2-Clause                             |
| expect-type                                                       | 1.4.0        | Apache-2.0                               |
| fast-deep-equal                                                   | 3.1.3        | MIT                                      |
| fast-json-stable-stringify                                        | 2.1.0        | MIT                                      |
| fast-levenshtein                                                  | 2.0.6        | MIT                                      |
| fflate                                                            | 0.8.3        | MIT                                      |
| file-entry-cache                                                  | 8.0.0        | MIT                                      |
| find-up                                                           | 5.0.0        | MIT                                      |
| flat-cache                                                        | 4.0.1        | MIT                                      |
| flatted                                                           | 3.4.4        | ISC                                      |
| fsevents                                                          | 2.3.3        | MIT                                      |
| gensync                                                           | 1.0.0-beta.2 | MIT                                      |
| get-nonce                                                         | 1.0.1        | MIT                                      |
| glob-parent                                                       | 6.0.2        | ISC                                      |
| globals                                                           | 14.0.0       | MIT                                      |
| graceful-fs                                                       | 4.2.11       | ISC                                      |
| has-flag                                                          | 4.0.0        | MIT                                      |
| hermes-estree                                                     | 0.25.1       | MIT                                      |
| hermes-parser                                                     | 0.25.1       | MIT                                      |
| ignore                                                            | 5.3.2        | MIT                                      |
| import-fresh                                                      | 3.3.1        | MIT                                      |
| imurmurhash                                                       | 0.1.4        | MIT                                      |
| is-extglob                                                        | 2.1.1        | MIT                                      |
| is-glob                                                           | 4.0.3        | MIT                                      |
| isexe                                                             | 2.0.0        | ISC                                      |
| jiti                                                              | 2.7.0        | MIT                                      |
| js-tokens                                                         | 4.0.0        | MIT                                      |
| js-yaml                                                           | 4.3.2        | MIT                                      |
| jsesc                                                             | 3.1.0        | MIT                                      |
| json-buffer                                                       | 3.0.1        | MIT                                      |
| json-schema-traverse                                              | 0.4.1        | MIT                                      |
| json-stable-stringify-without-jsonify                             | 1.0.1        | MIT                                      |
| json5                                                             | 2.2.3        | MIT                                      |
| keyv                                                              | 4.5.4        | MIT                                      |
| levn                                                              | 0.4.1        | MIT                                      |
| lightningcss                                                      | 1.32.0       | MPL-2.0                                  |
| lightningcss-android-arm64                                        | 1.32.0       | MPL-2.0                                  |
| lightningcss-darwin-arm64                                         | 1.32.0       | MPL-2.0                                  |
| lightningcss-darwin-x64                                           | 1.32.0       | MPL-2.0                                  |
| lightningcss-freebsd-x64                                          | 1.32.0       | MPL-2.0                                  |
| lightningcss-linux-arm-gnueabihf                                  | 1.32.0       | MPL-2.0                                  |
| lightningcss-linux-arm64-gnu                                      | 1.32.0       | MPL-2.0                                  |
| lightningcss-linux-arm64-musl                                     | 1.32.0       | MPL-2.0                                  |
| lightningcss-linux-x64-gnu                                        | 1.32.0       | MPL-2.0                                  |
| lightningcss-linux-x64-musl                                       | 1.32.0       | MPL-2.0                                  |
| lightningcss-win32-arm64-msvc                                     | 1.32.0       | MPL-2.0                                  |
| lightningcss-win32-x64-msvc                                       | 1.32.0       | MPL-2.0                                  |
| locate-path                                                       | 6.0.0        | MIT                                      |
| lodash.merge                                                      | 4.6.2        | MIT                                      |
| lru-cache                                                         | 5.1.1        | ISC                                      |
| lucide-react                                                      | 0.577.0      | ISC                                      |
| magic-string                                                      | 0.30.21      | MIT                                      |
| minimatch                                                         | 3.1.5        | ISC                                      |
| ms                                                                | 2.1.3        | MIT                                      |
| nanoid                                                            | 3.3.20       | MIT                                      |
| natural-compare                                                   | 1.4.0        | MIT                                      |
| next                                                              | 16.3.8       | MIT                                      |
| next/node_modules/postcss                                         | 8.5.23       | MIT                                      |
| node-releases                                                     | 2.0.57       | MIT                                      |
| obug                                                              | 2.2.1        | MIT                                      |
| optionator                                                        | 0.9.4        | MIT                                      |
| p-limit                                                           | 3.1.0        | MIT                                      |
| p-locate                                                          | 5.0.0        | MIT                                      |
| parent-module                                                     | 1.0.1        | MIT                                      |
| path-exists                                                       | 4.0.0        | MIT                                      |
| path-key                                                          | 3.1.1        | MIT                                      |
| pathe                                                             | 2.0.3        | MIT                                      |
| picocolors                                                        | 1.1.1        | ISC                                      |
| picomatch                                                         | 4.0.7        | MIT                                      |
| playwright                                                        | 1.63.0       | Apache-2.0                               |
| playwright-core                                                   | 1.63.0       | Apache-2.0                               |
| postcss                                                           | 8.5.29       | MIT                                      |
| prelude-ls                                                        | 1.2.1        | MIT                                      |
| prettier                                                          | 3.9.9        | MIT                                      |
| punycode                                                          | 2.3.1        | MIT                                      |
| radix-ui                                                          | 1.6.7        | MIT                                      |
| react                                                             | 19.3.0       | MIT                                      |
| react-dom                                                         | 19.3.0       | MIT                                      |
| react-remove-scroll                                               | 2.7.2        | MIT                                      |
| react-remove-scroll-bar                                           | 2.3.8        | MIT                                      |
| react-style-singleton                                             | 2.2.3        | MIT                                      |
| resolve-from                                                      | 4.0.0        | MIT                                      |
| rolldown                                                          | 1.2.12       | MIT                                      |
| scheduler                                                         | 0.28.0       | MIT                                      |
| semver                                                            | 6.3.1        | ISC                                      |
| sharp                                                             | 0.35.5       | Apache-2.0                               |
| sharp/node_modules/semver                                         | 7.8.5        | ISC                                      |
| shebang-command                                                   | 2.0.0        | MIT                                      |
| shebang-regex                                                     | 3.0.0        | MIT                                      |
| siginfo                                                           | 2.0.0        | ISC                                      |
| source-map-js                                                     | 1.2.2        | BSD-3-Clause                             |
| stackback                                                         | 0.0.2        | MIT                                      |
| std-env                                                           | 4.3.0        | MIT                                      |
| strip-json-comments                                               | 3.1.1        | MIT                                      |
| styled-jsx                                                        | 5.1.6        | MIT                                      |
| supports-color                                                    | 7.2.0        | MIT                                      |
| tailwind-merge                                                    | 3.7.0        | MIT                                      |
| tailwindcss                                                       | 4.3.3        | MIT                                      |
| tapable                                                           | 2.3.3        | MIT                                      |
| tinybench                                                         | 2.9.0        | MIT                                      |
| tinyexec                                                          | 1.3.1        | MIT                                      |
| tinyglobby                                                        | 0.2.17       | MIT                                      |
| tinyglobby/node_modules/fdir                                      | 6.5.0        | MIT                                      |
| tinyrainbow                                                       | 3.2.0        | MIT                                      |
| ts-api-utils                                                      | 2.5.0        | MIT                                      |
| tslib                                                             | 2.8.1        | 0BSD                                     |
| type-check                                                        | 0.4.0        | MIT                                      |
| typescript                                                        | 5.9.3        | Apache-2.0                               |
| typescript-eslint                                                 | 8.71.0       | MIT                                      |
| undici-types                                                      | 6.21.0       | MIT                                      |
| update-browserslist-db                                            | 1.3.3        | MIT                                      |
| uri-js                                                            | 4.4.1        | BSD-2-Clause                             |
| use-callback-ref                                                  | 1.3.3        | MIT                                      |
| use-sidecar                                                       | 1.1.3        | MIT                                      |
| vite                                                              | 8.3.2        | MIT                                      |
| vite/node_modules/lightningcss                                    | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-android-arm64                      | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-darwin-arm64                       | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-darwin-x64                         | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-freebsd-x64                        | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-linux-arm-gnueabihf                | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-linux-arm64-gnu                    | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-linux-arm64-musl                   | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-linux-x64-gnu                      | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-linux-x64-musl                     | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-win32-arm64-msvc                   | 1.33.0       | MPL-2.0                                  |
| vite/node_modules/lightningcss-win32-x64-msvc                     | 1.33.0       | MPL-2.0                                  |
| vitest                                                            | 4.1.11       | MIT                                      |
| which                                                             | 2.0.2        | ISC                                      |
| why-is-node-running                                               | 2.3.0        | MIT                                      |
| word-wrap                                                         | 1.2.5        | MIT                                      |
| yallist                                                           | 3.1.1        | ISC                                      |
| yocto-queue                                                       | 0.1.0        | MIT                                      |
| zod                                                               | 4.6.5        | MIT                                      |
| zod-validation-error                                              | 4.0.2        | MIT                                      |

## shadcn/ui

Locally owned primitives follow the shadcn/ui composition pattern with Radix primitives. shadcn/ui is MIT licensed: <https://github.com/shadcn-ui/ui/blob/main/LICENSE.md>. Components are in `src/components/ui/primitives.tsx`.
