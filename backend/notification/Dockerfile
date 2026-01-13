FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript (for production)
RUN npm run build

# Run the service in dev mode by default
# Override with docker-compose for different environments
CMD ["npm", "run", "dev"]
