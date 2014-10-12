/**
 * JQcards - Deck
 * deck.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Deck to Slot
    var Deck = Slot.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
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
                animate: false,
                width: 71,
                height: 96,
                zindex: 222,
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
        events: {
            'click this': 'restart'
        },

        // Restart game
        restart: function() {
            var that = this;
            that.canvas.restart();
        }
    });

    // Return class
    return Deck;
});