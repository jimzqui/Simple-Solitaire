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
    place: function(opt) {
        var that = this;

        // Display card
        var pos = opt.slot.settings.el.offset();
        if (opt.face != undefined) { that.flip(opt.face, 0); }
        that.el.css({
            position: 'absolute',
            left: pos.left + 2,
            top: pos.top + 2
        });

        // Callback
        if (opt.callback) opt.callback();

        // Return card
        return that;
    },

    // Move card to another slot
    move: function(opt) {
        var that = this;

        // Set timeout
        var fast1 = opt.count * opt.basespeed;
        var fast2 = opt.slot.cards.length * opt.basespeed;
        var timeout = fast1 + fast2;
        var speed = 500;

        if (opt.slot.settings.cascade == true) {
            var adjust_top = opt.slot.cards.length * 20;
        } else {
            var adjust_top = 0;
        }

        // Animate card
        var pos = opt.slot.settings.el.offset();
        setTimeout(function() {
            that.el.css({
                zIndex: timeout
            });
            that.el.animate({
                position: 'absolute',
                left: pos.left,
                top: pos.top + adjust_top
            }, speed, function() {
                setTimeout(function() {
                    if (opt.face != undefined) { that.flip(opt.face, 100); }
                }, 1000 - speed);

                // Callback
                if (opt.callback) opt.callback(opt.count);
            });
        }, timeout);

        // Return card
        return that;
    },

    // Flip card
    flip: function(face, speed) {
        var that = this;
        var width = that.el.width();
        that.face = face;

        if (face == 'facedown') {
            that.el.animate({
                width: 10,
                height: 96,
                marginLeft: width / 2
            }, speed, function() {
                that.el.animate({
                    width: 71,
                    height: 96,
                    marginLeft: 0
                }, speed, function() {
                    that.el.attr('src', 'cards/facedown.png');
                    that.el.removeClass('faceup');
                    that.el.addClass('facedown');
                });
            });
        } else {
            that.el.animate({
                width: 10,
                height: 96,
                marginLeft: width / 2
            }, speed, function() {
                that.el.animate({
                    width: 71,
                    height: 96,
                    marginLeft: 0
                }, speed, function() {
                    that.el.attr('src', 'cards/' + that.slug + '.png');
                    that.el.removeClass('facedown');
                    that.el.addClass('faceup');
                });
            });
        }

        // Return card
        return that;
    }
});