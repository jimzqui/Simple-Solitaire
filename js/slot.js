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
                last: null,
                status: null,
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
            that.create();
            return that;
        },

        // Create slot element
        create: function() {
            var that = this;

            // Create slot
            var html = '<div class="slot"><span></span></div>';
            that.el = $(html).appendTo(that.canvas);
            that.inner = that.el.find('span');

            // Compute offset
            that.offset = that.computeOffset();

            // Style slot
            that.style();
            return that;
        },

        // Add styling to slot
        style: function() {
            var that = this;

            // Style element
            that.el.css({
                position: 'absolute',
                left: that.offset.left,
                top: that.offset.top,
                borderRadius: 5,
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
        },

        // Pick card from slot
        pickCard: function(pos, remove) {
            var that = this;

            // Default remove to true
            if (remove == undefined) {
                remove = true;
            }

            // Randomize
            if (pos == undefined) {
                var pos = Math.floor((Math.random() * that.cards.length));
            }

            // Get card
            var card = that.cards[pos];

            // Remove card
            if (remove == true) {
                that.removeCard(pos);
            }

            // Return card
            return card;
        },

        // Pick cards from slot
        pickCards: function(size) {
            var that = this;

            // Create container
            var slot_cards = [];

            // Pick cards
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
        addCard: function(card) {
            var that = this;

            // Add meta data
            card.index = that.cards.length;
            card.slotindex = that.slotindex;
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
        },

        // Add cards to slot
        addCards: function(cards, callback) {
            var that = this;

            // Iterate each card
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];

                // Add card to slot
                that.addCard(card);

                // Move cards with callback
                if (i == cards.length - 1) {
                    var cb = callback;
                } else {
                    var cb = function(){};
                }

                // Move card
                card.move(that, cb);
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
        shuffle: function() {
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
        },

        // Compute anim data
        computeAnim: function() {
            var that = this;

            // Compute data
            var zindex = that.cards.length;
            var timeout = (that.cards.length * that.anim.ease) * 2;
            var interval = that.anim.interval;
            var speed = that.anim.speed;

            // Return data
            return {
                zswitch: 0,
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute cascade data
        computeCascade: function() {
            var that = this;
            var adjust_left = (that.cards.length - 1) * that.cascade.left;
            var adjust_top = (that.cards.length - 1) * that.cascade.top;

            return {
                left: that.offset.left + adjust_left,
                top: that.offset.top + adjust_top
            };
        },

        // Get any card collision
        setCollision: function(card, offset) {
            var that = this;

            // Something collided with the card
            if (card.isCollide(that, offset) == true) {

                // Make sure not its own slot
                if (that.slotindex != card.slotindex) {
                    return that.collide = card.slot;
                } 
            }

            that.collide = null;
        },

        // Check for any collision
        checkCollision: function(card, callback) {
            var that = this;

            // Column collided
            if (that.collide != null) {

                // Card is allowed to switch
                if (card.isAllowed(that) == true) {
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

        // Compute slot positions
        computeOffset: function() {
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
        }
    });

    // Return class
    return Slot;
});