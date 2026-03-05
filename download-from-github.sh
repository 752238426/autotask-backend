#!/bin/bash

# Sealos 终端从 GitHub 下载脚本
# 使用方法: chmod +x download-from-github.sh && ./download-from-github.sh

echo "========================================="
echo "  从 GitHub 下载 AutoTaskApp 后端文件"
echo "========================================="
echo ""

# GitHub 仓库信息
REPO="752238426/autotask-backend"
BRANCH="main"

# 检查是否安装了 git
if command -v git &> /dev/null; then
    echo "✅ 检测到 git 已安装"
    echo ""
    echo ">>> 方法 1: 使用 git 克隆整个仓库"
    echo "----------------------------------------"

    # 备份当前目录（如果需要）
    if [ -d "backup" ]; then
        rm -rf backup
    fi
    mkdir -p backup

    # 备份现有文件
    echo ">>> 备份现有文件到 backup 目录..."
    cp -r ./* backup/ 2>/dev/null || true

    # 克隆仓库
    echo ">>> 正在从 GitHub 克隆仓库..."
    git clone https://github.com/${REPO}.git temp-repo

    if [ $? -eq 0 ]; then
        echo "✅ 仓库克隆成功"
        echo ""

        # 复制关键文件
        echo ">>> 复制文件到当前目录..."
        cp temp-repo/server.js ./
        cp temp-repo/package.json ./

        # 复制 modules 目录
        if [ -d "temp-repo/modules" ]; then
            cp -r temp-repo/modules/* ./modules/
            echo "✅ 模块文件已复制"
        fi

        # 清理临时文件
        rm -rf temp-repo

        echo ""
        echo "✅ 文件下载完成！"
        echo ""
        echo "下载的文件列表："
        ls -lh server.js package.json modules/

    else
        echo "❌ git 克隆失败，尝试使用 wget 方法..."
        echo ""
    fi
else
    echo "⚠️  未检测到 git，使用 wget 方法..."
    echo ""
fi

# 方法 2: 使用 wget 下载单个文件
if ! command -v git &> /dev/null || [ ! -f "server.js" ]; then
    echo ">>> 方法 2: 使用 wget 下载单个文件"
    echo "----------------------------------------"

    # 检查 wget 是否可用
    if ! command -v wget &> /dev/null; then
        echo ">>> 安装 wget..."
        apk add --no-cache wget
    fi

    echo ">>> 下载 server.js..."
    wget -O server.js https://raw.githubusercontent.com/${REPO}/${BRANCH}/server.js

    echo ">>> 下载 package.json..."
    wget -O package.json https://raw.githubusercontent.com/${REPO}/${BRANCH}/package.json

    # 确保 modules 目录存在
    mkdir -p modules

    echo ">>> 下载模块文件..."
    wget -O modules/auth.js https://raw.githubusercontent.com/${REPO}/${BRANCH}/modules/auth.js
    wget -O modules/config.js https://raw.githubusercontent.com/${REPO}/${BRANCH}/modules/config.js
    wget -O modules/update.js https://raw.githubusercontent.com/${REPO}/${BRANCH}/modules/update.js
    wget -O modules/appList.js https://raw.githubusercontent.com/${REPO}/${BRANCH}/modules/appList.js

    echo ""
    echo "✅ 文件下载完成！"
    echo ""
fi

# 验证文件
echo ">>> 验证下载的文件..."
echo "----------------------------------------"
FILES_OK=true

if [ ! -f "server.js" ]; then
    echo "❌ server.js 下载失败"
    FILES_OK=false
else
    echo "✅ server.js ($(stat -c%s server.js) bytes)"
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json 下载失败"
    FILES_OK=false
else
    echo "✅ package.json ($(stat -c%s package.json) bytes)"
fi

MODULES=("auth" "config" "update" "appList")
for module in "${MODULES[@]}"; do
    if [ ! -f "modules/${module}.js" ]; then
        echo "❌ modules/${module}.js 下载失败"
        FILES_OK=false
    else
        echo "✅ modules/${module}.js ($(stat -c%s modules/${module}.js) bytes)"
    fi
done

echo ""
if [ "$FILES_OK" = true ]; then
    echo "🎉 所有文件下载成功！"
    echo ""
    echo "接下来的步骤："
    echo "1. 检查文件内容: cat server.js"
    echo "2. 如果需要安装新依赖: npm install"
    echo "3. 重启应用: pm2 restart all (如果使用 pm2)"
    echo "   或: node server.js (直接运行)"
    echo ""
else
    echo "⚠️  部分文件下载失败，请检查网络连接或重试"
    echo ""
fi

# 提供快速重启命令
echo "快速重启命令："
echo "----------------------------------------"
if command -v pm2 &> /dev/null; then
    echo "pm2 restart all"
else
    echo "# 停止当前运行的进程（如果有）"
    echo "pkill -f 'node server.js'"
    echo ""
    echo "# 启动新版本"
    echo "node server.js &"
fi

echo ""
echo "========================================="
echo "  下载脚本执行完成"
echo "========================================="
