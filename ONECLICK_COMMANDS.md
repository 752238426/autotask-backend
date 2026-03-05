# Sealos 终端一键下载命令集合

## 🚀 超级简单版（推荐新手）

直接复制以下命令到 Sealos 终端执行，会自动下载所有文件并重启应用：

```bash
apk add --no-cache git && git clone https://github.com/752238426/autotask-backend.git temp && cp temp/server.js . && cp temp/package.json . && cp -r temp/modules/* ./modules/ && rm -rf temp && echo "✅ 下载完成" && pm2 restart all && sleep 3 && curl http://localhost:3000/api/test
```

---

## 📦 标准版（带验证）

这个版本会验证文件是否下载成功：

```bash
apk add --no-cache git && git clone https://github.com/752238426/autotask-backend.git temp && cp temp/server.js . && cp temp/package.json . && cp -r temp/modules/* ./modules/ && rm -rf temp && ls -lh server.js package.json modules/ && echo "✅ 文件下载完成" && pm2 restart all && echo "✅ 应用已重启"
```

---

## 🔧 完整版（带备份和详细日志）

这个版本会备份现有文件，并显示详细的执行过程：

```bash
echo "🚀 开始从 GitHub 下载文件..." && apk add --no-cache git && mkdir -p backup && cp server.js package.json backup/ 2>/dev/null || true && cp -r modules backup/ 2>/dev/null || true && echo "📦 备份完成" && git clone https://github.com/752238426/autotask-backend.git temp && cp temp/server.js . && cp temp/package.json . && cp -r temp/modules/* ./modules/ && rm -rf temp && echo "✅ 文件下载完成" && echo "📋 下载的文件：" && ls -lh server.js package.json modules/ && pm2 restart all && echo "✅ 应用已重启" && sleep 5 && echo "🧪 测试 API：" && curl http://localhost:3000/api/test
```

---

## ⚡ 最快版（无验证）

如果您确定一切正常，可以使用这个最快版本：

```bash
apk add --no-cache git && git clone https://github.com/752238426/autotask-backend.git temp && cp temp/server.js . && cp temp/package.json . && cp -r temp/modules/* ./modules/ && rm -rf temp && pm2 restart all
```

---

## 🌐 使用 wget 版本（如果 git 不可用）

如果您的环境中 git 不可用，可以使用 wget 版本：

```bash
apk add --no-cache wget && wget -O server.js https://raw.githubusercontent.com/752238426/autotask-backend/main/server.js && wget -O package.json https://raw.githubusercontent.com/752238426/autotask-backend/main/package.json && mkdir -p modules && wget -O modules/auth.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/auth.js && wget -O modules/config.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/config.js && wget -O modules/update.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/update.js && wget -O modules/appList.js https://raw.githubusercontent.com/752238426/autotask-backend/main/modules/appList.js && echo "✅ 下载完成" && pm2 restart all
```

---

## 📝 分步执行版（便于调试）

如果您想看到每一步的执行结果，可以使用这个分步版本：

```bash
echo "第1步：安装 git..." && apk add --no-cache git && \
echo "第2步：克隆仓库..." && git clone https://github.com/752238426/autotask-backend.git temp && \
echo "第3步：复制 server.js..." && cp temp/server.js . && \
echo "第4步：复制 package.json..." && cp temp/package.json . && \
echo "第5步：复制模块文件..." && cp -r temp/modules/* ./modules/ && \
echo "第6步：清理临时文件..." && rm -rf temp && \
echo "第7步：验证文件..." && ls -lh server.js package.json modules/ && \
echo "第8步：重启应用..." && pm2 restart all && \
echo "✅ 全部完成！"
```

---

## 🎯 推荐使用顺序

1. **新手用户**：使用"超级简单版"
2. **想要验证**：使用"标准版"
3. **需要安全**：使用"完整版"
4. **追求速度**：使用"最快版"
5. **git 不可用**：使用"wget 版本"
6. **需要调试**：使用"分步执行版"

---

## 📋 命令说明

所有命令都会执行以下操作：

1. ✅ 安装必要的工具（git 或 wget）
2. ✅ 从 GitHub 下载文件
3. ✅ 复制文件到正确位置
4. ✅ 清理临时文件
5. ✅ 重启应用
6. ✅ 验证下载成功（部分版本）

---

## 🔍 验证下载成功

执行完命令后，您可以验证：

```bash
# 检查文件是否存在
ls -lh server.js package.json modules/

# 测试应用是否正常运行
curl http://localhost:3000/api/test

# 预期响应
{
  "status": "ok",
  "message": "AutoTaskApp API is running"
}
```

---

## ⚠️ 注意事项

1. **网络连接**：确保 Sealos 终端可以访问 GitHub
2. **权限问题**：确保有写入权限
3. **备份**：建议使用"完整版"以自动备份现有文件
4. **重启**：所有命令都会自动重启应用

---

## 🆘 如果命令执行失败

1. **检查网络**：`ping github.com`
2. **检查权限**：`ls -la` 查看当前目录权限
3. **查看错误**：命令会显示错误信息
4. **手动重试**：可以分段执行命令

---

## 📞 快速参考

| 版本 | 特点 | 适用场景 |
|------|------|----------|
| 超级简单版 | 最简单，自动测试 | 新手，快速更新 |
| 标准版 | 带文件验证 | 需要确认下载成功 |
| 完整版 | 备份+详细日志 | 生产环境，需要安全 |
| 最快版 | 无验证，最快 | 熟悉用户，多次更新 |
| wget 版本 | 不依赖 git | git 不可用的情况 |
| 分步执行版 | 显示每一步 | 调试和排查问题 |

---

## 🎉 总结

选择任意一个命令，复制到 Sealos 终端执行即可！

**推荐新手使用：**
```bash
apk add --no-cache git && git clone https://github.com/752238426/autotask-backend.git temp && cp temp/server.js . && cp temp/package.json . && cp -r temp/modules/* ./modules/ && rm -rf temp && echo "✅ 下载完成" && pm2 restart all && sleep 3 && curl http://localhost:3000/api/test
```

就这么简单！一条命令完成所有操作！
