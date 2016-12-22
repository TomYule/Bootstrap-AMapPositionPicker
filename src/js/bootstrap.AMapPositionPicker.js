/**
 * BootstrapAMapPositionPicker v0.6.0
 * @author: Kinegratii
 */
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('jquery'));
    } else {
        if (typeof jQuery === 'undefined') {
            throw 'bootstrap.AMapPositionPicker requires jQuery to be loaded first';
        }
        if (typeof  AMap == 'undefined') {
            throw 'bootstrap.AMapPositionPicker requires AMap to be loaded first';
        }
        factory(jQuery, AMap);
    }
}(function ($, AMap) {
    //全局工具函数
    String.prototype.format = function (data) {
        var result = this;
        for (var key in data) {
            if (data[key] != undefined) {
                var reg = new RegExp("({" + key + "})", "g");
                result = result.replace(reg, data[key]);
            }
        }
        return result;
    };
    if (typeof String.prototype.startsWith != 'function') {
        String.prototype.startsWith = function (prefix) {
            return this.slice(0, prefix.length) === prefix;
        };
    }

    function wrapFormat(formatter, data) {
        if (typeof formatter == 'function') {
            return formatter(data);
        } else if (typeof formatter == 'string') {
            return formatter.format(data);
        } else {
            return '';
        }
    }

    // 数据结构定义
    var Position = (function () {
        function Position(longitude, latitude, address) {
            this.longitude = longitude;
            this.latitude = latitude;
            this.address = address || '';
        }

        Position.prototype.isValid = function () {
            return this.longitude != undefined && this.longitude != null && this.latitude != undefined && this.latitude != null;
        };
        Position.prototype.copy = function (data) {
            if (data == undefined) {
                return new Position(this.longitude, this.latitude, this.address);
            } else {
                return new Position(
                    data.longitude || this.longitude,
                    data.latitude || this.latitude,
                    data.address || this.address
                );
            }
        };
        Position.empty = function () {
            return new Position(null, null, "");
        };
        Position.validate = function (position) {
            if (position) {
                return position.isValid();
            } else {
                return false;
            }
        };
        Position.validateLngLat = function (lnglatStr) {
            var result = /^([+-]?(0?\d{1,2}(\.\d{1,6})?|1[0-7]?\d{1}(\.\d{1,6})?|180\.0{1,6}))[-;,]([-+]?([0-8]?\d{1}(\.\d{1,6})?|90(\.0{1,6})?))$/.exec(lnglatStr);
            if (result) {
                return {longitude: parseFloat(result[1]), latitude: parseFloat(result[5])};
            } else {
                return null;
            }
        };
        Position.LNGLAT_FORMATTER = ['{longitude}-{latitude}', '{longitude};{latitude}', '{longitude},{latitude}'];
        return Position;
    }());

    var InputEl = (function () {
        var idIndex = -1;

        function generateSelectorId(selector) {
            if (selector.startsWith('#')) {
                return selector.substring(1);
            } else {
                idIndex += 1;
                return 'id_bapp_i' + idIndex;
            }
        }

        function InputEl(options, position) {
            this.name = options.name;
            if (options.selector instanceof jQuery) {
                this.$instance = options.selector;
                this.created = true;
            }
            else if ($(options.selector).length > 0) {
                this.$instance = $(options.selector);
                this.created = true;
            } else {
                var inputHtml = '<input type="hidden" id="{id}" name="{name}"/>'.format({
                    id: generateSelectorId(options.selector),
                    name: options.name
                });
                this.$instance = $(inputHtml);
                this.created = false;
            }
            this.formatter = function (position) {
                return wrapFormat(options.formatter, position);
            };
            // 赋值
            if (Position.validate(position)) {
                this.$instance.val(this.formatter(position));
            }
        }

        InputEl.prototype.render = function (data) {
            var s = this.formatter(data);
            this.$instance.val(s);
        };

        return InputEl;

    }());

    // Modal 封装
    var pickerModal = (function () {
        var toolsHtml = '<div style="position: absolute;z-index: 2;top:5px;right: 5px;"><div class="btn-group">'
            + '<button id="idAMapPositionPickerLocation" type="button" class="btn btn-default"><span class="glyphicon glyphicon-map-marker"></span>&nbsp;定位</button>'
            + '<button id="idAMapPositionPickerClear" type="button" class="btn btn-default"><span class="glyphicon glyphicon-remove"></span>&nbsp;清除</button>'
            + '<button id="idAMapPositionPickerReset" type="button" class="btn btn-default"><span class="glyphicon glyphicon-repeat"></span>&nbsp;重置</button> </div>'
            + '</div>';
        var modalHtml = '<div class="modal fade" id="idAMapPositionPickerModal">'
            + '<div class="modal-dialog">'
            + '<div class="modal-content">'
            + '<div class="modal-header"><button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button><h4 class="modal-title">请选择地址</h4><small id="idAMapPositionPickerAlert" style="color: red">必须选择一个位置</small></div>'
            + '<div class="modal-body">'
            + '<div id="idAMapPositionPickerMap" style="height: 500px;" class="form-control">'
            + toolsHtml
            + '</div>' //End of Map container
            + '<input class="form-control" style="margin-top:10px;" id="idAMapPositionPickerAddress"/>'
            + '</div>' //End of modal-Body
            + '<div class="modal-footer">'
            + '<button id="idAMapPositionPickerSelect" type="button" class="btn btn-primary">确定</button><button type="button" class="btn btn-default" data-dismiss="modal">取消</button>'
            + '</div>' //End of Modal-footer
            + '</div>' //End of Modal-content
            + '</div>' // End of Modal-dialog
            + '</div>';//End of Modal
        var $modal = null, $map, $addressInput, $alert, $pickBtn, $locationBtn, $resetBtn, $clearBtn;
        var mapObj = null, marker = null, geolocation;
        var context = null, contextOptions = null;
        //init modal
        var cachePosition = Position.empty();


        function initModal() {
            if ($modal == null) {
                $modal = $(modalHtml);
                $(document.body).append($modal);
                mapObj = new AMap.Map("idAMapPositionPickerMap", {
                    zoom: 15
                });
                AMap.plugin(['AMap.ToolBar', 'AMap.Scale', 'AMap.OverView'],
                    function () {
                        mapObj.addControl(new AMap.ToolBar());
                        mapObj.addControl(new AMap.Scale());
                        mapObj.addControl(new AMap.OverView({isOpen: true}));
                    });
                AMap.event.addListener(mapObj, 'click', function (e) {
                    $alert.hide();
                    cachePosition.longitude = e.lnglat.lng;
                    cachePosition.latitude = e.lnglat.lat;
                    showPositionOnMap(undefined, e.lnglat);
                });
                mapObj.plugin('AMap.Geolocation', function () {
                    geolocation = new AMap.Geolocation({
                        enableHighAccuracy: true,
                        timeout: 3000,
                        maximumAge: 0,
                        convert: true,
                        panToLocation: true,
                        zoomToAccuracy: true,
                        markerOptions: {}
                    });
                });
                // 内部事件响应
                $map = $("#idAMapPositionPickerMap");
                $pickBtn = $("#idAMapPositionPickerSelect");
                $locationBtn = $("#idAMapPositionPickerLocation");
                $resetBtn = $("#idAMapPositionPickerReset");
                $clearBtn = $("#idAMapPositionPickerClear");
                $addressInput = $("#idAMapPositionPickerAddress");
                $alert = $("#idAMapPositionPickerAlert");

                $pickBtn.on('click', pickPosition);
                $resetBtn.on('click', resetInitialPosition);
                $clearBtn.on('click', clearPosition);
                $locationBtn.on('click', location);
            }
        }

        function initialModalUI(options) {
            $map.css('height', options.height);
            $modal.find('h4.modal-title').html(options.title);
            $alert.hide();

        }

        function location() {
            $alert.hide();
            geolocation.getCurrentPosition(function (status, result) {
                if (status == 'complete') {
                    cachePosition.longitude = result.position.lng;
                    cachePosition.latitude = result.position.lat;
                    cachePosition.address = result.formattedAddress;
                    showPositionOnMap(cachePosition);
                } else {
                    $alert.html(result.message).show();
                }
            });
        }

        function clearPosition() {
            cachePosition = Position.empty();
            marker.setMap(null);
            $addressInput.val('');
        }

        function resetInitialPosition() {
            cachePosition = context.getInitialPosition();
            if (Position.validate(cachePosition)) {
                showPositionOnMap(cachePosition);
            } else {
                marker.setMap(null);
                $addressInput.val('');
            }

        }

        function pickPosition() {
            var address = $addressInput.val();
            cachePosition.address = address;
            if (contextOptions.required && !cachePosition.isValid()) {
                $alert.html('请选择地址').show();
            } else {
                $alert.hide();
                $modal.modal('hide');
                context._onPickedCallback(cachePosition.copy({address: address})); //返回一个新的数据实例
            }
        }

        function showModal() {
            initModal();
            initialModalUI(contextOptions);
            var p = context.position();
            if (p && p.isValid()) {
                cachePosition = p;
                showPositionOnMap(context.position()); // 显示位置
            } else {
                if (marker) {
                    marker.setMap(null);
                }
                $addressInput.val('');
            }
            $modal.modal('show');
        }

        function showPositionOnMap(position, lnglat) {
            var address = "";
            if (lnglat == undefined) {
                if (Position.validate(position)) {
                    lnglat = new AMap.LngLat(position.longitude, position.latitude);
                    address = position.address;
                } else {
                    return;
                }
            }

            if (address) {
                _showPositionOnMap();
            } else {
                var geocoder;
                mapObj.plugin(["AMap.Geocoder"], function () {
                    geocoder = new AMap.Geocoder({
                        radius: 1000,
                        extensions: "base"
                    });
                    AMap.event.addListener(geocoder, "complete", function (GeocoderResult) {
                        if (GeocoderResult["info"] == "OK") {
                            address = GeocoderResult.regeocode.formattedAddress;
                        } else {
                        }
                        _showPositionOnMap();
                    });
                    geocoder.getAddress(lnglat);
                });
            }

            function _showPositionOnMap() {
                if (marker != null) {
                    marker.setMap(null);
                }
                marker = new AMap.Marker({
                    map: mapObj,
                    position: lnglat,
                    topWhenClick: true,
                    offset: new AMap.Pixel(-5, -30)
                });
                $addressInput.val(address);
                mapObj.setCenter(lnglat);
            }
        }

        return {
            showModal: showModal,
            startContext: function (mContext, mContextOptions) {
                context = mContext;
                contextOptions = mContextOptions;
                return this;
            },
            endContext: function () {
                return this;
            }
        }
    })();

    var aMapPositionPicker = function (element, options) {

        var picker = {
            isFirstLoad: false,
            initialPosition: null,
            inputElList: []
        };
        var $inputEl = null;

        picker._onPickedCallback = function (mPosition) {
            picker.position(mPosition);
            $inputEl.val(wrapFormat(options.formatter, mPosition));
            for (var i in picker.inputElList) {
                picker.inputElList[i].render(mPosition);
            }
            options.onPicked(mPosition);
            //element.trigger('AMPP.Picked', [mPosition]);
        };

        // 公有 API

        picker.getInitialPosition = function () {
            return initialPosition;
        };

        picker.position = function (mPosition) {
            if (mPosition == undefined) {
                return element.data('position');
            } else {
                element.data('position', mPosition)
            }
        };

        //
        if (element.is('input')) {
            $inputEl = element;
        } else {
            $inputEl = element.children('input');
        }
        $inputEl.prop("readonly", true);
        //初始位置
        if (Position.LNGLAT_FORMATTER.indexOf(options.formatter)) {
            var result = Position.validateLngLat($inputEl.val());
            if (result) {
                options.value.longitude = parseFloat(result.longitude);
                options.value.latitude = parseFloat(result.latitude);
            }
        }
        var initialPosition = new Position(options.value.longitude, options.value.latitude, options.value.address);
        element.data('position', initialPosition.copy());
        //事件注册
        element.on('click', function () {
            //show modal/
            pickerModal.startContext(picker, options).showModal();
        });
        // 处理fields
        var fields = options.fields || [];
        for (var i in fields) {
            var iEl = new InputEl(fields[i] || {});
            if (!iEl.created) {
                element.after(iEl.$instance);
            }
            picker.inputElList.push(iEl);
        }
        return picker;
    };

    $.fn.AMapPositionPicker = function (options) {
        options = options || {};
        var args = Array.prototype.slice.call(arguments, 1),
            isInstance = true,
            thisMethods = [], //可级联函数列表
            returnValue;
        if (typeof  options == 'object') {
            return this.each(function () {
                var $this = $(this);
                if (!$this.data('AMapPositionPicker')) {
                    var dataOptions = {
                        formatter: $this.data('formatter'),
                        title: $this.data('title'),
                        height: $this.data('height'),
                        required: $this.data('required'),
                        value: {
                            longitude: $this.data('valueLongitude'),
                            latitude: $this.data('valueLatitude'),
                            address: $this.data('valueAddress')
                        }
                    }; // 处理data-*属性
                    options = $.extend(true, {}, $.fn.AMapPositionPicker.defaults, dataOptions, options);
                    $this.data('AMapPositionPicker', aMapPositionPicker($this, options));
                }
            });
        } else if (typeof  options == 'string') {
            this.each(function () {
                var $this = $(this),
                    instance = $this.data('AMapPositionPicker');
                if (!instance) {
                    throw new Error('bootstrap.AMapPositionPicker("' + options + '") method was called on an element that is not using AMapPositionPicker');
                }
                returnValue = instance[options].apply(instance, args);
                isInstance = returnValue === instance;
            });
            if (isInstance || $.inArray(options, thisMethods) > -1) {
                return this;
            }

            return returnValue;
        }
        throw new TypeError('Invalid arguments for AMapPositionPicker: ' + options);
    };
    $.fn.AMapPositionPicker.defaults = {
        formatter: '{address}',
        onPicked: function (position) {
        },
        value: {
            //初始化位置
            longitude: null,
            latitude: null,
            address: null
        },
        required: true,
        title: '请输入地址',
        height: '500px',
        fields: []
    };
    $.fn.AMapPositionPicker.version = 'v0.6.0';
    $(function () {
        $('[data-provide="AMapPositionPicker"]').AMapPositionPicker();
    });
}))
;