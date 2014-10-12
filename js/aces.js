/**
 * JQcards - Aces
 * aces.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Stack to Slot
    var Aces = Slot.extend({

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
                    speed: 300,
                    ease: 15
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
            that._create();
            return that;
        },

        // Events
        events: {
            'mousedown card face:faceup': 'card.grab',
            'mouseup card face:faceup': 'card.return'
        }
    });

    // Return class
    return Aces;
});