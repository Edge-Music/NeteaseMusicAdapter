FROM node:18-alpine
WORKDIR /app

# 设置 npm 淘宝源
RUN npm config set registry https://registry.npmmirror.com

# 安装依赖
COPY package*.json ./
RUN npm install

# 复制源码并构建
COPY . .
RUN npm run build

EXPOSE 7001
CMD ["npm", "run", "start"]
