/**
 * JQcards - Column
 * column.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['slot'], function(Slot) {

    // Extend Column to Slot
    var Column = Slot.extend({

        // Add card to slot
        addCard: function(card) {
            var that = this;

            // Call parent method
            that._super(card);

            // Update height
            that.height = ((that.cards.length - 1) * 20) + that.height;

            // Update card status
            card.browsed = false;
        },

        // Remove card from slot
        removeCard: function(pos) {
            var that = this;

            // Call parent method
            that._super(pos);

            // Update height
            that.height = ((that.cards.length - 1) * 20) + that.height;
        },

        // Compute anim data
        computeAnim: function() {
            var that = this;

            // Compute data
            var zindex = (that.slotindex + 1) * (that.slotindex + 1) + that.cards.length;
            var timeout = (that.cards.length * that.anim.ease) * 2;
            var interval = that.anim.interval;
            var speed = that.anim.speed;

            // Return data
            return {
                zswitch: 0,
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute casecade data
        computeCascade: function() {
            var that = this;
            var adjust = (that.cards.length - 1) * 20;

            return {
                left: that.offset.left,
                top: that.offset.top + adjust
            };
        }
    });

    // Return class
    return Column;
});