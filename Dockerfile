# Multi-stage build for Node.js application
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for development)
FROM base AS runtime

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Install ALL dependencies (including dev dependencies for drizzle-kit)
RUN npm install

# Copy application code
COPY --chown=nodejs:nodejs . .

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "fetch('http://localhost:3000/health').then(() => process.exit(0)).catch(() => process.exit(1))" || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "src/index.js"]
