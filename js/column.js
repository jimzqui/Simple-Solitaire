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
                    top: 20
                },
                anim: {
                    interval: 150,
                    speed: 500,
                    ease: 20
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
            'click card face:facedown': 'card.flip',
            'dblclick card last:true': 'card.checkin',
            'mousedown card face:faceup': 'card.grab',
            'mouseup card face:faceup': 'card.return'
        },

        // Check if card is allowed
        validateDrop: function(card) {
            var that = this;

            // If card is king and slot is empty
            if (card.num == 13 && that.cards.length == 0) {
                return true; 
            }

            // Slot's card has matching value but different color
            if (that.last.num - 1 == card.num && that.last.color != card.color) {
                return true;
            } else {
                return false;
            }
        }
    });

    // Return class
    return Column;
});