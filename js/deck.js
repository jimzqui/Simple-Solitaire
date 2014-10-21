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
                    top: 0,
                    max: 0
                },
                anim: {
                    interval: 150,
                    speed: 500,
                    ease: 20
                },
                animate: false,
                cards: []
            };

            // Construct settings
            var settings = $.extend({}, defaults, options);

            // Extend parent settings
            that._super(settings);
            return that;
        }
    });

    // Return class
    return Deck;
});