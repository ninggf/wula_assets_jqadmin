layui.define('jquery', exports => {
	var clipboard = function () {
		var f   = {};
		f.copy  = function () {
			var c = !1, d;
			document.addEventListener("copy", function (b) {
				if (c) {
					c = !1;
					for (var e in d) b.clipboardData.setData(e, d[e]);
					b.preventDefault()
				}
			});
			return function (b) {
				return new Promise(function (e, f) {
					c = !0;
					d = "string" === typeof b ? {"text/plain": b} : b instanceof Node ? {"text/html": (new XMLSerializer).serializeToString(b)} : b;
					try {
						document.execCommand("copy") ?
							e() : (c = !1, f(Error("Unable to copy. Perhaps it's not available in your browser?")))
					} catch (g) {
						c = !1, f(g)
					}
				})
			}
		}();
		f.paste = function () {
			var c = !1, d, b;
			document.addEventListener("paste", function (e) {
				c && (c = !1, e.preventDefault(), d(e.clipboardData.getData(b)))
			});
			return function (e) {
				return new Promise(function (f, g) {
					c = !0;
					d = f;
					b = e || "text/plain";
					try {
						document.execCommand("paste") || (c = !1, g(Error("Unable to paste. Pasting only works in Internet Explorer at the moment.")))
					} catch (k) {
						c = !1, g(Error(k))
					}
				})
			}
		}();
		"undefined" === typeof ClipboardEvent &&
		"undefined" !== typeof window.clipboardData && "undefined" !== typeof window.clipboardData.setData && (function (c) {
			function d(a, b) {
				return function () {
					a.apply(b, arguments)
				}
			}

			function b(a) {
				if ("object" != typeof this) throw new TypeError("Promises must be constructed via new");
				if ("function" != typeof a) throw new TypeError("not a function");
				this._value = this._state = null;
				this._deferreds = [];
				l(a, d(f, this), d(g, this))
			}

			function e(a) {
				var b = this;
				return null === this._state ? void this._deferreds.push(a) : void m(function () {
					var c =
							b._state ? a.onFulfilled : a.onRejected;
					if (null === c) return void(b._state ? a.resolve : a.reject)(b._value);
					var h;
					try {
						h = c(b._value)
					} catch (d) {
						return void a.reject(d)
					}
					a.resolve(h)
				})
			}

			function f(a) {
				try {
					if (a === this) throw new TypeError("A promise cannot be resolved with itself.");
					if (a && ("object" == typeof a || "function" == typeof a)) {
						var b = a.then;
						if ("function" == typeof b) return void l(d(b, a), d(f, this), d(g, this))
					}
					this._state = !0;
					this._value = a;
					k.call(this)
				} catch (c) {
					g.call(this, c)
				}
			}

			function g(a) {
				this._state = !1;
				this._value =
					a;
				k.call(this)
			}

			function k() {
				for (var a = 0, b = this._deferreds.length; b > a; a++) e.call(this, this._deferreds[a]);
				this._deferreds = null
			}

			function n(a, b, c, h) {
				this.onFulfilled = "function" == typeof a ? a : null;
				this.onRejected  = "function" == typeof b ? b : null;
				this.resolve     = c;
				this.reject      = h
			}

			function l(a, b, c) {
				var h = !1;
				try {
					a(function (a) {
						h || (h = !0, b(a))
					}, function (a) {
						h || (h = !0, c(a))
					})
				} catch (d) {
					h || (h = !0, c(d))
				}
			}

			var m                = b.immediateFn || "function" == typeof setImmediate && setImmediate || function (a) {
				setTimeout(a, 1)
			}, p                 = Array.isArray || function (a) {
				return "[object Array]" ===
					Object.prototype.toString.call(a)
			};
			b.prototype["catch"] = function (a) {
				return this.then(null, a)
			};
			b.prototype.then     = function (a, c) {
				var d = this;
				return new b(function (b, f) {
					e.call(d, new n(a, c, b, f))
				})
			};
			b.all                = function () {
				var a = Array.prototype.slice.call(1 === arguments.length && p(arguments[0]) ? arguments[0] : arguments);
				return new b(function (b, c) {
					function d(e, g) {
						try {
							if (g && ("object" == typeof g || "function" == typeof g)) {
								var k = g.then;
								if ("function" == typeof k) return void k.call(g, function (a) {
									d(e, a)
								}, c)
							}
							a[e] = g;
							0 === --f && b(a)
						} catch (l) {
							c(l)
						}
					}

					if (0 === a.length) return b([]);
					for (var f = a.length, e = 0; e < a.length; e++) d(e, a[e])
				})
			};
			b.resolve            = function (a) {
				return a && "object" == typeof a && a.constructor === b ? a : new b(function (b) {
					b(a)
				})
			};
			b.reject             = function (a) {
				return new b(function (b, c) {
					c(a)
				})
			};
			b.race               = function (a) {
				return new b(function (b, c) {
					for (var d = 0, e = a.length; e > d; d++) a[d].then(b, c)
				})
			};
			"undefined" != typeof module && module.exports ? module.exports = b : c.Promise || (c.Promise = b)
		}(this), f.copy = function (c) {
			return new Promise(function (d, b) {
				if ("string" !== typeof c && !("text/plain" in
					c)) throw Error("You must provide a text/plain type.");
				window.clipboardData.setData("Text", "string" === typeof c ? c : c["text/plain"]) ? d() : b(Error("Copying was rejected."))
			})
		}, f.paste = function (c) {
			return new Promise(function (c, b) {
				var e = window.clipboardData.getData("Text");
				e ? c(e) : b(Error("Pasting was rejected."))
			})
		});
		return f
	};
	exports('clipboard', clipboard());
});