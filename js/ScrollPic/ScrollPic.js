(function() {
    var G = {
        $: function(objName) {
            if (document.getElementById) {
                return eval('document.getElementById("' + objName + '")')

            } else {
                return eval('document.all.' + objName)
            }
        },
        isIE: navigator.appVersion.indexOf("MSIE") != -1 ? true: false,
        addEvent: function(l, i, I) {
            if (l.attachEvent) {
                l.attachEvent("on" + i, I)

            } else {
                l.addEventListener(i, I, false)
            }
        },
        delEvent: function(l, i, I) {
            if (l.detachEvent) {
                l.detachEvent("on" + i, I)
            } else {
                l.removeEventListener(i, I, false)
            }
        }
    };
    function ScrollPic(I, i, l, o, c) {
        var O = this;
        O.scrollContId = I;
        O.arrLeftId = i;
        O.arrRightId = l;
        O.dotListId = o;
        O.listType = c;
        O.dotClassName = "dotItem";
        O.dotOnClassName = "dotItemOn";
        O.dotObjArr = [];
        O.listEvent = "onclick";
        O.circularly = true;
        O.frameWidth = O.pageWidth = 0;
        O.space = O.speed = 10;
        O.upright = false;
        O.pageIndex = 0;
        O.autoPlay = true;
        O.autoPlayTime = 5;
        O._state = "ready";
        O.stripDiv = document.createElement("DIV");
        O.lDiv01 = document.createElement("DIV");
        O.lDiv02 = document.createElement("DIV")

    };
    ScrollPic.prototype = {
        initialize: function() {
            var o = this,
            I = o;
            if (o.scrollContId) if (o.scDiv = G.$(o.scrollContId)) {
                o.scDiv.style[o.upright ? "height": "width"] = o.frameWidth + "px";
                o.scDiv.style.overflow = "hidden";
                o.lDiv01.innerHTML = o.scDiv.innerHTML;
                o.scDiv.innerHTML = "";
                o.scDiv.appendChild(o.stripDiv);
                o.stripDiv.appendChild(o.lDiv01);
                if (o.circularly) {
                    o.stripDiv.appendChild(o.lDiv02);
                    o.lDiv02.innerHTML = o.lDiv01.innerHTML

                }
                o.stripDiv.style.overflow = "hidden";
                o.stripDiv.style.zoom = "1";
                o.stripDiv.style[o.upright ? "height": "width"] = "32766px";
                o.lDiv01.style.overflow = "hidden";
                o.lDiv02.style.overflow = "hidden";
                if (!o.upright) {
                    o.lDiv01.style.cssFloat = "left";
                    o.lDiv01.style.styleFloat = "left"

                }
                o.lDiv01.style.zoom = "1";
                if (o.circularly && !o.upright) {
                    o.lDiv02.style.cssFloat = "left";
                    o.lDiv02.style.styleFloat = "left"

                }
                o.lDiv02.style.zoom = "1";
                G.addEvent(o.scDiv, "mouseover", 
                function() {
                    I.stop()

                });
                G.addEvent(o.scDiv, "mouseout", 
                function() {
                    I.play()

                });
                if (o.arrLeftId) if (o.alObj = G.$(o.arrLeftId)) {
                    G.addEvent(o.alObj, "mousedown", 
                    function() {
                        I.rightMouseDown()

                    });
                    G.addEvent(o.alObj, "mouseup", 
                    function() {
                        I.rightEnd()

                    });
                    G.addEvent(o.alObj, "mouseout", 
                    function() {
                        I.rightEnd()

                    })

                }
                if (o.arrRightId) if (o.arObj = G.$(o.arrRightId)) {
                    G.addEvent(o.arObj, "mousedown", 
                    function() {
                        I.leftMouseDown()

                    });
                    G.addEvent(o.arObj, "mouseup", 
                    function() {
                        I.leftEnd()

                    });
                    G.addEvent(o.arObj, "mouseout", 
                    function() {
                        I.leftEnd()

                    })

                }
                if (o.dotListId) {
                    o.dotListObj = G.$(o.dotListId);
                    o.dotListObj.innerHTML = "";
                    if (o.dotListObj) {
                        var i = Math.round(o.lDiv01[o.upright ? "offsetHeight": "offsetWidth"] / o.frameWidth + 0.4),
                        l,
                        O;
                        for (l = 0; l < i; l++) {
                            O = document.createElement("span");
                            o.dotListObj.appendChild(O);
                            o.dotObjArr.push(O);
                            O.className = l == o.pageIndex ? o.dotOnClassName: o.dotClassName;
                            if (o.listType == "number") O.innerHTML = l + 1;
                            O.title = "第" + (l + 1) + "页";
                            O.num = l;
                            O[o.listEvent] = function() {
                                I.pageTo(this.num)

                            }

                        }

                    }

                }
                o.scDiv[o.upright ? "scrollTop": "scrollLeft"] = 0;
                o.autoPlay && o.play();
                o._scroll = o.upright ? "scrollTop": "scrollLeft";
                o._sWidth = o.upright ? "scrollHeight": "scrollWidth";
                typeof o.onpagechange === "function" && o.onpagechange()

            } else throw new Error("scrollContId不是正确的对象.(scrollContId = \"" + o.scrollContId + "\")");
            else throw new Error("必须指定scrollContId.")

        },
        leftMouseDown: function() {
            if (this._state == "ready") {
                var a = this;
                this._state = "floating";
                this._scrollTimeObj = setInterval(function() {
                    a.moveLeft()

                },
                this.speed)

            }

        },
        rightMouseDown: function() {
            if (this._state == "ready") {
                var a = this;
                this._state = "floating";
                this._scrollTimeObj = setInterval(function() {
                    a.moveRight()

                },
                this.speed)

            }

        },
        moveLeft: function() {
            var i = this;
            if (i.circularly) if (i.scDiv[i._scroll] + i.space >= i.lDiv01[i._sWidth]) i.scDiv[i._scroll] = i.scDiv[i._scroll] + i.space - i.lDiv01[i._sWidth];
            else i.scDiv[i._scroll] += i.space;
            else if (i.scDiv[i._scroll] + i.space >= i.lDiv01[i._sWidth] - i.frameWidth) {
                i.scDiv[i._scroll] = i.lDiv01[i._sWidth] - i.frameWidth;
                i.leftEnd()

            } else i.scDiv[i._scroll] += i.space;
            i.accountPageIndex()

        },
        moveRight: function() {
            var i = this;
            if (i.circularly) if (i.scDiv[i._scroll] - i.space <= 0) i.scDiv[i._scroll] = i.lDiv01[i._sWidth] + i.scDiv[i._scroll] - i.space;
            else i.scDiv[i._scroll] -= i.space;
            else if (i.scDiv[i._scroll] - i.space <= 0) {
                i.scDiv[i._scroll] = 0;
                i.rightEnd()

            } else i.scDiv[i._scroll] -= i.space;
            i.accountPageIndex()

        },
        leftEnd: function() {
            var i = this;
            if (i._state == "floating") {
                i._state = "stoping";
                clearInterval(i._scrollTimeObj);
                var I = i.pageWidth - i.scDiv[i._scroll] % i.pageWidth;
                i.move(I)

            }

        },
        rightEnd: function() {
            var i = this;
            if (i._state == "floating") {
                i._state = "stoping";
                clearInterval(i._scrollTimeObj);
                var I = -i.scDiv[i._scroll] % i.pageWidth;
                i.move(I)

            }

        },
        move: function(a, d) {
            var c = this,
            b = a / 5;
            if (!d) {
                if (b > this.space) b = this.space;
                if (b < -this.space) b = -this.space

            }
            b = Math.abs(b) < 1 && b != 0 ? b >= 0 ? 1: -1: Math.round(b);
            if (b > 0) if (this.circularly) if (this.scDiv[this._scroll] + b >= this.lDiv01[this._sWidth]) this.scDiv[this._scroll] = this.scDiv[this._scroll] + b - this.lDiv01[this._sWidth];
            else this.scDiv[this._scroll] += b;
            else if (this.scDiv[this._scroll] + b >= this.lDiv01[this._sWidth] - this.frameWidth) {
                this.scDiv[this._scroll] = this.lDiv01[this._sWidth] - this.frameWidth;
                this._state = "ready";
                return

            } else this.scDiv[this._scroll] += b;
            else if (this.circularly) if (this.scDiv[this._scroll] + b < 0) this.scDiv[this._scroll] = this.lDiv01[this._sWidth] + this.scDiv[this._scroll] + b;
            else this.scDiv[this._scroll] += b;
            else if (this.scDiv[this._scroll] - b < 0) {
                this.scDiv[this._scroll] = 0;
                this._state = "ready";
                return

            } else this.scDiv[this._scroll] += b;
            a -= b;
            if (Math.abs(a) == 0) {
                this._state = "ready";
                this.autoPlay && this.play();
                this.accountPageIndex()

            } else {
                this.accountPageIndex();
                this._scrollTimeObj = setTimeout(function() {
                    c.move(a, d)

                },
                this.speed)

            }

        },
        pre: function() {
            var i = this;
            if (i._state == "ready") {
                i._state = "stoping";
                i.move( - i.pageWidth, true)

            }

        },
        next: function(I) {
            var i = this;
            if (i._state == "ready") {
                i._state = "stoping";
                if (i.circularly) i.move(i.pageWidth, true);
                else if (i.scDiv[i._scroll] >= i.lDiv01[i._sWidth] - i.frameWidth) {
                    i._state = "ready";
                    I && i.pageTo(0)

                } else i.move(i.pageWidth, true)

            }

        },
        play: function() {
            var a = this;
            if (this.autoPlay) {
                clearInterval(this._autoTimeObj);
                this._autoTimeObj = setInterval(function() {
                    a.next(true)

                },
                this.autoPlayTime * 1E3)

            }

        },
        stop: function() {
            clearInterval(this._autoTimeObj)

        },
        pageTo: function(I) {
            var i = this;
            if (i.pageIndex != I) {
                clearTimeout(i._scrollTimeObj);
                i._state = "stoping";
                I = I * i.frameWidth - i.scDiv[i._scroll];
                i.move(I, true)

            }

        },
        accountPageIndex: function() {
            var i = this,
            I = Math.round(i.scDiv[i._scroll] / i.frameWidth);
            if (I != i.pageIndex) {
                i.pageIndex = I;
                typeof i.onpagechange === "function" && i.onpagechange();
                if (i.pageIndex > Math.round(i.lDiv01[i.upright ? "offsetHeight": "offsetWidth"] / i.frameWidth + 0.4) - 1) i.pageIndex = 0;
                for (I = 0; I < i.dotObjArr.length; I++) i.dotObjArr[I].className = I == i.pageIndex ? i.dotOnClassName: i.dotClassName

            }

        }

    };
    window.ScrollPic = ScrollPic;
})();