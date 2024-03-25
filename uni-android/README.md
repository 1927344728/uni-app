## 说明

### Android平台签名证书

Android 平台打包发布 apk 应用，需要使用数字证书（.keystore文件）进行签名，用于表明开发者身份。

可以使用 JRE 环境中的 keytool 命令生成。

* 安装 JRE 环境：下载（https://www.java.com/zh-CN/download/manual.jsp） -> 安装 -> 设置环境变量。

* 生成签名证书：

  ```shell
  ## 创建证书——密钥123456
  keytool -genkey -alias uniAndroid.lizhao -keyalg RSA -keysize 2048 -validity 36500 -keystore uniAndroid.keystore
  ```

  ```shell
  输入密钥库口令:
  再次输入新口令:
  您的名字与姓氏是什么?
    [Unknown]:  lizhao
  您的组织单位名称是什么?
    [Unknown]:  lizhao
  您的组织名称是什么?
    [Unknown]:  lizhao
  您所在的城市或区域名称是什么?
    [Unknown]:  hz
  您所在的省/市/自治区名称是什么?
    [Unknown]:  zj
  该单位的双字母国家/地区代码是什么?
    [Unknown]:  cn
  CN=lizhao, OU=lizhao, O=lizhao, L=hz, ST=zj, C=cn是否正确?
    [否]:  是
  
  输入 <uniAndroid.lizhao> 的密钥口令
          (如果和密钥库口令相同, 按回车):
  ```

  **备注：** 生成的证书文件在执行以上命令时所在的目录。

* 查看签名证书：

  ```shell
  ## 查看证书信息——SHA1、SHA256
  keytool -list -v -keystore uniAndroid.keystore
  ```

