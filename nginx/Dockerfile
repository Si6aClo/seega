FROM node:16.18-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package.json package.json
COPY frontend/package-lock.json package-lock.json
RUN npm install

COPY frontend/create-env-file.sh create-env-file.sh
ARG REACT_APP_API_URL
ARG REACT_APP_WS_URL
RUN sh create-env-file.sh REACT_APP_API_URL=$REACT_APP_API_URL REACT_APP_WS_URL=$REACT_APP_WS_URL

COPY frontend/ .
RUN npm run build

FROM nginx:1.25

RUN rm /etc/nginx/conf.d/default.conf
COPY --from=frontend-builder /frontend/build /home/frontend
COPY --from=frontend-builder /frontend/.env /home/frontend/.env
COPY nginx/nginx.conf /etc/nginx/conf.d
