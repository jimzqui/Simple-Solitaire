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

            // Offset settings
            var offset = {
                top: 0,
                left: 0
            };

             // Anim settings
            var anim = {
                interval: 150,
                speed: 500,
                ease: 20
            };

            // Default settings
            var defaults = {
                offset: offset,
                anim: anim,
                last: null,
                status: null,
                animate: true,
                zindex: 1,
                cards: []
            };

            // Construct settings
            var settings = $.extend({}, defaults, options);
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Create slot
            that.create();
        },

        // Create slot element
        create: function() {
            var that = this;
            var html = '<div class="slot"><span></span></div>';
            that.el = $(html).appendTo('#solitaire');

            // Style element
            that.el.css({
                position: 'absolute',
                left: that.offset.left,
                top: that.offset.top,
                borderRadius: 5,
                height: 96,
                width: 71
            });

            that.el.find('span').css({
                border: '2px solid #555',
                display: 'none',
                float: 'left',
                borderRadius: 5,
                height: 92,
                width: 67
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

            // Push to slot
            that.cards.push(card);
            card.index = that.cards.length;

            // Return card
            return that;
        },

        // Add cards to slot
        addCards: function(cards, callback) {
            var that = this;

            // Iterate each card
            for (var i = 0; i < cards.length; i++) {
                var card = cards[i];
                card.pos = i;

                // Move cards with callback
                if (i == cards.length - 1) {
                    that.last = card;
                    card.last = true;
                    var cb = callback;
                } else {
                    card.last = false;
                    var cb = function(){};
                }

                // Move card
                card.move(that, cb);

                // Add card to slot
                that.addCard(card);
            };
        },

        // Remove card from slot
        removeCard: function(pos) {
            var that = this;

            // Remove card from slot
            that.cards.splice(pos, 1);

            // Update last pos
            var last_card = that.cards[that.cards.length - 1];
            if (last_card != undefined) {
                last_card.last = true;
                that.last = last_card;
            }

            // Return card
            return that;
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

        // Show/Hide inner
        inner: function(type) {
            var that = this;

            if (type == 'show') {
                that.el.find('span').fadeIn();
            } else {
                that.el.find('span').fadeOut();
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
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute casecade data
        computeCascade: function() {
            var that = this;
            return that.offset;
        }
    });

    // Return class
    return Slot;
});