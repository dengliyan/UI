(function () {
    var Class = {
        create: function () {
            return function () { this.initialize.apply(this, arguments) }
        }
    };
    Object.extend = function (destination, source) {
        for (property in source) {
            destination[property] = source[property]
        }
        return destination;
    };
    Object.extend(Function.prototype, {
        bind: function () {
            var __m = this,
            object = arguments[0],
            args = new Array();
            for (var i = 1; i < arguments.length; i++) {
                args.push(arguments[i])
            }
            return function () {
                return __m.apply(object, args)
            }
        }
    });
    //工具类处理
    var Utils = {
        $: function (o) {
            return typeof (o) == 'string' ? document.getElementById(o) : o;
        },
        $E: function (tag) {
            return document.createElement(tag || 'div');
        },
        $M: function (ele, css, attr) {
            css = css || {};
            attr = attr || {};
            if (!ele || !css || !attr) {
                return;
            }
            var z, y = ele.style, x;
            for (var i in css) {
                z = css[i];
                y[i] = z;
            }
            for (var i in attr) {
                z = css[i];
                ele.setAttribute = z
            }
        },
        $aE: function (tag, cls, css, attr, father) {
            father = father || document.body;
            var ele = this.$E(tag); 			//创建一个元素
            if (cls) ele.className = cls; 		//添加一个样式
            this.$M(ele, css || {}, attr || {}); 	//组织数据
            return father.appendChild(ele); 	//追加到数据
        },
        loadJs: function (url, charset, callback) {
            var _js = document.createElement('script');
            var _this = this;
            if (!(charset == null || charset == '')) { _js.setAttribute('charset', charset); }
            _js.setAttribute('type', 'text/javascript');
            _js.setAttribute('src', url);
            document.getElementsByTagName('head')[0].appendChild(_js);
            _js.onload = _js.onreadystatechange = function () {
                if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
                    callback(_js);
                    Utils.removeJs(_js);
                }
            }
        },
        removeJs: function (o) {
            var _js = (typeof o == "string") ? document.getElementById(o) : o;
            _js.onload = _js.onreadystatechange = null;
            try {
                _js.parentNode.removeChild(_js);
            } catch (e) { }
        },
        //颜色处理
        color: function (input, init, compare) {
            if (input == "") { return ""; }
            if (init > compare) return "<span style=\"color:#F00\">" + input + "</span>";
            if (init < compare) return "<span style=\"color:#090\">" + input + "</span>";
            return "<span>" + input + "</span>";
        },
        //转换数字
        formatNumber: function (input, len, def) {
            def = def || '0.00';
            input = parseFloat(input);
            if (!len || isNaN(parseInt(len))) len = 0;
            return isNaN(input) ? def : input.toFixed(len);
        },
        //转换成百分比
        formatPercent: function (input, def) {
            def = def || '';
            input = parseFloat(input);
            return isNaN(input) ? def : input.toFixed(2) + "%";
        },
        //转换成金钱格式
        currency: function (a, b) {
            a = a.toFixed(b);
            a += '';
            var x = a.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
    };
    function StockQuoteTable(obj, opt) {
        //当前编号
        this.containerID = obj;
        //初始化数据
        this.initedData = {};
        //最后加载数据
        this.lastData = {};
        //定时器
        this.timeInterval = null;
        //列对应表
        this.columnMap = {
            'code': { name: '股票代码', i: function (d, c) { return '<a href="http://stock.quote.stockstar.com/' + d[c['code']] + '.shtml" target="_blank">' + d[c['code']] + '</a>'; } }
			, 'name': { name: '股票名称', i: function (d, c) { return '<a href="http://stock.quote.stockstar.com/' + d[c['code']] + '.shtml" target="_blank">' + d[c['name']] + '</a>'; } }
			, 'close': { name: '最新价', c: 'right num', compare: 'close', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['close']], 2, 0), d[c['cv']], 0); } }
			, 'cv': { name: '涨跌额', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['cv']], 2, 0), d[c['cv']], 0); } }
			, 'cr': { name: '涨跌幅', c: 'right', i: function (d, c) { return Utils.color(Utils.formatPercent(d[c['cr']] * 100, 0), d[c['cv']], 0); } }
			, 'open': { name: '今开', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['open']], 2, 0), d[c['open']], d[c['prev']]); } }
			, 'prev': { name: '昨收', c: 'right', i: function (d, c) { return Utils.formatNumber(d[c['prev']],2); } }
			, 'high': { name: '最高', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['high']], 2, 0), d[c['high']], d[c['prev']]); } }
			, 'low': { name: '最低', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['low']], 2, 0), d[c['low']], d[c['prev']]); } }
			, 'pe': { name: '市盈率', c: 'right', i: function (d, c) { return Utils.formatNumber(d[c['pe']], 2); } }
			, 'tr': { name: '换手率', c: 'right', i: function (d, c) { return Utils.formatPercent(d[c['tr']] * 100, 0); } }
			, 'val': { name: '金额', c: 'right', i: function (d, c) { return '-'; } }
			, 'vol': { name: '总手', c: 'right', i: function (d, c) { return '-'; } }
			, 'wb': { name: '委比', c: 'right', i: function (d, c) { return Utils.formatPercent(d[c['wb']] * 100, 0); } }
			, 'lb': { name: '量比', c: 'right', i: function (d, c) { return Utils.formatNumber(d[c['lb']], 2); } }
			, 'lhr': { name: '振幅', c: 'right', i: function (d, c) { return Utils.formatPercent(d[c['lhr']] * 100, 0); } }
			, 'info': { name: '相关资讯', i: function (d, c) { return '<a href="http://stock.quote.stockstar.com/' + d[c['code']] + '.shtml" target="_blank">行情</a>　<a href="http://news.stockstar.com/info/dstock.aspx?code=' + d[c['code']] + '" target="_blank">资讯</a>'; } }
        };
        //关键字，进行数据匹配的标识，默认为代码+市场
        this.key = 'id';
        //编号数据
        if (!StockQuoteTable.childs) {
            StockQuoteTable.childs = []
        };
        this.id = StockQuoteTable.childs.push(this) - 1;
        //设置选项
        this.setOptions = function (opt) {
            this.options = {
                args: {
                    i: 's',
                    p: 10,
                    o: "nq,d",
                    n: 'ssQuoteCallback'
                },
                columns: ['code', 'name', 'close', 'cr', 'info'],
                timeOut: 10
            };
            Object.extend(this.options, opt || {});
        };

        //从服务器接收数据
        this.receive = function (force) {
            force = force || false; //是否为强制刷新
            //分析请求的URL地址
            var p = [];
            for (var g in this.options.args) {
                p.push(g + "=" + this.options.args[g]);
            }
            var url = 'http://192.168.13.117:8088/handler/hq.ashx?r=' + (new Date()).getTime() + '&' + p.join('&');
            //创建层
            var _this = this;
            var createMask = function () {
                var mask = Utils.$aE('div', '',
				{
				    'position': 'absolute'
					, 'width': _this.containerID.offsetWidth + 'px'
					, 'height': _this.containerID.offsetHeight + 'px'
					, 'lineHeight': _this.containerID.offsetHeight + 'px'
					, 'textAlign': 'center'
					, 'zIndex': 1000
					, 'left': 0
					, 'top': 0
					, 'backgroundColor': '#000'
					, 'opacity': 0.75
					, 'filter': 'alpha(opacity=75)'
				}, {}, _this.containerID);
                mask.innerHTML = '<span style="background-color:#FFD; border:solid 1px #FD9; padding:6px 18px">数据加载中....</span>';
            };
            //关闭层
            var closeMask = function () {
                //查找指定的编号
                var mask = _this.containerID.getElementsByTagName('div');
                //存在数据，则删除
                if (mask && mask.length > 0) {
                    _this.containerID.removeChild(mask[0]);
                }
            };
            //如果为强制运行，则创建更新提示层
            if (force) {
                //关闭层
                createMask();
                //强制更新清空上一次数据
                _this.lastData = {};
                //清空定时器
                if (this.timeInterval)
                    clearInterval(this.timeInterval);
            }
            //当前时间已经收盘，则不更新
            Utils.loadJs(url, 'gb2312', function () {
                //获取当前返回的变量名 
                var name = _this.options.args.n;
                //存储数据
                _this.initedData = {};
                _this.initedData = window[name];
                //填充数据
                _this.fill();
                //关闭层
                if (force) {
                    //隐藏刷新层
                    setTimeout(function () { closeMask(); }, 100);
                    //重新建立定时器
                    _this.timeInterval = setInterval("StockQuoteTable.childs[" + _this.id + "].receive()", _this.options.timeOut * 1000);
                }
            });
        };
        //填充数据
        this.fill = function () {
            var table = this.containerID.getElementsByTagName('table'); //查找是否存在表格
            if (table == null || table == undefined || table.length == 0) {
                //创建一个表格
                this.createTable();
				//加载数据
				this.reloadTable(table[0]);
            }
            else {
                //缓存数据到表格上
                this.reloadTable(table[0]);
            }
            //后期处理
            //清空上一次请求的数据
            if (this.initedData != null && this.initedData != undefined && this.initedData.datas != null && this.initedData.datas != undefined && this.initedData.datas.length > 0 && this.initedData.columns != null && this.initedData.columns != undefined) {
                this.lastData = {};
                for (var i = 0; i < this.initedData.datas.length; i++) {
                    var key = this.initedData.datas[i][this.initedData.columns[this.key]];
                    this.lastData[key] = this.initedData.datas[i];
                }
            }
        };
        //创建表格
        this.createTable = function () {
            try {
                //创建一个表格
                var _table = Utils.$aE("table", '', { "width": "100%", "border": "none" }, null, this.containerID);
                //创建表头
                var _thead = Utils.$aE("thead", '', {}, {}, _table);
                //创建一个tbody
                var _tbody = Utils.$aE("tbody", '', {}, {}, _table);
                _table.border = "0";
                _table.cellPadding = "0";
                _table.cellSpacing = "0";
                var _columns = this.options.columns;
                //表头
                var _thead_tr = Utils.$aE("tr", null, null, null, _thead);
                //加载表头
                for (var g in _columns) {
                    var i = this.columnMap[_columns[g]] || {};
                    var _th = Utils.$aE('th', '', null, null, _thead_tr);
                    _th.innerHTML = i.name || '未定义';
                    //需要进行比较，防止添加字符时，宽度变化		
                    if ((i.compare || '').length > 0) {
                        Utils.$M(_th, { width: 66 + "px", padding: 0 }, null);
                    }
                }
				//初始化数据
				for (var i = 0; i < this.options.args.p; i++) {
                        //创建表格一行
                        var _tbody_tr = Utils.$aE("tr", i % 2 == 0 ? "even" : "odd", null, null, _tbody);
                        for (var g in _columns) {                            
                            var _td = Utils.$aE('td', null, null, null, _tbody_tr);
                            //更新内容
                            _td.innerHTML = '--';
                        }
				}
            }
            catch (e) {
            }
        };
        //在已有表格上绑定数据
        this.reloadTable = function (o) {
            try {
                //当前数据不为空
                if (this.initedData != null && this.initedData != undefined
					&& this.initedData.datas != null && this.initedData.datas != undefined && this.initedData.datas.length > 0
					&& this.initedData.columns != null && this.initedData.columns != undefined) {
                    //防止加载数据失败，清空表格，只有在数据加载成功才展示
                    //加载表内容
                    var _tbody = o.getElementsByTagName("tbody")[0];
                    //清空当前的数据
                    o.removeChild(_tbody);
                    //创建一个tbody
                    _tbody = Utils.$aE("tbody", '', {}, {}, o);
                    var _columns = this.options.columns;
					//判断是否要进行闪烁					
                    //加载数据
                    for (var i = 0; i < this.initedData.datas.length; i++) {
                        var _tbody_tr = Utils.$aE("tr", i % 2 == 0 ? "even" : "odd", null, null, _tbody); //创建表格一行
                        //判断本行数据是上一行中是否存在
                        var _key = this.initedData.datas[i][this.initedData.columns[this.key]];
                        //与上一次的数据进行比较
                        var _isExists = (this.lastData[_key] || []).length > 0;
                        for (var g in _columns) {
                            var o = this.columnMap[_columns[g]] || { i: function () { return '-'; } };
                            var c = o.c || '';
                            var _td = Utils.$aE('td', c, null, null, _tbody_tr); //添加一行数据
                            _td.innerHTML = o.i(this.initedData.datas[i], this.initedData.columns); //更新内容
                            //如果当前的股票在上一次中存在，则闪烁
                            //每次更新比较的字段
                            var compare = o.compare || '';
                            if (_isExists && compare.length > 0) {
                                //上一次的行情价格
                                var p = (this.lastData[_key] || {})[this.initedData.columns[compare]] || 0;
                                //当前的行情价格
                                var c = this.initedData.datas[i][this.initedData.columns[compare]];
								//闪烁
								this.flicker(_td, p > c ? -1 : p < c ? 1 : 0);
                            }
                        }
                    }
                }
            }
            catch (e) {
            }
        };
        //初始化数据
        this.init = function () {
            //初始容器
            this.containerID = Utils.$(this.containerID);
            if (this.containerID) {
                //设置层样式为relative
                Utils.$M(this.containerID, { position: 'relative' });
				//初始化表格
				this.createTable();
                //加载数据
                this.receive();
                //定时刷新
                this.timeInterval = setInterval("StockQuoteTable.childs[" + this.id + "].receive()", this.options.timeOut * 1000);
            }
        };
        //价格闪烁操作
        this.flicker = function (o, a) {
            var times = 1, intervalId;
            var color = (a == 1 ? "#FFE1E1" : a == -1 ? "#D7F2DC" : "");
            var arrow = (a == 1 ? "↑" : a == -1 ? "↓" : "");
            var children = o.getElementsByTagName("span");
            //如果找到合适的数据
            if (children != null && children != undefined && children.length > 0) {
                var tween = function (a, b) {
                    //次数+1
                    times++;
                    if ((a.style.backgroundColor || "") == "") {
                        a.style.backgroundColor = color;
                        if (b != null && b != undefined) {
                            var html = b.innerHTML;
                            b.innerHTML = arrow + html.replace("↑", "").replace("↓", "");
                        }
                    } else {
                        a.style.backgroundColor = '';
                    }
                    if (times > 5 && intervalId) {
                        clearInterval(intervalId);
                    }
                }
                //建立定时器
                intervalId = setInterval(function () { tween(o, children[0]); }, 250);
            }
        };
        //加载配置文件
        this.setOptions(opt);
        //初始化
        this.init();
    };
    window.StockQuoteTable = StockQuoteTable;
})();