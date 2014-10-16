/**
 * JQcards - Slot
 * stack.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['class'], function(Class) {

    // Create new Slot Class
    var Slot = Class.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                position: {
                    left: 0,
                    top: 0
                },
                cascade: {
                    left: 0,
                    top: 0
                },
                anim: {
                    interval: 150,
                    speed: 500,
                    ease: 20
                },
                animate: true,
                width: 71,
                height: 96,
                cards: []
            };

            // Construct settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Create slot
            that._create();
            return that;
        },

        // Events
        events: {},

        // Pick card from slot
        pickCard: function(pos, remove) {
            var that = this;

            // Randomize
            if (pos == undefined) {
                var pos = Math.floor((Math.random() * that.cards.length));
            }

            // Get card from slot
            var card = that.cards[pos];

            // Remove card
            that.removeCard(pos);

            // Return card
            return card;
        },

        // Pick cards from slot
        pickCards: function(size) {
            var that = this;

            // Create container
            var slot_cards = [];

            // Pick cards depending on size
            for (var i = 1; i <= size; i++) {

                // Get random card from slot
                var card = that.pickCard();

                // Add card to container
                slot_cards.push(card);
            };

            // Return cards
            return slot_cards;
        },

        // Add card to slot
        addCard: function(card, callback) {
            var that = this;

            // Unbind all
            card.el.off();

            // Add meta data
            card.index = that.cards.length;
            card.slot = that;
            card.last = true;
            that.last = card;

            // Update last card
            var lastcard = that.cards[that.cards.length - 1];
            if (lastcard != undefined) {
                lastcard.last = false;
            }

            // Push to slot
            that.cards.push(card);

            // Update height
            that.height = ((that.cards.length - 1) * that.cascade.top) + that.height;

            // Move card to slot
            card.move(that, callback);
        },

        // Add cards to slot
        addCards: function(cards, callback) {
            var that = this;

            // Iterate each card
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.batch_count = i;

                // Move card to slot
                (function(i, card, callback) {
                    if (i == cards.length - 1) {
                        that.addCard(card, callback);
                    } else {
                        that.addCard(card);
                    }
                })(i, card, callback);
            };
        },

        // Remove card from slot
        removeCard: function(pos) {
            var that = this;

            // Unbind events of this card
            var card = that.cards[pos];
            if (card != undefined) {
                card.el.off();
            }

            // Update card indexes
            for (var i = pos; i < that.cards.length; i++) {
                var next_card = that.cards[i + 1];
                if (next_card != undefined) {
                    next_card.index -= 1;
                }
            };

            // Remove card from slot
            that.cards.splice(pos, 1);

            // Update last pos
            var last_card = that.cards[that.cards.length - 1];
            if (last_card != undefined) {
                last_card.last = true;
                that.last = last_card;
            }

            // Update height
            that.height = ((that.cards.length - 1) * that.cascade.top) + that.height;

            // If slot is browse
            if (that.browse_from != undefined && that.reset == undefined) {
                that.cascadeBrowsed();
            }
        },

        // Open or flip cards
        browseCards: function() {
            var that = this;

            // If still animating, return
            if (that.browsing == true) return;
            that.browsing = true;

            // Uncascade cards
            that.browse_to.uncascadeBrowsed();
            var browsed = [];

            // Pick cards based on browse size
            for (var i = 0; i < that.browse_to.browse_size; i++) {
                var card = that.pickCard(that.cards.length - 1);
                
                // Add card to container
                if (card != undefined) {
                    browsed.push(card);
                }
            };

            // Register move
            that.canvas.registerMove({
                action: 'browseCards',
                type: 'cards',
                actor: browsed,
                origin: browsed[0].slot
            });

            // Place cards to browse
            that.browse_to.addCards(browsed, function() {

                // Flip browsed cards
                for (var i = 0; i < browsed.length; i++) {
                    var card = browsed[i];

                    if (i == browsed.length - 1) {
                        card.flip(function() {
                            that.browsing = false;
                        });
                    } else {
                        card.flip();
                    }
                };
            });
        },

        // The reverse of browse
        unbrowseCards: function() {
            var that = this;

            // Change anim
            that.anim.speed = 200;
            that.anim.interval = 0;
            that.anim.ease = 0;

            // Create container
            var cards = [];

            // Compute browe size
            var browse_size = that.cards.length % that.browse_size;
            if (browse_size == 0) { browse_size = that.browse_size; }

            // Get last browse cards
            for (var i = 0; i < that.browse_to.browse_size; i++) {
                var card = that.browse_to.pickCard(that.browse_to.cards.length - 1);
                if (card != undefined) {
                    card.el.css({ left: that.browse_to.offset.left });
                    card.flip(0);
                    cards.push(card);
                }
            }

            // Place cards to stack
            that.addCards(cards, function() {
                that.anim.speed = 500;
                that.anim.interval = 150;
                that.anim.ease = 20;
            });
        },

        // Reset browesed cards
        resetBrowsed: function() {
            var that = this;

            // Change anim
            that.anim.speed = 200;
            that.anim.interval = 0;
            that.anim.ease = 0;

            // Create container
            var cards = [];
            that.browse_to.reset = true;

            // Iterate all browsed cards
            for (var i = that.browse_to.cards.length - 1; i >= 0; i--) {
                var card = that.browse_to.pickCard(i);
                (function(card) {
                    card.el.css({ left: that.browse_to.offset.left });
                    cards.push(card);
                    card.flip(0);
                })(card);
            };

            // Place cards to stack
            that.addCards(cards, function() {
                that.anim.speed = 500;
                that.anim.interval = 150;
                that.anim.ease = 20;
                delete that.browse_to.reset;
            });
        },

        // Cascade browsed cards
        cascadeBrowsed: function(callback) {
            var that = this;

            // Return if reseting
            if (that.reset == true) return;

            // Get card length
            if (that.cards.length > that.browse_size) {
                var count = that.browse_size;
                var length = that.browse_size;
            } else {
                var count = that.cards.length;
                var length = that.cards.length;
            }

            // Recascade browse cards
            for (var i = 0; i < length; i++) {
                count--;
                var card = that.cards[that.cards.length - 1 - i];
                var adjust_left = count * that.cascade.left;

                if (i == length - 1) {
                    card.el.animate({
                        left: that.offset.left + adjust_left
                    }, 'fast', callback);
                } else {
                    card.el.animate({
                        left: that.offset.left + adjust_left
                    }, 'fast');
                }
            };
        },

        // Uncascade browsed cards
        uncascadeBrowsed: function(callback) {
            var that = this;
            var count = 0;

            // Compute browe size
            var browse_size = that.cards.length % that.browse_size;
            if (browse_size == 0) { browse_size = that.browse_size; }

            // Move last browsed to left
            for (var i = that.cards.length - 1; i >= that.cards.length - (1 + browse_size); i--) {
                var card = that.cards[i];
                if (card != undefined) {
                    card.offset.left = that.offset.left;

                    // Chek when to send callback
                    if (i == that.cards.length - (1 + browse_size)) {
                        card.el.animate({
                            left: that.offset.left
                        }, 'fast', callback);
                    } else {
                        card.el.animate({
                            left: that.offset.left
                        }, 'fast');
                    }
                }
            };

            // If browse is empty
            if (that.cards.length == 0) {
                if (callback) callback();
            }
        },

        // Shuffle cards
        shuffle: function(callback) {
            var that = this;
            var cur_index = that.cards.length, temp_value, rand_index ;

            // While there remain elements to shuffle
            while (0 !== cur_index) {

                // Pick a remaining element
                rand_index = Math.floor(Math.random() * cur_index);
                cur_index -= 1;

                // And swap it with the current element
                temp_value = that.cards[cur_index];
                that.cards[cur_index] = that.cards[rand_index];
                that.cards[rand_index] = temp_value;

                // Update zindex
                that.cards[cur_index].el.css({
                    zIndex: cur_index * -1
                });
            }

            // Callback after shuffle
            if (callback) callback();
        },

        // Flip all cards facedown
        facedown: function(callback) {
            var that = this;

            // Iterate each card
            for (var i = 0; i < that.cards.length; i++) {
                var card = that.cards[i];
                card.face = 'facedown';
                card.img.attr('src', 'cards/facedown.png');
            };

            // Callback after facedown
            if (callback) callback();
        },

        // Flip all cards facedown
        faceup: function(callback) {
            var that = this;

            // Iterate each card
            for (var i = 0; i < that.cards.length; i++) {
                var card = that.cards[i];
                card.face = 'faceup';
                card.img.attr('src', 'cards/' + card.slug + '.png');
            };

            // Callback after faceup
            if (callback) callback();
        },

        // Unbind all events
        unbind: function() {
            var that = this;

            // Unbind slot
            that.el.off();

            // Iterate each cards and unbind event
            for (var i = 0; i < that.cards.length; i++) {
                var card = that.cards[i];
                card.el.off();
            };
        },

        // Compute slot positions
        _computeOffset: function() {
            var that = this;
            var dist_left = 30;
            var dist_top = 50;

            // Compute data
            var pos_left = (that.position.left * that.width) + (that.position.left * dist_left);
            var pos_top = (that.position.top * that.height) + (that.position.top * dist_top);

            return {
                left: pos_left,
                top: pos_top
            }
        },

        // Compute anim data
        _computeAnim: function() {
            var that = this;

            // If alternate anim is present and slot is rendered
            if (that.altanim != undefined && that.canvas.rendered == true) {
                var anim = that.altanim;
            } else {
                var anim = that.anim;
            }

            // Compute data
            var card = that.cards[that.cards.length - 1];
            var zindex = that.offset.left + that.cards.length;
            var timeout = (card.batch_count * anim.ease) * 2;
            var interval = anim.interval;
            var speed = anim.speed;

            // Return data
            return {
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute cascade data
        _computeCascade: function() {
            var that = this;
            var card = that.cards[that.cards.length - 1];
            var adjust_left = card.batch_count * that.cascade.left;
            var adjust_top = (that.cards.length - 1) * that.cascade.top;
            if (!adjust_left) adjust_left = 0;
            
            return {
                left: that.offset.left + adjust_left,
                top: that.offset.top + adjust_top
            };
        },

        // Render card events
        _cardEvents: function(card) {
            var that = this;

            // Unbind events
            card.el.off();

            // Iterate each events
            $.each(that.events, function(index, value) {
                var event = index.split(' ')[0];
                var elem = index.split(' ')[1];
                var matches = (/\[(.*?)\]/).exec(elem);
                if (matches) var filters = matches[1];
                var target = elem.replace(/\[(.*?)\]/g, '');
                var action = value;

                // If event is not for card
                if (target != 'card') return;

                // Bind event to card
                card.el.on(event, function(e) {
                    if (filters != undefined) {
                        var filters_arr = filters.split(',');
                        for (var i = 0; i < filters_arr.length; i++) {
                            var filter = filters_arr[i];
                            var operand_a = filter.split('=')[0];
                            var operand_b = filter.split('=')[1];
                            if (card[operand_a].toString() != operand_b) return;
                        };
                    }

                    var object = action.split('.')[0];
                    var func = action.split('.')[1];

                    if (func != undefined) {
                        card.e = e;
                        card[func]()
                    } else {
                        that.e = e;
                        that[action](card);
                    }
                });
            });
        },

        // Render slot events
        _slotEvents: function() {
            var that = this;

            // Unbind events
            that.el.off();

            // Iterate each events
            $.each(that.events, function(index, value) {
                var event = index.split(' ')[0];
                var elem = index.split(' ')[1];
                var matches = (/\[(.*?)\]/).exec(elem);
                if (matches) var filters = matches[1];
                var target = elem.replace(/\[(.*?)\]/g, '');
                var action = value;

                // If event is not for card
                if (target != 'this') return;

                // Bind event to slot
                that.el.on(event, function(e) {
                    if (filters != undefined) {
                        var filters_arr = filters.split(',');
                        for (var i = 0; i < filters_arr.length; i++) {
                            var filter = filters_arr[i];
                            var operand_a = filter.split('=')[0];
                            var operand_b = filter.split('=')[1];
                            if (that[operand_a].toString() != operand_b) return;
                        };
                    }

                    that[action]();
                });
            });
        },

        // Create slot element
        _create: function() {
            var that = this;

            // Create slot
            var html = '<div class="slot"><span></span></div>';
            that.el = $(html).appendTo(that.canvas.el);
            that.inner = that.el.find('span');

            // Compute offset
            that.offset = that._computeOffset();

            // Style element
            that.el.css({
                position: 'absolute',
                left: that.offset.left,
                top: that.offset.top,
                height: that.height,
                width: that.width,
                cursor: 'pointer'
            });

            // Style inner
            that.inner.css({
                background: 'url(img/' + that.name + '.png) no-repeat scroll',
                backgroundPosition: 'center center',
                border: '2px solid #555',
                backgroundSize: 50,
                float: 'left',
                opacity: '0.8',
                borderRadius: 5,
                height: that.height - 4,
                width: that.width - 4
            });

            // Render slot events
            that._slotEvents();
        },
    });

    // Return class
    return Slot;
});