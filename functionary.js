(function(){
	var args = function(argsObj) {
		return Array.prototype.splice.call(argsObj,argsObj);
	};
	var isFunc = function(f) {
		return f!==undefined && f!==null && f instanceof Function;
	};

	Function.prototype.delay = Function.prototype.delay || function(ms) {
		if (!isFunc(this)) throw "delay must be called on an instance of a function.";
		var a = args(arguments), f = this;
		d = a.shift() || 0.01;
		return setTimeout(function(){
			return f.apply(f,a);
		},d);
	};

	Function.prototype.defer = Function.prototype.defer || function() {
		if (!isFunc(this)) throw "defer must be called on an instance of a function.";
		var a = args(arguments);
		a.unshift(null);
		return Function.prototype.delay.apply(this,a);
	};

	Function.prototype.collapse = Function.prototype.collapse || function(i) {
		if (!isFunc(this)) throw "collapse must be called on an instance of a function.";
		var i = parseInt(i) || null, q = false,f = this,a = null,t= null,g = function() {		
			if (t) t = null;
			if (q!=true) return;
			q = false;
			f.apply(this,a);
		},h = function() {
			a = args(arguments);
			if (q) return;
			q = true;
			if (i!==null) t = g.delay(i);
		};
		h.pending = function() {
			return q;
		};
		h.now = function() {
			if (t) clearTimeout(t);
			a = args(arguments);
			q = true;
			try { 
				g();
			} catch (e) {
				q = false;
				throw e;
			};
			q = false;
		};
		h.cancel = function() {
			q = false;
			if (t) clearTimeout(t);
		};
		return h;
	};

	Function.prototype.wait = Function.prototype.wait || function() {
		if (!isFunc(this)) throw "wait must be called on an instance of a function.";
		var fs = args(arguments), c = this;
		var stop = false;
		var g = function() {			
			stop = false;
			var a = args(arguments), t = this, x = 0;
			for (var i=0;i<fs.length;i++) {
				var f = fs[i];
				if (!isFunc(f)) continue;
				(function(f){
					if (stop) return;
					try {
						f.apply(t,a);
					}
					catch (e) {}
					x += 1;
					if (x>=fs.length && !stop) c.apply(t,a);
				}).defer(f);
			}
		};
		g.cancel = function() {
			stop = true;
		};
		g.now = function() {
			stop = true;
			c.apply(this,args(arguments));
		};
		return g;
	};

	Function.prototype.bundle = Function.prototype.bundle || function() {
		var a = args(arguments);
		if (a.length===0) return this;
		for (var i=0;i<a.length;i++) if (!isFunc(a[i])) a[i] = null;
		if(isFunc(this)) a.unshift(this);
		return function() {
			var b = args(arguments);
			var r = null;
			for (var i=0;i<a.length;i++) {
				var f = a[i];
				if (f!==null) r = a[i].apply(this,b);
			}
			return r;
		};			
		return g;
	}

	Function.prototype.chain = Function.prototype.chain || Function.prototype.bundle;

	Function.prototype.before = Function.prototype.before || Function.prototype.bundle;

	Function.prototype.after = Function.prototype.after || function() {
		var a = args(arguments), f = null;		
		if (a.length===0) f = function() {};
		else f = a.shift();
		a.push(this);
		return f.bundle.apply(f,a);
	};

	Function.prototype.completed = Function.prototype.completed || function(c) {
		if (!isFunc(this)) throw "completed must be called on an instance of a function.";
		if (!isFunc(c)) throw "parameter f must be a function.";
		var f = this, g = function() {
			var a = args(arguments);
			try {
				var r = f.apply(this,a);
				c(this,r,a);
				return r;
			}
			catch (e) {
				throw e;
			};
		};
		return g;
	};

	Function.prototype.failed = Function.prototype.failed || function(c) {
		if (!isFunc(this)) throw "completed must be called on an instance of a function.";
		if (!isFunc(c)) throw "parameter f must be a function.";
		var f = this, g = function() {
			var a = args(arguments);
			try {
				var r = f.apply(this,a);
				return r;
			}
			catch (e) {
				c(this,r,a);
				throw e;
			};
		};
		return g;
	};

	Function.prototype.wrap = Function.prototype.wrap || function(w) {
		if (!isFunc(this)) throw "completed must be called on an instance of a function.";
		if (!isFunc(w)) throw "parameter f must be a function.";
		var f = this, g = function() {
			var a = args(arguments);
			a.unshift(f);
			return w.apply(this,a);
		};
		g.unwrap = function() {
			return f;
		};
		return g;
	};

})();