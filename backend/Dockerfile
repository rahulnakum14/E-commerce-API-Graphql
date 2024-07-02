FROM node:16
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
# Bundle app source
COPY . .
EXPOSE 80
CMD [ "npm", "run", "dev" ]
 









# /* Old filel*/




# # Use an official Node.js runtime as a parent image
# FROM node:14-alpine

# # Create and set the working directory
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy the rest of the application source code
# COPY . .

# # Expose the port the server will run on
# EXPOSE 4000

# # Command to run the GraphQL server
# CMD ["npm", "run", "start"]
