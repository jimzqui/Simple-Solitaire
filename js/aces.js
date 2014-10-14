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
            'mousedown card[face=faceup]': 'card.grab',
            'mouseup card[face=faceup]': 'card.return'
        },

        // Check if drop is allowed
        dropAllowed: function(card) {
            var that = this;

            // If card num - 1, is equals to cards total
            if (card.num - 1 == that.cards.length && card.suit == that.checkin) {
                return true;
            } else {
                return false;
            }
        },

        // Check if checkin is allowed
        checkinAllowed: function(card) {
            var that = this;

            // If card num - 1, is equals to cards total
            if (card.num - 1 == that.cards.length && card.suit == that.checkin) {
                return true;
            } else {
                return false;
            }
        }
    });

    // Return class
    return Aces;
});