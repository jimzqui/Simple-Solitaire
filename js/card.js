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

            // Time card animation
            if (slot.animate == true) {
                setTimeout(function() {
                    that.el.css({ zIndex: anim.zindex });
                    that.el.animate(that.offset, anim.speed);
                }, anim.timeout);

                // Callback
                setTimeout(function() {
                    if(callback) callback(that);
                }, anim.timeout + anim.interval);
            }

            // Place card
            else {
                that.el.css({ zIndex: anim.zindex });
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

            // Get the correct ace slot to checkin
            var index = that.canvas.suits.indexOf(that.suit);
            var slot = that.canvas.aces[index];

            // If allowed, place card
            if (that.num - 1 == slot.cards.length) {
                var card = that.slot.pickCard(that.index);
                slot.addCard(card);
            }

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
                for (var i = 0; i < that.canvas.columns.length; i++) {
                    var column = that.canvas.columns[i];
                    column._setCollision(that, offset);
                };
            });

            // Other cards
            var count = 1;
            for (var i = that.index + 1; i < that.slot.cards.length; i++) {
                var card_active = that.slot.cards[i];
                card_active._drag(x, y - (count * 20));
                count++;
            };
        },

        // Return card after grab
        return: function(callback) {
            var that = this;

            // Unbind mousemove after return
            that.canvas.el.unbind('mousemove');

            // Return if not grabbed
            if (that.grabbed != true) return;

            // Check any collision for slots
            for (var i = 0; i < that.canvas.columns.length; i++) {
                var column = that.canvas.columns[i];
                var collided = column._checkCollision(that, function(cards) {
                    column.addCards(cards, function() {
                        column.collide = null;
                    });
                });
            };

            // Return all cards
            if (collided == false) {
                for (var i = that.index; i < that.slot.cards.length; i++) {
                    var card_active = that.slot.cards[i];

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

        // If card is allowed to switch
        _isAllowed: function(slot) {
            var that = this;

            // If card is king and slot is empty
            if (that.num == 13 && slot.cards.length == 0) {
                return true; 
            }

            // Slot's card has matching value but different color
            if (slot.last.num - 1 == that.num && slot.last.color != that.color) {
                return true;
            } else {
                return false;
            }
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
        }
    });

    // Return class
    return Card;
});