# AMapPositionPicker

## 概述

bootstrap.AMapPositionPicker是一款基于高德地图的位置选择插件，使用jQuery开发。提供了以下特性：

- 初始位置数据
- 字段显示格式、验证
- 数据控件绑定
- 支持高德地图地理逆编码
- 自定义Modal外观样式

## 使用方法


1. 依次引入高德地图JS、jQuery、Bootstrap和bootstrap.AMapPositionPicker.min.js文件。

```
<script type="text/javascript" src="http://webapi.amap.com/maps?v=1.3&key=您申请的key值"></script>
<script type="text/javascript" src="http://cdn.bootcss.com/jquery/1.11.1/jquery.min.js"></script>
<script type="text/javascript" src="http://cdn.bootcss.com/bootstrap/3.3.6/js/bootstrap.min.js"></script>
<script type="text/javascript" src="./dist/bootstrap.AMapPositionPicker.min.js"></script>
```

2. 在目标输入框初始化选项。

html代码

```
<input type="text" id="id_address_input" name="address"/>
```

JS代码

```
$("#id_address_input").AMapPositionPicker();
```

## 文档

[文档&示例](http://kinegratii.oschina.io/bootstrap-amappositionpicker/index.html)

## 构建

项目使用gulp工具构建。

## 协议

本项目基于MIT协议开源。

## 作者

- kinegratii@gmail.com