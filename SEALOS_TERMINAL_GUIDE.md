# Sealos 终端从 GitHub 下载文件指南

## 快速开始（3步完成）

### 步骤 1: 进入 Sealos 应用终端

1. 登录 Sealos 控制台: https://cloud.sealos.io
2. 找到 `autotask-backend` 应用
3. 点击进入应用详情
4. 找到"终端"或"Terminal"按钮
5. 点击进入终端

### 步骤 2: 下载并执行脚本

在终端中执行以下命令：

```bash
# 下载脚本
wget https://raw.githubusercontent.com/752238426/autotask-backend/main/download-from-github.sh

# 赋予执行权限
chmod +x download-from-github.sh

# 执行脚本
./download-from-github.sh
```

### 步骤 3: 重启应用

脚本执行完成后，根据提示重启应用：

```bash
# 如果使用 pm2
pm2 restart all

# 或者直接重启
pkill -f 'node server.js'
node server.js &
```

---

## 手动操作方法

如果脚本无法使用，可以手动执行以下命令：

### 方法 1: 使用 git（推荐）

```bash
# 安装 git
apk add --no-cache git

# 克隆仓库
git clone https://github.com/752238426/autotask-backend.git temp-repo

# 复制文件
cp temp-repo/server.js ./
cp temp-repo/package.json ./
cp -r temp-repo/modules/* ./modules/

# 清理
rm -rf temp-repo

# 安装依赖（如果需要）
npm install

# 重启应用
pm2 restart all
```

### 方法 2: 使用 wget 逐个下载

```bash
# 安装 wget
apk add --no-cache wget

# 下载主文件
wget https://raw.githubusercontent.com/752238426/autotask-backend/main/server.js
wget https://raw.githubusercontent.com/752238426/autotask-backend/main/package.json

# 创建 modules 目录
mkdir -p modules

# 下载模块文件
wget -O modules/auth.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/auth.js
wget -O modules/config.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/config.js
wget -O modules/update.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/update.js
wget -O modules/appList.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/appList.js

# 验证文件
ls -lh server.js package.json modules/

# 重启应用
pm2 restart all
```

---

## 验证下载成功

### 检查文件是否存在

```bash
# 检查主文件
ls -lh server.js package.json

# 检查模块文件
ls -lh modules/

# 查看文件内容（可选）
cat server.js | head -20
```

### 测试应用是否正常运行

```bash
# 测试 API 接口
curl http://localhost:3000/api/test

# 测试健康检查
curl http://localhost:3000/health
```

预期响应：
```json
{
  "status": "ok",
  "message": "AutoTaskApp API is running",
  "environment": "production"
}
```

---

## 常见问题

### 问题 1: wget 或 git 命令不存在

**解决方案：**
```bash
# Alpine Linux (Sealos 默认)
apk add --no-cache git wget curl

# 检查是否安装成功
git --version
wget --version
```

### 问题 2: 下载失败或网络超时

**解决方案：**
```bash
# 使用 curl 代替 wget
curl -o server.js https://raw.githubusercontent.com/752238426/autotask-backend/main/server.js

# 或增加 wget 超时时间
wget --timeout=30 --tries=3 https://raw.githubusercontent.com/752238426/autotask-backend/main/server.js
```

### 问题 3: 文件权限问题

**解决方案：**
```bash
# 修改文件权限
chmod 644 server.js package.json modules/*.js

# 如果需要执行权限
chmod +x server.js
```

### 问题 4: 应用启动失败

**解决方案：**
```bash
# 检查错误日志
pm2 logs

# 或查看应用日志
tail -f /var/log/app.log

# 检查依赖是否安装
npm install

# 检查 Node.js 版本
node --version
```

---

## 一键更新命令（复制粘贴即可）

将以下命令复制到 Sealos 终端中一次性执行：

```bash
apk add --no-cache git wget curl && \
git clone https://github.com/752238426/autotask-backend.git temp-repo && \
cp temp-repo/server.js ./ && \
cp temp-repo/package.json ./ && \
cp -r temp-repo/modules/* ./modules/ && \
rm -rf temp-repo && \
echo "✅ 文件下载完成" && \
ls -lh server.js package.json modules/ && \
pm2 restart all && \
echo "✅ 应用已重启" && \
sleep 5 && \
curl http://localhost:3000/api/test
```

---

## 文件清单

下载完成后，您应该有以下文件：

```
backend/
├── server.js              # 主服务器文件
├── package.json           # 项目配置文件
└── modules/
    ├── auth.js           # 认证模块
    ├── config.js         # 配置模块
    ├── update.js         # 更新模块
    └── appList.js        # 应用列表模块
```

---

## 后续操作

### 1. 验证应用功能

```bash
# 测试各个 API 接口
curl http://localhost:3000/api/test
curl http://localhost:3000/health
curl http://localhost:3000/
```

### 2. 查看应用日志

```bash
# 如果使用 pm2
pm2 logs

# 或直接查看
tail -f /var/log/app.log
```

### 3. 监控应用状态

```bash
# 查看进程状态
pm2 status

# 或查看端口监听
netstat -tlnp | grep 3000
```

---

## 快速参考

| 操作 | 命令 |
|------|------|
| 下载脚本 | `wget https://raw.githubusercontent.com/752238426/autotask-backend/main/download-from-github.sh` |
| 执行脚本 | `chmod +x download-from-github.sh && ./download-from-github.sh` |
| 重启应用 | `pm2 restart all` |
| 查看日志 | `pm2 logs` |
| 测试 API | `curl http://localhost:3000/api/test` |

---

## 技术支持

如果遇到问题：

1. 检查网络连接是否正常
2. 确认 GitHub 仓库地址是否正确
3. 查看应用日志获取错误信息
4. 确认 Node.js 和 npm 版本是否兼容

---

## 总结

通过本指南，您可以：

✅ 在 Sealos 终端中从 GitHub 下载文件
✅ 使用自动化脚本简化操作
✅ 手动下载单个文件作为备选方案
✅ 验证文件下载和应用运行状态
✅ 快速重启应用使更改生效

**最简单的方法：** 复制上面的一键更新命令到终端执行即可！
