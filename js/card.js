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
                width: 71,
                height: 96
            };

            // Construct settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            return that;
        },

        // Create card element
        create: function(value, suit) {
            var that = this;

            // Set card info
            that.setValue(value);
            that.setSuit(suit);
            that.setName(value);

            // Card num and slug
            that.num = value;
            that.slug = this.num + that.suit;

            // Create card
            var html = '<div class="card"><img src="cards/' + 
            that.slug + '.png"><span></span></div>';
            that.el = $(html).appendTo('#solitaire');
            that.img = that.el.find('img');
            that.flip('facedown', 0);

            // Style card
            that.style();
            return that;
        },

        // Add styling to card
        style: function() {
            var that = this;

            // Style element
            that.el.css({
                position: 'absolute',
                height: that.height,
                width: that.width,
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
        },

        // Set card value
        setValue: function(value) {
            var that = this;

            switch(value) {
                case 11: that.value = 10; break;
                case 12: that.value = 10; break;
                case 13: that.value = 10; break;
                default: that.value = value;
            }
        },

        // Set card suit and color
        setSuit: function(suit) {
            var that = this;

            switch(suit) {
                case 1: that.suit = 'Spades'; that.color = 'black'; break;
                case 2: that.suit = 'Hearts'; that.color = 'white'; break;
                case 3: that.suit = 'Clubs'; that.color = 'black'; break;
                case 4: that.suit = 'Diamonds'; that.color = 'white'; break;
                default: that.suit = 'Spades'; that.color = 'black';
            }
        },

        // Set card name
        setName: function(value) {
            var that = this;
            
            switch(value) {
                case 1: that.name = 'Ace'; break;
                case 11: that.name = 'Jack'; break;
                case 12: that.name = 'Queen'; break;
                case 13: that.name = 'King'; break;
                default: that.name = value;
            }
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
        grab: function(x, y, canvas_el, callback) {
            var that = this;

            // Add styling to card
            that.el.addClass('grabbed');

            // Move card according to mouse offset
            canvas_el.mousemove(function(e) {
                var offset = {
                    left: e.pageX - x,
                    top: e.pageY - y,
                    zIndex: 999 - y
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
            that.el.animate({
                left: that.offset.left,
                top: that.offset.top,
                zIndex: that.zindex
            }, 'fast', function() {
                if (callback) callback();

                // Add styling to card
                that.el.removeClass('grabbed');
            });
        },

        // Check for collision
        isCollide: function(slot, offset) {
            var that = this;

            // If card is king and target of target is empty
            if (that.num == 13 && slot.cards.length == 0) {
                return true; 
            }

            // Compute card data
            var x1 = offset.left;
            var y1 = offset.top;
            var h1 = that.height;
            var w1 = that.width;
            var b1 = y1 + h1;
            var r1 = x1 + w1;

            // Get target's card data
            var x2 = slot.last.offset.left;
            var y2 = slot.last.offset.top;
            var h2 = slot.last.height;
            var w2 = slot.last.width;
            var b2 = y2 + h2;
            var r2 = x2 + w2;

            if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) return false;
            return true;
        },

        // If card is allowed to switch
        isAllowed: function(slot) {
            var that = this;

            // If card is king and target is empty
            if (that.num == 13 && slot.cards.length == 0) {
                return true; 
            }

            // Target's card has matching value but different color
            if (slot.last.num - 1 == that.num && slot.last.color != that.color) {
                return true;
            } else {
                return false;
            }
        }
    });

    // Return class
    return Card;
});