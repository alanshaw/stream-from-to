var streamft = require("./")
  , test = require("tap").test
  , through = require("through")
  , fs = require("fs")
  , rimraf = require("rimraf")

var tmpDir = __dirname + "/tmp"

function setUp () {
  rimraf.sync(tmpDir)
  fs.mkdirSync(tmpDir)
}

test("path to path", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var ts = through(function (data) {
    writeCount++
    this.queue(data)
  })

  streamft(ts).from.path(__dirname + "/index.js").to.path(tmpDir + "/index.js", function (er) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var input = fs.readFileSync(__dirname + "/index.js", {encoding: "utf8"})
      , output = fs.readFileSync(tmpDir + "/index.js", {encoding: "utf8"})

    t.equal(input, output, "Should have written input to output destination")
    t.end()
  })
})

test("path to path shorthand", function (t) {
  setUp()

  t.plan(3)

  var writeCount = 0

  var ts = through(function (data) {
    writeCount++
    this.queue(data)
  })

  streamft(ts).from(__dirname + "/index.js").to(tmpDir + "/index.js", function (er) {
    t.ifError(er)

    t.ok(writeCount > 0, "Should have passed through the through stream")

    var input = fs.readFileSync(__dirname + "/index.js", {encoding: "utf8"})
      , output = fs.readFileSync(tmpDir + "/index.js", {encoding: "utf8"})

    t.equal(input, output, "Should have written input to output destination")
    t.end()
  })
})