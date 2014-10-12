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
                    top: 0
                },
                anim: {
                    interval: 0,
                    speed: 200,
                    ease: 0
                },
                last: null,
                status: null,
                animate: true,
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
            'dblclick card face:faceup': 'card.checkin',
            'mousedown card last:true': 'card.grab',
            'mouseup card last:true': 'card.return'
        },

        // Uncascade cards
        uncascade: function(callback) {
            var that = this;

            // Compute browe size
            var count = 0;
            var browse_size = that.cards.length % 3;
            if (browse_size == 0) { browse_size = 3; }

            // Move last browsed to left
            for (var i = that.cards.length - 1; i >= that.cards.length - (1 + browse_size); i--) {
                var card = that.cards[i];
                if (card != undefined) {
                    card.offset.left = that.offset.left;

                    // Chek when to send callback
                    if (i == that.cards.length - (1 + browse_size)) {
                        var cb = callback;
                    } else {
                        var cb = function(){};
                    }

                    // Animate to left
                    card.el.animate({
                        left: that.offset.left
                    }, 'fast', cb);
                }
            };

            // If browse is empty
            if (that.cards.length == 0) {
                if (callback) callback();
            }
        },

        // Check for any collision
        _checkCollision: function(card, callback) {
            var that = this;

            // Column collided
            if (that.collide != null) {

                // Card is allowed to switch
                if (card._isAllowed(that.last) == true) {
                    var cards_active = [];

                    // Add only last card
                    cards_active.push(that.collide.pickCard(that.collide.cards.length - 1));

                    // Callback after checking
                    if (callback) callback(cards_active);

                    return true;
                }
            }

            return false;
        },

        // Compute cascade data
        _computeCascade: function() {
            var that = this;
            var card = that.cards[that.cards.length - 1];
            var adjust_left = card.count * that.cascade.left;
            var adjust_top = (that.cards.length - 1) * that.cascade.top;

            return {
                left: that.offset.left + adjust_left,
                top: that.offset.top + adjust_top
            };
        }
    });

    // Return class
    return Browse;
});