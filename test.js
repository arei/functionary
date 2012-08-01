
try {
	require("./functionary.js");
}
catch (e) {
}

(function() {
	console.log("\nTesting Bundle: ");
	var a = 0;
	(function(){ 
		a = 5; 
	}.bundle(function(){
		a = a * 4;
	},function(){
		a = a / 2;
	},function(){
		a = a + 7;
	}))();
	if (a===17) console.log("Passed.");
	else console.log("FAILED.");
})();

(function() {
	console.log("\nTesting Chain: ");
	var a = 0;
	(function(){ 
		a = 6; 
	}.bundle(function(){
		a = a * 4;
	},function(){
		a = a / 2;
	},function(){
		a = a + 7;
	}))();
	if (a===19) console.log("Passed.");
	else console.log("FAILED.");
})();

(function() {
	console.log("\nTesting After: ");
	var a = null, b = false;
	var f = function(){
		a = b;
	}.after(function(){
		b = true;
	});
	f();
	if (a) console.log("Passed.");
	else console.log("FAILED.");
})();

(function() {
	console.log("\nTesting Before: ");
	var a = null, b = false;
	var f = function(){
		b = true;
	}.before(function(){
		a = b;
	});
	f();
	if (a) console.log("Passed.");
	else console.log("FAILED.");
})();

(function() {
	console.log("\nTesting Completed: ");
	var a = false;
	var f = function(){
		a = false;
	}.completed(function(){
		a = true;
	});
	f();
	if (a) console.log("Passed.");
	else console.log("FAILED.");
})();

(function() {
	console.log("\nTesting Failed: ");
	var a = false;
	var f = function(){
		throw "asdf";
	}.failed(function(){
		a = true;
	});
	try {
		f();
	} catch (e) {};
	if (a) console.log("Passed.");
	else console.log("FAILED.");
})();

(function() {
	console.log("\nTesting Before and After: ");
	var a = false, b = false, c = false;
	var f = function() {
		b = c;
	}.after(function(){
		c = true;
	}).before(function(){
		a = b;
	});
	f();
	if (a) console.log("Passed.");
	else console.log("FAILED.");
})();

(function(){
	console.log("\nTesting Wrap: ");
	var a = false, b = false;
	var f = function() {
		a = b;
	};
	var g = f.wrap(function(orig){
		b = true;
		orig();
	});
	g();
	if (a) console.log("Passed.");
	else console.log("FAILED.");
})();

(function() {
	console.log("\nTesting Managed collapse: ");
	var e = 0, c = 0;

	var g = function() { 
		e++;
	}.collapse();

	for (var i=0;i<5;i++) { 
		c++;
		g();
	};
	g.now();

	if (c!=5 && e!=1) console.log("FAILED.");
	else console.log("Passed.");
})();

(function() {
	console.log("\nTesting Timed collapse: ");
	var e = 0, c = 0;

	var g = function() { 
		e++;
	}.collapse(1000);

	for (var i=0;i<25;i++) { 
		setTimeout(function(){
			c++;
			g();
		},i*10); 
	};

	(function(){
		if (c!=25 && e!=3) console.log("FAILED.");
		else console.log("Passed.");
	}).delay(1000)	
})();

(function(){
	console.log("\nTesting Wait: ");
	var c = 5;
	var g = (function() {
		c = c / 5;
	}).wait(function(){
		c = c * 4;
	},function(){
		c = c / 2;
	},function(){
		c = c + 20
	});
	g();

	(function() {
		if (c!=6) console.log("FAILED.");
		else console.log("Passed.");
	}).delay(1000);

}).delay(1100);