modsjs
------

modsjs is a small library that extends the core prototypes for expanded functionality for Browser or NodeJS development.  It is similar to Prototype.js but lighter or sugar.js.

## Compatabilty

fod.js will work in either Node.js or Browser implementations.

## Installation

For Node.js simply install from npm as such: `npm install modsjs`
    
For browsers, download the modsjs.zip package.  You may then include modsjs.js to get everything or individual mods-* pacakges for just the piece you want. I'm going to assume you know how to do that using HTML already.

## Usage

### mods-f.js

Modifies the Function prototype adding additional methods as described below.  The result of any of these calls on a function is to return a function.  The returned function is a modified version of the function you initially created. For example:

	var F = function() { ... };
	var H = F.modifier();

The resulting function H is the given function F but modified by modifier().  Ultimately function H is a new function that wraps (in some manner) function F.

Other ways of calling modifiers are

	var H = function() { ... }.modifer();
	(function() { ... }.modifer());

Each additional function added to the prototype provides a different type of modifiication to the original function. Please see the individual details below.

Additionally, because the result of a function modifier is a function modifiers can be chained together for multiple effects.

#### before(f)

Executes the given function f before the function that is being modified.

	var F = function() { ... };
	var G = function() { ... };
	var H = F.before(G);

All calls to H() will execute G() first, then F().

#### after(f)

Executes the given function f after the function that is being modified.

	var F = function() { ... };
	var G = function() { ... };
	var H = F.after(G);

All calls to H() will execute F() first, then G().

#### completed(f)

Executes the given function f after the function being modified has executed and only if that function did not throw an exception.

	var F = function() { ... };
	var G = function() { ... };
	var H = F.completed(G);

All calls to H() will execute F() and then if no exception occured will execute G().

#### failed(f)

Executes the given function f after the function being modified has executed and only if that function threw an exception.

	var F = function() { ... };
	var G = function() { ... };
	var H = F.completed(G);

All calls to H() will execute F() and then an exception occured will execute G().

#### wrap(f)

Wraps the function being modified into the given function f.  The first parameter passed to f will be the original function so that it can be called from inside of f.

	var F = function() { ... };
	var G = function(originalF) { ... };
	var H = F.wrap(G);

All calls to H() will execute G().  It is up to G() to call F.

H contains a function H.unwrap() which will return F.

#### collapse()

Collapses all calls to the modified function into a single call to be exected by the developer.

	var F = function() { ... };
	var H = F.collapse();

All calls to H will be collapsed into a single "pending" call.  H can be examined to
see if it has pending calls with H.pending().  A call to H.now() will execute F() and remove the pending state.  A call to H.cancel() will remove the pending state without executing F().

Parameters passed to H.now() are forwarded to F().

#### collapse(num)

Collapses all calls to the modified function info a single call that is exected `num` milliseconds after the first call to the modified function.

	var F = function() { ... };
	var H = F.collapse(1500);

All calls to H will be collapsed into a single "pending" call.  The pending call will be executed 1500 milliseconds after the first H() call.  After execution the pending state is cleared and waiting for the next call to H().  Execution can be stopped with H.cancel() or forced with H.now().  H.pending() will return true if execution is pending.

Only the last parameters passed to H() are passed to F() unless H.now() is used, in which case the parameters of H.now() are passed to F().

## Testing

You can, if you want, run test.js in node `node test.js` to verify that fod.js is working.

## Feedback

Please let me know if you like or are using this, or even if you dislike it or have any ideas.  @areinet 
