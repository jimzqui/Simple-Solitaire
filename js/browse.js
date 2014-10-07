/**
 * JQcards - Browse
 * browse.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Browse to Slot
    var Browse = Slot.extend({

        // Uncascade cards
        uncascade: function(callback) {
            var that = this;

            // Compute browe size
            var browse_size = that.cards.length % 3;
            if (browse_size == 0) { browse_size = 3; }

            // Move last browsed to left
            for (var i = that.cards.length - 1; i >= that.cards.length - (1 + browse_size); i--) {
                var card = that.cards[i];
                if (card != undefined) {
                    card.browsed = false;
                    card.el.animate({
                        left: that.offset.left
                    });
                }
            };

            // Follow-up uncascade
            if (callback) callback();
        },

        // Compute anim data
        computeAnim: function() {
            var that = this;

            // Compute data
            var zindex = that.cards.length;
            var timeout = (15 * that.anim.ease) * 2;
            var interval = that.anim.interval;
            var speed = that.anim.speed;

            // Return data
            return {
                zswitch: speed / 2,
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute casecade data
        computeCascade: function() {
            var that = this;

            // Retrieve previous and current card
            var curr_card = that.cards[that.cards.length - 1];
            var prev_card = that.cards[that.cards.length - 2];
            curr_card.browsed = true;

            // Compute left offset
            if (prev_card == undefined) {
                var offset_left = that.offset.left;
            } else {
                if (prev_card.browsed == false) {
                    var offset_left = that.offset.left;
                } else {
                    var offset_left = prev_card.offset.left + 20;
                }
            }

            return {
                left: offset_left,
                top: that.offset.top
            };
        }
    });

    // Return class
    return Browse;
});