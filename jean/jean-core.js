var fs = require('fs');
var markov = require('markov');

var m = markov(3);
var maxWords = 10;
var maxSentences = 1;
var minSentenceLength = 5;
var maxSentenceLength = 50;
var muted = 0;
var file = __dirname + "/bloggar.txt";
var emojis = [  
    ":joy:",":champagne:",":heart:",":clap:",
    ":cristal:",":sweat_smile:",":retarderad:", ":wink:",":kissing_heart:",
    ":ok_hand:",":smile:",":smirk:", ":money_with_wings:",":heart_eyes:", ":100:", 
];
var extendedEmojis = [
    ":borgen_approves:", ":trump_approves:", ":trump_ok:", ":poop:",
    ":trump_finger:", ":trump_fist:", ":snoop:", ":retarderad:", ":parrot-dealwithit:",
    ":niclaz:", ":harambe:", ":edward:", ":ettkilomjol:",":wine_glass:",":beer:",":bira:"
];
var emojiChance = 0.8;
var minEmoji = 1;
var maxEmoji = 3;


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function balanceParan(s) {
    var numParan = 0, numClosed = 0;
    for (var i = 0; i < s.length; i++) {
        if (s.charAt(i) == "(") {
            numParan++;
        }
        else if (s.charAt(i) == ")") {
            numClosed++;
        }
    }

    var numToClose = numParan-numClosed;

    for (var i = 0; i < numToClose; i++) {
        s += ")";
    }

    return s;
}

function splitAndKeepSeparators(s) {
    s = s.replace(/\.+/g, ".").replace(/\?+/g, "?").replace(/!+/g, "!");
    for (var i = 0; i < s.length; i++) {

        if (s.charAt(i) == ".") {
            s = s.substr(0,i) + "@1@" + s.substr(i);
            i += 3;
        }
        else if (s.charAt(i) == "?") {
            s = s.substr(0,i) + "@2@" + s.substr(i);
            i += 3;
        }
        else if (s.charAt(i) == "!") {
            s = s.substr(0,i) + "@3@" + s.substr(i);
            i += 3;
        }
    }

    var sentences = s.split(/[\.\?!]/);

    for (var i = 0; i < sentences.length; i++) {
        if (sentences[i] && sentences[i].length > 0) {
            sentences[i] = sentences[i].replaceAll("@2@","? ").replaceAll("@3@","! ");
        }
        else {
            sentences.splice(i,1);
            i--;
        }
    }

    return sentences;
}

function format(s) {
    if (!s) return "Ingen aning mannen";
    s = s.replaceAll('"',"").replaceAll("”","").replaceAll("“","").toLowerCase();

    var formated = "";

    var sentences = splitAndKeepSeparators(s);
    sentences.sort(function(a, b){
        return a.length - b.length;
    });
    for (var i = 0; i < sentences.length; i++) {
        if (sentences[i].length < minSentenceLength) {
            sentences.splice(i,1);
            i--;
        }
    }

    if (sentences.length > 1 && Math.random() > 0.5) {
        sentences.splice(0,1);
    }

    var numSentences = randomInt(1, maxSentences);

    for (var i = 0; i < numSentences; i++) {
        if (sentences[i]){
            var sen = sentences[i];

            if (Math.random() < emojiChance) {
                var emoji = emojis[randomInt(0,emojis.length-1)];
                var numEmoji = randomInt(minEmoji,maxEmoji);
                for (var e = 0; e < numEmoji; e++) {
                    sen += emoji;
                }
                sen = sen.replaceAll("@1@"," ");
            }
            else {
                sen = sen.replaceAll("@1@",". ");
            }

            formated += balanceParan(sen.charAt(0).toUpperCase() + sen.substr(1));
        }

    }

    return formated.replace(/ +/g, " ").trim();
}

exports.getResponse = function(msg) {
    msg = msg.replace("jean","").replace("jean-pierre","").replace("jeanpierre","").replace("pierre","").replace("pjär","").trim();

    var words = m.respond(msg);

    var res = words.join(" ");
    return format(res);
}

exports.getEmoji = function(includeExtended) {
    var emojiArray = includeExtended ? extendedEmojis : emojis;
    return emojiArray[randomInt(0,emojiArray.length-1)];
}
exports.getEmojiName = function(includeExtended) {
    var emoji = this.getEmoji(includeExtended);
    return emoji.replaceAll(":","");
}

exports.init = function() {
    return new Promise(function(resolve, reject) {

        for (var i = 0; i < emojis.length; i++) {
            extendedEmojis.push(emojis[i]);
        }

        var s = fs.createReadStream(file);
        m.seed(s, function() {
            console.log("Jean is alive");
            resolve();
        });
    });
}
