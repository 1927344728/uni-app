
#!/bin/bash
echo "重启 Spring Boot 应用..."
echo ""

# 先停止
./stop.sh
sleep 2

# 再启动
./start.sh