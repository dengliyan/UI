var focusUtils = {
    hoverNum: function(I) {
        I = window.event ? event: I;
        var i = I.srcElement || I.target;
        if (i) {
            i.className = "NumberHover";
            i.setAttribute("ishovering", "true")
        }
    },
    leaveNum: function(I) {
        I = window.event ? event: I;
        var i = I.srcElement || I.target;
        if (i) {
            i.removeAttribute("ishovering");
            if (i.className != "selected") {
                i.className = "NumberLeave"
            }
        }
    },
    absPosition: function(o, I) {
        var l = o.offsetLeft,
        O = o.offsetTop,
        i = o;
        while (i.id != document.body & i.id != document.documentElement & i != I) {
            i = i.offsetParent;
            l += i.offsetLeft;
            O += i.offsetTop
        };
        return {
            left: l,
            top: O
        }
    }
};
function Pixviewer(FocusImgID,  width, height) {
    this.Data = [];
    this.TimeOut = 5000;
    var isIE = navigator.appVersion.indexOf("MSIE") != -1 ? true: false;
    this.width = width;
    this.height = height;
    this._divtriangle = null;
	this.BigPicID=null;
	this.NumberID=null;
	this.NumberBgID=null;	
    this.TitleID = null;
	this.TitleBGID = null;
    this.selectedIndex = 0;
    var TimeOutObj;
    if (!Pixviewer.childs) {
        Pixviewer.childs = []
    };
    this.showTime = null;
    this.showSum = 10;
    this.ID = Pixviewer.childs.push(this) - 1;
    this.listCode = '<span style="cursor:pointer; margin:0px; padding:1px 7px 1px 8px; border-left:solid 1px #cccccc;[$rightborder]" src="[$pic]" onclick="Pixviewer.childs[[$thisId]].select([$num])">[$numtoShow]</span>';
    this.Add = function(jsnObj) {
        this.Data.push(jsnObj)
    };
    this.TimeOutBegin = function() {
        clearInterval(TimeOutObj);
        TimeOutObj = setInterval("Pixviewer.childs[" + this.ID + "].next()", this.TimeOut)
    };
    this.TimeOutEnd = function() {
        clearInterval(TimeOutObj)
    };
    this.select = function(num, noAction) {
        if (num > this.Data.length - 1) {
            return
        };
        if (num == this.selectedIndex) {
            return
        };
        this.TimeOutBegin();
        if (this.BigPicID) {
            if (this.$(this.BigPicID)) {
                var aObj = this.$(this.BigPicID).getElementsByTagName("a")[0];
                aObj.href = this.Data[num].url;				
                if (this.aImgY) {
                    this.aImgY.style.display = 'none';
                    this.aImg.style.zIndex = 0
                };
                this.aImgY = this.$('F' + this.ID + 'BF' + this.selectedIndex);
                this.aImg = this.$('F' + this.ID + 'BF' + num);
                clearTimeout(this.showTime);
                this.showSum = 5;
                if (!noAction) {
                    var appleMobileCheck = /\((iPad|iPhone|iPod)/i;
                    if (appleMobileCheck.test(navigator.userAgent)) {
                        if (this.aImgY) {
                            this.aImgY.style.display = 'none'
                        };
                        this.aImg.style.display = 'block';
                        this.aImg.style.zIndex = 0;
                        this.aImg.style.opacity = 1;
                        this.aImgY = null
                    } else {
                        this.showTime = setTimeout("Pixviewer.childs[" + this.ID + "].show()", 30)
                    }
                } else {
                    if (isIE) {
                        this.aImg.style.filter = "alpha(opacity=100)"
                    } else {
                        this.aImg.style.opacity = 1
                    }
                }
            }
        };
        if (this.NumberID) {
            if (this.$(this.NumberID) && FocusImgID && this.$(FocusImgID)) {
                var sImg = this.$(this.NumberID).getElementsByTagName("span"),i;
				var offset=0,cWidth=0;//计算元素的偏移值
                for (i = 0; i < sImg.length; i++) {
                    if (i == num || num == (i - this.Data.length)) {
                        sImg[i].className = "selected"
                    } else {
                        sImg[i].className = "";
                        if (sImg[i].getAttribute("ishovering") != "true") {
                            sImg[i].className = "NumberLeave"
                        }
                    }
                };
				//获取当前元素宽度、以及右边所有元素的宽度
				for (i = num; i < sImg.length; i++) {
					if(i==num){
						cWidth=sImg[i].offsetWidth||0;
					}else{
						offset+=(sImg[i].offsetWidth||0);
					}
				}
				//console.log(num+" "+offset+" "+cWidth);
                if (!this._divtriangle) {
					//创建一个三角区域
					this._divtriangle =this.$aE('div','Triangle',{bottom:"0px"},null,this.$(FocusImgID));
                };
                if (this._divtriangle) {					
					//自己宽度是21					
                    this._divtriangle.style.right = offset + Math.ceil((cWidth-21)/2) + "px"
                }
            }
        };
        if (this.TitleID && this.$(this.TitleID)) {
            this.$(this.TitleID).innerHTML = "<a href=\"" + this.Data[num].url + "\" target=\"_blank\">" + this.Data[num].title + "</a>"
        };
		if (this.TitleBGID && this.$(this.TitleBGID)) {
			if(this.Data[num].title==null||this.Data[num].title==""){
				this.$(this.TitleBGID).style.display = "none";
			}else{
				this.$(this.TitleBGID).style.display = "";
			}
        };
        this.selectedIndex = num;
        if (this.onchange) {
            this.onchange()
        }
    };
    this.show = function() {
        this.showSum--;
        if (this.aImgY) {
            this.aImgY.style.display = 'block'
        };
        this.aImg.style.display = 'block';
        if (isIE) {
            this.aImg.style.filter = "alpha(opacity=0)";
            this.aImg.style.filter = "alpha(opacity=" + (5 - this.showSum) * 20 + ")"
        } else {
            this.aImg.style.opacity = 0;
            this.aImg.style.opacity = (5 - this.showSum) * 0.2
        };
        if (this.showSum <= 0) {
            if (this.aImgY) {
                this.aImgY.style.display = 'none'
            };
            this.aImg.style.zIndex = 0;
            this.aImgY = null
        } else {
            this.aImg.style.zIndex = 2;
            this.showTime = setTimeout("Pixviewer.childs[" + this.ID + "].show()", 30)
        }
    };
    this.next = function() {
        var temp = this.selectedIndex;
        temp++;
        if (temp >= this.Data.length) {
            temp = 0
        };
        this.select(temp)
    };
    this.pre = function() {
        var temp = this.selectedIndex;
        temp--;
        if (temp < 0) {
            temp = this.Data.length - 1
        };
        this.select(temp)
    };
    this.begin = function() {
        this.selectedIndex = -1;
        var i,
        temp = "";
        if (FocusImgID) {
            if (this.$(FocusImgID)) {
                var topObj = this.$(FocusImgID);
				topObj.innerHTML='';//清空数据
				this.$M(topObj,{width:this.width + "px",height:this.height + "px"},null);
				this.BigPicID=this.$aE('div','PvBigPic',null,null,topObj);
				this.BigPicID.innerHTML='<a href="#"></a>';
				this.NumberID=this.$aE('div','PvNumber',null,null,topObj);				
				this.NumberBgID=this.$aE('div','PvNumberBg',null,null,topObj);				
				this.TitleID=this.$aE('div','PvTitleBox',null,null,topObj);				
				this.TitleBGID=this.$aE('div','PvTitleBoxBG',null,null,topObj);
				this.$aE('div','tBorder',{width:this.width + "px"},null,topObj);
				this.$aE('div','lBorder',{height:this.height + "px"},null,topObj);
				this.$aE('div','bBorder',{width:this.width + "px"},null,topObj);
				this.$aE('div','rBorder',{height:this.height + "px"},null,topObj);				
            }
        };
        if (this.TitleID) {
            if (this.$(this.TitleID)) {
                this.$(this.TitleID).style.width = this.width + "px";
            }
        };
		if(this.TitleBGID){
			if (this.$(this.TitleBGID)) {
				var o=this.$(this.TitleBGID);
				this.$M(o,{width:this.width + "px"});				
			}
		}
        if (this.NumberBgID) {
            if (this.$(this.NumberBgID)) {
                this.$(this.NumberBgID).style.bottom = 1 + "px"
            }
        };
        if (this.BigPicID) {			
            if (this.$(this.BigPicID)) {
                var aObj = this.$(this.BigPicID).getElementsByTagName("a")[0];
                aObj.style.zoom = 1;
                this.$(this.BigPicID).style.position = "relative";
                this.$(this.BigPicID).style.zoom = 1;
                this.$(this.BigPicID).style.overflow = "hidden";
                this.$(this.BigPicID).style.height = this.height + "px";
                for (i = 0; i < this.Data.length; i++) {
                    temp += '<img src="' + this.Data[i].pic + '" id="F' + this.ID + 'BF' + i + '" style="display:' + (i == 0 ? 'block': 'none') + '" galleryimg="no"' + (this.width ? ' width="' + this.width + '"': '') + (this.height ? ' height="' + this.height + '"': '') + ' alt="' + this.Data[i].title + '" />'
                };
                aObj.innerHTML = temp;
                var imgObjs = aObj.getElementsByTagName("img"),
                XY = focusUtils.absPosition(imgObjs[0], this.$(this.BigPicID));
                for (i = 0; i < imgObjs.length; i++) {
                    imgObjs[i].style.position = "absolute";
                    imgObjs[i].style.top = XY.top + "px";
                    imgObjs[i].style.left = XY.left + "px";
                    imgObjs[i].style.width = this.width + "px";
                    imgObjs[i].style.height = this.height + "px"
                }
            }
        };
        if (this.NumberID) {
            if (this.$(this.NumberID)) {
                tempHTML = "";
                for (i = 0; i < this.Data.length; i++) {
                    temp = this.listCode;
                    temp = temp.replace(/\[\$thisId\]/ig, this.ID);
                    temp = temp.replace(/\[\$num\]/ig, i);
                    temp = temp.replace(/\[\$numtoShow\]/ig, i + 1);
                    temp = temp.replace(/\[\$title\]/ig, this.Data[i].title);
                    if (i == this.Data.length - 1) {
                        temp = temp.replace(/\[\$rightborder\]/ig, " border-right:solid 1px #cccccc;")
                    }else{
						temp = temp.replace(/\[\$rightborder\]/ig, "")
					};
                    tempHTML += temp;
                };
                this.$(this.NumberID).innerHTML = tempHTML;
                this.$(this.NumberID).style.bottom = 1 + "px";
                var sImg = this.$(this.NumberID).getElementsByTagName("span"),i;
                for (i = 0; i < sImg.length; i++) {
                    if (window.attachEvent) {
                        sImg[i].attachEvent("onmouseover", focusUtils.hoverNum);
                        sImg[i].attachEvent("onmouseout", focusUtils.leaveNum)
                    } else {
                        sImg[i].addEventListener("mouseover", focusUtils.hoverNum, false);
                        sImg[i].addEventListener("mouseout", focusUtils.leaveNum, false)
                    }
                }
            }
        };
        this.TimeOutBegin();
        this.select(0, true)
    };
    this.$ = function(o) {
        return typeof (o) == 'string' ? document.getElementById(o) : o;
    };
	this.$E = function (tag) {
        return document.createElement(tag || 'div');	
    };
	this.$M = function(ele, css, attr){
		css=css||{};
		attr=attr||{};
		if(!ele||!css||!attr){
			return;
		}
		var z, y=ele.style, x;
		for(var i in css){
			z = css[i];
			y[i] = z;
		}
		for(var i in attr){
			z = css[i];
			ele.setAttribute= z
		}
	};	
	this.$aE=function(tag,cls,css,attr,father){
		father = father || document.body;
		var ele = this.$E(tag);				//创建一个元素
		if(cls) ele.className=cls;			//添加一个样式
		this.$M(ele,css||{},attr||{});		//组织数据
		return father.appendChild(ele);		//追加到数据
	}
};