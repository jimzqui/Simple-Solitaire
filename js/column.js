/**
 * JQcards - Column
 * column.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Column to Slot
    var Column = Slot.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                cascade: {
                    left: 0,
                    top: 20,
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
            'click card[face=facedown,last=true]': 'card.open',
            'dblclick card[last=true]': 'card.checkin',
            'mousedown card[face=faceup]': 'card.grab',
            'mouseup card[face=faceup]': 'card.return'
        },

        // Drop condition
        dropCondition: {
            suit: 'alternate',
            order: 'desc'
        }
    });

    // Return class
    return Column;
});