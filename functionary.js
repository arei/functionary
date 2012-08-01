/*

Modifies the Function prototype adding additional methods as described below.  
The result of any of these calls on a function is to return a function.  The 
returned function is a modified version of the function you initially created. 
For example:

	var F = function() { ... };
	var H = F.modifier();

The resulting function H is the given function F but modified by modifier().  
Ultimately function H is a new function that wraps (in some manner) function F.

Other ways of calling modifiers are

	var H = function() { ... }.modifer();
	(function() { ... }.modifer());

Each additional function added to the prototype provides a different type of 
modifiication to the original function. Please see the individual details below.

Additionally, because the result of a function modifier is a function 
modifiers can be chained together for multiple effects.

author: Glen R. Goodwion (@areinet - http://www.arei.net)

*/

(function(){

	/*
		Internal args converter.
	*/
	var args = function(argsObj) {
		return Array.prototype.splice.call(argsObj,argsObj);
	};
	var isFunc = function(f) {
		return f!==undefined && f!==null && f instanceof Function;
	};

	/*
		Delays execution of a function by ms.  A shortcut of calling setTimeout(f,delay). 
		As with setTimeout, the delay period is only a suggestion, not an absolute.
		THis differs from setTimeout in that all the parameters after the first one
		are passed to the function being called.

		Returns a >0 number representing the functions position in the function queue.
	*/
	Function.prototype.delay = Function.prototype.delay || function(ms) {
		if (!isFunc(this)) throw "delay must be called on an instance of a function.";
		var a = args(arguments), f = this;
		d = a.shift() || 0.01;
		return setTimeout(function(){
			return f.apply(f,a);
		},d);
	};

	/*
		Essentially a defer with a minimal delay time thus making this function
		executed next in the function queue.  All parameters passed to defer are
		forwarded on to the function being defered.

		Returns a >0 number representing the functions position in the function queue.
	*/
	Function.prototype.defer = Function.prototype.defer || function() {
		if (!isFunc(this)) throw "defer must be called on an instance of a function.";
		var a = args(arguments);
		a.unshift(null);
		return Function.prototype.delay.apply(this,a);
	};

	/*
		Given some function G, modify the function to collapse subsequent calls into a single
		call that executes either after some given time frame or as requested.

		There are two flavors of this call: managed and timed. Managed collapse places the
		responsibility of executing the collapsed call with the developer.  Timed collapse 
		automatically ensures the execution of G after some period of time.

		MANAGED

		The managed flavor, collapse() is called without any parameter as shown here.

		var G = function(){ ... };
		var F = G.collapse();

		Subsquent calls to F are collapsed into a single pending execution.  F.pending() will
		return true if F has any prior calls waiting to be executed.  F.now() will execute G
		immediately can clear the pending state.  F.cancel will clear the pending state, but
		will not execute G.

		A note about parameters: 

		Parameters passed to F() will be ignored using the managed approach.  The only
		parameters used in executing G will be those passed in to F.now().

		TIMED

		The timed flavor, collapse() is called with a single number that specifies
		milliseconds, as shown below:

		var X = 1500; // 1.5 seconds
		var G = function(){ ... };
		var F = G.collapse(X); 

		Using this flavor, G will execute X milliseconds after the first call to F. Upon
		execution of G, the pending state is cleared and the process can begin again. 
		F.pending(), f.now(), and f.cancel(), each behave as described above.

		A Note about parameters: 

		The parameters passed on the final call to F() before the timer executed G()
		will be passed to G().  The exception to this is that any call to f.now() will
		send the parameters from .now() into G.
	*/
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

	/*
		Executes the bound function after all the passed in function have executed.
		Execution is in a deferred manner to prevent blocking.  There is no order 
		garauntted to the execution of the passed in functions.
	*/
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

	/*
		Bundles two (or more) functions together into one serial execution.  The bound
		function always executes first. Parameters passed into the resulting function are
		passed to each bundled function.  The return value of a chain is that of
		the last function executed.  Any parameter passed to bundle that is not
		a function is ignored.  You may also execute this without a bound function to
		concatanate allt he functions passed in.
	*/
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

	/*
		Chain is an alias to bundle.  See bundle for details.
	*/
	Function.prototype.chain = Function.prototype.chain || Function.prototype.bundle;

	/*
		A function modifier that executes another function before the original
		function has exectued.  f.before(g) This is functionally equivalant to 
		doing f.bundle(g).
	*/
	Function.prototype.before = Function.prototype.before || Function.prototype.bundle;

	/*
		a function modifier that executes another function after the original
		function has executed.  f.after(g) is functionally equivalant to 
		g.bundle(f).

	*/
	Function.prototype.after = Function.prototype.after || function() {
		var a = args(arguments), f = null;		
		if (a.length===0) f = function() {};
		else f = a.shift();
		a.push(this);
		return f.bundle.apply(f,a);
	};

	/*
		A function modifier that executes another function after successful
		execution (no exception thrown) of the original function.
	*/
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

	/*
		A function modifier that executes another function after unsuccessful
		execution (an exception thrown) of the original function.
	*/
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

	/*
		A function modifier for wrapping a function within a second function.  The second 
		function (w) will be called first, and the first parameter will the original function.
		It is up to the second function (w) to then call the first function.
	*/
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