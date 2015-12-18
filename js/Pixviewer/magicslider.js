var eles = {
	span: document.createElement('span')
};
var AbstractEffect = function(width, height, mask){
	this.width = width;
	this.height = height;
	this.mask = mask;
	this.itemWidth = 61;
	this.itemHeight = 61;
	this.spans = [];
	this.counter = 0;
	this.duration = 30;
}

AbstractEffect.prototype = {
	initialize: function(observer){
		this.observer = observer;
		observer.cantNext();
		this.mask.innerHTML = '';
		this.mask.appendChild(this.createItems());
		this.counter = 0;
		this.timer = setInterval(dk.bind(this, this.run), this.duration);
	},
	createItems: function(){},
	run: function(){},
	callBack: function(){
		this.observer.canNext();
	}
};

var VSlideEffect = function(width, height, mask, image){
	AbstractEffect.call(this, width, height, mask);
	this.image = image;
	this.duration = 80;
};

VSlideEffect.prototype = new AbstractEffect();

VSlideEffect.prototype.createItems = function(){
	this.columnCount = Math.floor(this.width / this.itemWidth + (this.width % this.itemWidth == 0 ? 0 : 1));
	var fgm = document.createDocumentFragment();
	for(var i = 0; i < this.columnCount; i ++){
		var s = eles.span.cloneNode(true);
		this.spans.push(s);
		fgm.appendChild(s);
		var left = i * this.itemWidth;
		var bgPosition = (i * - this.itemWidth) + 'px 0';
		$(s).css({left: left, top: 0, width: this.itemWidth, height: this.height, backgroundPosition: bgPosition, 'background-image': 'url(' + this.image + ')'});
	}
	return fgm;
};

VSlideEffect.prototype.run = function(){
	var num = this.columnCount;
	if(this.counter < num - 1){
		$(this.spans[this.counter]).animate({height: 0, opacity: 0}, 'slow');
		this.counter ++;
		return;
	}else if(this.counter == num - 1){
		$(this.spans[this.counter]).animate({height: 0, opacity: 0}, 'slow', dk.bind(this, this.callBack));
		this.counter ++;
	}
	clearInterval(this.timer);
	this.counter = 0;
};

var VShutterEffect = function (width, height, mask, image){
	AbstractEffect.call(this, width, height, mask);
	this.image = image;
	this.duration = 80;
}

VShutterEffect.prototype = new AbstractEffect();

VShutterEffect.prototype.createItems = function(){
	this.columnCount = Math.floor(this.width / this.itemWidth + (this.width % this.itemWidth == 0 ? 0 : 1));
	var fgm = document.createDocumentFragment();
	for(var i = 0; i < this.columnCount; i ++){
		var s = eles.span.cloneNode(true);
		this.spans.push(s);
		fgm.appendChild(s);
		var left = i * this.itemWidth;
		var bgPosition = (i * - this.itemWidth) + 'px 0';
		$(s).css({left: left, top: 0, width: this.itemWidth, height: this.height, backgroundPosition: bgPosition, 'background-image': 'url(' + this.image + ')'});
	}
	return fgm;
};

VShutterEffect.prototype.run = function(){
	var num = this.columnCount;
	if(this.counter < num - 1){
		$(this.spans[this.counter]).animate({width: 0, opacity: 0}, 'slow');
		this.counter ++;
		return;
	}else if(this.counter == num - 1){
		$(this.spans[this.counter]).animate({width: 0, opacity: 0}, 'slow', dk.bind(this, this.callBack));
		this.counter ++;
	}
	clearInterval(this.timer);
	this.counter = 0;
};

var HShutterEffect = function(width, height, mask, image){
	AbstractEffect.call(this, width, height, mask);
	this.image = image;
	this.duration = 80;
};

HShutterEffect.prototype = new AbstractEffect();

