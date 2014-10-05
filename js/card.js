/**
 * JQcards - Card
 * card.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['class'], function(Class) {

    // Create new Card Class
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
            that.img = '<div class="card"><img src="cards/' + that.slug + '.png"><span></span></div>';

            // Setup container
            that.container = $('#solitaire');
            that.container.offset = that.container.offset();

            // Create card
            that.el = $(that.img).appendTo(that.container);
            that.flip('facedown', 0);

            // Check if card is grabbed
            that.el.mousedown(function(e) { 
                if (that.face == 'facedown') return;
                var x = e.pageX - that.offset.left;
                var y = e.pageY - that.offset.top;
                that.grab(x, y);
            })
            .mouseup(function() { 
                if (that.face == 'facedown') return;
                that.return();
            });
        },

        // Move card to slot
        move: function(slot, callback) {
            var that = this;

            // Compute anim data
            var anim = slot.computeAnim();
            var cascade = slot.computeCascade();
            that.offset = cascade;

            // Time card animation
            if (slot.animate == true) {
                that.el.css({
                    zIndex: anim.zindex
                });

                setTimeout(function() {
                    that.el.animate({
                        position: 'absolute',
                        left: cascade.left,
                        top: cascade.top
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
                    left: cascade.left,
                    top: cascade.top
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

            // Default speed to 75
            if (speed == undefined) {
                speed = 75;
            }

            // Get flip image
            if (face == 'facedown') {
                var callback = function() {
                    that.el.find('img').attr('src', 'cards/facedown.png');
                    that.el.removeClass('faceup');
                    that.el.addClass('facedown');
                };
            } else {
                var callback = function() {
                    that.el.find('img').attr('src', 'cards/' + that.slug + '.png');
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
        },

        // Grab card
        grab: function(x, y) {
            var that = this;

            // Add styling to card
            that.el.addClass('grabbed');
            that.el.removeClass('ungrabbed');

            // Move card according to mouse offset
            that.el.mousemove(function(e) {
                that.el.css({
                    left: e.pageX - x,
                    top: e.pageY - y
                });
            });
        },

        // Return to original offset
        return: function(callback) {
            var that = this;

            // Animate to offset
            that.el.animate(that.offset, 'fast', function() {
                if (callback) callback();

                // Add styling to card
                that.el.addClass('ungrabbed');
                that.el.removeClass('grabbed');
            });

            // Unbind grab
            that.el.unbind('mousemove');
        },

        // Check for collision
        collision: function(target1, target2) {
            var that = this;
            var x1 = target1.offset().left;
            var y1 = target1.offset().top;
            var h1 = target1.outerHeight(true);
            var w1 = target1.outerWidth(true);
            var b1 = y1 + h1;
            var r1 = x1 + w1;
            var x2 = target2.offset().left;
            var y2 = target2.offset().top;
            var h2 = target2.outerHeight(true);
            var w2 = target2.outerWidth(true);
            var b2 = y2 + h2;
            var r2 = x2 + w2;

            if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
            return true;
        }
    });

    // Return class
    return Card;
});