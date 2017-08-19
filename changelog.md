# 更新日志

## v0.8.3

- `Position` 新增 `label` 属性值

## v0.8.2

- 新增工具：在地图显示点标记。
- 版本获取移到工具 `$.AMapPositionPicker.pluginVersion`， 版本字符串去掉 `v` 前缀。
- 地址中心选项 `center` 支持 经纬度数组格式。
- 修正 `data-value-address` 无法显示地址的bug

## v0.8.1

- 新增 `AMPP.PickedCompleted` 事件
- 选择成功回调函数增加 `hasPicked` 参数
- 修正重复显示选择点标记的bug
- 选项 `onPicked` 已废弃

## v0.8.0

- 重构插件逻辑
- 新增 `errorTip` 选项
- 点标记时新增鼠标滑过的文字提示
- 增加搜索按钮切换效果
- 增加点标记动画效果
- POI地址改由地理逆编码获取

## v0.7.0

- 新增搜索功能。
- 主页迁移至 gitee.com

## v0.6.0

- 新增浏览器定位功能。

## v0.5.0

- 发布第一个测试版本。