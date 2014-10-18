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
                    top: 0,
                    max: 0
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

        // Pick random cards from slot
        pickRandom: function(size) {
            var that = this;

            // Create container
            var cards = [];

            // Pick cards depending on size
            for (var i = 1; i <= size; i++) {
                var card = that.cards[Math.floor((Math.random() * that.cards.length))];
                that._removeCard(card);
                cards.push(card);
            };

            // Return cards
            return cards;
        },

        // Add cards to slot
        addCards: function(cards, callback) {
            var that = this;

            // Check if multiple cards
            if (!(cards instanceof Array)) {
                var card = cards;
                var cards = [];
                cards.push(card);
            }

            // Set batch cards
            that.batch = cards;

            // Uncascade cards
            that._maxUncascade();

            // Iterate each card and add
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.batch_count = i;

                // Move card to slot
                (function(i, card, callback) {
                    if (i == cards.length - 1) {
                        that._addCard(card, function() {
                            delete card.batch_count;
                            delete that.batch;
                            if (callback) callback();
                        });
                    } else {
                        that._addCard(card);
                    }
                })(i, card, callback);
            };
        },

        // Remove cards from slot
        removeCards: function(cards) {
            var that = this;

            // Check if multiple cards
            if (!(cards instanceof Array)) {
                var card = cards;
                var cards = [];
                cards.push(card);
            }

            // Iterate each card and remove
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                that._removeCard(card);
            };

            // Cascade cards
            that._maxCascade();
        },

        // Get cards
        getCards: function(size, reverse) {
            var that = this;

            // Default reverse to false
            if (reverse == undefined) {
                reverse = false;
            }

            // Create container
            var cards = [];

            // Pick cards based on size
            if (reverse == true) {
                var length = that.cards.length - 1;
                for (var i = length; i > length - size; i--) {
                    var card = that.cards[i]
                    if (card != undefined) cards.push(card);
                };
            } else {
                for (var i = 0; i < size; i++) {
                    var card = that.cards[i]
                    if (card != undefined) cards.push(card);
                }
            }

            // Remove cards from origin
            that.removeCards(cards);

            // Return cards
            return cards;
        },

        // Open or flip cards
        browseCards: function() {
            var that = this;

            // If still animating, return
            if (that.browsing == true) return;
            that.browsing = true;

            // Pick cards from slot
            var browsed = that.getCards(that.browse_to.browse_size, true);

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
                        card.flip(0.15);
                        that.browsing = false;
                    } else {
                        card.flip(0.15);
                    }
                };
            });
        },

        // The reverse of browse
        unbrowseCards: function() {
            var that = this;

            // Compute browe size
            var browse_size = that.cards.length % that.browse_size;
            if (browse_size == 0) { browse_size = that.browse_size; }

            // Pick cards from slot
            var cards = that.browse_to.getCards(that.browse_to.browse_size, true);

            // Flip cards and uncascade
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.el.css({ left: that.browse_to.offset.left });
                card.flip(0.15);
            };

            // Place cards to stack
            that.addCards(cards);
        },

        // Reset browesed cards
        resetBrowsed: function() {
            var that = this;

            // Pick cards from slot
            var cards = that.browse_to.getCards(that.browse_to.cards.length, true);

            // Flip cards and uncascade
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.el.css({ left: that.browse_to.offset.left });
                card.flip(0.15);
            };

            // Place cards to stack
            that.addCards(cards);
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

        // Add card to slot
        _addCard: function(card, callback) {
            var that = this;

            // Unbind all
            card.el.off();

            // Update card info
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

        // Remove card from slot
        _removeCard: function(card) {
            var that = this;

            // Unbind events of this card
            if (card != undefined) {
                card.el.off();
            }

            // Update card indexes
            for (var i = card.index; i < that.cards.length; i++) {
                var next_card = that.cards[i + 1];
                if (next_card != undefined) {
                    next_card.index -= 1;
                }
            };

            // Remove card from slot
            that.cards.splice(card.index, 1);

            // Update last position
            var last_card = that.cards[that.cards.length - 1];
            if (last_card != undefined) {
                last_card.last = true;
                that.last = last_card;
            }

            // Update height
            that.height = ((that.cards.length - 1) * that.cascade.top) + that.height;
        },

        // Cascade cards to max
        _maxCascade: function(callback) {
            var that = this;

            // Return if max cascade is not set
            if (that.cascade.max == 0) return

            // Get card length
            if (that.cards.length > that.cascade.max) {
                var count = that.cascade.max;
                var length = that.cascade.max;
            } else {
                var count = that.cards.length;
                var length = that.cards.length;
            }

            // Recascade browse cards
            for (var i = 0; i < length; i++) {
                count--;
                var card = that.cards[that.cards.length - 1 - i];
                var adjust_left = count * that.cascade.left;
                var adjust_top = count * that.cascade.top;
                card.offset.left = that.offset.left + adjust_left;
                card.offset.top = that.offset.top + adjust_top;

                if (i == length - 1) {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast', callback);
                } else {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast');
                }
            };
        },

        // Uncascade cards to max
        _maxUncascade: function(callback) {
            var that = this;

            // Return if max cascade is not set
            if (that.cascade.max == 0) return

            // Compute adjustment
            var adjust_left = that.batch.length * that.cascade.left;
            var adjust_top = that.batch.length * that.cascade.top;

            // Uncascade other cards
            for (var i = that.cards.length - 1; i >= 0; i--) {
                var card = that.cards[i];
                card.offset.left = card.offset.left - adjust_left;
                card.offset.top = card.offset.top - adjust_top;

                // Make sure cards dont go over the slot offset
                if (card.offset.left < that.offset.left) card.offset.left = that.offset.left;
                if (card.offset.top < that.offset.top) card.offset.top = that.offset.top;

                if (i == length - 1) {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast', callback);
                } else {
                    card.el.animate({
                        left: card.offset.left,
                        top: card.offset.top
                    }, 'fast');
                }
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
            var adjust_left = (that.cards.length - 1) * that.cascade.left;
            var adjust_top = (that.cards.length - 1) * that.cascade.top;

            if (that.cascade.left && that.cascade.max > 0) {
                var cut = that.batch.length - that.cascade.max;
                adjust_left = (card.batch_count - cut) * that.cascade.left ;
            }

            if (that.cascade.top && that.cascade.max > 0) {
                var cut = that.batch.length - that.cascade.max;
                adjust_top = (card.batch_count - cut) * that.cascade.top ;
            }

            // If data is NaN
            if (!adjust_left) adjust_left = 0;
            if (!adjust_top) adjust_top = 0;
            
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