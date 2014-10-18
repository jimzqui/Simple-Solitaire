/**
 * JQcards - Stack
 * stack.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Stack to Slot
    var Stack = Slot.extend({

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
                altanim: {
                    interval: 0,
                    speed: 200,
                    ease: 0
                },
                icon: true,
                animate: true,
                width: 71,
                height: 96,
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
            'click card[last=true]': 'browseCards',
            'click this': 'resetBrowsed'
        }
    });

    // Return class
    return Stack;
});