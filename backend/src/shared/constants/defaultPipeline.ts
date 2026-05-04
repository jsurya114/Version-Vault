/**
 * Default CI/CD pipeline configuration.
 * This is used internally — no file is created in the user's repository.
 * Just like GitHub runs Actions behind the scenes, Version Vault runs
 * a default pipeline on every push without polluting the user's repo.
 */
export const DEFAULT_PIPELINE = `name: CI Pipeline
on: [push]
jobs:
  build:
    runs-on: node:18
    steps:
      - name: Install Dependencies
        run: |
          if [ -f package.json ]; then npm install; fi
          if [ -d "backend" ] && [ -f "backend/package.json" ]; then cd backend && npm install; fi
          if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then cd frontend && npm install; fi

      - name: Syntax & Type Check
        run: |
          echo "Running syntax check for JavaScript files..."
          find . -type f -name "*.js" -not -path "*/node_modules/*" -exec node -c {} + || exit 1

          echo "Running type and syntax check for TypeScript files..."
          if [ -f tsconfig.json ]; then
            npx -y typescript tsc --noEmit || exit 1
          elif find . -name "*.ts" -not -path "*/node_modules/*" | grep -q .; then
            echo "No root tsconfig.json found, running basic tsc check on all .ts files..."
            npx -y typescript tsc --noEmit --allowJs --target esnext --moduleResolution node --skipLibCheck $(find . -name "*.ts" -not -path "*/node_modules/*") || exit 1
          fi

          if [ -d "backend" ] && [ -f "backend/tsconfig.json" ]; then
            echo "Checking backend TypeScript..."
            cd backend && npx -y typescript tsc --noEmit || exit 1
            cd ..
          fi

          if [ -d "frontend" ] && [ -f "frontend/tsconfig.json" ]; then
            echo "Checking frontend TypeScript..."
            cd frontend && npx -y typescript tsc --noEmit || exit 1
            cd ..
          fi

      - name: Run Tests
        run: |
          if [ -f package.json ] && grep -q '"test"' package.json; then
            npm test || exit 1
          fi
`;