HShutterEffect.prototype.createItems = function(){
	this.rowCount = Math.floor(this.height / this.itemHeight + (this.height % this.itemHeight == 0 ? 0 : 1));
	var fgm = document.createDocumentFragment();
	for(var i = 0; i < this.rowCount; i++){
		var s = eles.span.cloneNode(true);
		this.spans.push(s);
		fgm.appendChild(s);
		var top = i * this.itemHeight;
		var bgPosition ='0 ' + (i * - this.itemHeight) + 'px';
		$(s).css({left: 0, top: top, width: this.width, height: this.itemHeight, backgroundPosition: bgPosition, 'background-image': 'url(' + this.image + ')'});
	}
	return fgm;
}
HShutterEffect.prototype.run = function(){
	var num = this.rowCount;
	if(this.counter < num - 1){
		$(this.spans[this.counter]).animate({height: 0, opacity: 0}, 'slow');
		this.counter ++;
		return;
	}else if(this.counter == num - 1){
		$(this.spans[this.counter]).animate({height: 0, opacity: 0}, 'slow', dk.bind(this, this.callBack));
		this.counter ++;
	}
	clearInterval(this.timer);
	this.counter = 0;
};


var ShineEffect = function(width, height, mask, image){
	AbstractEffect.call(this, width, height, mask);
	this.image = image;
};

ShineEffect.prototype = new AbstractEffect();

ShineEffect.prototype.createItems = function(){
	var columnCount = Math.floor(this.width / this.itemWidth + (this.width % this.itemWidth == 0 ? 0 : 1));
	var rowCount = Math.floor(this.height / this.itemHeight + (this.height % this.itemHeight == 0 ? 0 : 1));
	this.totalCount = columnCount * rowCount;
	var fgm = document.createDocumentFragment();
	this.spans.length = 0;
	for(var i = 0; i < columnCount; i++){
		for(var j = 0; j < rowCount; j++){
			var s = eles.span.cloneNode(true);
			this.spans.push(s);
			fgm.appendChild(s);
			var left = i * this.itemWidth;
			var top = j * this.itemWidth;
			var bgPosition = (i * -61) + 'px ' + (j * -61) + 'px';
			$(s).css({left: left, top: top, width: this.itemWidth, height: this.itemWidth, backgroundPosition: bgPosition, 'background-image': 'url(' + this.image + ')'});
		}
	}
	return fgm;
};

ShineEffect.prototype.run = function(){
	var num = this.totalCount;
	this.isRunning = true;
	if(this.counter < num - 1){
		$(this.spans[this.counter]).fadeOut('slow');
		this.counter ++;
		return;
	}else if(this.counter == num - 1){
		$(this.spans[this.counter]).fadeOut('slow', dk.bind(this, this.callBack));
		this.counter ++;
	}
	clearInterval(this.timer);
	this.counter = 0;
};

var RanShineEffect = function(width, height, mask, image){
	AbstractEffect.call(this, width, height, mask);
	this.image = image;
	this.duration = 20;
};
RanShineEffect.prototype = new AbstractEffect();
RanShineEffect.prototype.createItems = function(){
	var columnCount = Math.floor(this.width / this.itemWidth + (this.width % this.itemWidth == 0 ? 0 : 1));
	var rowCount = Math.floor(this.height / this.itemHeight + (this.height % this.itemHeight == 0 ? 0 : 1));
	this.totalCount = columnCount * rowCount;
	var fgm = document.createDocumentFragment();
	this.spans.length = 0;
	for(var i = 0; i < columnCount; i++){
		for(var j = 0; j < rowCount; j++){
			var s = eles.span.cloneNode(true);
			this.spans.push(s);
			fgm.appendChild(s);
			var left = i * this.itemWidth;
			var top = j * this.itemWidth;
			var bgPosition = (i * -61) + 'px ' + (j * -61) + 'px';
			$(s).css({left: left, top: top, width: this.itemWidth, height: this.itemWidth, backgroundPosition: bgPosition, 'background-image': 'url(' + this.image + ')'});
		}
	}
	return fgm;
};
RanShineEffect.prototype.run = function(){
	var num = this.totalCount;
	var curr = dk.ran(0, this.spans.length - 1);
	if(this.spans.length > 1){
		$(this.spans[curr]).fadeOut('slow');
		this.spans.splice(curr, 1);
		return;
	}else if(this.spans.length == 1){
		$(this.spans[0]).fadeOut('slow', dk.bind(this, this.callBack));
		this.spans.length == 0;
	}
	clearInterval(this.timer);
};


