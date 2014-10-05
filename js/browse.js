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

            // Move last browsed to left
            if (that.browsed != undefined) {
                for (var i = 0; i < that.browsed.length; i++) {
                    var card = that.browsed[i];
                    card.el.animate({
                        left: that.offset.left
                    });
                };
            }

            // Reset browsed
            that.browsed = [];

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
            var adjust = (that.cards.length % 3) * 20;

            return {
                left: that.offset.left + adjust,
                top: that.offset.top
            };
        }
    });

    // Return class
    return Browse;
});