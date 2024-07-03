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

# Set environment variables
ENV NEXT_PUBLIC_MONGO_URI=mongodb+srv://gio_flawless:flawless123@cluster0.6ednv6t.mongodb.net/
ENV NEXTAUTH_SECRET=ee31rIAF8a0oBPCTJr81r0N5rzS22HEj4e0knj0Xpuk=
ENV NEXT_PUBLIC_JWT_SECRET=Hwl5iWfJNPCIuA+aFruqKRi3ZWds8mprYMiCegLxNQM=
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=312309817214-hs5bigq0sdv9qqtgbujlkmgnfa22qhgl.apps.googleusercontent.com
ENV NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=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
ENV NEXTAUTH_URL=https://calendar-reservation-enq3ce7zja-wl.a.run.app
ENV NEXT_PUBLIC_ADMIN_EMAIL=gioedrianlyap7@gmail.com
ENV NEXT_PUBLIC_BASE_URL=https://calendar-reservation-enq3ce7zja-wl.a.run.app
ENV NEXT_PUBLIC_EMAIL_USER=reservation.system05@gmail.com
ENV NEXT_PUBLIC_EMAIL_PASS="zcol tgqw vpzs qnvl"
ENV NODE_ENV=production
ENV EXPRESS_PORT=3001

# Build the Next.js app
RUN npm run build-next

EXPOSE 3000

# Command to run Next.js in production mode
CMD ["npm", "run", "start-next"]
