/**
 * JQcards - Canvas
 * canvas.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['class'], function(Class) {

    // Create new Canvas Class
    var Canvas = Class.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                width: 677,
                height: 550,
                checkins: [],
                collisions: [],
                suits: ['Spades', 'Hearts', 'Clubs', 'Diamonds'],
                names: ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King']
            };

            // Construct final settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Create canvas
            that._create();
            return;
        },

        // Place cards to slots
        render: function(slots, callback, i) {
            var that = this;

            // Default i to 0
            if (i == undefined) {
                i = 0;
            }

            // Get cards
            var slot = slots[i];
            var cards = that.deck.pickCards(slot.pickcount);

            // Place cards to slot
            slot.addCards(cards, function() {
                if (i == slots.length - 1) {
                    if (callback) callback();
                } else {
                    that.render(slots, callback, i + 1);
                }
            });
        },

        // Create canvas
        _create: function() {
            var that = this;

            // Create canvas
            var html = '<div id="' + that.el + '"></div>';
            that.el = $(html).appendTo('body');

            // Style canvas
            that.el.css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: that.width,
                height: that.height,
                marginLeft: (that.width / 2) * -1,
                marginTop: (that.height / 2) * -1
            });

            // Canvas offset
            that.offset = that.el.offset();
        }
    });

    // Return class
    return Canvas;
});