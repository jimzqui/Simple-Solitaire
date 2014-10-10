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
            that.create();
            return that;
        },

        // Create card element
        create: function() {
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

            // Move card according to mouse offset
            canvas_el.mousemove(function(e) {
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

        // Return to original offset
        return: function(callback) {
            var that = this;

            // Animate to offset
            that.el.css({ zIndex: that.zindex });
            that.el.animate({
                left: that.offset.left,
                top: that.offset.top,
            }, 'fast', function() {
                if (callback) callback();
                that.grabbed = false;
            });
        },

        // Check for collision
        isCollide: function(slot, offset) {
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
        isAllowed: function(slot) {
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

        // Add collision to card
        addCollision: function(slots) {
            var that = this;

            // Check if card is grabbed
            that.el.unbind('mousedown');
            that.el.mousedown(function(e) { 
                if (that.face == 'facedown') return;
                if (that.slot.name == 'browse' 
                && that.last == false) return;

                // Get mouse offset
                var x = e.pageX - that.offset.left;
                var y = e.pageY - that.offset.top;

                // Grab and get collision data for slots
                that.grab(x, y, slots[0].canvas, function(offset) {
                    for (var i = 0; i < slots.length; i++) {
                        var column = slots[i];
                        column.setCollision(that, offset);
                    };
                });

                // Other cards
                var count = 1;
                for (var i = that.index + 1; i < that.slot.cards.length; i++) {
                    var card_active = that.slot.cards[i];
                    card_active.grab(x, y - (count * 20), slots[0].canvas);
                    count++;
                };
            });

            // Check if card is released
            that.el.unbind('mouseup');
            that.el.mouseup(function(e) { 
                slots[0].canvas.unbind('mousemove');
                if (that.grabbed != true) return;

                // Check any collision for slots
                for (var i = 0; i < slots.length; i++) {
                    var column = slots[i];
                    var collided = column.checkCollision(that, function(cards) {
                        column.addCards(cards, function() {
                            column.collide = null;
                        });
                    });
                };

                // Return all cards
                if (collided == false) {
                    for (var i = that.index; i < that.slot.cards.length; i++) {
                        var card_active = that.slot.cards[i];
                        card_active.return();
                    };
                }
            });
        },

        addEvents: function(slots) {
            var that = this;

            // Check if card is clicked
            that.el.unbind('click');
            that.el.click(function(e) { 
                if (that.face == 'faceup') return;
                if (that.slot.name == 'stack') return;

                // Flip card
                that.flip('faceup');
            });

            // Check if card is dbclicked
            that.el.unbind('dblclick');
            that.el.dblclick(function() {
                if (that.face == 'facedown') return;
                if (that.slot.name == 'browse' 
                && that.last == false) return;

                // Chekin card
                switch(that.suit) {
                    case 'Spades': slots[0].checkinCard(that); break;
                    case 'Hearts': slots[1].checkinCard(that); break;
                    case 'Clubs': slots[2].checkinCard(that); break;
                    case 'Diamonds': slots[3].checkinCard(that); break;
                }
            });
        },

        // Remove collision
        removeCollision: function() {
            var that = this;
            that.el.unbind('mousedown');
            that.el.unbind('mouseup');
        },

        // Remove events
        removeEvents: function() {
            var that = this;
            that.el.unbind('click');
            that.el.unbind('dbclick');
        }
    });

    // Return class
    return Card;
});