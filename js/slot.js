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
                var card = that.cards[Math.floor((Math.random() * that.cardCount()))];
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
                var length = that.cardCount() - 1;
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
                    } else {
                        card.flip(0.15);
                    }
                };

                // Set to unbrowse
                that.browsing = false;
            });
        },

        // The reverse of browse
        unbrowseCards: function() {
            var that = this;

            // If still animating, return
            if (that.unbrowsing == true) return;
            that.unbrowsing = true;

            // Set animate to true
            that.animate = true;

            // Compute browe size
            var browse_size = that.cardCount() % that.browse_size;
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
            that.addCards(cards, function() {

                // Set to unbrowse
                that.unbrowsing = false;
            });
        },

        // Reset browesed cards
        resetBrowsed: function() {
            var that = this;

            // Set animate to true
            that.animate = true;

            // Pick cards from slot
            var cards = that.browse_to.getCards(that.browse_to.cardCount(), true);

            // Flip cards and uncascade
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.el.css({ left: that.browse_to.offset.left });
                card.flip(0.15);
            };

            // Register move
            that.canvas.registerMove({
                action: 'resetCards',
                type: 'cards',
                actor: cards,
                origin: cards[0].slot
            });

            // Place cards to stack
            that.addCards(cards);
        },

        // Unbind all events
        unbind: function() {
            var that = this;

            // Unbind slot
            that.el.off();

            // Iterate each cards and unbind event
            for (var i = 0; i < that.cardCount(); i++) {
                var card = that.cards[i];
                card.el.off();
            };
        },

        // Get card count
        cardCount: function() {
            var that = this;
            return that.cards.length;
        },

        // Add card to slot
        _addCard: function(card, callback) {
            var that = this;

            // Unbind all
            card.el.off();

            // Update card info
            card.index = that.cardCount();
            card.slot = that;
            card.last = true;
            that.last = card;

            // Update last card
            var lastcard = that.cards[that.cardCount() - 1];
            if (lastcard != undefined) {
                lastcard.last = false;
            }

            // Push to slot
            that.cards.push(card);

            // Update height
            that.height = ((that.cardCount() - 1) * that.cascade.top) + that.height;

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
            for (var i = card.index; i < that.cardCount(); i++) {
                var next_card = that.cards[i + 1];
                if (next_card != undefined) {
                    next_card.index -= 1;
                }
            };

            // Remove card from slot
            that.cards.splice(card.index, 1);

            // Update last position
            var last_card = that.cards[that.cardCount() - 1];
            if (last_card != undefined) {
                last_card.last = true;
                that.last = last_card;
            }

            // Update height
            that.height = ((that.cardCount() - 1) * that.cascade.top) + that.height;
        },

        // Cascade cards to max
        _maxCascade: function(callback) {
            var that = this;

            // Return if max cascade is not set
            if (that.cascade.max == 0) return

            // Get card length
            if (that.cardCount() > that.cascade.max) {
                var count = that.cascade.max;
                var length = that.cascade.max;
            } else {
                var count = that.cardCount();
                var length = that.cardCount();
            }

            // Recascade browse cards
            for (var i = 0; i < length; i++) {
                count--;
                var card = that.cards[that.cardCount() - 1 - i];
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
            for (var i = that.cardCount() - 1; i >= 0; i--) {
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

        _applySwitch: function(card, condition) {
            var that = this;

            // If drop is not setup for this slot
            if (condition == undefined) return false;

            // Default result to false
            var result = false;

            // Check for suit conditions
            switch(condition.suit) {
                case 'same':

                    // Check order conditions
                    switch(condition.order) {
                        case 'asc': 
                            if (card.num - 1 == that.cardCount() && card.suit == that.last.suit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                        default:
                            if (card.num == 13 && that.cardCount() == 0) {
                                result = true;
                            } else if (that.last.num - 1 == card.num && card.suit == that.last.suit) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                    }
                break;
                case 'checkin':

                    // Check order conditions
                    switch(condition.order) {
                        case 'asc': 
                            if (card.num - 1 == that.cardCount() && card.suit == that.checkin) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                        default:
                            if (card.num == 13 && that.cardCount() == 0) {
                                result = true;
                            } else if (that.last.num - 1 == card.num && card.suit == that.checkin) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                    }
                break;
                default:

                    // Check order conditions
                    switch(condition.order) {
                        case 'asc': 
                            if (card.num - 1 == that.cardCount() && card.suit == that.checkin) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                        default:
                            if (card.num == 13 && that.cardCount() == 0) {
                                result = true;
                            } else if (that.last.num - 1 == card.num && that.last.color != card.color) {
                                result = true;
                            } else {
                                result = false;
                            }
                        break;
                    }
                break;
            }

            return result;
        },

        // Compute slot positions
        _computeOffset: function() {
            var that = this;
            var dist_left = that.canvas.tile.x_space;
            var dist_top = that.canvas.tile.y_space;

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
            var card = that.cards[that.cardCount() - 1];
            var zindex = that.offset.left + that.cardCount();
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
            var card = that.cards[that.cardCount() - 1];
            var adjust_left = (that.cardCount() - 1) * that.cascade.left;
            var adjust_top = (that.cardCount() - 1) * that.cascade.top;

            if (that.cascade.left > 0 && that.cascade.max > 0 && that.cardCount() > that.cascade.max) {
                var cut = that.batch.length - that.cascade.max;
                adjust_left = (card.batch_count - cut) * that.cascade.left ;
            }

            if (that.cascade.top > 0 && that.cascade.max > 0 && that.cardCount() > that.cascade.max) {
                var cut = that.batch.length - that.cascade.max;
                adjust_top = (card.batch_count - cut) * that.cascade.top ;
            }

            // Compute final offset
            var offset_left = that.offset.left + adjust_left;
            var offset_top = that.offset.top + adjust_top;

            // Make sure cards dont go over the slot offset
            if (offset_left < that.offset.left) offset_left = that.offset.left;
            if (offset_top < that.offset.top) offset_top = that.offset.top;
            
            return {
                left: offset_left,
                top: offset_top
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

            // Set height and width
            that.width = that.canvas.tile.width;
            that.height = that.canvas.tile.height;

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
                backgroundImage: 'url(' + that.canvas.themes_dir + 'slots.png)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '0 0',
                height: that.height,
                width: that.width,
                float: 'left'
            });

            // Render slot events
            that._slotEvents();
        },
    });

    // Return class
    return Slot;
});