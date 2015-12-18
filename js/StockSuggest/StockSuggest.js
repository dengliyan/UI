/*
	功能描述：股票搜索提示建议
	作    者：ly.deng
	修改记录：
		1.2 采用q.ssajax.cn域名进行数据传输
		1.3 添加submit提交方式，callback统一放到submit方法执行
		1.4 修正股指链接不正确显示，由原来的GET方式，改成POST方式提交到指定的页面
		1.5	(1)、添加关联事件
			(2)、取消错误数据
			(3)、添加多个代码查询
			(4)、添加自定义Class功能
			(5)、修复父层定义相对定位时，位置计算错误问题
			(6)、添加默认提交按钮事件绑定
			(7)、添加更多连接显示
		1.6 (1)、添加行情软件快捷键展示功能
			(2)、添加排序种类优先
			(3)、取消直接到达页面功能，统一由exdir进行操作
		1.7 (1)、修复Exdir跳转BUG	
		1.8 (1)、统一POST到新页面直接跳转
 2013-01-31 (1)、修复了因*ST股票无法显示的BUG
*/
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
    /*基础操作类*/
    var $Base = {
        $: function (objName) {
            if (document.getElementById) {
                return eval('document.getElementById("' + objName + '")')
            } else {
                return eval('document.all.' + objName)
            }
        },
        isIE: navigator.appVersion.indexOf("MSIE") != -1 ? true : false,
        addEvent: function (l, i, I) {
            if (l.attachEvent) {
                l.attachEvent("on" + i, I)
            } else {
                l.addEventListener(i, I, false)
            }
        },
        delEvent: function (l, i, I) {
            if (l.detachEvent) {
                l.detachEvent("on" + i, I)
            } else {
                l.removeEventListener(i, I, false)
            }
        },
        cE: function (o) {
            return document.createElement(o)
        },
		getStyle: function (obj, prop) {
            if (obj.currentStyle) { //IE浏览器
                return obj.currentStyle[prop];
            } else if (window.getComputedStyle) { //W3C标准浏览器
                propprop = prop.replace(/([A-Z])/g, "-$1");
                propprop = prop.toLowerCase();
                return document.defaultView.getComputedStyle(obj, null)[propprop];
            }
            return null;
        },
		/*修改此处代码*/
        offset: function (o) {
			var x = 0, y = 0, element = o;
            y += element.offsetTop;
            x += element.offsetLeft;
            element = element.offsetParent;
            while (element.offsetParent) {
                var position = ($Base.getStyle(element, "position") || "").toLowerCase();
                if (!(position == "absolute" || position == "relative")) {
                    y += element.offsetTop;
                    x += element.offsetLeft;
                }
                element = element.offsetParent;
            }
            return { 'left': x, 'top': y };
		},
		subString:function(str, len,eps){
			eps=eps||false;
			if(!str || !len) { return ''; }
			var a = 0,i = 0,temp = '';
			for (i=0;i<str.length;i++){
				if (str.charCodeAt(i)>255)
					a+=2;
				else
					a++;
				if(a > len) { return eps?temp+"...":temp; }
				temp += str.charAt(i);
			}
			return str;
		}
    };
	
    var StockSuggest = Class.create();
    Object.extend(StockSuggest.prototype, {
        initialize: function (obj, opt) {
            var self = this;
            self.url = "http://q.ssajax.cn/info/handler/xsuggesthandler.ashx"; //当前的请求地址
			//self.url = "http://localhost:31304/SSHandler.Web/Handler/xSuggestHandler.ashx"; //当前的请求地址
            self.input = obj;                    //当前的输入框
            self.form = null;                    //当前需要提交的表单   
			self.disabled=false;
            self.columns={												//数据转换格式
            	"选项":function(i,s){ 
					//正则转义
					var b = /([\^|\$|\.|\*|\+|\?|\=|\!|\:|\\|\/|\(|\)|\[|\]|\{|\}])/gi;  //需要转义的字符
                    var a = s.replace(b, "\\" + "$1"); //替换数据
					var reg = new RegExp('^' + a + '.*$', 'im');
					for (var sourceIndex = 0; sourceIndex < 3; sourceIndex++) {
						var content = i[sourceIndex];
						if (reg.test(content)) {
							content=$Base.subString(content,8);
							return ((typeof content === "string") ? content.replace(s.toUpperCase(), "<span style='color:#FF0000;float:none'>" + s.toUpperCase() + "</span>") : content)
						}
					}
					return i[0];	
					
				},
				"代码":function(i,s){ return i[0];},
            	"简称":function(i,s){ return i[1];},
            	"拼音":function(i,s){ return i[2];},
            	"类型":function(i,s){ return i[3];}
            };			
			self._tableCssText={
				thead:{
					"选项":"width:60px;text-align:center",
					"代码":"width:60px;text-align:center",
					"简称":"text-align:left;padding-left:24px",
					"拼音":"width:60px;text-align:center",
					"类型":"width:60px;text-align:center"
				},
				tbody:{
					"选项":"text-align:center",
					"代码":"text-align:center",
					"简称":"text-align:left;padding-left:12px",
					"拼音":"text-align:center",
					"类型":"text-align:center"
				}
			};
			
			//快捷键定义
			self._shortKeyMap={
				"03":"http://index.quote.stockstar.com/000001.shtml",//上证指数
				"04":"http://index.quote.stockstar.com/399001.shtml",//深证成指
				"06":"http://quote.stockstar.com/stock/fav/favorite.htm",//自选股报价
				"1":"http://quote.stockstar.com/stock/sha.shtml",//上证 A 股
				"2":"http://quote.stockstar.com/stock/shb.shtml",//上证 B 股
				"3":"http://quote.stockstar.com/stock/sza.shtml",//深证 A 股
				"4":"http://quote.stockstar.com/stock/szb.shtml",//深证 B 股
				"5":"http://quote.stockstar.com/stock/ranklist_shbond_1_0_1.html",//上证债券
				"6":"http://quote.stockstar.com/stock/ranklist_szbond_1_0_1.html",//深证债券
				"7":"http://quote.stockstar.com/stock/ranklist_a_1_0_1.html",//沪深 A 股
				"8":"http://quote.stockstar.com/stock/ranklist_b_1_0_1.html",//沪深 B 股
				"9":"http://quote.stockstar.com/stock/small.shtml",//中小企业
				"40":"http://quote.stockstar.com/fund/closed.shtml",//封闭式基金
				"41":"http://quote.stockstar.com/fund/open.shtml",//开放式基金
				"42":"http://quote.stockstar.com/fund/etf.shtml",//ETF
				"43":"http://quote.stockstar.com/fund/lof.shtml",//LOF
				"60":"http://quote.stockstar.com/stock/ranklist_a.shtml",//沪深A股涨跌排行
				"61":"http://quote.stockstar.com/stock/ranklist_sha.shtml",//上证A股涨跌排行
				"62":"http://quote.stockstar.com/stock/ranklist_shb.shtml",//上证B股涨跌排行
				"63":"http://quote.stockstar.com/stock/ranklist_sza.shtml",//深证A股涨跌排行
				"64":"http://quote.stockstar.com/stock/ranklist_szb.shtml",//深证B股涨跌排行
				"65":"http://quote.stockstar.com/stock/ranklist_shbond.shtml",//上证债券涨跌排行
				"66":"http://quote.stockstar.com/stock/ranklist_szbond.shtml",//深证债券涨跌排行
				"67":"http://quote.stockstar.com/stock/ranklist_gem.shtml",//创业板涨跌排行
				"68":"http://quote.stockstar.com/stock/ranklist_b.shtml",//沪深B股涨跌排行
				"69":"http://quote.stockstar.com/stock/ranklist_small.shtml",//中小板涨跌排行
				"80":"http://quote.stockstar.com/stock/rank_a.shtml",//沪深A股综合排名 
				"81":"http://quote.stockstar.com/stock/rank_sha.shtml",//上证A股综合排名
				"82":"http://quote.stockstar.com/stock/rank_shb.shtml",//上证B股综合排名
				"83":"http://quote.stockstar.com/stock/rank_sza.shtml",//深证A股综合排名
				"84":"http://quote.stockstar.com/stock/rank_szb.shtml",//深证B股综合排名
				//"85":"",//上证债券综合排名
				//"86":"",//深证债券综合排名
				"87":"http://quote.stockstar.com/stock/rank_gem.shtml",//创业板综合排名
				"89":"http://quote.stockstar.com/stock/rank_small.shtml",//中小板综合排名
				"180":"http://index.quote.stockstar.com/000010.shtml",//上证 180 走势
				"100":"http://index.quote.stockstar.com/399004.shtml",//深证 100 走势
				"300":"http://index.quote.stockstar.com/000300.shtml",//沪深300
				"50":"http://index.quote.stockstar.com/000016.shtml"//上证50
			};
            self._U = null;                      //当前提交的
            self._hidden = false;              //是否隐藏
            self._cache = {};                    //缓存对象
            self._enabled=true;
            self._index=-1;			//当前的索引位置
			self.copyright={version:'1.8',author:'ly.deng'};
            self.setOptions(opt);
			//整理因老版本带来的错误
			var b=[];
			for(var i=0;i<self.options.header.columns.length;i++){
				if(self.options.header.columns[i]!="选项"){
					b.push(self.options.header.columns[i]);
				}
			}
			self.options.header.columns=b;
            self.init();
        },
        setOptions:function(opt){
        	this.options={
				width: "220px",						//宽度
				opacity:1,							//透明度
				multiple:false,						//多个显示
				className: '',						//追加的类名
				text: "代码/拼音/简称",	//默认显示的文字
				rows: 10,							//当前返回的数量
				types: [101, 102, 103, 104, 105, 201, 300, 401, 403, 405, 501, 502, 503, 504,801,802,9001],//股票的类型
				status: [1],						//上市状态
				shortcutKey:false,					//行情软件中的快捷键 
				orderBy:2,							//指数优先
				resultVar: "result",				//返回的变量
				header: {show:true,columns:["选项","简称","类型"]},	//搜索结果呈现样式,
				more: true,							//是否显示更多
				autoSubmit: true,					//允许自动提交
				evt:false,							//绑定提交事件
				callback: function (a,b,c) { }   	//自身对象，代码，名称，市场，类型
        	};
        	Object.extend(this.options, opt || {});
      	},
        init: function () {
            this.input = typeof (this.input) == "string" ? $Base.$(this.input) : this.input; //建立操作对象
            if (!this.input) {
                throw new Error("无对象");
            }
            this.input.value = this.options.text;
            this.input.setAttribute("autocomplete", "off");
			this.input.autoComplete = "off";
            this.input.style.color="#999";
            this.input.autoComplete = "off";
			this.input.name='code';//模拟提交表单信息
            if (this.form == null) {
                 var _parent = this.input.parentNode;
				 /*
				 while (_parent.nodeName.toLowerCase() != "form" && _parent.nodeName.toLowerCase() != "body") {
                    _parent = _parent.parentNode;
                 }
				 */
                 if (_parent.nodeName.toLowerCase() == "form") {                       
                    this.form = _parent;
                 } else {//创建一个表单
	                 this.form = $Base.cE("form");
	                 this.input.parentNode.insertBefore(this.form, this.input);
	                 var _i = this.input;
	                 this.input.parentNode.removeChild(this.input);
	                 this.form.appendChild(_i);
                }
				this.form.method = "post";
            }	
			//不允许自动提交	
			if(!this.options.autoSubmit){
				this.form.onsubmit = function() {return false;};
			}
			//创建一个动态的元素			
            //绑定事件            
            $Base.addEvent(this.input, "focus", this.bind(this.inputFocus)); //光标定位事件
            $Base.addEvent(this.input, "blur", this.bind(this.inputBlur)); //光标离开事件			
            $Base.addEvent(this.input, "keyup", this.bind(this.keyupListener));//键盘事件
			$Base.addEvent(this.input, "keydown",this.bind(this.keydownListener));//键盘事件
			//绑定按钮事件
			this.evt=null;
			if(this.options.evt&&(this.evt=$Base.$(this.options.evt))){	
				$Base.addEvent(this.evt, "click", this.bind(this.btnClick));//键盘事件
			}
        },
        bind: function (_b, _c) {
            var _d=this;return function(){var _e=null;if(typeof _c!="undefined"){for(var i=0;i<arguments.length;i++){_c.push(arguments[i])}_e=_c}else{_e=arguments}return _b.apply(_d,_e)};
        },
		btnClick:function(e){
			this.submit();
		},
        inputBlur: function (e) {//光标定义与离开事件
            if (this.input.value == "") {
                this.input.value = this.options.text;
                this._U = "";
                this.hiddenWrapper()
            } else{
                this.hiddenWrapper();
            }
			this.multipleTips(false);
        },
        inputFocus: function (e) {//光标定义与离开事件
            if (this.input.value == this.options.text) {
                this.input.value = "";
                this._U = "";  
				this.multipleTips(true);				
            }
            this.dataTrigger(false);			
        },
        keyupListener: function (e) {//响应按键事件
			var key = (window.event) ? window.event.keyCode : e.keyCode;			
            switch (key) {
                case 38: //向上按键 
                    if (this.wrapper != null && this.wrapper.innerHTML != ""&&this._enabled&&this.wrapper.firstChild.tBodies) {                    	  
                    	  		var _tbody = this.wrapper.firstChild.tBodies[0];
                            var _trows = _tbody.rows;//当前所有数据
                            var _rows = _trows.length;
                            if (this._index == -1) this._index = _rows - 1;
                            else this._index--;
                            if (this._index < 0||this._index > _rows - 1) { this._index = _rows - 1; }//计算上一个数据的索引
                            for (var i = 0; i < _rows; i++) {
                                if (i == this._index) {
                                    _trows[i]._over = true;
                                }
                                else {
                                    _trows[i]._over = false;
                                }
                                this.setColor(_trows[i]);
                            }
                            this.input.value=(_trows[this._index].getAttribute("ref")||"").split(',')[0];
                    }
                    break;
                case 40: //向下按键  
                    if (this.wrapper != null && this.wrapper.innerHTML != ""&&this._enabled&&this.wrapper.firstChild.tBodies) {
                    		 var _tbody = this.wrapper.firstChild.tBodies[0];
								 var _trows = _tbody.rows;
								 var _rows = _trows.length;
								 if (this._index == -1) { this._index = 0; }
								 else { this._index++; }
								 if (this._index > _rows - 1||this._index<0) { this._index = 0; }//计算下一个数据的索引
								 for (var i = 0; i < _rows; i++) {
									if (i == this._index) {
										_trows[i]._over = true;
									}
									else {
										_trows[i]._over = false;
									}
									this.setColor(_trows[i]);
							    }
								this.input.value=(_trows[this._index].getAttribute("ref")||"").split(',')[0];
                    }
                    break;                
                default:
					var o=this;
					o.multipleTips(false);
					o.dataTrigger(true);
                    break
            }
        },
		keydownListener:function(e){			
			var key = (window.event) ? window.event.keyCode : e.keyCode;	
			if(key==13){//回车
				var self=this;
                self._hidden = false;                
			 	self.submit(true);//自动触发
				self.hiddenWrapper();
                setTimeout(function(){self.input.blur();},10);	//主动离开会取消autosubmit		
			}
		},        
        dataTrigger: function (e) {//数据调用事件 
        	this._index = -1;
			//强制读取数据			
            var _s =e?this.input.value:(this._U|| this.input.value);//加载上一次查询的数据  
			//如果使用了多个查询，则
			if(this.options.multiple){
				var c = _s.split(/[,，;； ]{1}/);
				if (c.length > 1) {
					_s = c[c.length - 1];
					//如果有其他数据
					this.hiddenWrapper();
				};
			}
			//读取
			//console
			//location.hash="#"+this._U+"_"+"-"+_s;
            if (this._U != _s) {//如果数据发生了变化				
                this._U = _s; //更新内存中的数据
                if (_s != "") {
                    if (("key_" + _s) in this._cache) {//当前的数据在缓存中
                        this.dataFill()
                    } else {
                    	  if (this._R == null) {
							this._R = $Base.cE("div");
							this._R.style.display = "none";
							document.body.insertBefore(this._R, document.body.lastChild)
						} //建立新的对象
						var _js = $Base.cE('script');     //开始加载数据
						var self = this;
						var _name=self.options.resultVar;//名称
						var _url = this.url+'?'+([						            						
							'q='+encodeURIComponent(encodeURIComponent(_s))
							,'type='+this.options.types.join(',')
							,'n='+_name
							,'ls=' + this.options.status.join(',')
							,'key='+ this.options.shortcutKey
							,'order='+ this.options.orderBy
							,'rows='+this.options.rows
							,'_r='+(new Date()).getTime()
							].join('&'));//查询的URL地址
						//alert(_url);
						//location.hash="#"+encodeURIComponent(_url)
						_js.setAttribute('charset', 'gb2312'); 
						_js.setAttribute('type', 'text/javascript');
						_js.setAttribute('src', _url);
						this._R.appendChild(_js);
						_js.onload = _js.onreadystatechange = function () {
							if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
							  self._cache["key_"+_s]=window[_name];					//将数据加入到缓存中
							  self.dataFill();																//回调数据
							  _js.onload = _js.onreadystatechange = null;
							  window[_name]=null;															//清空内存中的对象
							  this.parentNode.removeChild(this);							//删除当前的数据            
							}
						}
                    }
                }else{                	
                   this.hiddenWrapper();
                }
            } else if(this._U!="") {
                this.showWrapper(); //显示当前的隐藏
            }
        },       
        hiddenWrapper: function () {//隐藏层
        	if (this._hidden == false) {			
                if (this.wrapper != null) this.wrapper.style.display = "none";                
            }
        },
        showWrapper: function () {//显示层
			if (this.wrapper != null) this.wrapper.style.display = "";
        },        
        //多个数据输入提示框
		//
		multipleTips:function(display){
			//创建多层	
			if(this.options.multiple){
				if(display){
					if (this.multiple == null) {//创建提示层
						//创建层
						this.multiple = $Base.cE("div");
						//添加样式
						this.multiple.style.cssText = "display:none;z-index:100000;position:absolute;background:url(http://i.ssimg.cn/images/www/suggest_info.gif) no-repeat;height:56px;position:absolute;width:129px;";
						//添加层
						this.input.parentNode.insertBefore(this.multiple, this.input);
					}
					//计算位置
					this.setPosition(this.multiple);
					this.multiple.style.display='block';
				}else if(this.multiple){
					this.multiple.style.display='none';
				}
			}
		},
		dataFill: function () {//数据加载与填充
            var _s = this._U;//this.input.value;
            if (("key_" + _s) in this._cache && this._cache["key_" + _s]!=null&& this._cache["key_" + _s] != undefined) {//开始加载数据
                if (this.wrapper == null) {//创建提示层
					this.wrapper = $Base.cE("div");
                    //层的编号
					this.wrapper.id = "ssajax_lib_suggest_result_layer_"+this.input.id;   
					//层上的自定义样式
					this.wrapper.className = this.options.className;
                    this.input.parentNode.insertBefore(this.wrapper, this.input);
                }                         
                this.wrapper.style.cssText = "z-index:9999;width:" + this.options.width + ";opacity:" + this.options.opacity + ";filter:alpha(opacity:" + (this.options.opacity * 100) + ");position:absolute;display:none;border:1px dashed #ccc";
				//this.wrapper.style.cssText = "z-index:9999;opacity:" + this.options.opacity + ";filter:alpha(opacity:" + (this.options.opacity * 100) + ");position:absolute;display:none;border:1px dashed #ccc";
                this.setPosition(this.wrapper); 
                var _table = $Base.cE("table");
                var _tbody = $Base.cE("tbody");	//
                var _thead = $Base.cE("thead");
                var _tfoot = $Base.cE("tfoot");	//
                var _thead_tr = $Base.cE("tr");	//表头
                _table.border = "0";
                _table.cellPadding = "0";
                _table.cellSpacing = "0";
                _table.style.cssText = "line-height:18px;background:#FFF;font-size:12px;text-align:center;color:#666;width:100%;font-weight:normal";
                _thead_tr.style.cssText = "background:#cce8f8;height:22px;line-height:22px;overflow:hidden;font-weight:normal";
                if (this.options.header != null&&this.options.header.show&&this.options.header.columns&&this.options.header.columns.length>0) {
					//修正算法，第一项必须显示成选项
					var _th = $Base.cE("th");
					_th.innerHTML = "选项";
					_th.style.cssText = this._tableCssText.thead["选项"];
					_thead_tr.appendChild(_th);
					for (var i = 0; i < this.options.header.columns.length; i++) {						
						_th = $Base.cE("th");
						_th.innerHTML = this.options.header.columns[i];
						_th.style.cssText = this._tableCssText.thead[this.options.header.columns[i]];
						_thead_tr.appendChild(_th);
					}
					_thead.appendChild(_thead_tr);
					_table.appendChild(_thead);
                }
                var _u = this._cache["key_" + _s]||{summary:{total:0},datas:[]};
                var _v = _u.datas.length > this.options.rows ? this.options.rows: _u.datas.length;
                this._enabled=_v>0;
				//判断是否有证券数据
				//判断表头中包含有选项
				//数据兼容
				//var security=false;
				//判断当前数据中有无股票代码
				//for (var i = 0; i < _v; i++) {
				//	if(_u.datas[i][5]!=0){
				//		security=true;
				//		break;
				//	}
				//}
                for (var i = 0; i < _v; i++) {
					var _tbody_tr = $Base.cE("tr");
                    _tbody_tr.setAttribute("ref",_u.datas[i].join(","));//添加属性
                    _tbody_tr.style.cursor = "pointer";
                    _tbody_tr.index=i;
                    var self=this;
                    _tbody_tr.onmouseover = function() {                        
                        //self._index = this.index;//重新读取新的索引
                        if (self.wrapper != null && self.wrapper.innerHTML != ""&&self.wrapper.firstChild.tBodies) {//清空当前的选定
	                        	var _tbody = self.wrapper.firstChild.tBodies[0];
				                    var _trows = _tbody.rows;
				                    var _rows = _trows.length;
				                    for (var i = 0; i < _rows; i++) {
				                        _trows[i]._over = false;
				                        self.setColor(_trows[i]);
				                    }
                        }
						this._over = true;
						//取消移动时取值
						self.setColor(this);
                    };
                    _tbody_tr.onmouseout = function() {
                        this._over = false;			
						self.setColor(this);
                    };
                    _tbody_tr.onmousedown = function() {
						 self._index = this.index;//重新读取新的索引
                    	 self._hidden = true
                    };
                    _tbody_tr.onclick = function() {//点击提交数据 
						self._hidden = false;
						this._over = false;	
						self.hiddenWrapper();		
						self.setColor(this);										
						self.submit();
                    };					
                    var _t_td= $Base.cE("td");
					_t_td.style.wordBreak = 'break-all';
					_t_td.hidefocus = "true";
					_t_td.style.padding = "1px";
					_t_td.innerHTML = this.columns["选项"]( _u.datas[i],_s);
					_t_td.style.cssText = this._tableCssText.tbody["选项"];
					_tbody_tr.appendChild(_t_td);
					//如果快捷键数据，则不显示后边的数据
                    for (var j = 0; j <this.options.header.columns.length; j++) {
						//security
						_t_td = $Base.cE("td");
						_t_td.style.wordBreak = 'break-all';
						_t_td.hidefocus = "true";
						_t_td.style.padding = "1px";
						_t_td.style.cssText = this._tableCssText.tbody[this.options.header.columns[j]];
						_t_td.innerHTML = this.columns[this.options.header.columns[j]]( _u.datas[i],_s);
						_tbody_tr.appendChild(_t_td);
						//如果是快捷键，只显示一行，则进行设置colspan属性
						if(_u.datas[i][5]==0){
							_t_td.colSpan=this.options.header.columns.length;
							_t_td.innerHTML ="";
							_t_td.innerHTML = this.columns["简称"]( _u.datas[i],_s);	
							_t_td.style.cssText = this._tableCssText.tbody["简称"];							
							//if(this.options.header.columns[j]=="简称")
							//_t_td.innerHTML = this.columns["简称"]( _u.datas[i],_s);							
							break;
						}
                    }
                    _t_td = null;
                    _tbody.appendChild(_tbody_tr);
                }				
                if(_v==0){
                		var _tbody_tr = $Base.cE("tr");
                		var _t_td = $Base.cE("td");
                		_tbody_tr.style.cssText = "background:#FFF;height:25px;line-height:25px;overflow:hidden;color:#999";
                		_t_td.colSpan=this.options.header.columns.length+1;
						_t_td.style.cssText = "text-align:center";
                		_t_td.innerHTML="未找到符合条件的结果";
                		_tbody_tr.appendChild(_t_td);
                		_tbody.appendChild(_tbody_tr);
                }
				//判断数量是否大于，且需要展示更多
				if(_u.summary.total>10&&this.options.more){
					var _tbody_tr = $Base.cE("tr");	
					var _t_td = $Base.cE("td");						
					_tbody_tr.style.cssText = "background:#FFF;height:22px;line-height:22px;overflow:hidden;color:#999;text-align:center";
                    _t_td.style.padding = "1px";
					_t_td.hidefocus = "true";
					_t_td.colSpan=this.options.header.columns.length+1;
					_t_td.innerHTML='<a href="http://quote.stockstar.com/search.aspx?keyword='+_s+'" target="_blank">查看全部&gt;&gt;</a>';
					_tbody_tr.onmousedown = function() {
                    	 self._hidden = true
                    };
					_tbody_tr.onclick = function(evt) {//点击提交数据						
						self._hidden = false;
						self.hiddenWrapper();						
                    };
					_tbody_tr.appendChild(_t_td);
					_tfoot.appendChild(_tbody_tr);			
				}
                _table.appendChild(_tbody);	
                _table.appendChild(_tfoot);	
				this.wrapper.innerHTML = ""; 								//清空当前的数据								
                this.wrapper.appendChild(_table);
                this.showWrapper();
            }else{
				this.hiddenWrapper()
            }
        },
        setColor: function(o) {
            var _Bg = "";
            if (o._over) {
                _Bg = "#FEF175";
            }
            else {
                _Bg = "#FFFFFF";
            }
            o.style.backgroundColor = _Bg;
        },        
        setPosition: function (target) {            
            var _offset=$Base.offset(this.input);
            var _j = _offset.top;
            var _k = _offset.left;            
            var _l = [this.input.parentNode.style.borderTopWidth.replace("px", "") * 1, this.input.parentNode.style.borderLeftWidth.replace("px", "") * 2];
            var _o = [0, 0];
            if (target.style.top != _j + "px") {
                target.style.top = _j - _l[0] + _o[0] + "px"
            }			
            if (target.style.left != _k + "px") {
                target.style.left = _k - _l[1] + _o[1] + "px"
            }			
            var _p = this.input.style.borderTopWidth;
            var _q = this.input.style.borderBottomWidth;
            var _r = this.input.clientHeight;
            _r += _p != "" ? _p.replace("px", "") * 1 : 2;
            _r += _q != "" ? _q.replace("px", "") * 1 : 2;
            if (target.style.marginTop != _r + "px") {
                target.style.marginTop = _r + "px"
            }
        },
        getSelectData:function(){
			var index=this._index;
        	if (this.wrapper != null && this.wrapper.innerHTML != ""&&this.wrapper.firstChild.tBodies) {
							var _tbody = this.wrapper.firstChild.tBodies[0];
							var _trows = _tbody.rows;
							var _rows = _trows.length;
							if(index<0) index=0;
							if(index>_rows-1) index=_rows-1;
							var _tRow=_trows[index];//获取当前的数据
							var _i=(_tRow.getAttribute("ref")||"").split(",");//生成默认的数据
							if(_i.length==0) return null;
							return _i;
			}
			return null;
		},
		//跳转到某个页面
		goto:function(url,e,m,t){			
			var self=this;
			e= e || false;
			self.form.action=url;
        	self.form.method= m ||"post";
        	self.form.target=t||"_blank";
			self.form.onsubmit = function() {return true;};	
			if(!e){			
				self.form.submit();
				self.form.onsubmit = function() {return false;};		
			}
		},		
		/*提交数据方法，对于控件可以直接使用*/
        submit: function(isEnter) {
        	 var index=this._index;		
			 isEnter=isEnter || false;	
        	 if (this.wrapper != null && this.wrapper.innerHTML != ""&&this.wrapper.firstChild.tBodies) {			 
							var _tbody = this.wrapper.firstChild.tBodies[0];
							var _trows = _tbody.rows;
							var _rows = _trows.length;
							//处理
							if(index<0){
								//判断当前的输入的数据是否存在下拉框中
								//如果不存在，则进入搜索页面
								//如果存在，则进行跳转
								var value=this.input.value,isExists=false,findItem=0;
								//只存在一条记录时，则进行查询
								if(_trows.length==1){
									var array=(_trows[0].getAttribute("ref")||"").split(",");//生成默认的数据
									if(array.length==0) return false;
									if(array.length>=3&&(array[0]==value||array[1].toLowerCase()==value.toLowerCase()||array[2].toLowerCase()==value.toLowerCase())){
										isExists=true;
										index=0;
									}
								}
								//如果没有找到，则退出
								//没有找到，且当前允许自动提交或无callback
								//多条记录，直接进行exdir进行查询
								if(!isExists&&this.options.autoSubmit){
									var action="http://quote.stockstar.com/stock/exdir.aspx?code="+value;
									var method='post';
									this.goto(action,isEnter);
									return false;
								}
							}
							if(index<0) index=0;
							if(index>_rows-1) index=_rows-1;
							var _tRow=_trows[index];//获取当前的数据
							//回车事件取消选中状态
							_tRow._over = false;			
							this.setColor(_tRow);							
							var _i=(_tRow.getAttribute("ref")||"").split(",");//生成默认的数据
							if(_i.length==0) return false;
							//多条记录							
							this.input.value=_i[0];							
							if(!this.options.autoSubmit&&this.options.callback!=null){
								this.options.callback(this,_i,isEnter);//使用回调函数								
								return false;
							}
							var action="http://quote.stockstar.com/stock/exdir.aspx?code="+_i[0]+"&mk="+_i[4]+"&securtytype="+_i[5]+"&target=quotesearch";
							var method='post';
							switch(_i[5]){
								case "101":
								case "102":
								case "103":
								case "104":
								case "105":
									action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent("http://stock.quote.stockstar.com/" + _i[0] + ".shtml");
									break;
								case "201":
								case "202":
								case "203":
								case "204":
									action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent("http://index.quote.stockstar.com/" + _i[0] + ".shtml");
									break;
								case "300":
								case "301":
									action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent("http://if.quote.stockstar.com/" + _i[0] + ".shtml");
									break;
								case "401":
								case "403":
								case "404":
									action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent("http://bond.quote.stockstar.com/" + _i[0] + ".shtml");
									break;
								case "500":
								case "501":
								case "502":
								case "503":
								case "504":
									action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent("http://fund.stockstar.com/funds/" + _i[0] + ".shtml");
									break;
								case "0":									
									//快捷键处理
									if(this._shortKeyMap[_i[0]]){
										action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent(this._shortKeyMap[_i[0]]);									
									}else{
										action="http://quote.stockstar.com/stock/exdir.aspx?code="+_i[0]+"&mk=null&securtytype=-1&target=quotesearch";		
									}
									break;	
								case "9001":
									//添加对余额宝指数的支持
									if(_i[0]=="000198QX")
										action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent("http://resource.stockstar.com/DataCenter/StockData/yeb.htm");
									break;								
								default:
									action="http://quote.stockstar.com/stock/exdir.aspx?code="+_i[0]+"&mk="+_i[4]+"&securtytype="+_i[5]+"&target=quotesearch";	
									break;												
							};				
							this.goto(action,isEnter,method);
        	}
			else{
				//无数据提交
				var action="http://quote.stockstar.com/stock/exdir.aspx?code="+this.input.value;
				this.goto(action,isEnter);
				return false;
			}
        }
    });
    window.StockSuggest = StockSuggest;
})();