/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'lucide-react/dynamicIconImports.mjs' {
  const dynamicIconImports: Record<string, () => Promise<any>>;
  export default dynamicIconImports;
}
