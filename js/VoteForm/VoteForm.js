/* File Created: 八月 27, 2012 */
/*数据格式
var json =
{
    id: 1,
    name: '测试投票',
    description: '',
    issues:
    [
        {
            id: 0,
            name: '问题一',
            maximum: 2,
            items:
            [
                {
                    id: 0,
                    name: 'a-0000'
                },
                {
                    id: 1,
                    name: 'b-cccc'
                }
            ]
        },
        {
            id: 1,
            name: '问题二',
            maximum: 1,
            items:
            [
                {
                    id: 11,
                    name: 'a-0000'
                },
                {
                    id: 12,
                    name: 'b-cccc'
                }
            ]
        }
    ]
};
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
		addEvent: function (l, i, I) {
            if (l.attachEvent) {
                l.attachEvent("on" + i, I)
            } else {
                l.addEventListener(i, I, false)
            }
        }
	};
	
	//投票
	function VoteForm(obj,data) {
		//当前编号
        this.containerID = obj;
		//当前的数据
        this.data=data;
		//表单
		this._form=null;
		//数据渲染
		
		//数据展示模板
		this._template='<div class="title">[$.title]</div><ul class="content">[$.content]</ul><input type="hidden" name="vHidden[$.id]" value="[$.maximum]" /><input type="hidden" name="vIssues" value="[$.id]" />';
		//一行数据模板
		this._templateli='<li><input type="[$.type]" id="vItem[$.item.id]" value="[$.item.id]" name="vIssue[$.issue.id]" /><label for="vItem[$.item.id]">[$.item.name]</label></li>';
		this._render=function(){
			//解析标题
			var a = this.data.issues||[];
			//遍历展开数据
			for (var i = 0; i < a.length; i++) {				
				//当前的编号、名称
				var id=a[i].id,name=a[i].name;
				//取最大值
				var maximum = a[i].maximum;
				maximum = maximum < 1 ? 1 : maximum;
				maximum = maximum > a[i].items.length ? a[i].items.length : maximum;
				//取控件的类型
				var type = maximum == 1 ? "radio" : "checkbox";
				var t=this._template,c='';
				for (var j = 0; j < a[i].items.length; j++) {
					var li=this._templateli;
					li=li.replace(/\[\$\.type\]/g,type);
					li=li.replace(/\[\$\.issue\.id\]/g,a[i].id);
					li=li.replace(/\[\$\.item\.id\]/g,a[i].items[j].id);
					li=li.replace(/\[\$\.item\.name\]/g,a[i].items[j].name);
					c+=li;
				}
				t=t.replace(/\[\$\.title\]/g,name);
				t=t.replace(/\[\$\.content\]/g,c);
				t=t.replace(/\[\$\.id\]/g,id);
				t=t.replace(/\[\$\.maximum\]/g,maximum);
				var d=Utils.$aE('div','detail',null,null,this._form);
				d.innerHTML=t;
				//添加事件								
				var e=d.getElementsByTagName('input');
				//多选框添加事件，进行判断
				for( var k=0; k<e.length; k++ ) {
					if(e[k].type=='checkbox'&&maximum<a[i].items.length){						
						(function(a,b,c){
							Utils.addEvent(a,'click',function(){
								//加载当前所有控件
								var x=b.getElementsByTagName('input');
								//选中，则判断当前的数据
								if(this.checked){
									//判断当前选中的数据
									var total=0;
									//读取已选中的数量
									for( var i=0; i<x.length; i++ ) {
										if(x[i].type=='checkbox'&&x[i].checked){
											total+=1;
										}
									}
									//如果已达到了最大值，则不可选择
									if(total>=c){
										for( var i=0; i<x.length; i++ ) {
											if(x[i].type=='checkbox'&&!x[i].checked){
												x[i].setAttribute("disabled","disabled");
											}
										}
									}
								}else{
									//取消选中，则取消不可操作状态
									for( var i=0; i<x.length; i++ ) {
											if(x[i].type=='checkbox'&&!x[i].checked){
												x[i].removeAttribute("disabled");
											}
									}
								}
							});
						})(e[k],d,maximum);		
					}
				}			
			}
			//添加按钮事件
			//添加投票编号
			var b=Utils.$E('input');
			b.type='hidden';
			b.name='vId';
			b.value=this.data.id;			
			this._form.appendChild(b);
			
			var c=Utils.$aE('div','commit',null,null,this._form);
			
			//创建一个提交按钮
			var d=Utils.$E('input');
			d.type='button';
			d.className='ui-button-submit';
			d.value='投票';
			c.appendChild(d);
			
			//创建一个查看按钮
			var e=Utils.$E('input');
			e.type='button';
			e.className='ui-button-view';
			e.value='查看';	
			c.appendChild(e);
			
			//投票事件
			var _this=this;
			
			//提交数据
			Utils.addEvent(d,'click',function(){				
				_this._form.action='http://survey.stockstar.com/vote/Polling.ashx';
				var a=_this._form.childNodes;
				for(var i=0;i<a.length;i++){
					//加载当前的有效的数据
					if(a[i].nodeName.toLowerCase()=='div'&&a[i].className=='detail'){
						//取所有下拉框
						var b=a[i].getElementsByTagName('input');
						//
						//获取当前的编号，最大值
						var id=0,maximum=0;
						//读取当前编号
						for(var j=0;j<b.length;j++){
							if(b[j].type=='hidden'&&b[j].name=='vIssues'){
								id=Number(b[j].value)||0;
								break;
							}
						}
						//读取最大值
						for(var j=0;j<b.length;j++){
							if(b[j].type=='hidden'&&b[j].name=='vHidden'+id){
								maximum=Number(b[j].value)||0;
								break;
							}
						}
						//判断是否都已选中
						var total=0;
						for(var j=0;j<b.length;j++){
							if(b[j].type=='checkbox'||b[j].type=='radio'){
								total+=b[j].checked?1:0;
							}
						}
						if(total==0){
							alert('投票失败，请确定每一项都进行了选择！');
							return false;
						}
						if(total>maximum){
							alert('投票失败，请确定每一项的最大可选数量！');
							return false;
						}
					}
				}
				_this._form.submit();
			});
			//查看数据
			Utils.addEvent(e,'click',function(){
				_this._form.action='http://survey.stockstar.com/vote/view_'+_this.data.id+'.html';				
				_this._form.submit();
			});			
		};
		
		//读取数据
		this.containerID = Utils.$(this.containerID);
		//开始数据
		if(this.containerID&&this.data!=null&&this.data!=undefined){
			//创建一个表单
			this._form=Utils.$aE('form',null,null,null,this.containerID);
			this._form.id='voteForm'+obj;
			this._form.method='post';
			this._form.target='_blank';
			//解析数据
			this._render();
		}
	};
	window.VoteForm=VoteForm;
})();	