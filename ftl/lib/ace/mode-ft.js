define("ace/mode/ft_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var FtHighlightRules = function() {

    this.$rules = {
        "start" : [
            {
                token : "comment",
                regex : /#.*$/
            },
            {
                token : "string",
                regex : /\*?\[.*]/,
                push  : "value"
            },
            {
                token : "entity.name.function",
                regex : /(.*=)\s*$/,
            },
            {
                token : "entity.name.function",
                regex : /(.*=)/,
                push  : "value"
            },
            {
                regex : /\|/,
                token : "string",
                push : "value"
            },
            {
                defaultToken: "invalid"
            }
        ],
        "value" : [
            {
                regex : /{/,
                token : "variable",
                push : "placeable"
            },
            {
                regex : /$/,
                token : "string",
                next : "pop"
            },
            {
                defaultToken: "storage"
            }
        ],
        "placeable" : [
            {
                token : "keyword",
                regex : /^\s*\[.*]/,
                push  : "value"
            },
            {
                token : "keyword",
                regex : /^\s*\*?\[.*]/,
                push  : "value"
            },
            {
                regex : /{/,
                token : "variable",
                push : "placeable"
            },
            {
                regex : /}/,
                token : "variable",
                next : "pop"
            },
            {
                defaultToken: "variable"
            }
        ],
    };

    this.normalizeRules();

};

oop.inherits(FtHighlightRules, TextHighlightRules);

exports.FtHighlightRules = FtHighlightRules;
});

define("ace/mode/ft",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/ft_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var FtHighlightRules = require("./ft_highlight_rules").FtHighlightRules;

var Mode = function() {
    this.HighlightRules = FtHighlightRules;
};
oop.inherits(Mode, TextMode);

(function() {
    this.$id = "ace/mode/ft";
}).call(Mode.prototype);

exports.Mode = Mode;
});
