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

            // Create card
            that._create();
            return that;
        },

        // Move card to slot
        move: function(slot, callback) {
            var that = this;

            // Compute anim data
            var anim = slot._computeAnim();
            that.offset = slot._computeCascade();
            that.zindex = anim.zindex;

            // Make sure card is on top while moving
            that.el.animate({ zIndex: anim.zindex + 999 }, 0);
            that.zindex = anim.zindex + 999;

            // Time card animation
            if (slot.animate == true) {
                setTimeout(function() {
                    that.el.animate(that.offset, anim.speed, function() {
                        that.el.animate({ zIndex: anim.zindex }, 0);
                        that.zindex = anim.zindex;
                    });
                }, anim.timeout);

                // Callback
                setTimeout(function() {
                    if(callback) callback(that);
                }, anim.timeout + anim.interval);
            }

            // Place card
            else {
                that.el.css({ zIndex: anim.zindex });
                that.zindex = anim.zindex;
                that.el.css(that.offset);
                if(callback) callback(that);
            }
        },

        // Flip card
        flip: function(speed, callback) {
            var that = this;

            // Default speed to 75
            if (speed == undefined) {
                speed = 75;
            }

            // Get flip image
            if (that.face == 'faceup') {
                var new_face = 'facedown';
                var src = 'cards/' + new_face + '.png';
            } else {
                var new_face = 'faceup';
                var src = 'cards/' + that.slug + '.png';
            }

            // Update card face
            that.face = new_face;

            // Flip animation
            that.el.animate({
                width: 0,
                height: that.height,
                marginLeft: that.width / 2
            }, speed, function() {
                that.el.animate({
                    width: that.width,
                    height: that.height,
                    marginLeft: 0
                }, speed, function() {
                    that.img.attr('src', src);
                    if(callback) callback();
                });
            });
        },

        // Checkin card to ace pile
        checkin: function(callback) {
            var that = this;

            // Get the correct slot to checkin
            $.each(that.canvas.slots, function(name, slot) {
                if ($.isFunction(slot.checkinAllowed)) {
                    if (slot.checkinAllowed(that) == true) {
                        var card = that.slot.pickCard(that.index);
                        card.el.animate({ zIndex: 999 }, 0);
                        slot.addCard(card);
                    }
                }
            });

            // Callback afer checkin
            if (callback) callback(offset);
        },

        // Grab card
        grab: function(callback) {
            var that = this;

            // Get mouse offset
            var x = that.e.pageX - that.offset.left;
            var y = that.e.pageY - that.offset.top;

            // Drag card and get collision data for slots
            that._drag(x, y, function(offset) {
                $.each(that.canvas.slots, function(name, slot) {
                    that._setCollision(slot, offset);
                });
            });

            // Other cards
            var count = 1;
            for (var j = that.index + 1; j < that.slot.cards.length; j++) {
                var card_active = that.slot.cards[j];
                card_active._drag(x, y - (count * 20));
                count++;
            };
        },

        // Return card after grab
        return: function(callback) {
            var that = this;
            var collided;

            // Unbind mousemove after return
            that.canvas.el.unbind('mousemove');

            // Return if not grabbed
            if (that.grabbed != true) return;

            // Check any collision for slots
            $.each(that.canvas.slots, function(name, slot) {
                collided = that._checkCollision(slot, function(cards) {
                    slot.addCards(cards, function() {
                        slot.collide = null;
                    });
                });
            });

            // Return all cards
            if (collided == false) {
                for (var j = that.index; j < that.slot.cards.length; j++) {
                    var card_active = that.slot.cards[j];

                    // Animate back to offset
                    card_active.el.animate({
                        left: card_active.offset.left,
                        top: card_active.offset.top,
                        zIndex: card_active.zindex
                    }, 'fast', function() {
                        if (callback) callback();
                        card_active.grabbed = false;
                    });
                };
            }
        },

        // Drag card following mouse
        _drag: function(x, y, callback) {
            var that = this;

            // Move card according to mouse offset
            that.canvas.el.mousemove(function(e) {
                that.grabbed = true;

                var offset = {
                    left: e.pageX - x,
                    top: e.pageY - y,
                    zIndex: 9999 - y
                };

                // Update offset
                that.el.css(offset);

                // Callback afer grab
                if (callback) callback(offset);
            });
        },

        // Check for collision
        _isCollide: function(slot, offset) {
            var that = this;

            // If empty slot, slot is target
            if (slot.cards.length == 0) {
                var target = slot; 
            } else {
                var target = slot.last;
            }

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
        },

        // Get any card collision
        _setCollision: function(slot, offset) {
            var that = this;

            // Something collided with the card
            if (that._isCollide(slot, offset) == true) {

                // Make sure not its own slot
                if (slot.name != that.slot.name) {
                    return slot.collide = that.slot;
                }
            }

            // Uncollide
            slot.collide = null;
        },

        // Check for any collision
        _checkCollision: function(slot, callback) {
            var that = this;

            // Column collided
            if (slot.collide != null) {

                // Card is allowed to switch
                if ($.isFunction(slot.dropAllowed)) {
                    if (slot.dropAllowed(that) == true) {
                        var cards_active = [];

                        // Iterate each cards
                        for (var i = slot.collide.cards.length - 1; i >= that.index; i--) {
                            var card_active = slot.collide.pickCard(i);
                            if (card_active.face == 'faceup') {
                                cards_active.push(card_active);
                            }
                        };

                        // Callback after checking
                        if (callback) callback(cards_active.reverse());

                        return true;
                    }
                }
            }

            return false;
        },

        // Create card element
        _create: function() {
            var that = this;

            // Set card info
            switch(that.name) {
                case 'Ace': that.value = 1; that.num = 1; break;
                case 'Jack': that.value = 10; that.num = 11; break;
                case 'Queen': that.value = 10; that.num = 12; break;
                case 'King': that.value = 10; that.num = 13; break;
                default: that.value = that.name; that.num = that.name;
            }

            // Set card color
            switch(that.suit) {
                case 'Spades': that.color = 'black'; break;
                case 'Hearts': that.color = 'white'; break;
                case 'Clubs': that.color = 'black'; break;
                case 'Diamonds': that.color = 'white'; break;
            }

            // Card num and slug
            that.slug = that.num + that.suit;

            // Create card
            var html = '<div class="card"><img src="cards/facedown.png"><span></span></div>';
            that.el = $(html).appendTo('#solitaire');
            that.img = that.el.find('img');
            that.face = 'facedown';

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
                zIndex: 1
            });

            // Style card img
            that.el.find('img').css({
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0
            });
        }
    });

    // Return class
    return Card;
});