FROM node:20-alpine

WORKDIR /app

# Copy package files first for dependency caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application files
COPY . .

# Expose port
EXPOSE 7001

# Command to run the application
CMD ["node", "server.js"]
