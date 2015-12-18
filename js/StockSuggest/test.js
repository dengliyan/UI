(function() {
    var Class = {
        create: function() {
            return function() {
                this.initialize.apply(this, arguments)

            }

        }

    };
    Object.extend = function(destination, source) {
        for (property in source) {
            destination[property] = source[property]

        }
        return destination

    };
    var Base = Class.create();
    Object.extend(Function.prototype, {
        bind: function() {
            var __m = this,
            object = arguments[0],
            args = new Array();
            for (var i = 1; i < arguments.length; i++) {
                args.push(arguments[i])

            }
            return function() {
                return __m.apply(object, args)

            }

        }

    });
    Object.extend(Base.prototype, {
        initialize: function() {},
        Browser: {
            IE: !!(window.attachEvent && navigator.userAgent.indexOf('Opera') === -1),
            Opera: navigator.userAgent.indexOf('Opera') > -1,
            WebKit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
            Gecko: navigator.userAgent.indexOf('Gecko') > -1 && navigator.userAgent.indexOf('KHTML') === -1,
            MobileSafari: !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)

        },
        $: function(o) {
            return typeof(o) == 'string' ? document.getElementById(o) : o

        },
        $C: function(o) {
            return document.createElement(o)

        },
        $aE: function(elm, evType, fn, useCapture) {
            if (elm.addEventListener) {
                elm.addEventListener(evType, fn, useCapture);
                return true

            } else if (elm.attachEvent) {
                var r = elm.attachEvent('on' + evType, fn);
                return r

            } else {
                elm['on' + evType] = fn

            }

        },
        $dE: function(elm, evType, fn, useCapture) {
            if (elm.removeEventListener) {
                elm.removeEventListener(evType, fn, useCapture);
                return true

            } else if (elm.detachEvent) {
                var r = elm.detachEvent('on' + evType, fn);
                return r

            } else {
                elm['on' + evType] = null;
                return

            }

        },
        isNullorEmpty: function(obj) {
            if (obj == null || obj == "" || obj == "undefined") {
                return true

            }
            return false

        },
        getStyle: function(obj, styleProp) {
            if (obj.currentStyle) return obj.currentStyle[styleProp];
            else if (window.getComputedStyle) return document.defaultView.getComputedStyle(obj, null).getPropertyValue(styleProp)

        }

    });
    var Gee = new Base();
    var StockSuggest = Class.create();
    Object.extend(StockSuggest.prototype, {
        initialize: function(obj, arg) {
            this.input = obj;
            this.dataurl = "http://suggest.eastmoney.com/SuggestData/Default.aspx?name={#NAME}&input={#KEY}&type={#TYPE}";
            if (!Gee.isNullorEmpty(arg.dataurl)) this.dataurl = arg.dataurl;
            this.autoSubmit = Gee.isNullorEmpty(arg.autoSubmit) ? false: arg.autoSubmit;
            this.type = Gee.isNullorEmpty(arg.type) ? "": arg.type;
            this.link = Gee.isNullorEmpty(arg.link) ? "": arg.link;
            this.width = Gee.isNullorEmpty(arg.width) ? "": arg.width;
            this.opacity = Gee.isNullorEmpty(arg.opacity) ? 1: arg.opacity;
            this.className = Gee.isNullorEmpty(arg.className) ? "": arg.className;
            this.max = Gee.isNullorEmpty(arg.max) ? 10: arg.max;
            this.text = Gee.isNullorEmpty(arg.text) ? "请输入...": arg.text;
            this.header = Gee.isNullorEmpty(arg.header) ? ["选项", "代码", "名称"] : arg.header;
            this.body = Gee.isNullorEmpty(arg.body) ? [ - 1, 1, 4] : arg.body;
            this.callback = (arg.callback == null || arg.callback == "undefined") ? null: arg.callback;
            this.showAd = (arg.showAd == null || arg.showAd == "undefined") ? true: arg.showAd;
            this.results = null;
            this._D = null;
            this._F = null;
            this._R = null;
            this._W = null;
            this._X = {};
            this._Y = {};
            this._hidden = false;
            this.Market = "";
            this.mType = "";
            this.SName = "";
            this._iF = null;
            this._iN = null;
            this._iC = null;
            this._oForm = null;
            this.StockType = {
                "0": "未知",
                "1": "A 股",
                "2": "B 股",
                "3": "权证",
                "4": "期货",
                "5": "债券",
                "10": "基金",
                "11": "开基",
                "12": "ETF",
                "13": "LOF",
                "14": "货基",
                "15": "QDII",
                "16": "封基",
                "21": "港股",
                "22": "窝轮",
                "31": "美股",
                "32": "外期",
                "40": "指数",
                "50": "期指"

            };
            this.ShowType = {
                "ABSTOCK": "1,2,3",
                "CNSTOCK": "1,2,3,10,50",
                "CNFUND": "11,12,13,14,15,16",
                "HKSTOCK": "21,22",
                "USASTOCK": "31"

            };
            this.init()

        },
        init: function() {
            this._Y = {};
            this.input = typeof(this.input) == "string" ? Gee.$(this.input) : this.input;
            if (this.input) {
                if (this._F == null) {
                    var FormNode = this.input.parentNode;
                    while (FormNode.nodeName.toLowerCase() != "form" && FormNode.nodeName.toLowerCase() != "body") {
                        FormNode = FormNode.parentNode

                    }
                    if (FormNode.nodeName.toLowerCase() == "form") {
                        this._oForm = {
                            action: FormNode.action,
                            target: FormNode.target,
                            method: FormNode.method,
                            onsubmit: FormNode.onsubmit

                        };
                        this._F = FormNode

                    } else {
                        this._F = Gee.$C("form");
                        this._F.method = "get";
                        if (this.autoSubmit) {
                            this._F.target = "_blank"

                        } else {
                            this._F.target = "_self";
                            this._F.onsubmit = function() {
                                return false

                            }

                        }
                        this.input.parentNode.insertBefore(this._F, this.input);
                        var _i = this.input;
                        this.input.parentNode.removeChild(this.input);
                        this._F.appendChild(_i)

                    }

                }
                if (this.autoSubmit) {
                    this._F.onsubmit = function() {
                        return false

                    }

                }
                this.input.value = this.text;
                this.input.setAttribute("autocomplete", "off");
                this.input.autoComplete = "off";
                this._iF = this._bd(this.inputFocus);
                this._iN = this._bd(this.Navigate);
                this._iC = this._bd(this.Confirm);
                Gee.$aE(this.input, "focus", this._iF);
                Gee.$aE(this.input, "blur", this._iF);
                Gee.$aE(this.input, "keyup", this._iN);
                if (this.autoSubmit) Gee.$aE(this.input, "keydown", this._iC);
                Gee.$aE(this.input, "mouseup", this._iN)

            }

        },
        dispose: function() {
            this._Y = {};
            this.input = typeof(this.input) == "string" ? Gee.$(this.input) : this.input;
            if (this.input) {
                if (this._oForm != null) {
                    this._F.action = this._oForm.action;
                    this._F.target = this._oForm.target;
                    this._F.method = this._oForm.method;
                    this._F.onsubmit = this._oForm.onsubmit

                }
                Gee.$dE(this.input, "focus", this._iF);
                Gee.$dE(this.input, "blur", this._iF);
                Gee.$dE(this.input, "keyup", this._iN);
                if (this.autoSubmit) Gee.$dE(this.input, "keydown", this._iC);
                Gee.$dE(this.input, "mouseup", this._iN)

            }

        },
        GetShowType: function() {
            if (this.type == "") return "";
            else return this.ShowType[this.type]

        },
        inputFocus: function(e) {
            var _t = e.type;
            if (this.input.value == this.text && _t.indexOf("focus") >= 0) {
                this.input.value = "";
                this._U = "";
                this.Suggest()

            } else if (this.input.value == "" && _t.indexOf("blur") >= 0) {
                this.input.value = this.text;
                this._U = "";
                this.hiddenResults()

            } else if (_t.indexOf("blur") >= 0) {
                this.hiddenResults()

            }

        },
        nGourl: false,
        Navigate: function(e) {
            var _K = this.header == null ? 0: 1;
            switch (e.keyCode) {
                case 38:
                this.nGourl = false;
                if (this.results != null && this.results.innerHTML != "") {
                    this.setLine(this.results.firstChild.rows[(!this._W || this._W.rowIndex == _K) ? this.results.firstChild.rows.length - 2: this._W.rowIndex - 1])

                }
                break;
                case 40:
                this.nGourl = false;
                if (this.results != null && this.results.innerHTML != "") {
                    this.setLine(this.results.firstChild.rows[(!this._W || this._W.rowIndex == this.results.firstChild.rows.length - 2) ? _K: this._W.rowIndex + 1])

                }
                break;
                case 13:
                if (!this.autoSubmit) {
                    this.nGourl = true;
                    if (this.results != null && this.results.innerHTML != "") {
                        var _s = this.input.value;
                        var _u = "";
                        if (this._W != null) {
                            if (("key_" + _s) in this._Y && this._Y["key_" + _s] != "") {
                                _u = this._Y["key_" + _s].replace(/&amp;/g, "&").replace(/;$/, "").split(";")

                            }
                            if (_u != "" && _u.length > 0) {
                                var obj = Gee.$(_u[0]);
                                if (typeof obj != "undefined") this.setLine(obj, e)

                            } else {
                                this.setLine(this._W, e)

                            }

                        } else {
                            var err = false;
                            if (("key_" + _s) in this._Y && this._Y["key_" + _s] != "") {
                                _u = this._Y["key_" + _s].replace(/&amp;/g, "&").replace(/;$/, "").split(";")

                            }
                            if (_u != "" && _u.length > 0) {
                                var obj = Gee.$(_u[0]);
                                if (typeof obj != "undefined") this.setLine(obj, e)

                            } else {
                                alert("您输入的股票代码不存在！");
                                err = true

                            }

                        }
                        if (this.callback != null && !err) {
                            this.callback({
                                code: this.input.value,
                                type: this.Market,
                                mt: this.mType,
                                cnName: this.SName

                            })

                        }

                    }
                    this.hiddenResults()

                } else {
                    this.Submit(this.input, false)

                }
                break;
                default:
                this.Suggest();
                break

            }

        },
        Confirm: function(e) {
            if (e.keyCode == 13) {
                this.nGourl = true;
                if (this.results != null && this.results.innerHTML != "") {
                    var isErr = false;
                    var _s = this.input.value;
                    var _u = "";
                    if (this._W != null) {
                        if (("key_" + _s) in this._Y && this._Y["key_" + _s] != "") {
                            _u = this._Y["key_" + _s].replace(/&amp;/g, "&").replace(/;$/, "").split(";")

                        }
                        if (_u != "" && _u.length > 0) {
                            var obj = Gee.$(_u[0]);
                            this.setLine(obj, e)

                        } else {
                            this.setLine(this._W, e)

                        }

                    } else {
                        if (("key_" + _s) in this._Y && this._Y["key_" + _s] != "") {
                            _u = this._Y["key_" + _s].replace(/&amp;/g, "&").replace(/;$/, "").split(";")

                        }
                        if (_u != "" && _u.length > 0) {
                            var obj = Gee.$(_u[0]);
                            this.setLine(obj, e)

                        } else {
                            alert("您输入的股票代码不存在！");
                            isErr = true

                        }

                    }
                    if (this.callback != null && !isErr) {
                        this.callback({
                            code: this.input.value,
                            type: this.Market,
                            mt: this.mType

                        })

                    }

                } else {
                    alert("请输入股票代码！")

                }
                this.hiddenResults()

            } else {
                this.Suggest()

            }

        },
        _bd: function(_b, _c) {
            var _d = this;
            return function() {
                var _e = null;
                if (typeof _c != "undefined") {
                    for (var i = 0; i < arguments.length; i++) {
                        _c.push(arguments[i])

                    }
                    _e = _c

                } else {
                    _e = arguments

                }
                return _b.apply(_d, _e)

            }

        },
        _gt: function() {
            return (new Date()).getTime()

        },
        Suggest: function() {
            var _s = this.input.value;
            if (this._U != _s) {
                this._U = _s;
                if (_s != "") {
                    if (("key_" + _s) in this._Y) {
                        this.Tip()

                    } else {
                        this._io(_s, this._bd(this.Tip), this._bd(this.hiddenResults))

                    }

                } else {
                    if (this.results != null && this.results.innerHTML != "") {
                        this._W = null

                    }
                    this.hiddenResults()

                }

            } else {
                this.setResults()

            }

        },
        setResults: function() {
            if (this.results != null) this.results.style.display = ""

        },
        hiddenResults: function() {
            if (this._hidden == false) {
                if (this.results != null) this.results.style.display = "none"

            }

        },
        _io: function(s, _E, _F) {
            if (this._R == null) {
                this._R = Gee.$C("div");
                this._R.style.display = "none";
                document.body.insertBefore(this._R, document.body.lastChild)

            }
            var dataObjName = "sData_" + this._gt();
            var _H = Gee.$C("script");
            _H.type = "text/javascript";
            _H.charset = "gb2312";
            _H.src = this.dataurl.replace("{#NAME}", dataObjName).replace("{#KEY}", escape(s)).replace("{#TYPE}", this.GetShowType());
            _H._0j = this;
            if (_E) {
                _H._0k = _E

            }
            if (_F) {
                _H._0l = _F

            }
            _H._0m = s;
            _H._0n = dataObjName;
            _H[document.all ? "onreadystatechange": "onload"] = function() {
                if (document.all && this.readyState != "loaded" && this.readyState != "complete") {
                    return

                }
                var _I = window[this._0n];
                if (typeof _I != "undefined") {
                    this._0j._Y["key_" + this._0m] = _I;
                    this._0k(_I);
                    window[this._0n] = null

                }
                this._0j = null;
                this._0m = null;
                this._0n = null;
                this[document.all ? "onreadystatechange": "onload"] = null;
                this.parentNode.removeChild(this)

            };
            this._R.appendChild(_H)

        },
        Submit: function(e, isOut) {
			alert("=====");
            if (typeof isOut == "undefined") isOut = true;
            if (isOut) this._D = null;
            var _u = "";
            if (this._D == null) {
                var _s = this.input.value;
                if ( !! this._Y["key_" + _s]) {
                    var _u = this._Y["key_" + _s].replace(/&amp;/g, "&").replace(/;$/, "").split(";");
                    if (_u != "" && _u.length > 0) {
                        var _tD = _u[0].split(",");
                        this._D = _tD

                    }

                } else {
                    var _u = "http://quote.eastmoney.com/"

                }

            }
            if (this._D != null && this._D != "") {
                switch (this._D[2]) {
                    case "1":
                case "2":
                case "3":
                case "5":
                case "10":
                case "41":
                    var __mI = "sh";
                    if (this._D[5] == "2") __mI = "sz";
                    _u = "http://quote.eastmoney.com/" + __mI + this._D[1] + ".html";
                    break;
                    case "4":
                    _u = "http://quote.eastmoney.com/qihuo/" + this._D[1] + ".html";
                    break;
                    case "40":
                    _u = "http://quote.eastmoney.com/zs" + this._D[1] + ".html";
                    break;
                    case "11":
                case "12":
                case "13":
                case "14":
                case "15":
                case "16":
                    _u = "http://fund.eastmoney.com/" + this._D[1] + ".html";
                    break;
                    case "21":
                case "22":
                    _u = "http://quote.eastmoney.com/hk/" + this._D[1] + ".html";
                    break;
                    case "31":
                case "32":
                    _u = "http://quote.eastmoney.com/us/" + this._D[1] + ".html";
                    break;
                    case "50":
                    _u = "http://quote.eastmoney.com/gzqh/" + this._D[1] + ".html";
                    break;
                    default:
                    _u = "http://quote.eastmoney.com/" + this._D[1] + ".html";
                    break

                }
                if (_u != "") {
                    var isEnter = false;
                    var tmpInput = this.input.name;
                    var tempVal = this.input.value;
                    if (typeof e != "undefined") {
                        this.input.name = "";
                        this.input.value = "";
                        if (e.keyCode == 13) isEnter = true

                    } else {
                        var isSixNum = !isNaN(this.input.value) && this.input.value.length == 6;
                        if ( !! isOut && !isSixNum) {
                            this.input.name = "stockcode";
                            _u = "http://quote.eastmoney.com/search.html";
                            if (this.text.indexOf(this.input.value) >= 0 || this.input.value == "") {
                                this.input.name = "";
                                this.input.value = "";
                                _u = "http://quote.eastmoney.com/"

                            }

                        }

                    }
                    this.goUrl(_u, "_blank", isEnter);
                    this.input.name = tmpInput;
                    this.input.value = tempVal

                }

            } else {
                var tmpInput = this.input.name;
                var tempVal = this.input.value;
                this.input.name = "stockcode";
                var urlStr = "http://quote.eastmoney.com/search.html";
                if (this.text.indexOf(this.input.value) >= 0 || this.input.value == "") {
                    this.input.name = "";
                    this.input.value = "";
                    urlStr = "http://quote.eastmoney.com/"

                }
                this.goUrl(urlStr, "_blank", isEnter);
                this.input.name = tmpInput;
                this.input.value = tempVal

            }

        },
        goUrl: function(url, target, iE) {
		
				
            if (this._F != null) {
                this._F.action = url;
                this._F.target = target;
                this._F.method = "get";
                this._F.onsubmit = function() {
					
                    return true

                };
				
                if (!iE) this._F.submit()

            } else {
                alert("Error")

            }
            this.hiddenResults()

        },
        setColor: function(o) {
            var _B = "";
            if (o._0f && o._0g) {
                _B = "#F8FBDF"

            } else if (o._0f) {
                _B = "#F1F5FC"

            } else if (o._0g) {
                _B = "#FCFEDF"

            }
            if (o.style.backgroundColor != _B) {
                o.style.backgroundColor = _B

            }

        },
        setLine: function(o, e) {
            var _C = o.id.split(",");
            this._D = _C;
            var _D = _C[1];
            this._U = _D;
            this.Market = _C[2];
            this.mType = _C[5];
            this.SName = _C[4];
            this.input.value = _D;
            if (this._W != null) {
                this._W._0f = false;
                this.setColor(this._W)

            }
            o._0f = true;
            this.setColor(o);
            this._W = o;
			//alert(this.nGourl);
            if (this.autoSubmit && this.nGourl) this.Submit(e, false)

        },
        mouseoverLine: function(o) {
            o._0g = true;
            this.setColor(o)

        },
        mouseoutLine: function(o) {
            o._0g = false;
            this.setColor(o)

        },
        setLineMouse: function(o) {
            this.nGourl = true;
            this.setLine(o);
            if (this.callback != null) {
                this.callback({
                    code: this.input.value,
                    type: this.Market,
                    mt: this.mType,
                    cnName: this.SName

                })

            }

        },
        hidepause: function() {
            this._hidden = true

        },
        hideresume: function() {
            this._hidden = false;
            this.hiddenResults()

        },
        setTip: function() {
            var _j = 0;
            var _k = 0;
            var _f = this.input;
            if (Gee.getStyle(_f.parentNode, 'position').toLowerCase() != "relative") {
                do {
                    _j += _f.offsetTop || 0;
                    _k += _f.offsetLeft || 0;
                    if (Gee.getStyle(_f, 'position').toLowerCase() == "relative") break;
                    _f = _f.offsetParent

                }
                while (_f);
                var _l = [this.input.parentNode.style.borderTopWidth.replace("px", "") * 1, this.input.parentNode.style.borderLeftWidth.replace("px", "") * 1];
                var _o = [1, 1];
                if (this.results.style.top != _j + "px") {
                    this.results.style.top = _j - _l[0] + _o[0] + "px"

                }
                if (this.results.style.left != _k + "px") {
                    this.results.style.left = _k - _l[1] + _o[1] + "px"

                }

            } else {
                this.results.style.top = "0";
                this.results.style.left = "0"

            }
            var _p = this.input.style.borderTopWidth;
            var _q = this.input.style.borderBottomWidth;
            var _r = this.input.clientHeight;
            _r += _p != "" ? _p.replace("px", "") * 1: 2;
            _r += _q != "" ? _q.replace("px", "") * 1: 2;
            if (this.results.style.marginTop != _r + "px") {
                this.results.style.marginTop = _r + "px"

            }

        },
        Tip: function() {
            var _s = this.input.value;
            if (("key_" + _s) in this._Y && !!this._Y["key_" + _s] && this._Y["key_" + _s] != "undefined" && this._Y["key_" + _s] != "") {
                if (this.results == null) {
                    this.results = Gee.$C("div");
                    this.results.className = "suggest-result";
                    this.results.style.cssText = "z-index:9999;width:" + this.width + "px;opacity:" + this.opacity + ";filter:alpha(opacity:" + (this.opacity * 100) + ");position:absolute;display:none;";
                    if (this.className == "") this.results.style.border = "1px solid #ccc";
                    else this.results.className = this.className;
                    this.input.parentNode.insertBefore(this.results, this.input);
                    this.results["suggest"] = this

                }
                this.setTip();
                this.results.innerHTML = "";
                var t = Gee.$C("table");
                t.border = "0";
                t.cellPadding = "0";
                t.cellSpacing = "0";
                t.style.cssText = "line-height:18px;border:1px solid #FFF;background:#FFF;font-size:12px;text-align:center;color:#666;width:100%;";
                var tB = Gee.$C("tbody");
                var _t_h_tr = Gee.$C("tr");
                _t_h_tr.style.cssText = "background:#E6F4F5;height:22px;line-height:22px;overflow:hidden;";
                if (this.header != null) {
                    for (var i = 0; i < this.header.length; i++) {
                        var _t_th = Gee.$C("th");
                        if (this.header[i] == "代码") _t_th.width = 52;
                        if (this.header[i] == "类型") _t_th.width = 40;
                        _t_th.innerHTML = this.header[i];
                        _t_h_tr.appendChild(_t_th)

                    }

                }
                tB.appendChild(_t_h_tr);
                var _u = this._Y["key_" + _s].replace(/&amp;/g, "&").replace(/;$/, "").split(";");
                var _v = _u.length > this.max ? this.max: _u.length;
                for (var i = 0; i < _v; i++) {
                    var _x = _u[i].split(",");
                    _x[ - 1] = _x[0].replace(_s.toUpperCase(), '<span style="color:#F00;">' + _s.toUpperCase() + '</span>');
                    _x[ - 2] = _x[2] in this.StockType ? this.StockType[_x[2]] : "--";
                    var _t_tr = Gee.$C("tr");
                    _t_tr.id = _u[i];
                    _t_tr.style.cursor = "pointer";
                    _t_tr._oj = this;
                    _t_tr.onmouseover = function() {
                        this._oj.mouseoverLine(this)

                    };
                    _t_tr.onmouseout = function() {
                        this._oj.mouseoutLine(this)

                    };
                    _t_tr.onmousedown = function() {
                        return this._oj.hidepause(this)

                    };
                    _t_tr.onclick = function() {
                        this._oj.setLineMouse(this);
                        this._oj.hideresume(this)

                    };
                    var _t_td;
                    for (var j = 0; j < this.body.length; j++) {
                        _t_td = Gee.$C("td");
                        _t_td.style.wordBreak = 'break-all';
                        _t_td.hidefocus = "true";
                        _t_td.style.padding = "1px";
                        _t_td.innerHTML = _x[this.body[j]];
                        _t_tr.appendChild(_t_td)

                    }
                    _t_td = null;
                    tB.appendChild(_t_tr)

                }
                var _more_t_tr = Gee.$C("tr");
                _more_t_tr.id = "_AutoSuggest_tip_More_";
                var _more_t_td = Gee.$C("td");
                _more_t_td.colSpan = this.header.length;
                _more_t_td.align = "right";
                _more_t_td.hidefocus = "true";
                _more_link = Gee.$C("a");
                _more_link.style.cssText = "color:#C00;float:none;clear:both;background:none;border:0;";
                _more_link.href = "http://quote.eastmoney.com/search.html?stockcode=" + escape(_s);
                _more_link.target = "_blank";
                _more_link.innerHTML = "更多查询结果&gt;&gt;";
                _more_link._oj = this;
                _more_link.onmousedown = function() {
                    return this._oj.hidepause(this)

                };
                _more_link.onclick = function() {
                    this._oj.hideresume(this)

                };
                _more_t_td.appendChild(_more_link);
                _more_t_tr.appendChild(_more_t_td);
                tB.appendChild(_more_t_tr);
                t.appendChild(tB);
                this.results.appendChild(t);
                this.setResults()

            } else {
                this.hiddenResults()

            }

        }

    });
    window.StockSuggest = StockSuggest

})(); 