var streamft = require("./")
  , test = require("tap").test
  , through = require("through")
  , fs = require("fs")
  , rimraf = require("rimraf")
  , Buffer = require("buffer").Buffer

var tmpDir = __dirname + "/tmp"

function setUp () {
  rimraf.sync(tmpDir)
  fs.mkdirSync(tmpDir)
}

test("from path to path", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  streamft(createStream).from.path(__dirname + "/index.js").to.path(tmpDir + "/index.js", function (er) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var input = fs.readFileSync(__dirname + "/index.js", {encoding: "utf8"})
      , output = fs.readFileSync(tmpDir + "/index.js", {encoding: "utf8"})

    t.equal(input, output, "Should have written input to output destination")
    t.end()
  })
})

test("from paths to paths", function (t) {
  setUp()

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  var paths = ["/index.js", "/README.md"]
    , srcPaths = paths.map(function (p) { return __dirname + p })
    , destPaths = paths.map(function (p) { return tmpDir + p })

  t.plan(paths.length + 2)

  streamft(createStream).from.paths(srcPaths).to.paths(destPaths, function (er) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    srcPaths.forEach(function (srcPath, i) {
      var input = fs.readFileSync(srcPath, {encoding: "utf8"})
        , output = fs.readFileSync(destPaths[i], {encoding: "utf8"})

      t.equal(input, output, "Should have written input " + i + " to output " + i + " destination")
    })

    t.end()
  })
})

test("from path to path shorthand", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  streamft(createStream).from(__dirname + "/index.js").to(tmpDir + "/index.js", function (er) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var input = fs.readFileSync(__dirname + "/index.js", {encoding: "utf8"})
      , output = fs.readFileSync(tmpDir + "/index.js", {encoding: "utf8"})

    t.equal(input, output, "Should have written input to output destination")
    t.end()
  })
})

test("from path to string", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  streamft(createStream).from.path(__dirname + "/index.js").to.string(function (er, str) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var input = fs.readFileSync(__dirname + "/index.js", {encoding: "utf8"})

    t.equal(input, str, "Should have buffered input as a string")
    t.end()
  })
})

test("from path to string with options", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  streamft(createStream).from.path(__dirname + "/index.js").to.string({encoding: "utf8"}, function (er, str) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var input = fs.readFileSync(__dirname + "/index.js", {encoding: "utf8"})

    t.equal(input, str, "Should have buffered input as a string")
    t.end()
  })
})

test("from path to buffer", function (t) {
  setUp()

  t.plan(4)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  streamft(createStream).from.path(__dirname + "/index.js").to.buffer(function (er, buf) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var input = fs.readFileSync(__dirname + "/index.js")

    t.ok(Buffer.isBuffer(buf), "Buffer should be a buffer")
    t.equal(input.toString("utf8"), buf.toString("utf8"), "Should have buffered input")
    t.end()
  })
})

test("from string to path", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  var input = "Testing 123"

  streamft(createStream).from.string(input).to.path(tmpDir + "/test.txt", function (er) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var output = fs.readFileSync(tmpDir + "/test.txt", {encoding: "utf8"})

    t.equal(input, output, "Should have written input to output destination")
    t.end()
  })
})

test("from string to string", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  var input = "Testing 123"

  streamft(createStream).from.string(input).to.string(function (er, str) {
    t.ifError(er)
    t.ok(writeCount > 0, "Should have passed through the through stream")
    t.equal(input, str, "Should have written input to output destination")
    t.end()
  })
})

test("from string to buffer", function (t) {
  setUp()

  t.plan(4)

  var writeCount = 0

  var createStream = function () {
    return through(function (data) {
      writeCount++
      this.queue(data)
    })
  }

  var input = "Testing 123"

  streamft(createStream).from.string(input).to.buffer(function (er, buf) {
    t.ifError(er)
    t.ok(writeCount > 0, "Should have passed through the through stream")
    t.ok(Buffer.isBuffer(buf), "Buffer should be a buffer")
    t.equal(input, buf.toString("utf8"), "Should have written input to output destination")
    t.end()
  })
})