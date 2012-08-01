functionary
------

functionary is a small library that extends the function core prototype for expanded functionality for Browser or NodeJS development.  It is similar to Prototype.js or sugar.js but only for functions.

Functionary modifies the Function prototype.  It attempts to only overwrite methods if they do not already exist.  As such it should not clobber pre-existing behaviors from other scripts such as Prototype.

The goal of functionary is to provide a series of convinence methods for doing more interesting things with functions.

`defer` and `delay` provide some very common behaviors that are not included in javascript by default but probably should have been.

`collapse`, arguably the most powerful of all the additions, provides incredibly powerful "queue" behavior to functions to ensure that a function only runs once over some period despite being called multiple times.

`wait` allows a developer to defer execution of a function until a series of other functions has run first.

`bundle`, `chain`, `before`, and `after` provide sequential executuion of functions.

`completed` and `failed` provide an interesting try/catch option for functions.

`wrap` allows a developer to wrap one function in another function.

Furthermore, by combining these function calls together one can come up with some very interesting functionality patterns.

## Compatabilty

functionary.js will work in either Node.js or Browser implementations.

## Installation

For Node.js simply install from npm as such: `npm install functionary`
    
For browsers, download the functionary.js file.  You may then include functionary.js in your HTML HEAD element. I'm going to assume you know how to do that using HTML already.

## Usage

### `defer(...)`

Defers the execution of the bound function to the next available pause in the execution thread.  JavaScript, as we all know, is single threaded.  However, through th usage of timers and events, a multi-threaded-like behavior can be achieved.  Defer, then, allows the developer to schedule the bound function for exection at the next idle time.

Defer may take any number of parameters which are passed to the bound function when it is executed.

	(function(a,b,c) {}).defer(1,2,3);
	
	var f = function(someNumber) {};
	f.defer(276);

Defer returns a non-zero interger representing the event id.  You can use `clearTimeout()` along with this number to cancel the call.

#### `delay(n, ...)`

Delays the execution of the boound function n milliseconds into the future.  Delay is not garaunteed to run exactly n milliseconds into the future.  Instead, delay runs n milliseconds intot he future where it then scheduled the function for execution at the next idle time.

Delay requires the first parameters to be a positive number representing the number of milliseconds to wait before execution. Any paramters passed in beyond the first parameter are automatically passed to the bound function at execution time.

	(function(a,b,c) {}).delay(1000,1,2,3);
	
	var f = function(someNumber) {};
	f.delay(50,276);

Delay returns a non-zero interger representing the event id.  You can use `clearTimeout()` along with this number to cancel the call.

### `collapse()` 

Collapse has two versions, Managed and Timed.  This describes the Managed version.  For the Timed version, see `collapse(n)` below.

Collapse take a bound function and ensure the multiple subsequent calls to the function get collapsed together into a single call.  Consider:

	var f = (function(){
		console.log("hello");
	});
	f();
	f();
	f();

This would print "hello" three times in succession.  However, through the usage of collapse() as shown below:

	var f = (function(){
		console.log("hello");
	}).collapse();
	f();
	f();
	f();
	f.now();

Would only print "hello" once, when the f.now() call is made.

This allows the developer to "queue" up a series of calls over time but then only actually run the call once.  The developer can test if any calls to the function have been "queued" up by calling `f.pending()`.  A `true` result indicates that calls are pending.

When the developer is then ready for `f()` to actually be executed, `f.now()` will force the actual execution.  In the event that execution should not occur, `f.cancel()` will clear the pending state without executing `f()`.

### `collapse(n)`

Collapse has two versions, Managed and Timed.  This describes the Timed version.  For the Managed version, see `collapse()` above.

Timed collapse is identical to Managed collapse, except for one very important detail.  The calling of f.now() is not required.  The system will automatically execute (see `delay` above) f.now() n milliseconds after the first call to `f()`. Thus in this example:

	var f = (function(){
		console.log("hello");
	}).collapse(50);
	f();
	f();
	f();

`f()` will execute 50 milliseconds after the first call to `f()`.  Once `f()` is actually executed, the pending state is cleared and the timer will not begin again until the next call to `f()`.

In the Timed version, a call to `f.now()` will force execution immediately. and cancel any pending execution

### `wait(...)`

Given some set of functions, wait will ensure that execution of the bound function happens only after all the other functions has happened first.  Each function execution is defered (see `defer` above) and the bound function is held from executing until all are complete.

For example:

	var f = (function() {
		console.log("last");
	}).wrap(function(){
		console.log("first");
	},function(){
		console.log("second");
	});
	f();

Would result in "first", "second" and then "last" called. 

PLEASE NOTE that the order of execution of the passed in functions is not garaunteed.

Two additional functions are added to the returned function from wait to provide additional control.  `cancel()` will stop execution of all functions that have not yet run including the bound function.  `now()` stop execution but then execute the bound function.

### `bundle(...)`

Bundle combined a series of functions into one function.  The order of execution of these functions is bound function, followers by passed in functions.

	var f = function(){};
	var g = function(){};
	var h = function(){};
	var i = function(){};
	var x = f.bundle(g,h,i);

In this example, the order of execution when `x()` is called is f, g, h, i.

### `chain(...)`

Chain is an alias to bundle and behaves identially.

### `before(...)`

Before is a specialized version of bundle that ensure that the bound function runs before the passed in functions.

	var f = function(){};
	var g = function(){};
	var x = f.before(g);

Execution of `x()` would result in `f()` running before `g()`.

### `after(...)`

Before is a specialized version of bundle that ensure that the bound function runs after the passed in functions.

	var f = function(){};
	var g = function(){};
	var x = f.after(g);

Execution of `x()` would result in `f()` running after `g()`.

### `completed(f)`

Completed and it's sibling `failed` provide an interesting twist on try/catch.  Completed will executes the passed in function, only if the given function did not throw an exception.  For example:

	var f = function(){};
	var g = function(){};
	var x = f.completed(g);

Executing `x()` would execute `f()` and then if no exception was thrown, would execute `g()` afterwards.

### `failed(f)`

Failed and it's sibling `completed` provide an interesting twist on try/catch.  Failed will executes the passed in function, only if the given function throws an exception.  For example:

	var f = function(){};
	var g = function(){};
	var x = f.failed(g);

Executing `x()` would execute `f()` and then if an exception was thrown, would execute `g()` afterwards.

### `wrap(f)`

Wrap allows for basic overloading of function behavior by wrapping the bound function inside of the passed in function.  The first parameters sent to the passed in function upon execution is the original bound function which the given function may execute.  Here's an example:

	var f = function(){
		console.log("inner");
	};
	var g = function(orig,a,b,c) {
		inner();
		console.log("outer",a,b,c);
	};
	var x = f.wrap(g);

Executing `x(1,2,3)` would result in

	inner
	outer 1 2 3 

## Future Changes

I'm hoping to add a Curry function soon.  Just got to think it through.  Other ideas will creep into my brain too and I will try to add them here.

## Testing

You can, if you want, run test.js in node `node test.js` to verify that fod.js is working.

## Feedback

Please let me know if you like or are using this, or even if you dislike it or have any ideas.  @areinet 
