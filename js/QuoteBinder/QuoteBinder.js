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
var QuoteBinder = Class.create();
Object.extend(QuoteBinder.prototype, {
    initialize: function (opt) {
        var _t = this;
        _t.setOptions(opt);
        _t.update();
        var interval = setInterval(function () { _t.update(); }, _t.options.interval * 1000);
    },
    setOptions: function (opt) {
        this.options = {
            data: [],
            tag: '',
            url: 'http://q.ssajax.cn/info/handler/xquotehandler.ashx?q={q}&n=ssQuote&tick={tick}',
            format: function (q) { return ""; },
            cache: {},
            interval: 60
        };
        Object.extend(this.options, opt || {});
    },
    update: function () {
        var _t = this;
        var _url = _t.options.url.replace("{q}", _t.options.data.join(",")).replace("{tick}", Date.parse(new Date()));
        _t.utils.loadJs(_url, 'gb2312', function () {
            _t.options.cache = window.ssQuote || {};
            for (var a in _t.options.cache) {
                var q = _t.options.cache[a];
                var s = _t.options.format(q);
                $("#" + _t.options.tag + "" + q[0]).html(s);
            };
        });
    },
    utils: {
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
                    _this.removeJs(_js);
                }
            }
        },
        removeJs: function (o) {
            var _js = (typeof o == "string") ? document.getElementById(o) : o;
            _js.onload = _js.onreadystatechange = null;
            try {
                _js.parentNode.removeChild(_js);
            } catch (e) { }
        }
    }
});