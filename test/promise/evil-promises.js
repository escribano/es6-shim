"use strict";
require('../../'); // import Promise from es6-shim

var assert = require("assert");

describe("Evil promises should not be able to break invariants", function () {
  specify("resolving to a promise that calls onFulfilled twice", function (done) {
    // note that we have to create a trivial subclass, as otherwise the
    // Promise.resolve(evilPromise) is just the identity function.
    var EvilPromise = function(executor) { Promise.call(this, executor); };
    if (!EvilPromise.__proto__) { return; } // skip test if on IE < 11
    EvilPromise.__proto__ = Promise; // mutable __proto__ is in es6.
    EvilPromise.prototype = Object.create(Promise.prototype);
    EvilPromise.prototype.constructor = EvilPromise;

    var evilPromise = EvilPromise.resolve();
    evilPromise.then = function (f) {
      f(1);
      f(2);
    };

    var calledAlready = false;
    Promise.resolve(evilPromise).then(function (value) {
      assert.strictEqual(calledAlready, false);
      calledAlready = true;
      assert.strictEqual(value, 1);
    }).then(done, done);
  });
});
