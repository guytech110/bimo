FROM node:20-alpine

WORKDIR /app

# Copy CLI dist (assumes CI builds packages/cli/dist before building the image)
COPY dist ./dist
COPY index.js ./index.js

RUN cd dist && npm install --omit=dev --no-audit --no-fund

# Default to printing help
ENTRYPOINT ["node", "/app/dist/index.js"]
CMD ["--help"]


