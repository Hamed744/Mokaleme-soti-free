# Use the official Node.js image with a more recent version
FROM node:20

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy application code and environment variables
COPY . .

# Build the app
RUN npm run build

# Expose the port the app runs on
EXPOSE 3001

# Set environment variable for production
ENV NODE_ENV=production

# Run the server
CMD [ "npm", "run", "start-server" ] 