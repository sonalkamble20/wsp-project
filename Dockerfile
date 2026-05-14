# Use the official Node.js image
FROM node:20-slim

# Create and change to the app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install --ignore-scripts
RUN npm install --prefix client

# Copy the rest of the code
COPY . .

# Build the Vue frontend
RUN npm run build

# Expose the port (Cloud Run uses PORT environment variable)
ENV PORT=8080
EXPOSE 8080

# Start the server
# Note: This will also run the seed script as defined in package.json start
CMD ["npm", "start"]
