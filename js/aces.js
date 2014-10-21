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
                    top: 0,
                    max: 0
                },
                anim: {
                    interval: 150,
                    speed: 300,
                    ease: 15
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
            'mousedown card[face=faceup]': 'card.grab',
            'mouseup card[face=faceup]': 'card.return'
        },

        // Checkin condition
        checkinCondition: {
            suit: 'checkin',
            order: 'asc'
        },

        // Drop condition
        dropCondition: {
            suit: 'checkin',
            order: 'asc'
        }
    });

    // Return class
    return Aces;
});