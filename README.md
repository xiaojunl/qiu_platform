#qiu_platform
#介绍
O2O项目，网球爱好者-在线预定场馆或俱乐部教练（LBS周边展示），约战PK，商城，在线支付（支付宝&微信），前后端分离，登陆认证，后台管理
#usage guild
1 环境搭建

技术选型：node-based stack,node.js(v4.x)+swaggerize-express+mongodb(v3.x)+redis+angular.js(v1.4.x) <br />
开发工具：webstorm+linux (推荐)<br />
源码目录结构说明：
api-后端接口工程，docs-后端接口自动化文档，weixin-微信app，auto_deploy.sh-开发测试环境自动化部署脚本，补充：auto_deploy.sh同级目录下的release_deploy.sh-线上环境部署脚本<br />
web开发环境：<br />
a) dev tools install: <br />
     介于npm服务器在国外，推荐安装aliyun私服：
npm install -g cnpm --registry=http://registry.npm.taobao.org <br />
     其他：cnpm install -g bower<br />
b) cd ～/weixin >>cnpm install;  >>bower install;<br />
c) 运行：cnpm start，浏览器访问：http://localhost:8000/app<br /><br />


2 接口说明<br />

API docs，restful-based(GET/POST/PUT/DELETE)（http://localhost:8000/api/docs）<br />
忽略【系统级】API，关注默认的业务级API<br />



3 资源定义<br />

场馆 - venue ; 场地 - place ; 平台方 - platform； 俱乐部 - club；教练-coach；约战-arrange<br />
http status code：<br />
200  成功操作<br />
401 40101  未授权<br />
401 40102  无效的用户名或密码<br />
401 40103  需先绑定<br />
400 40001   input Invalid.<br />
400 40002   input param exists.<br />
400 40003   input param expire.<br />
400 40004   input param error.<br />
404 40401   not found.<br />
406 40601   Not Acceptable<br />
460 46001   exists.<br />
460 46002   has<br />
461 46101  不支持退款<br />
503 50301   Service Unavailable<br /><br />


4 共通API定义<br />

账号/订单/下单 3个模块访问保护，<br />
微信：用户未绑定手机号不能访问，跳转到绑定手机号页面，调用接口会收到：http status：401， error:{code:40103,msg:'需绑定手机号'}；<br />
移动端：用户未登录不能访问，跳转到登陆页面，调用接口，调用接口会收到：http status：401， error:{code:40101,msg:'Unauthorized'}；<br />

#警告：鉴于商业敏感信息功能并不全面，版权所有，仅供交流学习用，禁止直接用作商业用途
