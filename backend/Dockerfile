# Node.js base image
FROM node:18-alpine
WORKDIR /app
# Install dependencies
COPY package.json .
RUN npm install
# Copy code
COPY index.js .
# Expose port 3000
EXPOSE 3000
# Start backend
CMD ["npm", "start"]