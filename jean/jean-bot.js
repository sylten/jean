var Botkit = require('botkit');
var schedule = require('node-schedule');
var moment = require('moment');
var jean = require('./jean-core');

var names = ["jean","jean-pierre","jeanpierre","pjär","pierre", "jp"];
var favoriteReactions = ["cristal", "champagne", "100", "joy", "heart_eyes", "retarderad", "money_with_wings", "niclaz", "wine_glass", "kosken", "explorer", "bira", "beer"];
var mainChannel = "general";

var ambientReplyingEnabled = false;
var mentionReplyingEnabled = true;

var l337ingEnabled = true;
var l337Second = 20;
var last1337 = new Date('2018-01-01');

var replyChance = 0;
var reactChance = 0.0025;
var reactFollowChance = 0.05;
var lastMessageTime = new Date().getTime();
var muted = 0;
var muteTime = 36000000;

var controller = Botkit.slackbot();
var superSafeToken = "x_o_x_b_-_5_2_1_8_2_1_6_3_2_0_2_-_L_k_m_1_y_i_E_5_4_O_E_X_x_g_P_D_t_d_m_t_J_B_4_O";
var bot = controller.spawn({
  	token: superSafeToken.replace(new RegExp("_", 'g'), "")
});

bot.startRTM(function(err,bot,payload) {
    if (err) {
        throw new Error('Jean-Pierre kan inte komma åt Slack');
    }
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function isNotMuted() {
    if (muted > 0) {
        var time = new Date().getTime();
        if (time - muted > muteTime) {
            muted = 0;
            return true;
        }
        return false;
    }
    else {
        return true;
    }
}

function messageIncludesMuteWord(msg) {
    var lower = msg.toLowerCase();
    return lower.indexOf("chilla") != -1 ||
           lower.indexOf("tyst") != -1 ||
           lower.indexOf("sluta") != -1 ||
           lower.indexOf("käften") != -1;
}

function messageIncludesUnmuteWord(msg) {
    var lower = msg.toLowerCase();
    return lower.indexOf("vakna") != -1 ||
           lower.indexOf("prata") != -1 ||
           lower.indexOf("tagga") != -1;
}

function randomMessage(messages) {
    return messages[randomInt(0, messages.length-1)];
}

function dateDiff(d1, d2) {
  var m = moment(d1);
  var years = m.diff(d2, 'years');
  m.add(-years, 'years');
  var months = m.diff(d2, 'months');
  m.add(-months, 'months');
  var days = m.diff(d2, 'days');

  return {years: years, months: months, days: days};
}

function announceDate(dateInfo, msgBot, msgToReplyTo) {
	if (!dateInfo) return;

	var date1 = new Date();
    var date2 = dateInfo.datetime ? new Date(dateInfo.datetime) : dateInfo.when;

    var diff = dateDiff(date2, date1);
    var line = "Det är "+dateInfo.name;

    if (diff.years > 0 || diff.months > 0 || diff.days > 0) {
    	line += " om";
    }

    if (diff.years > 0) {
    	line += " " + diff.years + " år";
    }
    if (diff.months > 0) {
    	line += " " + diff.months + " månader";
    }
    if (diff.days > 0) {
    	line += " " + diff.days + " dagar";
    }
    line += "!!";

    if (msgBot && msgToReplyTo) {
    	msgBot.reply(msgToReplyTo, line);
    }
    else {
    	bot.say({
    		text: line,
    		channel: mainChannel
    	});
    }
}

exports.init = function() {
	controller.hears(["random"],["direct_message","direct_mention"], function(bot,message) {
	    var tokenized = tokenize(message.text);
	    var min = parseInt(tokenized[1]);
    	var max = parseInt(tokenized[2]);

    	if (isNaN(min) || isNaN(max)) {
    		return bot.reply(message, tokenized[1] + " eller " + tokenized[2] + " är inte nummer");
    	}
    	else {
    		bot.reply(message, ":trumvirvel: :trumvirvel: :trumvirvel:");
    		setTimeout(function() {
    			var num = randomInt(min, max).toString();
    			var numStr = "";
    			for (var i = 0; i < num.length; i++) {
    				if (num[i] == "-") {
    					numStr += ":heavy_minus_sign:";
    				}
    				else {
    					numStr += ":" + num[i] + ":";
    				}
    			}
    			bot.reply(message, numStr);
    		}, 5000);
    	}
	});

	if (ambientReplyingEnabled) {
		controller.on('reaction_added',function(bot, ev) {
			var r = Math.random();
			if (favoriteReactions.indexOf(ev.reaction) != -1 || r < reactFollowChance) {
				bot.api.reactions.add({
		            timestamp: ev.item.ts,
		            channel: ev.item.channel,
		            name: ev.reaction,
		         }, function(err, res) {
		            if (err) {
		               bot.botkit.log('Failed to add emoji reaction :(', err);
		            }
		         });
			}
		});
	}

	// controller.hears(["testjean"],["mention","ambient"], function(bot,message) {
	// 	var cmd = message.text.split(" ")[1];
	    
	// });

	controller.hears(["champagne"],["mention","ambient"], function(bot,message) {
	    bot.reply(message, randomMessage([
	        "https://media.giphy.com/media/iLab0CR7PreJG/giphy.gif"
	    ]));
	});

	controller.hears(["skumpa", "vask"],["mention","ambient"], function(bot,message) {
	    bot.reply(message, "http://gfx.bloggar.aftonbladet-cdn.se/wp-content/blogs.dir/428/files/2016/12/skumpa.gif");
	});

	function pappaBetalar(bot,message) {
		var match = message.match[1];
		bot.reply(message, randomMessage([
			'Det är lungt, pappa betalar',
			'Äh, fick en sprojlans ' + match ? match.replaceAll("?","") : "" + " av farsan igår :champagne:"
		]));
	}

	controller.hears('kostar (.*)', ["mention","ambient"], pappaBetalar);
	controller.hears('kostade (.*)', ["mention","ambient"], pappaBetalar);
	controller.hears('(.*) kostade', ["mention","ambient"], pappaBetalar);
	controller.hears('(.*) kostar', ["mention","ambient"], pappaBetalar);

	controller.hears(["dyrt","gratis","billigt"],["mention","ambient"], function(bot,message) {
	    bot.reply(message, "Pengar är inget problem :smirk:");
	});

	// När någon skriver direkt till jean
	controller.hears([""],["direct_message","direct_mention"], function(bot,message) {
        if (isNotMuted()) {
            if (messageIncludesMuteWord(message.text)) {
                bot.reply(message, randomMessage([
                    "Ok då :cry:"
                ]));
                muted = new Date().getTime();
            }
            else {
                bot.reply(message, jean.getResponse(message.text));
            }
        }
        else if (messageIncludesUnmuteWord(message.text)) {
            bot.reply(message, randomMessage([
                "Jaa!! :kissing_heart: " + jean.getResponse(message.text)
            ]));
            muted = 0;
        }
    });

	if (mentionReplyingEnabled) {
	    // När någon skriver ett av jeans smeknamn
	    controller.hears(names,["mention","ambient"], function(bot,message) {
	        if (isNotMuted()) {
	            if (messageIncludesMuteWord(message.text)) {
	                bot.reply(message, randomMessage([
	                    "Ok då :cry:"
	                ]));
	                muted = new Date().getTime();
	            }
	            else if (messageIncludesUnmuteWord(message.text)) {
	                bot.reply(message, randomMessage([
	                    "Jaa!! :kissing_heart: " + jean.getResponse(message.text)
	                ]));
	                muted = 0;
	            }
	            else {
	                bot.reply(message, jean.getResponse(message.text));
	            }
	        }
	    });
	}

    if (ambientReplyingEnabled) {
	    // När någon skriver utan att jean är inblandad
	    controller.hears([""],["mention","ambient"], function(bot,message) {
	        if (isNotMuted()) {
	            var r = Math.random();
	            var time = new Date().getTime();

	            if (r > 1-reactChance) {
	            	bot.api.reactions.add({
			            timestamp: message.ts,
			            channel: message.channel,
			            name: jean.getEmojiName(true),
			         }, function(err, res) {
			            if (err) {
			               bot.botkit.log('Failed to add emoji reaction :(', err);
			            }
			         });
	            }

	            else if (r < replyChance) {
	                lastMessageTime = time;
	                bot.reply(message, jean.getResponse(message.text));
	            }
	        }
	    });
    }
    
    if (l337ingEnabled) {
        var l337Hour = 13;
        var l337Minute = 37;

        controller.hears([""], ["mention", "ambient"], () => {
            var now = new Date();
            if (now.getHours() == l337Hour && now.getMinutes() == l337Minute) {
                last1337 = now;
            }
        });

        var rule = new schedule.RecurrenceRule();
        rule.hour = l337Hour;
        rule.minute = l337Minute;
        rule.second = l337Second;
    
        var j = schedule.scheduleJob(rule, () => {
            var now = new Date();
            if (isNotSameDay(now, last1337)) {
                bot.say({
                    text: "b",
                    channel: mainChannel
                });
            }
        });
    }

    console.log("Jean joined slack");
}

function isNotSameDay(d1, d2) {
    return d1.getFullYear() != d2.getFullYear() && d1.getMonth() != d2.getMonth() && d1.getDate() != d2.getDate();
}

function tokenize(s) {
	var underscores = "";
	var inQuotes = false;

	s = s.trim();
	for (var i = 0; i < s.length; i++) {
		var c = s[i];
		if (c == '"' || c == "'") {
			inQuotes = !inQuotes;
		}
		else if (inQuotes && c == " ") {
			underscores += "{";
		}
		else {
			underscores += c;
		}
	}

	var tokenized = underscores.split(" ");
	for (var i = 0; i < tokenized.length; i++) {
		tokenized[i] = tokenized[i].toLowerCase().replaceAll("{", " ");
	}

	return tokenized;
}

