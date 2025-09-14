    # Use a Node.js base image for building
    FROM node:alpine AS builder

    # Set the working directory inside the container
    WORKDIR /app

    # Copy package.json and package-lock.json (or yarn.lock)
    COPY package*.json ./

    # Install dependencies
    RUN npm install

    # Copy the rest of the application code
    COPY . .

    # Build the Vite application for production
    RUN npm run build

    # Use a lightweight Nginx base image for serving the built application
    FROM nginx:alpine

    # Copy the built assets from the builder stage to Nginx's web root
    COPY --from=builder /app/dist /usr/share/nginx/html

    # Expose port 80 for Nginx
    EXPOSE 80

    # Start Nginx
    CMD ["nginx", "-g", "daemon off;"]