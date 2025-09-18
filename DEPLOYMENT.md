# 生产环境部署说明

## 构建项目
```bash
npm run build
```

## Nginx 配置

1. 将 `nginx.conf.example` 中的配置添加到您的 nginx 配置文件中
2. 修改以下配置项：
   - `server_name`: 替换为您的域名
   - `root /path/to/your/dist`: 替换为构建后的 dist 目录路径
   - `proxy_pass http://localhost:8080`: 替换为您的后端服务器地址
   - SSL 证书路径（如果使用 HTTPS）

## 关键配置说明

### WebSocket 代理配置
```nginx
location /ws {
    proxy_pass http://localhost:8080/ws;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    # ... 其他配置
}
```

### API 代理配置
```nginx
location /api/ {
    proxy_pass http://localhost:8080/;
    # ... 其他配置
}
```

## 部署流程

1. 在服务器上构建项目：`npm run build`
2. 将 `dist` 目录部署到 nginx 静态文件目录
3. 配置 nginx 代理规则
4. 重启 nginx：`sudo systemctl restart nginx`
5. 确保后端服务运行在配置的端口（默认 8080）

## 测试

1. 访问您的域名，检查前端是否正常加载
2. 测试 WebSocket 连接是否正常
3. 检查浏览器开发者工具的网络面板，确认请求正确转发

## 注意事项

- WebSocket 连接在生产环境中使用相对路径 `/ws`
- 所有 API 请求使用相对路径 `/api/`
- nginx 负责将这些请求代理到后端服务器
- 如果使用 HTTPS，确保 WebSocket 连接也使用 WSS 协议