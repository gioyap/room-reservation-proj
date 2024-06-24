# Use the official Node.js image from the Docker Hub
FROM node:22

# Create and change to the app directory
WORKDIR /app

# Copy application dependency manifests to the container image
COPY package*.json ./

# Install production dependencies using --omit=dev
RUN npm install --omit=dev

# Copy local code to the container image
COPY . .

# Build the Next.js app
RUN npm run build-next

# Run the web service on container startup
CMD [ "npm", "start" ]

# Inform Docker that the container is listening on the specified port
EXPOSE 3001
