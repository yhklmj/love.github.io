/**
 * ---- Base is a JavaScript tool library.
 * ---- Its grammar is similar to jQuery.
 * ---- For study and discussion only.
 * ---- You can try it. Welcome to give me some advice.
 * ---- Let me know if you have a good idea , Mail to : zhangjun@1000phone.com
 * ---- Version v0.01
 * ---- Author root
 */
(function() {

    var base = function(selector, context) {
        if (typeof selector === "function") {
            // 如果传入的是函数  那么此时的base($) 就是就绪函数
            ready(selector);
            return; //终止函数执行
        }
        return new Base(selector, context);
    }

    // 构造函数
    function Base(selector, context) {
        var elements;
        if (selector.nodeType === 1) {
            this[0] = selector;
            Object.defineProperty(this, 'length', {
                enumerable: false,
                value: 1,
                writable: false
            });
        } else {
            elements = context ? context.querySelectorAll(selector) : document.querySelectorAll(selector);
            for (var i = 0; i < elements.length; i++) {
                // 构造函数中的 this 引用的是新创建的对象
                this[i] = elements[i];
            }
            Object.defineProperty(this, 'length', {
                enumerable: false,
                value: elements.length,
                writable: false
            });
        }
    }

    // 重置原型对象  新建一个对象赋值给Base的原型
    Base.prototype = {
        //修复constructor
        constructor: Base,
        each: function(callback) {
            for (var i = 0; i < this.length; i++) {
                callback(this[i], i);
            }
        },
        css: function(style, value) {
            var str = "";
            var str2 = "";
            if (typeof style === "string" && value) {
                this.each(function(elm, i) {
                    for (var i = 0; i < elm.style.length; i++) {
                        str += elm.style[i] + ":" + elm.style[elm.style[i]] + ";";
                    }
                    elm.style = str + style + ":" + value + ";";
                });
            } else if (typeof style === "object") {
                each(style, function(key, val) {
                    str += key + ":" + val + ";";
                });

                this.each(function(elm, i) {
                    for (var i = 0; i < elm.style.length; i++) {
                        str2 += elm.style[i] + ":" + elm.style[elm.style[i]] + ";";
                    }
                    elm.style.cssText = str2 + str;
                });

            }
            return this;
        },
        on: function(type, callback) {
            if (typeof type === "string" && callback) {
                if (this[0].addEventListener) {
                    this.each(function(elm, i) {
                        elm.addEventListener(type, callback);
                    });
                } else if (this[0].attachEvent) {
                    this.each(function(elm, i) {
                        elm.attachEvent("on" + type, callback);
                    });
                }
            } else if (typeof type === "object" && this[0]) {
                if (this[0].addEventListener) {
                    this.each(function(elm, i) {
                        each(type, function(key, val) {
                            elm.addEventListener(key, val);
                        });
                    });
                } else if (this[0].attachEvent) {
                    this.each(function(elm, i) {
                        each(type, function(key, val) {
                            elm.attachEvent("on" + key, val);
                        });
                    });
                }
            }
        },
        animate: function(style, callback) {
            // 想要改变元素的位置 先获得它当前的位置(样式)
            // 需要一个目标位置(样式)
            this.each(function(elm, i) {
                elm.timer = setInterval(function() {
                    var flag = true; //定义一个开关 当值为true时可以停止运动
                    var current = 0;
                    for (var attr in style) {
                        if (attr === 'opacity') {
                            current = parseFloat(getStyle(elm, attr)) * 100;
                        } else {
                            current = parseInt(getStyle(elm, attr));
                        }

                        var speed = (style[attr] - current) / 10;
                        speed = speed > 0 ? Math.ceil(speed) : Math.floor(speed);

                        if (current != style[attr]) {
                            // 没有到达目标
                            flag = false;
                        }

                        // 设置样式或透明度
                        if (attr == "opacity") {
                            elm.style[attr] = (current + speed) / 100;
                            elm.style.filter = 'alpha(opacity=' + (current + speed) + ')';
                        } else {
                            elm.style[attr] = current + speed + 'px';
                        }
                    }
                    // 循环执行结束 判断flag的值 如果为true 停止定时器
                    if (flag) {
                        clearInterval(elm.timer);
                        callback && callback();
                    }
                }, 30);
            });
            return this;
        },
        addClass: function(className) {
            this.each(function(elm, i) {
                elm.classList.add(className);
            });
            return this;
        },
        removeClass: function(className) {
            this.each(function(elm, i) {
                elm.classList.remove(className);
            });
            return this;
        },
        index: function(elm) {
            var arr = Array.from(this);
            return arr.findIndex((el, index) => el == elm);
        },
        tabs: function(ev, actived, display) {
            ev = ev || 'click';
            actived = actived || 'active';
            display = display || 'show';
            var oBtn = $('ul>li', this[0]);
            var oDiv = $('div[data-type="tabs"]', this[0]);
            oBtn.on(ev, function() {
                var _index = oBtn.index(this);
                oBtn.removeClass(actived);
                oDiv.removeClass(display);
                $(this).addClass(actived);
                $(oDiv[_index]).addClass(display);

            });
        },
        html: function(html) {
            if (typeof html == 'function') {
                this.each(function(elm, i) {
                    elm.innerHTML = html(elm.innerHTML, i);
                })
            } else {
                this.each(function(elm) {
                    elm.innerHTML = html;
                });
            }
            return this;
        },
        offset: function() {
            // get firstElement offset
            return {
                left: this[0].offsetLeft,
                top: this[0].offsetTop,
                width: this[0].offsetWidth,
                height: this[0].offsetHeight
            }
        },

    };

    // 封装一个函数用于遍历对象
    function each(obj, callback) {
        for (var i in obj) {
            callback(i, obj[i]);
        }
    }

    // 获取样式
    function getStyle(elm, style) {
        if (elm.currentStyle) {
            return elm.currentStyle[style];
        } else {
            return getComputedStyle(elm)[style];
        }
    }

    function ready(callback) {
        if (document.addEventListener) {
            // DOMContentLoaded 是H5的事件 ie不支持
            document.addEventListener('DOMContentLoaded', function() {
                //移除事件
                document.removeEventListener('DOMContentLoaded', arguments.callee)
                callback();
            })
        } else if (document.attachEvent) {
            // 兼容ie 就绪事件 onreadystatechange
            document.attachEvent("onreadystatechange", function() {
                if (document.readyState === 'complete') {
                    document.detachEvent("onreadystatechange", arguments.callee);
                    callback();
                }
            });
        }
    }

    window.$ = window.Base = base;
})();