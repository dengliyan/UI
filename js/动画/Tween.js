var Tween = {
    Linear: function (t, b, c, d) {
        return c * t / d + b;
    },
    Quad: {
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOut: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        }
    },
    Cubic: {
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOut: function (t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        }
    },
    Quart: {
        easeIn: function (t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOut: function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOut: function (t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        }
    },
    Back: {
        easeIn: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOut: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOut: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        }
    }
}
var Motion = function (target) {
        var t = 0; //��ǰʱ��
        var d = 150; //����ʱ��
        var delayTime = 10; //��ʱʱ����ms
        var styles = null; //�仯����ʽ
        var stylesChange = {}; //��ʽ�ĸı�ֵ
        var stylesBegin = {}; //��ʽ�ĳ�ʼֵ
        var callBackFunc = null; //�ص�����
        var timer = null; //setTimeout�����ľ��
        var quickStylesBefore = null; //��ݷ����Ŀ�ʼ��ʽ
        var quickStylesAfter = null; //��ݷ����Ľ�����ʽ
        var animateStatus = false; //��ǰ������״̬��falseΪ����δִ�л�ִ�����
        var funcQueue = []; //�������ж���
        if (typeof (target) == 'string') //�ж���������target����Ϊ�ַ��������ȡΪDOM����
        target = document.getElementById(target);
        this.resetStatus = function () {
            t = 0;
            styles = null;
            stylesChange = {};
            stylesBegin = {};
            callBackFunc = null;
            timer = null;
            quickStylesBefore = null;
            quickStylesAfter = null;
        }
        this.setDelayTime = function (_delayTime) {
            delayTime = _delayTime;
        }
        this.setTarget = function (_target) {
            target = _target;
        }
 
        this.setStyles = function (_styles) {
            styles = _styles;
        }
 
        this.setCallBackFunc = function (_callBackFunc) {
            callBackFunc = _callBackFunc;
        }
        this.getTarget = function () {
            return target;
        } //����������ִ�ж���
        this.pushFuncToQueue = function (funcString) {
            funcQueue.push(funcString);
        } //��ȡ����ִ��״̬
        this.getAnimateStatus = function () {
            return animateStatus;
        } //set quick methord target object styles
        this.setQuickStyle = function (_quickStyles, quickType) {
            if (quickType) quickStylesBefore = _quickStyles;
            else quickStylesAfter = _quickStyles;
        }
        //get target object's width and height
        this.getTargetStyle = function () {
            return {
                width: target.style.width || target.clientWidth,
                height: target.style.height || target.clientHeigth
            }
        }
        //calculate the target object's styles change value and the original value
        var calculatChange = function () {
                for (var styleName in styles) {
                    stylesChange[styleName] = parseInt(styles[styleName]) - parseInt(target.style[styleName] || 0);
                    stylesBegin[styleName] = parseInt(target.style[styleName] || 0);
                }
            }
            var setTargetStyles = function (_styles) {
                for (var styleName in _styles) {
                    target.style[styleName] = _styles[styleName];
                }
            }
            var beforeRun = function () {
                quickStylesBefore && setTargetStyles(quickStylesBefore);
                calculatChange();
                target.style.display = 'block';
                animateStatus = true;
            }
            this.afterRun = function () {
                if (target.style.width == '0px' || target.style.height == '0px') target.style.display = 'none';
                quickStylesAfter && setTargetStyles(quickStylesAfter);
                if (funcQueue.length > 0) {
                    animateStatus = false;
                    var currentFuncArray = funcQueue.shift();
                    return currentFuncArray[0].apply(this, currentFuncArray[1]);
                }
 
                animateStatus = false;
                //this.slideDown();
            }
 
            this.run = function () {
 
                (t == 0) && beforeRun();
                for (var styleName in styles) {
                    target.style[styleName] = Tween.Quad.easeInOut(t, stylesBegin[styleName], stylesChange[styleName], d) + 'px';
                }
                t++;
                if (t <= d) return timer = setTimeout(dk.bind(this, this.run), delayTime);
                this.afterRun();
                if (callBackFunc) return callBackFunc();
            }
    }
 
    motion.prototype = {
        animate: function (styles, callBackFunc) {
            if (this.getAnimateStatus()) return this.pushFuncToQueue([this.animate, arguments]);
            this.resetStatus();
            this.setStyles(styles)
            this.setCallBackFunc(callBackFunc);
            this.run();
        },
        slideDown: function (callBackFunc) {
            if (this.getAnimateStatus()) return this.pushFuncToQueue([this.slideDown, arguments]);
            this.resetStatus();
            var targetStyle = this.getTargetStyle();
            this.setQuickStyle({
                height: '0px'
            }, true);
            this.setStyles({
                height: targetStyle.height
            });
            this.setCallBackFunc(callBackFunc);
            this.run();
        },
        slideUp: function (callBackFunc) {
            if (this.getAnimateStatus()) return this.pushFuncToQueue([this.slideUp, arguments]);
            this.resetStatus();
            var targetStyle = this.getTargetStyle();
            this.setQuickStyle({
                height: targetStyle.height
            }, false);
            this.setStyles({
                height: '0px'
            });
            this.setCallBackFunc(callBackFunc);
            this.run();
        },
        show: function (callBackFunc) {
            this.resetStatus();
            var targetStyle = this.getTargetStyle();
            this.setQuickStyle({
                width: '0px',
                height: '0px'
            }, true);
            this.setStyles({
                width: targetStyle.width,
                height: targetStyle.height
            });
            this.setCallBackFunc(callBackFunc);
            this.run();
        },
        hide: function (callBackFunc) {
            this.resetStatus();
            var targetStyle = this.getTargetStyle();
            this.setQuickStyle({
                width: targetStyle.width,
                height: targetStyle.height
            }, false);
            this.setStyles({
                width: '0px',
                height: '0px'
            });
            this.setCallBackFunc(callBackFunc);
            this.run();
        }
    }