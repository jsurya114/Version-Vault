"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PIPELINE = void 0;
/**
 * Default CI/CD pipeline configuration.
 * This is used internally — no file is created in the user's repository.
 * Just like GitHub runs Actions behind the scenes, Version Vault runs
 * a default pipeline on every push without polluting the user's repo.
 */
exports.DEFAULT_PIPELINE = `name: CI Pipeline
on: [push]
jobs:
  build:
    runs-on: node:18
    steps:
      - name: Install root dependencies
        run: if [ -f package.json ]; then npm install; else echo "No root package.json found, skipping."; fi
      
      - name: Install backend dependencies
        run: if [ -d "backend" ] && [ -f "backend/package.json" ]; then cd backend && npm install; else echo "No backend package.json found, skipping."; fi
      
      - name: Install frontend dependencies
        run: if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then cd frontend && npm install; else echo "No frontend package.json found, skipping."; fi

      - name: Check JavaScript Syntax
        run: for file in $(find . -name "*.js" -not -path "*/node_modules/*" 2>/dev/null); do node -c "$file" || exit 1; done
      
      - name: TypeScript check root
        run: if [ -f tsconfig.json ]; then npx tsc --noEmit || exit 1; else echo "No root tsconfig.json found, skipping."; fi
      
      - name: TypeScript check backend
        run: if [ -d "backend" ] && [ -f "backend/tsconfig.json" ]; then cd backend && npx tsc --noEmit || exit 1; else echo "No backend tsconfig.json found, skipping."; fi
      
      - name: TypeScript check frontend
        run: if [ -d "frontend" ] && [ -f "frontend/tsconfig.json" ]; then cd frontend && npx tsc --noEmit || exit 1; else echo "No frontend tsconfig.json found, skipping."; fi

      - name: Run root tests
        run: if [ -f package.json ] && grep -q '"test"' package.json; then npm test || exit 1; else echo "No root tests defined, skipping."; fi
`;