function getRanEffect(width, height, mask, image){
	var pointer = dk.ran(0, 4);
	switch(pointer){
		case 0:
			return new VSlideEffect(width, height, mask, image);
			break;
		case 1:
			return new ShineEffect(width, height, mask, image);
			break;
		case 2:
			return new VShutterEffect(width, height, mask, image);
			break;
		case 3:
			return new HShutterEffect(width, height, mask, image);
			break;
		case 4:
			return new RanShineEffect(width, height, mask, image);
			break;
	}
	return null;
}

cmtMagicSlide = {
	
};
var option = {
	cid: '',
	width: '',
	height: '',
	itemWidth: '',
	itemHeight: '',
	nextBar: '',
	preBar: ''
}
var MagicSlide = function(option){
	this.cid, this.itemWidth, this.itemHeight;
	this.width = 720;
	this.height = 255;
	this.spans = [];
	this.images = [];
	this.pointer = 0;
	this.total = -1;
	this.isRunning = false;
	this.initialize(option);
};

MagicSlide.prototype = {
	initialize: function(option){
		for(var key in option){
			this[key] = option[key];
		}
		var lis = $('#' + this.cid + ' ul li');
		this.total = lis.length;
		$('#' + this.cid + ' ul li').hide();
		$('#' + this.cid + ' ul li').eq(0).show();
		var masklayer = this.masklayer = document.createElement('div');
		$('#' + this.cid + ' ul').before(masklayer);
		var jImages = $('#' + this.cid + ' ul li img');
		for(i = 0, len = jImages.length; i < len; i++){
			this.images.push(jImages[i].src);
		}
		masklayer.className = 'mask';
		masklayer.style.width = this.width + 'px';
		masklayer.style.height = this.height + 'px';
		this.timer = setInterval(dk.bind(this, this.next), 4000);
		this.initEvent();
	},
	initEvent: function(){
		$('#' + this.nextBar).click(dk.bind(this, this.eventNext));
		$('#' + this.preBar).click(dk.bind(this, this.eventPreview));
	},
	show: function(pointer, prePointer){
		this.hide(prePointer);
		var effect = getRanEffect(this.width, this.height, this.masklayer, this.images[prePointer]);
		effect.initialize(this);
		$('#' + this.cid + ' ul li').eq(pointer).show();
	},
	hide: function(pointer){
		$('#' + this.cid + ' ul li').eq(pointer).hide();
	},
	next: function(){
		if(this.isRunning){
			return;
		}
		var last = this.pointer;
		if(this.pointer < this.total - 1){
			this.pointer ++;
		}else{
			this.pointer = 0;
		}
		this.show(this.pointer, last);
	},
	preview: function(){
		if(this.isRunning){
			return;
		}
		var last = this.pointer;
		if(this.pointer > 0){
			this.pointer --;
		}else{
			this.pointer = this.total - 1;
		}
		this.show(this.pointer, last);
	},
	eventNext: function(e){
		this.pause();
		this.next();
		this.play();
	},
	eventPreview: function(e){
		this.pause();
		this.preview();
		this.play();
	},
	pause: function(){
		clearInterval(this.timer);
	},
	play: function(){
		this.timer = setInterval(dk.bind(this, this.next), 4000);
	},
	canNext: function(){
		this.isRunning = false;
	}, 
	cantNext: function(){
		this.isRunning = true;
	}
};