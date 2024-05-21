# uni-app

## 项目运行
```
# 安装
npm install

# 开发编辑与热加载
# npm run serve

### 生产编辑与压缩
npm run build
```

### 开发指南
#### `npm i` 报错：
```shell
command failed
npm ERR! command C:\WINDOWS\system32\cmd.exe /d /s /c node install.js
npm ERR! ERROR: Failed to set up Chromium r756035! Set "PUPPETEER_SKIP_DOWNLOAD" env variable to skip download.

```
解决方案：
```shell
export PUPPETEER_SKIP_DOWNLOAD='true'
npm i
```

#### 生成签名证书
使用keytool -genkey命令生成证书：
```shell
keytool -genkey -alias testalias -keyalg RSA -keysize 2048 -validity 36500 -keystore test.keystore
```
* testalias是证书别名，可修改为自己想设置的字符，建议使用英文字母和数字
* test.keystore是证书文件名称，可修改为自己想设置的文件名称，也可以指定完整文件路径
* 36500是证书的有效期，表示100年有效期，单位天，建议时间设置长一点，避免证书过期
按回车键，然后根据提示输入相应信息，完成后会生成证书（test.keystore），存在运行 keytool 命令时所在的目录下。
查看签名信息：
```shell
keytool -list -v -keystore test.keystore  
```