# Java AI 项目

这是一个基于 Java 的 AI 项目。

## 项目结构

```
java-ai/
├── src/                    # 源代码目录
│   ├── main/              # 主要源代码
│   │   ├── java/         # Java 源代码文件
│   │   │   └── com/      # 公司/组织包名
│   │   │       └── lizhao/ # 项目包名
│   │   │           ├── controller/  # 控制器层，处理请求响应
│   │   │           ├── service/     # 服务层，处理业务逻辑
│   │   │           ├── repository/  # 数据访问层
│   │   │           ├── model/       # 数据模型层
│   │   │           ├── util/        # 工具类
│   │   │           └── Main.java    # 程序入口
│   │   └── resources/    # 资源文件目录（配置文件、静态资源等）
│   └── test/             # 测试代码目录
```

## 目录说明

- `src/`: 项目的源代码根目录
  - `main/`: 包含项目的主要源代码
    - `java/`: 存放所有的 Java 源代码文件
      - `com/`: 公司/组织包名
        - `lizhao/`: 项目包名
          - `controller/`: 控制器层，负责处理 HTTP 请求和响应
          - `service/`: 服务层，包含核心业务逻辑
          - `repository/`: 数据访问层，负责与数据库交互
          - `model/`: 数据模型层，定义实体类和 DTO
          - `util/`: 工具类目录，存放通用工具方法
          - `Main.java`: 应用程序的入口类
    - `resources/`: 存放项目所需的资源文件，如配置文件、静态资源等
  - `test/`: 存放项目的测试代码

## 开发环境要求

- JDK 版本：待定
- 构建工具：待定
- 其他依赖：待定

## 如何运行

### 编译项目

```bash
# 在项目根目录下执行
javac src/main/java/com/lizhao/Main.java
```

### 运行项目

```bash
# 在项目根目录下执行
java -cp src/main/java com.lizhao.Main
```

## 如何调试

### 使用 JDB 调试

1. 编译时添加调试信息：
```bash
javac -g src/main/java/com/lizhao/Main.java
```

2. 启动 JDB：
```bash
jdb -classpath src/main/java com.lizhao.Main
```

3. 常用 JDB 命令：
- `stop at com.lizhao.Main:10` - 在第10行设置断点
- `run` - 运行程序
- `step` - 单步执行
- `next` - 单步跳过
- `print variable` - 打印变量值
- `cont` - 继续执行
- `quit` - 退出调试器

### 使用 IDE 调试

推荐使用 IntelliJ IDEA 或 Eclipse 进行调试：

1. 在 IDE 中打开项目
2. 在代码行号左侧点击设置断点
3. 使用调试模式运行程序（通常为 F5 或 Shift+F9）
4. 使用调试工具栏进行单步调试、查看变量等操作

## 贡献指南

待补充

## 许可证

待补充 