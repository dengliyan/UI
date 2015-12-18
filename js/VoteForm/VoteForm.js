/* File Created: ���� 27, 2012 */
/*���ݸ�ʽ
var json =
{
    id: 1,
    name: '����ͶƱ',
    description: '',
    issues:
    [
        {
            id: 0,
            name: '����һ',
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
            name: '�����',
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
            var ele = this.$E(tag); 			//����һ��Ԫ��
            if (cls) ele.className = cls; 		//���һ����ʽ
            this.$M(ele, css || {}, attr || {}); 	//��֯����
            return father.appendChild(ele); 	//׷�ӵ�����
        },
		addEvent: function (l, i, I) {
            if (l.attachEvent) {
                l.attachEvent("on" + i, I)
            } else {
                l.addEventListener(i, I, false)
            }
        }
	};
	
	//ͶƱ
	function VoteForm(obj,data) {
		//��ǰ���
        this.containerID = obj;
		//��ǰ������
        this.data=data;
		//��
		this._form=null;
		//������Ⱦ
		
		//����չʾģ��
		this._template='<div class="title">[$.title]</div><ul class="content">[$.content]</ul><input type="hidden" name="vHidden[$.id]" value="[$.maximum]" /><input type="hidden" name="vIssues" value="[$.id]" />';
		//һ������ģ��
		this._templateli='<li><input type="[$.type]" id="vItem[$.item.id]" value="[$.item.id]" name="vIssue[$.issue.id]" /><label for="vItem[$.item.id]">[$.item.name]</label></li>';
		this._render=function(){
			//��������
			var a = this.data.issues||[];
			//����չ������
			for (var i = 0; i < a.length; i++) {				
				//��ǰ�ı�š�����
				var id=a[i].id,name=a[i].name;
				//ȡ���ֵ
				var maximum = a[i].maximum;
				maximum = maximum < 1 ? 1 : maximum;
				maximum = maximum > a[i].items.length ? a[i].items.length : maximum;
				//ȡ�ؼ�������
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
				//����¼�								
				var e=d.getElementsByTagName('input');
				//��ѡ������¼��������ж�
				for( var k=0; k<e.length; k++ ) {
					if(e[k].type=='checkbox'&&maximum<a[i].items.length){						
						(function(a,b,c){
							Utils.addEvent(a,'click',function(){
								//���ص�ǰ���пؼ�
								var x=b.getElementsByTagName('input');
								//ѡ�У����жϵ�ǰ������
								if(this.checked){
									//�жϵ�ǰѡ�е�����
									var total=0;
									//��ȡ��ѡ�е�����
									for( var i=0; i<x.length; i++ ) {
										if(x[i].type=='checkbox'&&x[i].checked){
											total+=1;
										}
									}
									//����Ѵﵽ�����ֵ���򲻿�ѡ��
									if(total>=c){
										for( var i=0; i<x.length; i++ ) {
											if(x[i].type=='checkbox'&&!x[i].checked){
												x[i].setAttribute("disabled","disabled");
											}
										}
									}
								}else{
									//ȡ��ѡ�У���ȡ�����ɲ���״̬
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
			//��Ӱ�ť�¼�
			//���ͶƱ���
			var b=Utils.$E('input');
			b.type='hidden';
			b.name='vId';
			b.value=this.data.id;			
			this._form.appendChild(b);
			
			var c=Utils.$aE('div','commit',null,null,this._form);
			
			//����һ���ύ��ť
			var d=Utils.$E('input');
			d.type='button';
			d.className='ui-button-submit';
			d.value='ͶƱ';
			c.appendChild(d);
			
			//����һ���鿴��ť
			var e=Utils.$E('input');
			e.type='button';
			e.className='ui-button-view';
			e.value='�鿴';	
			c.appendChild(e);
			
			//ͶƱ�¼�
			var _this=this;
			
			//�ύ����
			Utils.addEvent(d,'click',function(){				
				_this._form.action='http://survey.stockstar.com/vote/Polling.ashx';
				var a=_this._form.childNodes;
				for(var i=0;i<a.length;i++){
					//���ص�ǰ����Ч������
					if(a[i].nodeName.toLowerCase()=='div'&&a[i].className=='detail'){
						//ȡ����������
						var b=a[i].getElementsByTagName('input');
						//
						//��ȡ��ǰ�ı�ţ����ֵ
						var id=0,maximum=0;
						//��ȡ��ǰ���
						for(var j=0;j<b.length;j++){
							if(b[j].type=='hidden'&&b[j].name=='vIssues'){
								id=Number(b[j].value)||0;
								break;
							}
						}
						//��ȡ���ֵ
						for(var j=0;j<b.length;j++){
							if(b[j].type=='hidden'&&b[j].name=='vHidden'+id){
								maximum=Number(b[j].value)||0;
								break;
							}
						}
						//�ж��Ƿ���ѡ��
						var total=0;
						for(var j=0;j<b.length;j++){
							if(b[j].type=='checkbox'||b[j].type=='radio'){
								total+=b[j].checked?1:0;
							}
						}
						if(total==0){
							alert('ͶƱʧ�ܣ���ȷ��ÿһ�������ѡ��');
							return false;
						}
						if(total>maximum){
							alert('ͶƱʧ�ܣ���ȷ��ÿһ�������ѡ������');
							return false;
						}
					}
				}
				_this._form.submit();
			});
			//�鿴����
			Utils.addEvent(e,'click',function(){
				_this._form.action='http://survey.stockstar.com/vote/view_'+_this.data.id+'.html';				
				_this._form.submit();
			});			
		};
		
		//��ȡ����
		this.containerID = Utils.$(this.containerID);
		//��ʼ����
		if(this.containerID&&this.data!=null&&this.data!=undefined){
			//����һ����
			this._form=Utils.$aE('form',null,null,null,this.containerID);
			this._form.id='voteForm'+obj;
			this._form.method='post';
			this._form.target='_blank';
			//��������
			this._render();
		}
	};
	window.VoteForm=VoteForm;
})();	