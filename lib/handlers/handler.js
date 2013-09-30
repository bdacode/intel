/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const util = require('util');

const Q = require('q');

const Formatter = require('../formatter');
const Filterer = require('../filterer');
const LEVELS = require('../levels');

const _defaultFormatter = new Formatter();

function Handler(options) {
  if (typeof options !== 'object') {
    options = { level: options };
  }
  var level = options.level;
  this.setLevel((level !== undefined) ? LEVELS.getLevel(level) : LEVELS.NOTSET);
  this.setFormatter(options.formatter);
  Filterer.call(this, options);
}
util.inherits(Handler, Filterer);

var proto = {

  level: null,

  _formatter: null,

  handle: function(record) {
    if (!this.filter(record)) {
      return Q.resolve();
    }
    if (this.emit.length < 2) {
      throw new Error('Handler.emit requires a callback argument');
    }
    return Q.ninvoke(this, 'emit', record);
  },

  // sub-classes should override emit, not handle
  emit: function emit(/*record, callback*/) {
    throw new Error('Handler.emit must be implemented by sub-classes');
  },

  format: function format(record) {
    var formatter = this._formatter || _defaultFormatter;
    return formatter.format(record);
  },

  setFormatter: function setFormatter(formatter) {
    this._formatter = formatter;
    return this;
  },

  setLevel: function setLevel(level) {
    this.level = LEVELS.getLevel(level);
    return this;
  }

};

for (var key in proto) {
  if (proto.hasOwnProperty(key)) {
    Handler.prototype[key] = proto[key];
  }
}

module.exports = Handler;