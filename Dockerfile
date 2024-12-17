# 使用 Python 官方镜像作为基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 将当前目录下的所有文件复制到容器中的 /app 目录
COPY . /app

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 启动 Flask 服务
CMD ["python", "app.py"]

# 开放 Flask 默认端口
EXPOSE 5000
