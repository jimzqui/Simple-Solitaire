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

            // Card suit and color
            switch(that.suit) {
                case 1: that.suit = 'Clubs'; that.color = 'black'; break;
                case 2: that.suit = 'Spades'; that.color = 'black'; break;
                case 3: that.suit = 'Diamonds'; that.color = 'white'; break;
                case 4: that.suit = 'Hearts'; that.color = 'white'; break;
                default: that.suit = 'Clubs'; that.color = 'black';
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

            return that;
        },

        // Create card element
        create: function(canvas) {
            var that = this;
            that.canvas_el = canvas.el;

            // Create card
            var html = '<div class="card"><img src="cards/' + that.slug + '.png"><span></span></div>';
            that.el = $(html).appendTo(canvas.el);
            that.img = that.el.find('img');
            that.flip('facedown', 0);

            // Style element
            that.el.css({
                position: 'absolute',
                height: canvas.settings.card.height,
                width: canvas.settings.card.width,
                cursor: 'pointer'
            });

            // Style card cover
            that.el.find('span').css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                zIndex: 2
            });

            // Style card img
            that.el.find('img').css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                zIndex: 1
            });

            // Setup dimension
            that.width = that.el.width();
            that.height = that.el.height();

            return that;
        },

        // Move card to slot
        move: function(slot, callback) {
            var that = this;

            // Compute anim data
            var anim = slot.computeAnim();
            that.offset = slot.computeCascade();
            that.zindex = anim.zindex;

            // Time card animation
            if (slot.animate == true) {
                setTimeout(function() {
                    that.el.animate(that.offset, anim.speed);

                    // Switch zindex on animate
                    setTimeout(function() {
                        that.el.css({ zIndex: anim.zindex });
                    }, anim.zswitch);

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
                that.el.css({ zIndex: anim.zindex });
                that.el.css(that.offset);

                // Callback
                if (that.last == true) {
                    if(callback) callback(that);
                }
            }
        },

        // Flip card
        flip: function(face, speed) {
            var that = this;

            // Update face
            that.face = face;

            // Default speed to 75
            if (speed == undefined) {
                speed = 75;
            }

            // Get flip image
            if (face == 'facedown') {
                var callback = function() {
                    that.img.attr('src', 'cards/facedown.png');
                    that.el.removeClass('faceup');
                    that.el.addClass('facedown');
                };
            } else {
                var callback = function() {
                    that.img.attr('src', 'cards/' + that.slug + '.png');
                    that.el.removeClass('facedown');
                    that.el.addClass('faceup');
                };
            }

            // Flip animation
            that.el.animate({
                width: 0,
                height: that.height,
                marginLeft: that.width / 2
            }, speed,  function() {
                that.el.animate({
                    width: that.width,
                    height: that.height,
                    marginLeft: 0
                }, speed, function() {
                    if(callback) callback();
                });
            });
        },

        // Grab card
        grab: function(x, y, callback) {
            var that = this;

            // Add styling to card
            that.el.addClass('grabbed');
            that.el.removeClass('ungrabbed');

            // Move card according to mouse offset
            that.canvas_el.mousemove(function(e) {
                var offset = {
                    left: e.pageX - x,
                    top: e.pageY - y
                };

                // Update offset
                that.el.css(offset);

                // Callback afer grab
                if (callback) callback(offset);
            });
        },

        // Return to original offset
        return: function(callback) {
            var that = this;

            // Animate to offset
            that.el.animate(that.offset, 'fast', function() {

                // Callback afer return
                if (callback) callback();

                // Add styling to card
                that.el.addClass('ungrabbed');
                that.el.removeClass('grabbed');
            });

            // Unbind grab
            that.canvas_el.unbind('mousemove');
        },

        // Switch to different
        switch: function(collide, callback) {
            var that = this;

            // Get last card
            var last = collide.slot2.last;
            var cards = [];

            console.log(last);
            console.log(that);

            // If card is allowed to switch column
            if (last.num - 1 == that.num && last.color != that.color) {
                var card = collide.slot1.pickCard(that.pos);
                cards.push(card);

                // Place cards to slot
                collide.slot2.addCards(cards);

                // Callback afer switch
                if (callback) callback();
            } else {

                // Back to position
                that.return(callback);
            }

            // Unbind grab
            that.canvas_el.unbind('mousemove');
        },

        // Check for collision
        isCollide: function(target, offset) {
            var that = this;

            // Compute card data
            var x1 = offset.left;
            var y1 = offset.top;
            var h1 = that.height;
            var w1 = that.width;
            var b1 = y1 + h1;
            var r1 = x1 + w1;

            // Get target data
            var x2 = target.offset.left;
            var y2 = target.offset.top;
            var h2 = target.height;
            var w2 = target.width;
            var b2 = y2 + h2;
            var r2 = x2 + w2;

            if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
            return true;
        }
    });

    // Return class
    return Card;
});