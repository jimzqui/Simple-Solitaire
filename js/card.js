/**
 * JQblackjack - Card Class
 * card.js
 * (c) 2010, Jimbo Quijano
 */

var Card = Class.extend({

    // Initialize
    init: function(options) {
        var that = this;

        // Card num
        that.num = options.value;

        // Card value
        switch(options.value) {
            case 11: that.value = 10; break;
            case 12: that.value = 10; break;
            case 13: that.value = 10; break;
            default: that.value = options.value;
        }

        // Card value
        switch(options.suit) {
            case 1: that.suit = 'Clubs'; break;
            case 2: that.suit = 'Spades'; break;
            case 3: that.suit = 'Diamonds'; break;
            case 4: that.suit = 'Hearts'; break;
            default: that.suit = 'Clubs';
        }

        // Card name
        switch(options.value) {
            case 1: that.name = 'Ace'; break;
            case 11: that.name = 'Jack'; break;
            case 12: that.name = 'Queen'; break;
            case 13: that.name = 'King'; break;
            default: that.name = options.value;
        }

        // Card slug
        that.slug = this.num + '-' + that.suit;

        // Card img
        that.img = '<img class="card" src="cards/' + that.slug + '.png" />';

        // Create card
        that.el = $(that.img).appendTo('body');
    },

    // Place card in slot
    place: function(slot, face) {
        var that = this;

        // Update card face
        that.face = face;

        // Display card
        var pos = slot.settings.el.offset();
        that.flip(face);
        that.el.css({
            position: 'absolute',
            left: pos.left + 2,
            top: pos.top + 2
        });

        // Return card
        return that;
    },

    // Move card to another slot
    move: function(slot, face, count) {
        var that = this;

        // Set timeout
        var timeout = count * 25;

        if (slot.settings.cascade == true) {
            var adjust_top = slot.cards.length * 20;
            var z_index = timeout;
        } else {
            var adjust_top = 0;
            var z_index = 0;
        }

        // Animate card
        var pos = slot.settings.el.offset();
        setTimeout(function() {
            that.flip(face);
            that.el.css({
                zIndex: z_index
            });
            that.el.animate({
                position: 'absolute',
                left: pos.left,
                top: pos.top + adjust_top
            }, 'fast');
        }, timeout + 250);

        // Return card
        return that;
    },

    // Flip card
    flip: function(face) {
        var that = this;
        that.face = face;

        if (face == 'facedown') {
            that.el.attr('src', 'cards/facedown.png');
            that.el.removeClass('faceup');
            that.el.addClass('facedown');
        } else {
            that.el.attr('src', 'cards/' + that.slug + '.png');
            that.el.removeClass('facedown');
            that.el.addClass('faceup');
        }

        // Return card
        return that;
    }
});