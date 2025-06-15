# Use Node to run React in development mode
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only package.json first (for caching install)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the files
COPY . .

# Expose port 3000 instead of 5173
EXPOSE 3000

# Start dev server on port 3000
CMD ["npm", "run", "dev", "--", "--host", "--port", "3000"]