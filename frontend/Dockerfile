# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for Expo
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install dependencies with cache mount for faster rebuilds
# RUN --mount=type=cache,target=/root/.npm \
    # npm install

RUN npm install 

# Copy the rest of the application
COPY . .

# Expose ports
# 8081 - Metro bundler
# 19000 - Expo DevTools
# 19001 - Expo DevTools (alternate)
# 19002 - Expo DevTools (alternate)
EXPOSE 8081 19000 19001 19002

# Set environment variables
ENV EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
ENV REACT_NATIVE_PACKAGER_HOSTNAME=0.0.0.0

# Start Expo
CMD ["npx", "expo", "start", "--web", "--host", "lan"]

