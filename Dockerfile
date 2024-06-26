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

# Set environment variables
ENV NEXT_PUBLIC_MONGO_URI=mongodb+srv://gio_flawless:flawless123@cluster0.6ednv6t.mongodb.net/
ENV NEXTAUTH_SECRET=ee31rIAF8a0oBPCTJr81r0N5rzS22HEj4e0knj0Xpuk=
ENV NEXT_PUBLIC_JWT_SECRET=Hwl5iWfJNPCIuA+aFruqKRi3ZWds8mprYMiCegLxNQM=
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=312309817214-hs5bigq0sdv9qqtgbujlkmgnfa22qhgl.apps.googleusercontent.com
ENV NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=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
ENV NEXTAUTH_URL=https://calendarreservation-423300.df.r.appspot.com
ENV NEXT_PUBLIC_ADMIN_EMAIL=gioedrianlyap7@gmail.com
ENV NEXT_PUBLIC_BASE_URL=https://calendarreservation-423300.df.r.appspot.com
ENV NEXT_PUBLIC_EMAIL_USER=reservation.system05@gmail.com
ENV NEXT_PUBLIC_EMAIL_PASS="zcol tgqw vpzs qnvl"
ENV NODE_ENV=production
ENV EXPRESS_PORT=3001

# Build the Next.js app
RUN npm run build-next

# Stage 2: Set up the production environment
FROM node:20
WORKDIR /app

# Copy the built application
COPY --from=builder /app .

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Install Nginx
RUN apt-get update && apt-get install -y nginx

# Expose the port for Nginx
EXPOSE 3001

# Start Nginx and the Node.js app
CMD service nginx start && npm start
