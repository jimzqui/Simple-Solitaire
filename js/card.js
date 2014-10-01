/**
 * JQblackjack - Card Class
 * card.js
 * (c) 2010, Jimbo Quijano
 */

var Card = Class.extend({

    // Initialize
    init: function(options) {
        var that = this;

        // Default settings
        var defaults = {
            value: null,
            suit: null
        };

        // Construct settings
        var settings = $.extend({}, defaults, options);
        $.each(settings, function(index, value) {
            that[index] = value;
        });

        // Card num
        that.num = that.value;

        // Card value
        switch(that.value) {
            case 11: that.value = 10; break;
            case 12: that.value = 10; break;
            case 13: that.value = 10; break;
        }

        // Card value
        switch(that.suit) {
            case 1: that.suit = 'Clubs'; break;
            case 2: that.suit = 'Spades'; break;
            case 3: that.suit = 'Diamonds'; break;
            case 4: that.suit = 'Hearts'; break;
            default: that.suit = 'Clubs';
        }

        // Card name
        switch(that.value) {
            case 1: that.name = 'Ace'; break;
            case 11: that.name = 'Jack'; break;
            case 12: that.name = 'Queen'; break;
            case 13: that.name = 'King'; break;
        }

        // Card slug
        that.slug = this.num + that.suit;

        // Card img
        that.img = '<img src="cards/' + that.slug + '.png">';

        // Create card
        that.el = $(that.img).appendTo('body');
        that.flip('facedown', 0);
    },

    // Compute speed and timeout
    computeAnim: function(slot) {
        var that = this;

        // Compute data
        var zindex = (slot.zindex * 5) + slot.cards.length;
        var ease_a = slot.count * slot.anim_ease;
        var ease_b = slot.cards.length *slot.anim_ease;
        var interval = slot.anim_interval;
        var timeout = ease_a + ease_b;
        var speed = slot.anim_speed;

        // Get slot position
        var pos = slot.el.offset();
        
        // Get cascade adjust
        if (slot.cascade == true) {
            var adjust = slot.cards.length * slot.cascade_distance;
        } else {
            var adjust = 0;
        }

        // Return data
        return {
            zindex: zindex,
            interval: interval,
            timeout: timeout,
            adjust: adjust,
            speed: speed,
            pos: pos
        }
    },

    // Move card to slot
    move: function(slot, callback) {
        var that = this;

        // Compute anim data
        var anim = that.computeAnim(slot);

        // Time card animation
        if (slot.animate == true) {
            that.el.css({
                zIndex: anim.zindex
            });

            setTimeout(function() {
                that.el.animate({
                    position: 'absolute',
                    left: anim.pos.left,
                    top: anim.pos.top + anim.adjust
                }, anim.speed);
            }, anim.timeout);

            // Callback
            if (that.last == true) {
                setTimeout(function() {
                    if(callback) callback(that);
                }, anim.timeout + anim.interval);
            }
        }

        // Place card
        else {
            that.el.css({
                position: 'absolute',
                zIndex: anim.zindex,
                left: anim.pos.left,
                top: anim.pos.top + anim.adjust
            });

            // Callback
            if (that.last == true) {
                if(callback) callback(that);
            }
        }

        // Return card
        return that;
    },

    // Flip card
    flip: function(face, speed) {
        var that = this;
        var width = that.el.width();
        that.face = face;

        // Default speed to 100
        if (speed == undefined) {
            speed = 100;
        }

        // Get flip image
        if (face == 'facedown') {
            var callback = function() {
                that.el.attr('src', 'cards/facedown.png');
                that.el.removeClass('faceup');
                that.el.addClass('facedown');
            };
        } else {
            var callback = function() {
                that.el.attr('src', 'cards/' + that.slug + '.png');
                that.el.removeClass('facedown');
                that.el.addClass('faceup');
            };
        }

        // Flip animation
        that.el.animate({
            width: 10,
            height: 96,
            marginLeft: width / 2
        }, speed,  function() {
            that.el.animate({
                width: 71,
                height: 96,
                marginLeft: 0
            }, speed, function() {
                if(callback) callback();
            });
        });

        // Return card
        return that;
    }
});