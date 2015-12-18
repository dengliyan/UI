/*
	StockStar Javascript Library
*/
!(function(window){
	var stockstar ={};
	
	//������ж�
	var browser=stockstar.browser = function(){
		var ua=window.navigator.userAgent.toLowerCase(),
			b = {
			msie: /msie/.test(ua) && !/opera/.test(ua),
			opera: /opera/.test(ua),
			safari: /webkit/.test(ua) && !/chrome/.test(ua),
			firefox: /firefox/.test(ua),
			chrome: /chrome/.test(ua)
		};
		var mark = "";
		for (var i in b) {
			if (b[i]) { mark = "safari" == i ? "version" : i; break; }
		}
		b.version = mark && RegExp("(?:" + mark + ")[\\/: ]([\\d.]+)").test(ua) ? RegExp.$1 : "0";	
		b.ie = b.msie;
		b.ie6 = b.msie && parseInt(b.version, 10) == 6;
		b.ie7 = b.msie && parseInt(b.version, 10) == 7;
		b.ie8 = b.msie && parseInt(b.version, 10) == 8;	
		return b;
	}();
	
	//������
	var utils=stockstar.utils={		
		each : function(obj, iterator, context) {
			if (obj == null) return;
			//�Ѵ��ڱ����ķ���
			if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
				obj.forEach(iterator, context);
			}else if (obj.length === +obj.length) {//�ж��Ƿ�ΪNumber typeof obj.length=='number'
				//�жϲ���
				for (var i = 0, l = obj.length; i < l; i++) {
					if(iterator.call(context, obj[i], i, obj) === false)return;
				}
			}else{//Ϊ{a:1,b:2}��ʽ
				for (var key in obj) {
					if (obj.hasOwnProperty(key)) {
						if(iterator.call(context, obj[key], key, obj) === false)return
					}
				}
			}
		}
		, extend:function (t, s, b) {
			if (s) {
				for (var k in s) {
					if (!b || !t.hasOwnProperty(k)) {
						t[k] = s[k];
					}
				}
			}
			return t;
		}
		, bind:function (fn, context) {
			return function () {
				return fn.apply(context, arguments);
			};
		}
		, trim:function (str) {
			return str.replace(/(^[ \t\n\r]+)|([ \t\n\r]+$)/g, '');
		}		
		, domReady:function(){
			//Reference:http://www.cnblogs.com/rubylouvre/archive/2009/12/30/1635645.html
			var fnArr = [];	
			var doReady =function(doc){
				if (doc.isReady)  return;
				doc.isReady = true;
				for(var i=0,n=fnArr.length;i<n;i++){
					var fn = fnArr[i];
					fn();
				}
				fnArr.length = 0;//����¼�
			};	
			return function(fn){
				//�¼���
				if (document.addEventListener) {
					document.addEventListener("DOMContentLoaded",function(){
						document.removeEventListener("DOMContentLoaded",arguments.callee,false );//������غ���
						doReady(document);
					 },false);
				}else if (document.getElementById) {
					 document.write("<script id=\"ie-domReady\" defer='defer'src=\"//:\"><\/script>");
					 document.getElementById("ie-domReady").onreadystatechange = function() {
						 if (this.readyState === "complete") {
							doReady(document);
							this.onreadystatechange = null;
							this.parentNode.removeChild(this)
						 }
					 }
				}
				if(fn){
				  if(document.isReady){
					fn();
				  }else{
					fnArr.push(fn);//�洢�����¼�
				  }
				}
			};
		}()
		, load:function () {
			var tmpList = [];
			//��ȡ���������
			function findCacheItem(obj){				
				for(var i=0,l=tmpList.length;i<l;i++){
					try{
						var ci=tmpList[i];
						if(ci.url == (obj.src || obj.href))	{
							return ci;
						}
					}catch(e){
						continue;
					}
				}
				return null;
			};
			//
			return function (obj, fn) {
				var item = findCacheItem(obj);//�Ȳ�������
				if (item) {//����Ѿ�����
					if(item.ready){//����Ѿ����
						fn && fn();
					}else{
						item.funs.push(fn);//�����ݸ��µ������б�
					}
					return;
				};
				tmpList.push({//��������ӵ������б�
					url:obj.src||obj.href,
					funs:[fn]
				});
				var element = document.createElement(obj.tag);//����һ���ڵ�
				for (var p in obj) {
					if(p!='tag') element.setAttribute(p, obj[p]);
				}
				element.onload = element.onreadystatechange = function () {
					if (!this.readyState || /loaded|complete/.test(this.readyState)) {	
						item = findCacheItem(obj);						
						if (item&&item.funs.length > 0) {
							item.ready = 1;
							while(item.funs.length>0){//�����У�Ȼ��ִ��
								fi = item.funs.shift();
								fi();
							}
						}
						element.onload = element.onreadystatechange = null;
					}
				};
				document.getElementsByTagName("head")[0].appendChild(element);
			}
		}()
		, cssStyleToDomStyle:function(){
			var test = document.createElement('div').style,
				cache = {
					'float':test.cssFloat != undefined ? 'cssFloat' : test.styleFloat != undefined ? 'styleFloat' : 'float'
				};
			return function (cssName) {
				//�滻-�������
				return cache[cssName] || (cache[cssName] = cssName.toLowerCase().replace(/-([a-z])/ig, function (match) {
					return match.charAt(1).toUpperCase();
				}));
			};	
		}()		
	};	
	utils.each(['String','Function','Array','Number'],function(v){
		utils['is' + v] = function(obj){
			return Object.prototype.toString.apply(obj) == '[object ' + v + ']';
		}
	});
	
	//DOM����
	var dom=stockstar.dom={		
		get : function(element){
			return document.getElementById(element);
		}
		, createElement:function(tag, attrs){
			return dom.addAttr(document.createElement(tag), attrs)
		}
		, addAttr:function (node, attrs) {
			//��Ҫ����������
			var attrFix = browser.ie6 || browser.ie7 || browser.ie8  ? {tabindex:"tabIndex",readonly:"readOnly","for":"htmlFor","class":"className",maxlength:"maxLength",cellspacing:"cellSpacing",cellpadding:"cellPadding",rowspan:"rowSpan",colspan:"colSpan",usemap:"useMap",frameborder:"frameBorder"}:{tabindex:"tabIndex",readonly:"readOnly"};
			for (var attr in attrs) {
				if(attrs.hasOwnProperty(attr)){
					var value = attrs[attr];
					switch (attr) {
						case 'class':
							//ie��Ҫ������ֵ��setAttribute��������
							node.className = value;
							break;
						case 'style' :
							node.style.cssText = node.style.cssText + ";" + value;
							break;	
						case 'innerHTML':
							node[attr] = value;
							break;	
						case 'value':
							node.value = value;
							break;
						default:
							node.setAttribute(attrFix[attr] || attr, value);	
					}
				}
			}
			return node;
		}
		, removeAttr:function(node, attrNames){
		  
		}
		, getClass:function(cls, node, tag){
			var classElements = [];
	        node =node|| document;
	        tag = tag||'*';
	        var els = node.getElementsByTagName(tag);
	        var elsLen = els.length;
	        var pattern = new RegExp("(^|\\s)"+cls+"(\\s|$)");
			for (i = 0, j = 0; i < elsLen; i++) {
				if (pattern.test(els[i].className)) {
					classElements[j] = els[i];
					j++;
				}
			}
			return classElements;
		}
		, hasClass:function(element, className){
			className = utils.trim(className).replace(/[ ]{2,}/g,' ').split(' ');
			for(var i = 0,ci,cls = element.className;ci=className[i++];){
				if(!new RegExp('\\b' + ci + '\\b').test(cls)){
					return false;
				}
			}
			return i - 1 == className.length;
		}
		, addClass:function(element, classNames){
			if(!element)return;
			classNames = utils.trim(classNames).replace(/[ ]{2,}/g,' ').split(' ');
			for(var i = 0,ci,cls = element.className;ci=classNames[i++];){
				if(!new RegExp('\\b' + ci + '\\b').test(cls)){
					element.className += ' ' + ci;
				}
			}
		}
		, removeClass:function(){}
		, getOffset:function(node){
			var left = 0, top = 0;
			while (node.offsetParent) {
				left += (node.offsetLeft||0);
				top += (node.offsetTop||0);
				node = node.offsetParent;
			}
			return { 'left':left, 'top':top};
		}
		, getScroll: function(node) {
			var element = node || document.body;
			return {'left': element.scrollLeft || (document.documentElement && document.documentElement.scrollLeft),'top':element.scrollTop || (document.documentElement && document.documentElement.scrollTop)};					 
		}
		, getStyle:function(elem, name){
			if(document.defaultView){//
				var style = document.defaultView.getComputedStyle(elem, null);
				return name in style ? style[ name ] : style.getPropertyValue( name );
			}
			else{
				var style = elem.style, curStyle = elem.currentStyle;
				//͸����
				if ( name == "opacity" ) {
					if ( /alpha\(opacity=(.*)\)/i.test(curStyle.filter) ) {
						var opacity = parseFloat(RegExp.$1);
						return opacity ? opacity / 100 : 0;
					}
					return 1;
				}				
				if ( name == "float" ) { name = "styleFloat"; }				
				var val = curStyle[ name ] || curStyle[ utils.cssStyleToDomStyle(name) ];				
				return val;
			}
		}
		, setStyle:function(elems, style, value){
			
		}
	};
	
	//�¼�ģ�� 	
	var event=stockstar.event=function(){
		//http://dean.edwards.name/weblog/2005/10/add-event/
		function addEvent(element, type, handler) {
			var types = utils.isArray(type) ? type : [type] , k = types.length;
			if (k) while (k--) {
				type = types[k];
				if (element.addEventListener) {
					element.addEventListener(type, handler, false);
				} else {
					if (!handler.$guid) handler.$guid = addEvent.guid++;//���õ�ǰ�¼��ı��
					if (!element.$data) element.$data = {};
					var handlers = element.$data[type];//��ȡ��ǰ�ڵ��ϵ��¼�����
					if (!handlers) {
						handlers = element.$data[type] = {};
						if (element["on" + type]) //�洢�Ѿ����ڵ��¼��������(����еĻ�)
							handlers[0] = element["on" + type];
					};
					handlers[handler.$guid] = handler;//���¼��������洢��hash����						
					element["on" + type] = handleEvent;
				}
			}
		};	
		addEvent.guid=1;	
		function removeEvent(element, type, handler){
			// ��hash������ɾ�����¼��������
			if (element.removeEventListener) {
				element.removeEventListener(type, handler, false);
			} else if (element.$data && element.$data[type]) {
				delete element.$data[type][handler.$guid];
			}
			
		};		
		function handleEvent(event) {
			var returnValue = true;			
			event = event || fixEvent(window.event);// ȡ��event����(IEʹ����һ��ȫ�ֵ��¼�����)
			var handlers = this.$data[event.type];	// �ҵ��¼���������hash��		
			for (var i in handlers) {// ִ�и����¼��������
				this.$handleEvent = handlers[i];				
				if (this.$handleEvent(event) === false) {
				  returnValue = false;
				}
			}
			return returnValue;
		};
		function fixEvent(e){		
			if (e.target) return e;			
			var eventObj = {
				target: e.srcElement || document,
				preventDefault: function () {e.returnValue = false},
				stopPropagation: function () {e.cancelBubble = true}
			};			
			// IE6/7/8 ��ԭ��window.event����д�����ݻᵼ���ڴ��޷����գ�Ӧ�����ÿ���
			for (var i in e) {
				eventObj[i] = e[i];
			}			
			return eventObj;
		}		function fireEvent(element,type){
		}
		//��������
		return {
			'add':addEvent,
			'remove':removeEvent,
			'fix':fixEvent
		};
	}();	
	
	//ajax����
	var ajax=stockstar.ajax=function(){	
		//����һ������
		var creatAjaxRequest=function(){
			if (typeof XMLHttpRequest != "undefined") {
				return new XMLHttpRequest();
			} else if (typeof ActiveXObject != "undefined") {
				if (typeof arguments.callee.activeXString != "string") {
					var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"];
					for (var i = 0, len = versions.length; i < len; i++) {
						try {
							new ActiveXObect(versions[i]);
							arguments.callee.activeXString = versions[i];
							break;
						} catch (ex) {
							//����
						}
					}
				}
				return new ActiveXObect(arguments.callee.activeXString);
			} else {
				throw new Error("No XHR object available.");
			}
		};
		var serialize=function(json){
			var b = [];
			for (var i in json) {				
				//����Ǻ�����Ҳ��������
				if((typeof json[i]).toLowerCase() == "function") continue;
				//����Ƕ��󣬲�����
				if((typeof json[i]).toLowerCase() == "object") continue;
				b.push(encodeURIComponent(i)+ "="+encodeURIComponent(json[i]));
			}
			return b.join('&');
		};
		//��ʶ
		var expando= new Date().getTime();
		return {			
			request:function(url, ajaxOptions) {
				var ajaxRequest = creatAjaxRequest(),//����һ��request
					//�Ƿ�ʱ
					timeIsOut = false,
					defaultAjaxOptions = {
						method:"POST",
						timeout:5000,
						async:true,
						data:{},//��Ҫ���ݶ���Ļ�ֻ�ܸ���
						onstart:function(){	//��ʼ				
						},
						onsuccess:function() {//�ɹ�
						},
						onerror:function() {//����
						},
						oncomplete:function(){//���			
						}
					};
				//��չ���ݣ�Դ��Ĭ�ϣ�Ŀ���Ǵ���ģ�������ֵ
				var ajaxOpts = ajaxOptions ? utils.extend(defaultAjaxOptions,ajaxOptions) : defaultAjaxOptions;
				//�����������ʧ�ܻ�����URL��ַ
				if (!ajaxRequest || !url) {
					ajaxOptions.onerror();				
				}
				ajaxOptions.onstart();//ִ�п�ʼ����
				//�ύ�����ݴ���
				var postData = serialize(ajaxOpts.data||{});
				//��ʱ���
				var timerID = setTimeout(function() {
					if (ajaxRequest.readyState != 4) {
						timeIsOut = true;
						ajaxRequest.abort();
						clearTimeout(timerID);
					}
				}, ajaxOpts.timeout);
				// �ύ�����ݴ���
				var method = ajaxOpts.method.toUpperCase();
				var str = url + (url.indexOf("?")==-1?"?":"&") + (method=="POST"?"":submitStr+ "&ajaxCache=" + +new Date);
				ajaxRequest.open(method, str, ajaxOpts.async);
				if (method == "POST") {
					ajaxRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
					ajaxRequest.send(postData);
				} else {
					ajaxRequest.send(null);
				}
				//�����Ѿ����
				ajaxRequest.onreadystatechange = function() {
					if (ajaxRequest.readyState == 4) {
						if (!timeIsOut && ajaxRequest.status == 200) {
							try{
								//ֻ֧����JSON��ʽ����
								//ajaxRequest.responseText
								ajaxOpts.onsuccess(ajaxRequest);
							}catch(e){
								ajaxOpts.onerror(ajaxRequest);
							}
						} else {
							ajaxOpts.onerror(ajaxRequest);
						}					
					}				
				};
			}
			, script:function(obj,callback){
				var element = document.createElement("script");//����һ���ڵ�
				for (var p in obj) {
					element.setAttribute(p, obj[p]);
				}
				element.onload = element.onreadystatechange = function () {
					if (!this.readyState || /loaded|complete/.test(this.readyState)) {					
						callback&&callback();
						element.onload = element.onreadystatechange = null;
						document.getElementsByTagName('head')[0].removeChild(this);//�������
					}
				};
				document.getElementsByTagName("head")[0].appendChild(element);
			}
			, jsonp:function(url,charset,callback,name){				 
				 name=name||'callback';//���ڴ��ݸ��������Ĳ�����ʶ				 
				 var proxy = 'jsonp' + expando++;//��ǰ�������Ĳ���Ϊ��jsonpʱ��
				 window[proxy] = function(json) {//����һ������					
					callback(json);
				 }
				 url = url+(url.indexOf('?')>0?'&':'?') + name+'=' + proxy//����һ�������URL��ַ
				 //��ȡ���ݣ�����jsonp��ԭ���Զ�ִ�д�����
				 this.script({'type':'text/javascript','src':url,'charset':charset||'gb2312'},function(){
						 window[proxy] = undefined;//ɾ������
						 try {delete window[proxy];}catch(e) {}
				 });
			}
		}			
	}();
	
	//cookies����
	var cookies=stockstar.cookies=function(){
		return {
			get:function(key){
				var cookies = document.cookie.split(";");
				for (var i = 0; i < cookies.length; i++) {
				var datas = cookies[i].split("=");
					if (datas[0].replace(" ","") == key) {
						return decodeURIComponent(datas[1]);
					}
				}
				return null;
			}
			, set:function(key, value, expires, domain, path){
				var date = new Date();
				var ms = expires * 1000;
				date.setTime(date.getTime() + ms);
				//���ù��ڣ�����Cookeies���뱣�ֺͷ�����һ�£���Ҫ����domain��Ϣ
				var str = key + "=" + decodeURIComponent(value)+";expires=" + date.toUTCString()+"; path="+(path||"/")+"; domain="+(domain||'stockstar.com');
				document.cookie = str;
			}
			, remove:function(key, domain, path){
				var date = new Date();
				var ms = -1 * 1000;
				date.setTime(date.getTime() + ms);
				//���ù��ڣ�����Cookeies���뱣�ֺͷ�����һ�£���Ҫ����domain��Ϣ
				var str = key + "=;expires=" + date.toUTCString()+"; path="+(path||"/")+"; domain="+(domain||'stockstar.com');
				document.cookie = str;
			}			
		}
	}();
	
	if (window.$ === undefined) window.$ = stockstar;
})(window);


