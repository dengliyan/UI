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
    //�����ദ��
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
            var ele = this.$E(tag); 			//����һ��Ԫ��
            if (cls) ele.className = cls; 		//���һ����ʽ
            this.$M(ele, css || {}, attr || {}); 	//��֯����
            return father.appendChild(ele); 	//׷�ӵ�����
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
        //��ɫ����
        color: function (input, init, compare) {
            if (input == "") { return ""; }
            if (init > compare) return "<span style=\"color:#F00\">" + input + "</span>";
            if (init < compare) return "<span style=\"color:#090\">" + input + "</span>";
            return "<span>" + input + "</span>";
        },
        //ת������
        formatNumber: function (input, len, def) {
            def = def || '0.00';
            input = parseFloat(input);
            if (!len || isNaN(parseInt(len))) len = 0;
            return isNaN(input) ? def : input.toFixed(len);
        },
        //ת���ɰٷֱ�
        formatPercent: function (input, def) {
            def = def || '';
            input = parseFloat(input);
            return isNaN(input) ? def : input.toFixed(2) + "%";
        },
        //ת���ɽ�Ǯ��ʽ
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
        //��ǰ���
        this.containerID = obj;
        //��ʼ������
        this.initedData = {};
        //����������
        this.lastData = {};
        //��ʱ��
        this.timeInterval = null;
        //�ж�Ӧ��
        this.columnMap = {
            'code': { name: '��Ʊ����', i: function (d, c) { return '<a href="http://stock.quote.stockstar.com/' + d[c['code']] + '.shtml" target="_blank">' + d[c['code']] + '</a>'; } }
			, 'name': { name: '��Ʊ����', i: function (d, c) { return '<a href="http://stock.quote.stockstar.com/' + d[c['code']] + '.shtml" target="_blank">' + d[c['name']] + '</a>'; } }
			, 'close': { name: '���¼�', c: 'right num', compare: 'close', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['close']], 2, 0), d[c['cv']], 0); } }
			, 'cv': { name: '�ǵ���', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['cv']], 2, 0), d[c['cv']], 0); } }
			, 'cr': { name: '�ǵ���', c: 'right', i: function (d, c) { return Utils.color(Utils.formatPercent(d[c['cr']] * 100, 0), d[c['cv']], 0); } }
			, 'open': { name: '��', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['open']], 2, 0), d[c['open']], d[c['prev']]); } }
			, 'prev': { name: '����', c: 'right', i: function (d, c) { return Utils.formatNumber(d[c['prev']],2); } }
			, 'high': { name: '���', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['high']], 2, 0), d[c['high']], d[c['prev']]); } }
			, 'low': { name: '���', c: 'right', i: function (d, c) { return Utils.color(Utils.formatNumber(d[c['low']], 2, 0), d[c['low']], d[c['prev']]); } }
			, 'pe': { name: '��ӯ��', c: 'right', i: function (d, c) { return Utils.formatNumber(d[c['pe']], 2); } }
			, 'tr': { name: '������', c: 'right', i: function (d, c) { return Utils.formatPercent(d[c['tr']] * 100, 0); } }
			, 'val': { name: '���', c: 'right', i: function (d, c) { return '-'; } }
			, 'vol': { name: '����', c: 'right', i: function (d, c) { return '-'; } }
			, 'wb': { name: 'ί��', c: 'right', i: function (d, c) { return Utils.formatPercent(d[c['wb']] * 100, 0); } }
			, 'lb': { name: '����', c: 'right', i: function (d, c) { return Utils.formatNumber(d[c['lb']], 2); } }
			, 'lhr': { name: '���', c: 'right', i: function (d, c) { return Utils.formatPercent(d[c['lhr']] * 100, 0); } }
			, 'info': { name: '�����Ѷ', i: function (d, c) { return '<a href="http://stock.quote.stockstar.com/' + d[c['code']] + '.shtml" target="_blank">����</a>��<a href="http://news.stockstar.com/info/dstock.aspx?code=' + d[c['code']] + '" target="_blank">��Ѷ</a>'; } }
        };
        //�ؼ��֣���������ƥ��ı�ʶ��Ĭ��Ϊ����+�г�
        this.key = 'id';
        //�������
        if (!StockQuoteTable.childs) {
            StockQuoteTable.childs = []
        };
        this.id = StockQuoteTable.childs.push(this) - 1;
        //����ѡ��
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

        //�ӷ�������������
        this.receive = function (force) {
            force = force || false; //�Ƿ�Ϊǿ��ˢ��
            //���������URL��ַ
            var p = [];
            for (var g in this.options.args) {
                p.push(g + "=" + this.options.args[g]);
            }
            var url = 'http://192.168.13.117:8088/handler/hq.ashx?r=' + (new Date()).getTime() + '&' + p.join('&');
            //������
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
                mask.innerHTML = '<span style="background-color:#FFD; border:solid 1px #FD9; padding:6px 18px">���ݼ�����....</span>';
            };
            //�رղ�
            var closeMask = function () {
                //����ָ���ı��
                var mask = _this.containerID.getElementsByTagName('div');
                //�������ݣ���ɾ��
                if (mask && mask.length > 0) {
                    _this.containerID.removeChild(mask[0]);
                }
            };
            //���Ϊǿ�����У��򴴽�������ʾ��
            if (force) {
                //�رղ�
                createMask();
                //ǿ�Ƹ��������һ������
                _this.lastData = {};
                //��ն�ʱ��
                if (this.timeInterval)
                    clearInterval(this.timeInterval);
            }
            //��ǰʱ���Ѿ����̣��򲻸���
            Utils.loadJs(url, 'gb2312', function () {
                //��ȡ��ǰ���صı����� 
                var name = _this.options.args.n;
                //�洢����
                _this.initedData = {};
                _this.initedData = window[name];
                //�������
                _this.fill();
                //�رղ�
                if (force) {
                    //����ˢ�²�
                    setTimeout(function () { closeMask(); }, 100);
                    //���½�����ʱ��
                    _this.timeInterval = setInterval("StockQuoteTable.childs[" + _this.id + "].receive()", _this.options.timeOut * 1000);
                }
            });
        };
        //�������
        this.fill = function () {
            var table = this.containerID.getElementsByTagName('table'); //�����Ƿ���ڱ��
            if (table == null || table == undefined || table.length == 0) {
                //����һ�����
                this.createTable();
				//��������
				this.reloadTable(table[0]);
            }
            else {
                //�������ݵ������
                this.reloadTable(table[0]);
            }
            //���ڴ���
            //�����һ�����������
            if (this.initedData != null && this.initedData != undefined && this.initedData.datas != null && this.initedData.datas != undefined && this.initedData.datas.length > 0 && this.initedData.columns != null && this.initedData.columns != undefined) {
                this.lastData = {};
                for (var i = 0; i < this.initedData.datas.length; i++) {
                    var key = this.initedData.datas[i][this.initedData.columns[this.key]];
                    this.lastData[key] = this.initedData.datas[i];
                }
            }
        };
        //�������
        this.createTable = function () {
            try {
                //����һ�����
                var _table = Utils.$aE("table", '', { "width": "100%", "border": "none" }, null, this.containerID);
                //������ͷ
                var _thead = Utils.$aE("thead", '', {}, {}, _table);
                //����һ��tbody
                var _tbody = Utils.$aE("tbody", '', {}, {}, _table);
                _table.border = "0";
                _table.cellPadding = "0";
                _table.cellSpacing = "0";
                var _columns = this.options.columns;
                //��ͷ
                var _thead_tr = Utils.$aE("tr", null, null, null, _thead);
                //���ر�ͷ
                for (var g in _columns) {
                    var i = this.columnMap[_columns[g]] || {};
                    var _th = Utils.$aE('th', '', null, null, _thead_tr);
                    _th.innerHTML = i.name || 'δ����';
                    //��Ҫ���бȽϣ���ֹ����ַ�ʱ����ȱ仯		
                    if ((i.compare || '').length > 0) {
                        Utils.$M(_th, { width: 66 + "px", padding: 0 }, null);
                    }
                }
				//��ʼ������
				for (var i = 0; i < this.options.args.p; i++) {
                        //�������һ��
                        var _tbody_tr = Utils.$aE("tr", i % 2 == 0 ? "even" : "odd", null, null, _tbody);
                        for (var g in _columns) {                            
                            var _td = Utils.$aE('td', null, null, null, _tbody_tr);
                            //��������
                            _td.innerHTML = '--';
                        }
				}
            }
            catch (e) {
            }
        };
        //�����б���ϰ�����
        this.reloadTable = function (o) {
            try {
                //��ǰ���ݲ�Ϊ��
                if (this.initedData != null && this.initedData != undefined
					&& this.initedData.datas != null && this.initedData.datas != undefined && this.initedData.datas.length > 0
					&& this.initedData.columns != null && this.initedData.columns != undefined) {
                    //��ֹ��������ʧ�ܣ���ձ��ֻ�������ݼ��سɹ���չʾ
                    //���ر�����
                    var _tbody = o.getElementsByTagName("tbody")[0];
                    //��յ�ǰ������
                    o.removeChild(_tbody);
                    //����һ��tbody
                    _tbody = Utils.$aE("tbody", '', {}, {}, o);
                    var _columns = this.options.columns;
					//�ж��Ƿ�Ҫ������˸					
                    //��������
                    for (var i = 0; i < this.initedData.datas.length; i++) {
                        var _tbody_tr = Utils.$aE("tr", i % 2 == 0 ? "even" : "odd", null, null, _tbody); //�������һ��
                        //�жϱ�����������һ�����Ƿ����
                        var _key = this.initedData.datas[i][this.initedData.columns[this.key]];
                        //����һ�ε����ݽ��бȽ�
                        var _isExists = (this.lastData[_key] || []).length > 0;
                        for (var g in _columns) {
                            var o = this.columnMap[_columns[g]] || { i: function () { return '-'; } };
                            var c = o.c || '';
                            var _td = Utils.$aE('td', c, null, null, _tbody_tr); //���һ������
                            _td.innerHTML = o.i(this.initedData.datas[i], this.initedData.columns); //��������
                            //�����ǰ�Ĺ�Ʊ����һ���д��ڣ�����˸
                            //ÿ�θ��±Ƚϵ��ֶ�
                            var compare = o.compare || '';
                            if (_isExists && compare.length > 0) {
                                //��һ�ε�����۸�
                                var p = (this.lastData[_key] || {})[this.initedData.columns[compare]] || 0;
                                //��ǰ������۸�
                                var c = this.initedData.datas[i][this.initedData.columns[compare]];
								//��˸
								this.flicker(_td, p > c ? -1 : p < c ? 1 : 0);
                            }
                        }
                    }
                }
            }
            catch (e) {
            }
        };
        //��ʼ������
        this.init = function () {
            //��ʼ����
            this.containerID = Utils.$(this.containerID);
            if (this.containerID) {
                //���ò���ʽΪrelative
                Utils.$M(this.containerID, { position: 'relative' });
				//��ʼ�����
				this.createTable();
                //��������
                this.receive();
                //��ʱˢ��
                this.timeInterval = setInterval("StockQuoteTable.childs[" + this.id + "].receive()", this.options.timeOut * 1000);
            }
        };
        //�۸���˸����
        this.flicker = function (o, a) {
            var times = 1, intervalId;
            var color = (a == 1 ? "#FFE1E1" : a == -1 ? "#D7F2DC" : "");
            var arrow = (a == 1 ? "��" : a == -1 ? "��" : "");
            var children = o.getElementsByTagName("span");
            //����ҵ����ʵ�����
            if (children != null && children != undefined && children.length > 0) {
                var tween = function (a, b) {
                    //����+1
                    times++;
                    if ((a.style.backgroundColor || "") == "") {
                        a.style.backgroundColor = color;
                        if (b != null && b != undefined) {
                            var html = b.innerHTML;
                            b.innerHTML = arrow + html.replace("��", "").replace("��", "");
                        }
                    } else {
                        a.style.backgroundColor = '';
                    }
                    if (times > 5 && intervalId) {
                        clearInterval(intervalId);
                    }
                }
                //������ʱ��
                intervalId = setInterval(function () { tween(o, children[0]); }, 250);
            }
        };
        //���������ļ�
        this.setOptions(opt);
        //��ʼ��
        this.init();
    };
    window.StockQuoteTable = StockQuoteTable;
})();