# Serves the Pixel Dojo design prototype (export/) as a static site.
# No build step, no dependencies — just Node serving static files.
FROM node:20-alpine
WORKDIR /app
COPY server.mjs ./
COPY export ./export
ENV SERVE_DIR=export
ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.mjs"]
