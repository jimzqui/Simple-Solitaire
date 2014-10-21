/**
 * JQcards - Browse
 * browse.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Browse to Slot
    var Browse = Slot.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                cascade: {
                    left: 20,
                    top: 0,
                    max: 3
                },
                anim: {
                    interval: 0,
                    speed: 200,
                    ease: 0
                },
                animate: true,
                cards: []
            };

            // Construct settings
            var settings = $.extend({}, defaults, options);

            // Extend parent settings
            that._super(settings);
            return that;
        },

        // Events
        events: {
            'dblclick card[last=true]': 'card.checkin',
            'mousedown card[last=true]': 'card.grab',
            'mouseup card[last=true]': 'card.return'
        }
    });

    // Return class
    return Browse;
});