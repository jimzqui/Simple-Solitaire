/**
 * JQcards - Column
 * column.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Column to Slot
    var Column = Slot.extend({

        // Compute anim data
        computeAnim: function() {
            var that = this;

            // Compute data
            var zindex = (that.zindex * 5) + that.cards.length;
            var timeout = (that.cards.length * that.anim.ease) * 2;
            var interval = that.anim.interval;
            var speed = that.anim.speed;

            // Return data
            return {
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute casecade data
        computeCascade: function() {
            var that = this;
            var adjust = that.cards.length * 20;

            return {
                left: that.offset.left,
                top: that.offset.top + adjust
            };
        }
    });

    // Return class
    return Column;
});