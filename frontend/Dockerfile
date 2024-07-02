# Use an official Node version 10 image as a parent image
FROM node:14-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json into the container
COPY package*.json ./

# Install dependenciesdok
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 (assuming your React app runs on this port)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
