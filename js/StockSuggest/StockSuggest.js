/*
	������������Ʊ������ʾ����
	��    �ߣ�ly.deng
	�޸ļ�¼��
		1.2 ����q.ssajax.cn�����������ݴ���
		1.3 ���submit�ύ��ʽ��callbackͳһ�ŵ�submit����ִ��
		1.4 ������ָ���Ӳ���ȷ��ʾ����ԭ����GET��ʽ���ĳ�POST��ʽ�ύ��ָ����ҳ��
		1.5	(1)����ӹ����¼�
			(2)��ȡ����������
			(3)����Ӷ�������ѯ
			(4)������Զ���Class����
			(5)���޸����㶨����Զ�λʱ��λ�ü����������
			(6)�����Ĭ���ύ��ť�¼���
			(7)����Ӹ���������ʾ
		1.6 (1)��������������ݼ�չʾ����
			(2)�����������������
			(3)��ȡ��ֱ�ӵ���ҳ�湦�ܣ�ͳһ��exdir���в���
		1.7 (1)���޸�Exdir��תBUG	
		1.8 (1)��ͳһPOST����ҳ��ֱ����ת
 2013-01-31 (1)���޸�����*ST��Ʊ�޷���ʾ��BUG
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
    /*����������*/
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
            if (obj.currentStyle) { //IE�����
                return obj.currentStyle[prop];
            } else if (window.getComputedStyle) { //W3C��׼�����
                propprop = prop.replace(/([A-Z])/g, "-$1");
                propprop = prop.toLowerCase();
                return document.defaultView.getComputedStyle(obj, null)[propprop];
            }
            return null;
        },
		/*�޸Ĵ˴�����*/
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
            self.url = "http://q.ssajax.cn/info/handler/xsuggesthandler.ashx"; //��ǰ�������ַ
			//self.url = "http://localhost:31304/SSHandler.Web/Handler/xSuggestHandler.ashx"; //��ǰ�������ַ
            self.input = obj;                    //��ǰ�������
            self.form = null;                    //��ǰ��Ҫ�ύ�ı�   
			self.disabled=false;
            self.columns={												//����ת����ʽ
            	"ѡ��":function(i,s){ 
					//����ת��
					var b = /([\^|\$|\.|\*|\+|\?|\=|\!|\:|\\|\/|\(|\)|\[|\]|\{|\}])/gi;  //��Ҫת����ַ�
                    var a = s.replace(b, "\\" + "$1"); //�滻����
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
				"����":function(i,s){ return i[0];},
            	"���":function(i,s){ return i[1];},
            	"ƴ��":function(i,s){ return i[2];},
            	"����":function(i,s){ return i[3];}
            };			
			self._tableCssText={
				thead:{
					"ѡ��":"width:60px;text-align:center",
					"����":"width:60px;text-align:center",
					"���":"text-align:left;padding-left:24px",
					"ƴ��":"width:60px;text-align:center",
					"����":"width:60px;text-align:center"
				},
				tbody:{
					"ѡ��":"text-align:center",
					"����":"text-align:center",
					"���":"text-align:left;padding-left:12px",
					"ƴ��":"text-align:center",
					"����":"text-align:center"
				}
			};
			
			//��ݼ�����
			self._shortKeyMap={
				"03":"http://index.quote.stockstar.com/000001.shtml",//��ָ֤��
				"04":"http://index.quote.stockstar.com/399001.shtml",//��֤��ָ
				"06":"http://quote.stockstar.com/stock/fav/favorite.htm",//��ѡ�ɱ���
				"1":"http://quote.stockstar.com/stock/sha.shtml",//��֤ A ��
				"2":"http://quote.stockstar.com/stock/shb.shtml",//��֤ B ��
				"3":"http://quote.stockstar.com/stock/sza.shtml",//��֤ A ��
				"4":"http://quote.stockstar.com/stock/szb.shtml",//��֤ B ��
				"5":"http://quote.stockstar.com/stock/ranklist_shbond_1_0_1.html",//��֤ծȯ
				"6":"http://quote.stockstar.com/stock/ranklist_szbond_1_0_1.html",//��֤ծȯ
				"7":"http://quote.stockstar.com/stock/ranklist_a_1_0_1.html",//���� A ��
				"8":"http://quote.stockstar.com/stock/ranklist_b_1_0_1.html",//���� B ��
				"9":"http://quote.stockstar.com/stock/small.shtml",//��С��ҵ
				"40":"http://quote.stockstar.com/fund/closed.shtml",//���ʽ����
				"41":"http://quote.stockstar.com/fund/open.shtml",//����ʽ����
				"42":"http://quote.stockstar.com/fund/etf.shtml",//ETF
				"43":"http://quote.stockstar.com/fund/lof.shtml",//LOF
				"60":"http://quote.stockstar.com/stock/ranklist_a.shtml",//����A���ǵ�����
				"61":"http://quote.stockstar.com/stock/ranklist_sha.shtml",//��֤A���ǵ�����
				"62":"http://quote.stockstar.com/stock/ranklist_shb.shtml",//��֤B���ǵ�����
				"63":"http://quote.stockstar.com/stock/ranklist_sza.shtml",//��֤A���ǵ�����
				"64":"http://quote.stockstar.com/stock/ranklist_szb.shtml",//��֤B���ǵ�����
				"65":"http://quote.stockstar.com/stock/ranklist_shbond.shtml",//��֤ծȯ�ǵ�����
				"66":"http://quote.stockstar.com/stock/ranklist_szbond.shtml",//��֤ծȯ�ǵ�����
				"67":"http://quote.stockstar.com/stock/ranklist_gem.shtml",//��ҵ���ǵ�����
				"68":"http://quote.stockstar.com/stock/ranklist_b.shtml",//����B���ǵ�����
				"69":"http://quote.stockstar.com/stock/ranklist_small.shtml",//��С���ǵ�����
				"80":"http://quote.stockstar.com/stock/rank_a.shtml",//����A���ۺ����� 
				"81":"http://quote.stockstar.com/stock/rank_sha.shtml",//��֤A���ۺ�����
				"82":"http://quote.stockstar.com/stock/rank_shb.shtml",//��֤B���ۺ�����
				"83":"http://quote.stockstar.com/stock/rank_sza.shtml",//��֤A���ۺ�����
				"84":"http://quote.stockstar.com/stock/rank_szb.shtml",//��֤B���ۺ�����
				//"85":"",//��֤ծȯ�ۺ�����
				//"86":"",//��֤ծȯ�ۺ�����
				"87":"http://quote.stockstar.com/stock/rank_gem.shtml",//��ҵ���ۺ�����
				"89":"http://quote.stockstar.com/stock/rank_small.shtml",//��С���ۺ�����
				"180":"http://index.quote.stockstar.com/000010.shtml",//��֤ 180 ����
				"100":"http://index.quote.stockstar.com/399004.shtml",//��֤ 100 ����
				"300":"http://index.quote.stockstar.com/000300.shtml",//����300
				"50":"http://index.quote.stockstar.com/000016.shtml"//��֤50
			};
            self._U = null;                      //��ǰ�ύ��
            self._hidden = false;              //�Ƿ�����
            self._cache = {};                    //�������
            self._enabled=true;
            self._index=-1;			//��ǰ������λ��
			self.copyright={version:'1.8',author:'ly.deng'};
            self.setOptions(opt);
			//�������ϰ汾�����Ĵ���
			var b=[];
			for(var i=0;i<self.options.header.columns.length;i++){
				if(self.options.header.columns[i]!="ѡ��"){
					b.push(self.options.header.columns[i]);
				}
			}
			self.options.header.columns=b;
            self.init();
        },
        setOptions:function(opt){
        	this.options={
				width: "220px",						//���
				opacity:1,							//͸����
				multiple:false,						//�����ʾ
				className: '',						//׷�ӵ�����
				text: "����/ƴ��/���",	//Ĭ����ʾ������
				rows: 10,							//��ǰ���ص�����
				types: [101, 102, 103, 104, 105, 201, 300, 401, 403, 405, 501, 502, 503, 504,801,802,9001],//��Ʊ������
				status: [1],						//����״̬
				shortcutKey:false,					//��������еĿ�ݼ� 
				orderBy:2,							//ָ������
				resultVar: "result",				//���صı���
				header: {show:true,columns:["ѡ��","���","����"]},	//�������������ʽ,
				more: true,							//�Ƿ���ʾ����
				autoSubmit: true,					//�����Զ��ύ
				evt:false,							//���ύ�¼�
				callback: function (a,b,c) { }   	//������󣬴��룬���ƣ��г�������
        	};
        	Object.extend(this.options, opt || {});
      	},
        init: function () {
            this.input = typeof (this.input) == "string" ? $Base.$(this.input) : this.input; //������������
            if (!this.input) {
                throw new Error("�޶���");
            }
            this.input.value = this.options.text;
            this.input.setAttribute("autocomplete", "off");
			this.input.autoComplete = "off";
            this.input.style.color="#999";
            this.input.autoComplete = "off";
			this.input.name='code';//ģ���ύ����Ϣ
            if (this.form == null) {
                 var _parent = this.input.parentNode;
				 /*
				 while (_parent.nodeName.toLowerCase() != "form" && _parent.nodeName.toLowerCase() != "body") {
                    _parent = _parent.parentNode;
                 }
				 */
                 if (_parent.nodeName.toLowerCase() == "form") {                       
                    this.form = _parent;
                 } else {//����һ����
	                 this.form = $Base.cE("form");
	                 this.input.parentNode.insertBefore(this.form, this.input);
	                 var _i = this.input;
	                 this.input.parentNode.removeChild(this.input);
	                 this.form.appendChild(_i);
                }
				this.form.method = "post";
            }	
			//�������Զ��ύ	
			if(!this.options.autoSubmit){
				this.form.onsubmit = function() {return false;};
			}
			//����һ����̬��Ԫ��			
            //���¼�            
            $Base.addEvent(this.input, "focus", this.bind(this.inputFocus)); //��궨λ�¼�
            $Base.addEvent(this.input, "blur", this.bind(this.inputBlur)); //����뿪�¼�			
            $Base.addEvent(this.input, "keyup", this.bind(this.keyupListener));//�����¼�
			$Base.addEvent(this.input, "keydown",this.bind(this.keydownListener));//�����¼�
			//�󶨰�ť�¼�
			this.evt=null;
			if(this.options.evt&&(this.evt=$Base.$(this.options.evt))){	
				$Base.addEvent(this.evt, "click", this.bind(this.btnClick));//�����¼�
			}
        },
        bind: function (_b, _c) {
            var _d=this;return function(){var _e=null;if(typeof _c!="undefined"){for(var i=0;i<arguments.length;i++){_c.push(arguments[i])}_e=_c}else{_e=arguments}return _b.apply(_d,_e)};
        },
		btnClick:function(e){
			this.submit();
		},
        inputBlur: function (e) {//��궨�����뿪�¼�
            if (this.input.value == "") {
                this.input.value = this.options.text;
                this._U = "";
                this.hiddenWrapper()
            } else{
                this.hiddenWrapper();
            }
			this.multipleTips(false);
        },
        inputFocus: function (e) {//��궨�����뿪�¼�
            if (this.input.value == this.options.text) {
                this.input.value = "";
                this._U = "";  
				this.multipleTips(true);				
            }
            this.dataTrigger(false);			
        },
        keyupListener: function (e) {//��Ӧ�����¼�
			var key = (window.event) ? window.event.keyCode : e.keyCode;			
            switch (key) {
                case 38: //���ϰ��� 
                    if (this.wrapper != null && this.wrapper.innerHTML != ""&&this._enabled&&this.wrapper.firstChild.tBodies) {                    	  
                    	  		var _tbody = this.wrapper.firstChild.tBodies[0];
                            var _trows = _tbody.rows;//��ǰ��������
                            var _rows = _trows.length;
                            if (this._index == -1) this._index = _rows - 1;
                            else this._index--;
                            if (this._index < 0||this._index > _rows - 1) { this._index = _rows - 1; }//������һ�����ݵ�����
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
                case 40: //���°���  
                    if (this.wrapper != null && this.wrapper.innerHTML != ""&&this._enabled&&this.wrapper.firstChild.tBodies) {
                    		 var _tbody = this.wrapper.firstChild.tBodies[0];
								 var _trows = _tbody.rows;
								 var _rows = _trows.length;
								 if (this._index == -1) { this._index = 0; }
								 else { this._index++; }
								 if (this._index > _rows - 1||this._index<0) { this._index = 0; }//������һ�����ݵ�����
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
			if(key==13){//�س�
				var self=this;
                self._hidden = false;                
			 	self.submit(true);//�Զ�����
				self.hiddenWrapper();
                setTimeout(function(){self.input.blur();},10);	//�����뿪��ȡ��autosubmit		
			}
		},        
        dataTrigger: function (e) {//���ݵ����¼� 
        	this._index = -1;
			//ǿ�ƶ�ȡ����			
            var _s =e?this.input.value:(this._U|| this.input.value);//������һ�β�ѯ������  
			//���ʹ���˶����ѯ����
			if(this.options.multiple){
				var c = _s.split(/[,��;�� ]{1}/);
				if (c.length > 1) {
					_s = c[c.length - 1];
					//�������������
					this.hiddenWrapper();
				};
			}
			//��ȡ
			//console
			//location.hash="#"+this._U+"_"+"-"+_s;
            if (this._U != _s) {//������ݷ����˱仯				
                this._U = _s; //�����ڴ��е�����
                if (_s != "") {
                    if (("key_" + _s) in this._cache) {//��ǰ�������ڻ�����
                        this.dataFill()
                    } else {
                    	  if (this._R == null) {
							this._R = $Base.cE("div");
							this._R.style.display = "none";
							document.body.insertBefore(this._R, document.body.lastChild)
						} //�����µĶ���
						var _js = $Base.cE('script');     //��ʼ��������
						var self = this;
						var _name=self.options.resultVar;//����
						var _url = this.url+'?'+([						            						
							'q='+encodeURIComponent(encodeURIComponent(_s))
							,'type='+this.options.types.join(',')
							,'n='+_name
							,'ls=' + this.options.status.join(',')
							,'key='+ this.options.shortcutKey
							,'order='+ this.options.orderBy
							,'rows='+this.options.rows
							,'_r='+(new Date()).getTime()
							].join('&'));//��ѯ��URL��ַ
						//alert(_url);
						//location.hash="#"+encodeURIComponent(_url)
						_js.setAttribute('charset', 'gb2312'); 
						_js.setAttribute('type', 'text/javascript');
						_js.setAttribute('src', _url);
						this._R.appendChild(_js);
						_js.onload = _js.onreadystatechange = function () {
							if (!this.readyState || this.readyState == "loaded" || this.readyState == "complete") {
							  self._cache["key_"+_s]=window[_name];					//�����ݼ��뵽������
							  self.dataFill();																//�ص�����
							  _js.onload = _js.onreadystatechange = null;
							  window[_name]=null;															//����ڴ��еĶ���
							  this.parentNode.removeChild(this);							//ɾ����ǰ������            
							}
						}
                    }
                }else{                	
                   this.hiddenWrapper();
                }
            } else if(this._U!="") {
                this.showWrapper(); //��ʾ��ǰ������
            }
        },       
        hiddenWrapper: function () {//���ز�
        	if (this._hidden == false) {			
                if (this.wrapper != null) this.wrapper.style.display = "none";                
            }
        },
        showWrapper: function () {//��ʾ��
			if (this.wrapper != null) this.wrapper.style.display = "";
        },        
        //�������������ʾ��
		//
		multipleTips:function(display){
			//�������	
			if(this.options.multiple){
				if(display){
					if (this.multiple == null) {//������ʾ��
						//������
						this.multiple = $Base.cE("div");
						//�����ʽ
						this.multiple.style.cssText = "display:none;z-index:100000;position:absolute;background:url(http://i.ssimg.cn/images/www/suggest_info.gif) no-repeat;height:56px;position:absolute;width:129px;";
						//��Ӳ�
						this.input.parentNode.insertBefore(this.multiple, this.input);
					}
					//����λ��
					this.setPosition(this.multiple);
					this.multiple.style.display='block';
				}else if(this.multiple){
					this.multiple.style.display='none';
				}
			}
		},
		dataFill: function () {//���ݼ��������
            var _s = this._U;//this.input.value;
            if (("key_" + _s) in this._cache && this._cache["key_" + _s]!=null&& this._cache["key_" + _s] != undefined) {//��ʼ��������
                if (this.wrapper == null) {//������ʾ��
					this.wrapper = $Base.cE("div");
                    //��ı��
					this.wrapper.id = "ssajax_lib_suggest_result_layer_"+this.input.id;   
					//���ϵ��Զ�����ʽ
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
                var _thead_tr = $Base.cE("tr");	//��ͷ
                _table.border = "0";
                _table.cellPadding = "0";
                _table.cellSpacing = "0";
                _table.style.cssText = "line-height:18px;background:#FFF;font-size:12px;text-align:center;color:#666;width:100%;font-weight:normal";
                _thead_tr.style.cssText = "background:#cce8f8;height:22px;line-height:22px;overflow:hidden;font-weight:normal";
                if (this.options.header != null&&this.options.header.show&&this.options.header.columns&&this.options.header.columns.length>0) {
					//�����㷨����һ�������ʾ��ѡ��
					var _th = $Base.cE("th");
					_th.innerHTML = "ѡ��";
					_th.style.cssText = this._tableCssText.thead["ѡ��"];
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
				//�ж��Ƿ���֤ȯ����
				//�жϱ�ͷ�а�����ѡ��
				//���ݼ���
				//var security=false;
				//�жϵ�ǰ���������޹�Ʊ����
				//for (var i = 0; i < _v; i++) {
				//	if(_u.datas[i][5]!=0){
				//		security=true;
				//		break;
				//	}
				//}
                for (var i = 0; i < _v; i++) {
					var _tbody_tr = $Base.cE("tr");
                    _tbody_tr.setAttribute("ref",_u.datas[i].join(","));//�������
                    _tbody_tr.style.cursor = "pointer";
                    _tbody_tr.index=i;
                    var self=this;
                    _tbody_tr.onmouseover = function() {                        
                        //self._index = this.index;//���¶�ȡ�µ�����
                        if (self.wrapper != null && self.wrapper.innerHTML != ""&&self.wrapper.firstChild.tBodies) {//��յ�ǰ��ѡ��
	                        	var _tbody = self.wrapper.firstChild.tBodies[0];
				                    var _trows = _tbody.rows;
				                    var _rows = _trows.length;
				                    for (var i = 0; i < _rows; i++) {
				                        _trows[i]._over = false;
				                        self.setColor(_trows[i]);
				                    }
                        }
						this._over = true;
						//ȡ���ƶ�ʱȡֵ
						self.setColor(this);
                    };
                    _tbody_tr.onmouseout = function() {
                        this._over = false;			
						self.setColor(this);
                    };
                    _tbody_tr.onmousedown = function() {
						 self._index = this.index;//���¶�ȡ�µ�����
                    	 self._hidden = true
                    };
                    _tbody_tr.onclick = function() {//����ύ���� 
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
					_t_td.innerHTML = this.columns["ѡ��"]( _u.datas[i],_s);
					_t_td.style.cssText = this._tableCssText.tbody["ѡ��"];
					_tbody_tr.appendChild(_t_td);
					//�����ݼ����ݣ�����ʾ��ߵ�����
                    for (var j = 0; j <this.options.header.columns.length; j++) {
						//security
						_t_td = $Base.cE("td");
						_t_td.style.wordBreak = 'break-all';
						_t_td.hidefocus = "true";
						_t_td.style.padding = "1px";
						_t_td.style.cssText = this._tableCssText.tbody[this.options.header.columns[j]];
						_t_td.innerHTML = this.columns[this.options.header.columns[j]]( _u.datas[i],_s);
						_tbody_tr.appendChild(_t_td);
						//����ǿ�ݼ���ֻ��ʾһ�У����������colspan����
						if(_u.datas[i][5]==0){
							_t_td.colSpan=this.options.header.columns.length;
							_t_td.innerHTML ="";
							_t_td.innerHTML = this.columns["���"]( _u.datas[i],_s);	
							_t_td.style.cssText = this._tableCssText.tbody["���"];							
							//if(this.options.header.columns[j]=="���")
							//_t_td.innerHTML = this.columns["���"]( _u.datas[i],_s);							
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
                		_t_td.innerHTML="δ�ҵ����������Ľ��";
                		_tbody_tr.appendChild(_t_td);
                		_tbody.appendChild(_tbody_tr);
                }
				//�ж������Ƿ���ڣ�����Ҫչʾ����
				if(_u.summary.total>10&&this.options.more){
					var _tbody_tr = $Base.cE("tr");	
					var _t_td = $Base.cE("td");						
					_tbody_tr.style.cssText = "background:#FFF;height:22px;line-height:22px;overflow:hidden;color:#999;text-align:center";
                    _t_td.style.padding = "1px";
					_t_td.hidefocus = "true";
					_t_td.colSpan=this.options.header.columns.length+1;
					_t_td.innerHTML='<a href="http://quote.stockstar.com/search.aspx?keyword='+_s+'" target="_blank">�鿴ȫ��&gt;&gt;</a>';
					_tbody_tr.onmousedown = function() {
                    	 self._hidden = true
                    };
					_tbody_tr.onclick = function(evt) {//����ύ����						
						self._hidden = false;
						self.hiddenWrapper();						
                    };
					_tbody_tr.appendChild(_t_td);
					_tfoot.appendChild(_tbody_tr);			
				}
                _table.appendChild(_tbody);	
                _table.appendChild(_tfoot);	
				this.wrapper.innerHTML = ""; 								//��յ�ǰ������								
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
							var _tRow=_trows[index];//��ȡ��ǰ������
							var _i=(_tRow.getAttribute("ref")||"").split(",");//����Ĭ�ϵ�����
							if(_i.length==0) return null;
							return _i;
			}
			return null;
		},
		//��ת��ĳ��ҳ��
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
		/*�ύ���ݷ��������ڿؼ�����ֱ��ʹ��*/
        submit: function(isEnter) {
        	 var index=this._index;		
			 isEnter=isEnter || false;	
        	 if (this.wrapper != null && this.wrapper.innerHTML != ""&&this.wrapper.firstChild.tBodies) {			 
							var _tbody = this.wrapper.firstChild.tBodies[0];
							var _trows = _tbody.rows;
							var _rows = _trows.length;
							//����
							if(index<0){
								//�жϵ�ǰ������������Ƿ������������
								//��������ڣ����������ҳ��
								//������ڣ��������ת
								var value=this.input.value,isExists=false,findItem=0;
								//ֻ����һ����¼ʱ������в�ѯ
								if(_trows.length==1){
									var array=(_trows[0].getAttribute("ref")||"").split(",");//����Ĭ�ϵ�����
									if(array.length==0) return false;
									if(array.length>=3&&(array[0]==value||array[1].toLowerCase()==value.toLowerCase()||array[2].toLowerCase()==value.toLowerCase())){
										isExists=true;
										index=0;
									}
								}
								//���û���ҵ������˳�
								//û���ҵ����ҵ�ǰ�����Զ��ύ����callback
								//������¼��ֱ�ӽ���exdir���в�ѯ
								if(!isExists&&this.options.autoSubmit){
									var action="http://quote.stockstar.com/stock/exdir.aspx?code="+value;
									var method='post';
									this.goto(action,isEnter);
									return false;
								}
							}
							if(index<0) index=0;
							if(index>_rows-1) index=_rows-1;
							var _tRow=_trows[index];//��ȡ��ǰ������
							//�س��¼�ȡ��ѡ��״̬
							_tRow._over = false;			
							this.setColor(_tRow);							
							var _i=(_tRow.getAttribute("ref")||"").split(",");//����Ĭ�ϵ�����
							if(_i.length==0) return false;
							//������¼							
							this.input.value=_i[0];							
							if(!this.options.autoSubmit&&this.options.callback!=null){
								this.options.callback(this,_i,isEnter);//ʹ�ûص�����								
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
									//��ݼ�����
									if(this._shortKeyMap[_i[0]]){
										action = "http://q.ssajax.cn/info/handler/redirect.ashx?url="+encodeURIComponent(this._shortKeyMap[_i[0]]);									
									}else{
										action="http://quote.stockstar.com/stock/exdir.aspx?code="+_i[0]+"&mk=null&securtytype=-1&target=quotesearch";		
									}
									break;	
								case "9001":
									//��Ӷ���ָ����֧��
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
				//�������ύ
				var action="http://quote.stockstar.com/stock/exdir.aspx?code="+this.input.value;
				this.goto(action,isEnter);
				return false;
			}
        }
    });
    window.StockSuggest = StockSuggest;
})();