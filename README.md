# AMapPositionPicker

## 概述

[AMapPositionPicker](https://www.oschina.net/p/amappositionpicker)是一款基于高德地图的位置选择插件，使用jQuery开发。

## 特性

主要特性有：

- AMD & CMD 引入
- data-*属性配置
- 初始位置数据
- 浏览器定位
- 字段显示格式、验证
- 数据单向绑定
- 支持地理逆编码
- 外观样式定制
- 工具：在地图上显示点标记

## 使用方法


1. 依次引入高德地图JS、jQuery、Bootstrap和bootstrap.AMapPositionPicker.min.js文件。

```html
<script type="text/javascript" src="http://webapi.amap.com/maps?v=1.3&key=您申请的key值"></script>
<script type="text/javascript" src="http://cdn.bootcss.com/jquery/1.11.1/jquery.min.js"></script>
<script type="text/javascript" src="http://cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
<script type="text/javascript" src="./dist/bootstrap.AMapPositionPicker.min.js"></script>
```

2. 在目标输入框初始化选项。

html代码

```html
<input type="text" id="id_address_input" name="address"/>
```

JS代码

```javascript
$("#id_address_input").AMapPositionPicker();
```

更多示例请可查看 [开发文档](http://kinegratii.oschina.io/bootstrap-amappositionpicker/index.html)。

## 构建

项目使用gulp工具构建。

生成 release 文件

```
gulp release
```

## 作者和协议

本项目基于MIT协议开源。

- kinegratii@gmail.com
- [OSC个人主页](https://my.oschina.net/kinegratii)