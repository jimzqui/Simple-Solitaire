/**
 * JQcards - Slot
 * stack.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['card', 'class'], function(Card, Class) {

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
                last: null,
                status: null,
                animate: true,
                width: 71,
                height: 96,
                zindex: 0,
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

        // Create cards to slot
        populate: function(suits, names) {
            var that = this;

            // Contruct cards
            for (var i = 0; i < names.length; i++) {
                for (var j = 0; j < suits.length; j++) {

                    // Create new card
                    var card = new Card({
                        canvas: that.canvas,
                        name: names[i],
                        suit: suits[j],
                        zindex: i + j,
                    });

                    // Add card to slot
                    that.addCard(card);
                };
            };
        },

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

            // Render events
            that._cardEvents(card);

            // Update height
            that.height = ((that.cards.length - 1) * that.cascade.top) + that.height;

            // Compute anim data
            var anim = that._computeAnim();
            card.offset = that._computeCascade();
            card.zindex = anim.zindex;

            // Time card animation
            if (that.animate == true) {
                setTimeout(function() {
                    card.el.animate(card.offset, anim.speed);

                    // Switch zindex on animate
                    setTimeout(function() {
                        card.el.css({ zIndex: anim.zindex });
                    }, anim.speed / 2);

                }, anim.timeout);

                // Callback
                setTimeout(function() {
                    if(callback) callback(card);
                }, anim.timeout + anim.interval);
            }

            // Place card
            else {
                card.el.css({ zIndex: anim.zindex });
                card.el.css(card.offset);
                if(callback) callback(card);
            }
        },

        // Add cards to slot
        addCards: function(cards, callback) {
            var that = this;

            // Iterate each card
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.count = i;

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
        },

        // Transfer all cards to diff slot
        transfer: function(slot, callback) {
            var that = this;

            // Retrieve all cards
            var cards = that.pickCards(that.cards.length);

            // Place cards to slot
            slot.addCards(cards, function() {
                if (callback) callback();
            });
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

            // Compute data
            var zindex = that.offset.left + that.cards.length + that.zindex;
            var timeout = (that.cards.length * that.anim.ease) * 2;
            var interval = that.anim.interval;
            var speed = that.anim.speed;

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
            var adjust_left = (that.cards.length - 1) * that.cascade.left;
            var adjust_top = (that.cards.length - 1) * that.cascade.top;

            return {
                left: that.offset.left + adjust_left,
                top: that.offset.top + adjust_top
            };
        },

        // Get any card collision
        _setCollision: function(card, offset) {
            var that = this;

            // Something collided with the card
            if (card._isCollide(that, offset) == true) {

                // Make sure not its own slot
                if (that.name != card.slot.name) {
                    return that.collide = card.slot;
                } 
            }

            that.collide = null;
        },

        // Check for any collision
        _checkCollision: function(card, callback) {
            var that = this;

            // Column collided
            if (that.collide != null) {

                // Card is allowed to switch
                if (card._isAllowed(that) == true) {
                    var cards_active = [];

                    // Iterate each cards
                    for (var i = that.collide.cards.length - 1; i >= card.index; i--) {
                        var card_active = that.collide.pickCard(i);
                        if (card_active.face == 'faceup') {
                            cards_active.push(card_active);
                        }
                    };

                    // Callback after checking
                    if (callback) callback(cards_active.reverse());

                    return true;
                }
            }

            return false;
        },

        // Render card events
        _cardEvents: function(card) {
            var that = this;

            // Unbind events
            card.el.off();

            // Iterate each events
            $.each(that.events, function(index, value) {
                var event = index.split(' ')[0];
                var target = index.split(' ')[1];
                var filter = index.split(' ')[2];
                var action = value;

                // If event is not for card
                if (target != 'card') return;

                // Bind event to card
                card.el.on(event, function(e) {
                    if (filter != undefined){
                        var operand_a = filter.split(':')[0];
                        var operand_b = filter.split(':')[1];
                        if (card[operand_a].toString() != operand_b) return;
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
                var target = index.split(' ')[1];
                var filter = index.split(' ')[2];
                var action = value;

                // If event is not for card
                if (target != 'this') return;

                // Bind event to card
                that.el.css({ cursor: 'pointer' });
                that.el.on(event, function(e) {
                    if (filter != undefined){
                        var operand_a = filter.split(':')[0];
                        var operand_b = filter.split(':')[1];
                        if (that[operand_a].toString() != operand_b) return;
                    }

                    that[action](e);
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
                width: that.width
            });

            // Style inner
            that.inner.css({
                background: 'url(img/' + that.name + '.png) no-repeat scroll',
                backgroundPosition: 'center center',
                backgroundSize: 50,
                border: '2px solid #555',
                display: 'none',
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