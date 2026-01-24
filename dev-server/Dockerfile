FROM node:18-alpine

WORKDIR /app

# Copy package files from /api (single source of truth)
COPY api/package*.json ./
COPY api/tsconfig.json ./
COPY api/nodemon.json ./

# Install all dependencies
RUN npm install

# Copy source files
COPY api/ ./api/
COPY dev-server/ ./dev-server/

# Expose port
EXPOSE 3001

# Start dev server with hot reload
CMD ["npm", "run", "dev"]
