# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package descriptors and lockfiles
COPY package*.json ./

# Install packages
RUN npm install

# Copy source assets
COPY . .

# Build for production
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy compiled distribution from build stage
COPY --from=build /app/dist ./dist

# Install a light serve daemon globally
RUN npm install -g serve

EXPOSE 3000

# Start server
CMD ["serve", "-s", "dist", "-l", "3000"]
