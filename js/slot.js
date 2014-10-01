/**
 * JQblackjack - Slot Class
 * slot.js
 * (c) 2010, Jimbo Quijano
 */

var Slot = Class.extend({

    // Initialize
    init: function(options) {
        var that = this;

        // Default settings
        var defaults = {
            status: null,
            animate: true,
            cascade: false,
            browse_depth: 0,
            cascade_distance: 20,
            anim_interval: 150,
            anim_speed: 500,
            anim_ease: 20,
            zindex: 1,
            count: 0,
            cards: []
        };

        // Construct settings
        var settings = $.extend({}, defaults, options);
        $.each(settings, function(index, value) {
            that[index] = value;
        });
    },

    // Pick card from slot
    pickCard: function(count, remove) {
        var that = this;

        // Default remove to true
        if (remove == undefined) {
            remove = true;
        }

        // Randomize
        if (count == undefined) {
            var count = Math.floor((Math.random() * that.cards.length));
        }

        // Get card
        var card = that.cards[count];

        // Remove card
        if (remove == true) {
            that.removeCard(count);
        }

        // Return card
        return card;
    },

    // Add card to slot
    addCard: function(card) {
        var that = this;

        // Push to slot
        that.cards.push(card);
        card.index = that.cards.length;

        // Return card
        return that;
    },

    // Add cards to slot
    addCards: function(cards, callback, count) {
        var that = this;

        // Default count to 0
        if (count == undefined) {
            count = 0;
        }

        // Iterate each card
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            card.count = count;

            // Move cards with callback
            if (i == cards.length - 1) {
                card.last = true;
                var cb = callback;
            } else {
                card.last = false;
                var cb = function(){};
            }

            // Move card
            that.count = count;
            card.move(that, cb);

            // Add card to slot
            that.addCard(card);

            // Increment
            count++;
        };

        // Return count
        return count;
    },

    // Remove card from slot
    removeCard: function(rand) {
        var that = this;

        // Remove card from slot
        that.cards.splice(rand, 1);

        // Return card
        return that;
    },

    // Shuffle cards
    shuffle: function() {
        var that = this;
        var cur_index = that.cards.length, temp_value, rand_index ;

        // While there remain elements to shuffle
        while (0 !== cur_index) {

            // Pick a remaining element
            rand_index = Math.floor(Math.random() * cur_index);
            cur_index -= 1;

            // And swap it with the current element
            temp_value = that.cards[cur_index];
            that.cards[cur_index] = that.cards[rand_index];
            that.cards[rand_index] = temp_value;

            // Update zindex
            that.cards[cur_index].el.css({
                zIndex: cur_index * -1
            });
        }
    },

    // Stop slot activity
    sleep: function(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    }
});