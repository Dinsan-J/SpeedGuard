# Build Stage for Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /SGuard/frontend
COPY Frontend/package*.json ./
RUN npm install
COPY Frontend/ ./
RUN npm run build

# Final Stage for Backend & Production
FROM node:18-alpine
WORKDIR /SGuard
COPY Backend/package*.json ./
RUN npm install --production
COPY Backend/ ./
# Copy frontend build to backend's public directory
COPY --from=frontend-builder /SGuard/frontend/dist ./public

EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production
ENV MONGO_URI=mongodb+srv://deenu1835:34KHQ06RIPML92sS@cluster0.sr16oht.mongodb.net/test?retryWrites=true&w=majority
ENV JWT_SECRET=meetmeinthecloud@7_30
CMD ["npm", "start"]
