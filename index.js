var fs = require("fs")
  , concatStream = require("concat-stream")
  , StringStream = require("string-stream")
  , CombineStream = require("combine-stream")
  , async = require("async")

function createFrom (throughStream) {
  var exports = {}

  exports.from = function fromPath (paths, opts) {
    var outputArray = Array.isArray(paths)
    paths = Array.isArray(paths) ? paths : [paths]

    var srcStreams = paths.map(function (p) {
      return fs.createReadStream(p, opts)
    })

    return createTo(srcStreams, throughStream, outputArray)
  }

  exports.from.path = exports.from
  exports.from.string = function fromString (strings) {
    var outputArray = Array.isArray(strings)
    strings = Array.isArray(strings) ? strings : [strings]

    var srcStreams = strings.map(function (s) {
      return new StringStream(s)
    })

    return createTo(srcStreams, throughStream, outputArray)
  }

  exports.concat = {}
  exports.concat.from = function concatFromPath (paths, opts) {
    paths = Array.isArray(paths) ? paths : [paths]

    var srcStream = new CombineStream(paths.map(function (p) {
      return fs.createReadStream(p, opts)
    }))

    return createTo([srcStream], throughStream, false)
  }

  exports.concat.from.path = exports.concat.from
  exports.concat.from.string = function concatFromString (strings) {
    strings = Array.isArray(strings) ? strings : [strings]
    return createTo([new StringStream(strings.join(""))], throughStream, false)
  }

  return exports
}

function createTo (srcStreams, throughStream, outputArray) {
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

        srcStreams[i].pipe(throughStream).pipe(ws)
      }
    })

    async.parallel(tasks, cb)
  }

  exports.to.path = exports.to
  exports.to.buffer = function toBuffer (cb) {

    var tasks = srcStreams.map(function (ss) {
      return function (cb) {
        ss.pipe(throughStream).pipe(concatStream(function (buf) { cb(null, buf) }))
      }
    })

    async.parallel(tasks, function (er, bufs) {
      if (er) return cb(er)
      cb(null, outputArray ? bufs : bufs[0])
    })
  }
  exports.to.string = function toString (opts, cb) {
    if (!cb) {
      cb = opts
      opts = {}
    }

    exports.to.buffer(function (er, bufs) {
      if (er) return cb(er)

      bufs = Array.isArray(bufs) ? bufs : [bufs]

      var strs = bufs.map(function (buf) {
        return buf.toString(opts.encoding, opts.start, opts.end)
      })

      cb(null, outputArray ? strs : strs[0])
    })
  }

  return exports
}

module.exports = function (throughStream) {
  return createFrom(throughStream)
}