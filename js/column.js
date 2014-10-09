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
            that.create();
            return that;
        },

        // Add card to slot
        addCard: function(card) {
            var that = this;

            // Call parent method
            that._super(card);

            // Update height
            that.height = ((that.cards.length - 1) * that.cascade.top) + that.height;

            // Update card status
            card.browsed = false;
        },

        // Remove card from slot
        removeCard: function(pos) {
            var that = this;

            // Call parent method
            that._super(pos);

            // Update height
            that.height = ((that.cards.length - 1) * that.cascade.top) + that.height;
        },

        // Compute anim data
        computeAnim: function() {
            var that = this;

            // Compute data
            var zindex = (that.slotindex + 1) * (that.slotindex + 1) + that.cards.length;
            var interval = that.anim.interval;

            if (that.status == 'placed') {
                var timeout = 0;
                var speed = 100;
            } else {
                var timeout = (that.cards.length * that.anim.ease) * 2;
                var speed = that.anim.speed;
            }

            // Return data
            return {
                zswitch: 0,
                zindex: zindex,
                interval: interval,
                timeout: timeout,
                speed: speed
            }
        },

        // Compute cascade data
        computeCascade: function() {
            var that = this;
            var adjust_left = (that.cards.length - 1) * that.cascade.left;
            var adjust_top = (that.cards.length - 1) * that.cascade.top;

            return {
                left: that.offset.left + adjust_left,
                top: that.offset.top + adjust_top
            };
        }
    });

    // Return class
    return Column;
});