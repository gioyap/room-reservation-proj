# Use the official Node.js image from the Docker Hub
FROM node:20 AS builder

# Create and change to the app directory
WORKDIR /app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install production dependencies using --omit=dev
RUN npm install --omit=dev

# Copy local code to the container image
COPY . .

# Install ESLint
RUN npm install --save-dev eslint

# Install @types/bcryptjs
RUN npm install --save-dev @types/bcryptjs

# Build the Next.js app
RUN npm run build-next

EXPOSE 3000

# Command to run Next.js in production mode
CMD ["npm", "run", "start-next"]
