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
                num: '1',
                suit: 'joker',
                map: [3, 13]
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
                    slot._cardEvents(that);
                }, anim.timeout + anim.interval);
            }

            // Place card
            else {
                that.el.animate({ zIndex: anim.zindex }, 0);
                that.zindex = anim.zindex;
                that.el.css(that.offset);
                if(callback) callback(that);
                slot._cardEvents(that);
            }
        },

        // Open card
        open: function(speed) {
            var that = this;

            // Default speed to 0.3
            if (speed == undefined) {
                speed = 0.3;
            }

            // Flip card
            that.face = 'faceup';
            that.el.find('.flipper').css({
                transition: 'all ' + speed + 's ease 0s',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(180deg)'
            });

            // Register move
            that.canvas.registerMove({
                action: 'open',
                type: 'card',
                actor: that,
                origin: that.slot
            });
        },

        // Close card
        close: function(speed) {
            var that = this;

            // Default speed to 0.3
            if (speed == undefined) {
                speed = 0.3;
            }

            // Flip card
            that.face = 'facedown';
            that.el.find('.flipper').css({
                transition: 'all ' + speed + 's ease 0s',
                transformStyle: 'preserve-3d',
                transform: 'rotateY(0deg)'
            });
        },

        // Flip card
        flip: function(speed) {
            var that = this;

            // Default speed to 0.3
            if (speed == undefined) {
                speed = 0.3;
            }

            // Flip card
            if (that.face == 'faceup') {
                that.face = 'facedown';
                that.el.find('.flipper').css({
                    transition: 'all ' + speed + 's ease 0s',
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(0deg)'
                });
            } else {
                that.face = 'faceup';
                that.el.find('.flipper').css({
                    transition: 'all ' + speed + 's ease 0s',
                    transformStyle: 'preserve-3d',
                    transform: 'rotateY(180deg)'
                });
            }
        },

        // Checkin card to ace pile
        checkin: function(callback) {
            var that = this;

            // Get the correct slot to checkin
            $.each(that.canvas.slots, function(name, slot) {

                // Check if card is allowed to switch
                if (slot._applySwitch(that, slot.checkinCondition) == true) {
                    var card = that.slot.cards[that.index];
                    that.slot.removeCards(card);

                    // Register move
                    that.canvas.registerMove({
                        action: 'checkin',
                        type: 'card',
                        actor: card,
                        origin: card.slot
                    });

                    // Transfer card
                    card.el.animate({ zIndex: 999 }, 0);
                    slot.addCards(card);
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
            for (var j = that.index + 1; j < that.slot.cardCount(); j++) {
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

                    // Register move
                    that.canvas.registerMove({
                        action: 'switchCards',
                        type: 'cards',
                        actor: cards,
                        origin: cards[0].slot
                    });

                    // Transfer cards
                    slot.addCards(cards, function() {
                        slot.collide = null;
                    });
                });
            });

            // Return all cards
            if (collided == false) {
                for (var j = that.index; j < that.slot.cardCount(); j++) {
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
            if (slot.cardCount() == 0) {
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
                if (slot._applySwitch(that, slot.dropCondition) == true) {

                    // Pick cards from slot
                    var cards = slot.collide.getCards(slot.collide.cardCount() - that.index, true);

                    // Callback after checking
                    if (callback) callback(cards.reverse());

                    return true;
                }
            }

            return false;
        },

        // Create card element
        _create: function() {
            var that = this;

            // Set height and width
            that.width = that.canvas.tile.width;
            that.height = that.canvas.tile.height;

            // Set card info
            switch(that.num) {
                case 1: that.value = 1; that.name = 'Ace'; break;
                case 11: that.value = 10; that.name = 'Jack'; break;
                case 12: that.value = 10; that.name = 'Queen'; break;
                case 13: that.value = 10; that.name = 'King'; break;
                default: that.value = that.name; that.name = that.num;
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
            var html = '<div class="card"><div class="flipper">' +
            '<div class="faceup"><span></span></div>' +
            '<div class="facedown"><span></span></div></div></div>';
            that.el = $(html).appendTo(that.canvas.el);
            that.face = 'facedown';

            // Style element
            that.el.css({
                position: 'absolute',
                height: that.height,
                width: that.width,
                cursor: 'pointer',
                perspective: 1000
            });

            // Style card flipper
            that.el.find('.flipper').css({
                position: 'relative'
            });

            // Style faceup and facedown
            that.el.find('.faceup, .facedown').css({
                width: that.width,
                height: that.height,
                position: 'absolute',
                backfaceVisibility: 'hidden',
                top: 0,
                left: 0
            });

            // Style faceup
            that.el.find('.faceup').css({
                transform: 'rotateY(180deg)',
                zIndex: 2,
            });

            // Style facedown
            that.el.find('.facedown').css({
                transform: 'rotateY(0deg)'
            });

            // Compute background positions
            var faceup_x = that.faceup_map[0] * that.width;
            var faceup_y = that.faceup_map[1] * that.height;
            var facedown_x = that.facedown_map[0] * that.width;
            var facedown_y = that.facedown_map[1] * that.height;

            // Style faceup image
            that.el.find('.faceup span').css({
                float: 'left',
                width: that.width,
                height: that.height,
                backgroundImage: 'url(' + that.canvas.cards_dir + 'cards.png)',
                backgroundPosition: '-' + faceup_x + 'px -' + faceup_y + 'px',
            });

            // Style facedown image
            that.el.find('.facedown span').css({
                float: 'left',
                width: that.width,
                height: that.height,
                backgroundImage: 'url(' + that.canvas.cards_dir + 'cards.png)',
                backgroundPosition: '-' + facedown_x + 'px -' + facedown_y + 'px',
            });
        }
    });

    // Return class
    return Card;
});