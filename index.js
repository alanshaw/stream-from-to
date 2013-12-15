var fs = require("fs")
  , Stream = require("stream")
  , concatStream = require("concat-stream")
  , CombineStream = require("combine-stream")
  , async = require("async")
  , resumer = require("resumer")
  , Buffer = require("buffer").Buffer

function createFrom (createStream) {
  var exports = {}

  exports.from = function fromPath (paths, opts) {
    var outputArray = Array.isArray(paths)
    paths = Array.isArray(paths) ? paths : [paths]

    var srcStreams = paths.map(function (p) {
      return fs.createReadStream(p, opts)
    })

    return createTo(paths, srcStreams, createStream, outputArray)
  }

  exports.from.path = exports.from
  exports.from.paths = exports.from

  exports.from.string = function fromString (strings) {
    var outputArray = Array.isArray(strings)
    strings = Array.isArray(strings) ? strings : [strings]

    var srcStreams = strings.map(function (s) {
      return resumer().queue(s).end()
    })

    return createTo(strings, srcStreams, createStream, outputArray)
  }

  exports.from.strings = exports.from.string

  exports.concat = {}
  exports.concat.from = function concatFromPath (paths, opts) {
    paths = Array.isArray(paths) ? paths : [paths]

    var srcStream = new CombineStream(paths.map(function (p) {
      return fs.createReadStream(p, opts)
    }))

    return createTo([paths], [srcStream], createStream, false)
  }

  exports.concat.from.path = exports.concat.from
  exports.concat.from.paths = exports.concat.from

  exports.concat.from.string = function concatFromString (strings) {
    strings = Array.isArray(strings) ? strings : [strings]

    var stringStream = resumer().queue(strings.join("")).end()

    return createTo([strings], [stringStream], createStream, false)
  }

  exports.concat.from.strings = exports.concat.from.string

  return exports
}

function createTo (srcs, srcStreams, createStream, outputArray) {
  var exports = {}

  exports.to = function toPath (paths, opts, cb) {
    paths = Array.isArray(paths) ? paths : [paths]

    if (!cb) {
      cb = opts
      opts = {}
    }

    var tasks = paths.map(function (p, i) {
      return function (cb) {
        var ws = fs.createWriteStream(p, opts)

        ws.on("finish", function () {
          cb()
        })

        srcStreams[i].pipe(createStream(srcs[i])).pipe(ws)
      }
    })

    async.parallel(tasks, cb)
  }

  exports.to.path = exports.to
  exports.to.paths = exports.to

  exports.to.buffer = function toBuffer (opts, cb) {
    if (!cb) {
      cb = opts
      opts = {}
    }

    var tasks = srcStreams.map(function (ss, i) {
      return function (cb) {
        ss.pipe(createStream(srcs[i])).pipe(concatStream(function (buf) { cb(null, buf) }))
      }
    })

    async.parallel(tasks, function (er, bufs) {
      if (er) return cb(er)

      bufs = bufs.map(function (b) {
        return Buffer.isBuffer(b) ? b : new Buffer(b, opts.encoding)
      })

      cb(null, outputArray ? bufs : bufs[0])
    })
  }

  exports.to.buffers = exports.to.buffer

  exports.to.string = function toString (opts, cb) {
    if (!cb) {
      cb = opts
      opts = {}
    }

    var tasks = srcStreams.map(function (ss, i) {
      return function (cb) {
        ss.pipe(createStream(srcs[i])).pipe(concatStream(function (str) { cb(null, str) }))
      }
    })

    async.parallel(tasks, function (er, strs) {
      if (er) return cb(er)

      strs = strs.map(function (s) {
        return s.toString(opts.encoding)
      })

      cb(null, outputArray ? strs : strs[0])
    })
  }

  exports.to.strings = exports.to.string

  return exports
}

/**
 * @param {Function} createStream Function that creates and returns a through stream
 */
module.exports = function (createStream) {
  return createFrom(createStream)
}