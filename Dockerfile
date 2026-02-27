FROM node:18-alpine
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源码并构建
COPY . .
RUN npm run build

EXPOSE 7001
CMD ["npm", "run", "start"]
