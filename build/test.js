"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tape_1 = __importDefault(require("tape"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mktemp_1 = require("mktemp");
const _1 = require("./");
function repeat(string, times) {
    return new Array(times + 1).join(string);
}
var REPLACEMENT_OPTS = {
    replacement: "_"
};
tape_1.default("valid names", function (t) {
    ["the quick brown fox jumped over the lazy dog.mp3", "résumé"].forEach(function (name) {
        t.equal(_1.sanitize(name), name);
    });
    t.end();
});
tape_1.default("valid names", function (t) {
    ["valid name.mp3", "résumé"].forEach(function (name) {
        t.equal(_1.sanitize(name, REPLACEMENT_OPTS), name);
    });
    t.end();
});
tape_1.default("null character", function (t) {
    t.equal(_1.sanitize("hello\u0000world"), "helloworld");
    t.end();
});
tape_1.default("null character", function (t) {
    t.equal(_1.sanitize("hello\u0000world", REPLACEMENT_OPTS), "hello_world");
    t.end();
});
tape_1.default("control characters", function (t) {
    t.equal(_1.sanitize("hello\nworld"), "helloworld");
    t.end();
});
tape_1.default("control characters", function (t) {
    t.equal(_1.sanitize("hello\nworld", REPLACEMENT_OPTS), "hello_world");
    t.end();
});
tape_1.default("restricted codes", function (t) {
    ["h?w", "h/w", "h*w"].forEach(function (name) {
        t.equal(_1.sanitize(name), "hw");
    });
    t.end();
});
tape_1.default("restricted codes", function (t) {
    ["h?w", "h/w", "h*w"].forEach(function (name) {
        t.equal(_1.sanitize(name, REPLACEMENT_OPTS), "h_w");
    });
    t.end();
});
// https://msdn.microsoft.com/en-us/library/aa365247(v=vs.85).aspx
tape_1.default("restricted suffixes", function (t) {
    ["mr.", "mr..", "mr ", "mr  "].forEach(function (name) {
        t.equal(_1.sanitize(name), "mr");
    });
    t.end();
});
tape_1.default("relative paths", function (t) {
    [".", "..", "./", "../", "/..", "/../", "*.|."].forEach(function (name) {
        t.equal(_1.sanitize(name), "");
    });
    t.end();
});
tape_1.default("relative path with replacement", function (t) {
    t.equal(_1.sanitize("..", REPLACEMENT_OPTS), "_");
    t.end();
});
tape_1.default("reserved filename in Windows", function (t) {
    t.equal(_1.sanitize("con"), "");
    t.equal(_1.sanitize("COM1"), "");
    t.equal(_1.sanitize("PRN."), "");
    t.equal(_1.sanitize("aux.txt"), "");
    t.equal(_1.sanitize("LPT9.asdfasdf"), "");
    t.equal(_1.sanitize("LPT10.txt"), "LPT10.txt");
    t.end();
});
tape_1.default("reserved filename in Windows with replacement", function (t) {
    t.equal(_1.sanitize("con", REPLACEMENT_OPTS), "_");
    t.equal(_1.sanitize("COM1", REPLACEMENT_OPTS), "_");
    t.equal(_1.sanitize("PRN.", REPLACEMENT_OPTS), "_");
    t.equal(_1.sanitize("aux.txt", REPLACEMENT_OPTS), "_");
    t.equal(_1.sanitize("LPT9.asdfasdf", REPLACEMENT_OPTS), "_");
    t.equal(_1.sanitize("LPT10.txt", REPLACEMENT_OPTS), "LPT10.txt");
    t.end();
});
tape_1.default("invalid replacement", function (t) {
    t.equal(_1.sanitize(".", { replacement: "." }), "");
    t.equal(_1.sanitize("foo?.txt", { replacement: ">" }), "foo.txt");
    t.equal(_1.sanitize("con.txt", { replacement: "aux" }), "");
    t.equal(_1.sanitize("valid.txt", { replacement: '/:*?"<>|' }), "valid.txt");
    t.end();
});
tape_1.default("255 characters max", function (t) {
    var string = repeat("a", 300);
    t.ok(string.length > 255);
    t.ok(_1.sanitize(string).length <= 255);
    t.end();
});
// Test the handling of non-BMP chars in UTF-8
//
tape_1.default("non-bmp SADDLES the limit", function (t) {
    var str25x = repeat("a", 252), name = str25x + "\uD800\uDC00";
    t.equal(_1.sanitize(name), str25x);
    t.end();
});
tape_1.default("non-bmp JUST WITHIN the limit", function (t) {
    var str25x = repeat("a", 251), name = str25x + "\uD800\uDC00";
    t.equal(_1.sanitize(name), name);
    t.end();
});
tape_1.default("non-bmp JUST OUTSIDE the limit", function (t) {
    var str25x = repeat("a", 253), name = str25x + "\uD800\uDC00";
    t.equal(_1.sanitize(name), str25x);
    t.end();
});
function testStringUsingFS(str, t) {
    var sanitized = _1.sanitize(str) || "default";
    var filepath = path_1.default.join(tempdir, sanitized);
    // Should not contain any directories or relative paths
    t.equal(path_1.default.dirname(path_1.default.resolve("/abs/path", sanitized)), path_1.default.resolve("/abs/path"));
    // Should be max 255 bytes
    t.assert(Buffer.byteLength(sanitized) <= 255, "max 255 bytes");
    // Should write and read file to disk
    t.equal(path_1.default.dirname(path_1.default.normalize(filepath)), tempdir);
    fs_1.default.writeFile(filepath, "foobar", function (err) {
        t.ifError(err, "no error writing file");
        fs_1.default.readFile(filepath, function (err, data) {
            t.ifError(err, "no error reading file");
            t.equal(data.toString(), "foobar", "file contents equals");
            fs_1.default.unlink(filepath, function (err) {
                t.ifError(err, "no error unlinking file");
                t.end();
            });
        });
    });
}
// ## Filesystem Tests
//
// Test writing files to the local filesystem.
//
var tempdir = mktemp_1.createDirSync("sanitize-filename-test-XXXXXX");
try {
    var blns = require("big-list-of-naughty-strings/blns.json");
}
catch (err) {
    console.error("Error: Cannot load file 'big-list-of-naughty-strings/blns.json'");
    console.error("Make sure you've initialized git submodules by running");
    process.exit(1);
}
[]
    .concat([
    repeat("a", 300),
    "the quick brown fox jumped over the lazy dog",
    "résumé",
    "hello\u0000world",
    "hello\nworld",
    "semi;colon.js",
    ";leading-semi.js",
    "slash\\.js",
    "slash/.js",
    "col:on.js",
    "star*.js",
    "question?.js",
    'quote".js',
    "singlequote'.js",
    "brack<e>ts.js",
    "p|pes.js",
    "plus+.js",
    "'five and six<seven'.js",
    " space at front",
    "space at end ",
    ".period",
    "period.",
    "relative/path/to/some/dir",
    "/abs/path/to/some/dir",
    "~/.\u0000notssh/authorized_keys",
    "",
    "h?w",
    "h/w",
    "h*w",
    ".",
    "..",
    "./",
    "../",
    "/..",
    "/../",
    "*.|.",
    "./",
    "./foobar",
    "../foobar",
    "../../foobar",
    "./././foobar",
    "|*.what",
    "LPT9.asdf"
], blns)
    .forEach(str => {
    tape_1.default(JSON.stringify(str), t => testStringUsingFS(str, t));
});
tape_1.default("remove temp directory", t => {
    fs_1.default.rmdir(tempdir, err => {
        t.ifError(err);
        t.end();
    });
});
//# sourceMappingURL=test.js.map