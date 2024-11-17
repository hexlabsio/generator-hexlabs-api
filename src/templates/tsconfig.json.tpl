{
  "compilerOptions": {
    "module": "ESNext",
    "target": "ES2022",
    "outDir": "build",
    "sourceMap": true,
    "declaration": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "types": ["node", "jest"],
    "allowJs": true
  },
  "ts-node": {
    "esm": true,
    "experimentalSpecifierResolution": "node"
  },
  "include": ["src/**/*.ts", "generated/**/*.ts", "stack/**/*.ts"],
  "exclude": ["node_modules"]
}
