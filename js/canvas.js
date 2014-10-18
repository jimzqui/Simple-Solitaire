/**
 * JQcards - Canvas
 * canvas.js
 * (c) 2014, Jimbo Quijano
 */

// Load dependencies
define(['class'], function(Class) {

    // Create new Canvas Class
    var Canvas = Class.extend({

        // Initialize
        init: function(options) {
            var that = this;

            // Default settings
            var defaults = {
                el: 'solitaire',
                width: 677,
                height: 600,
                moves: [],
                slots: {},
                suits: ['Spades', 'Hearts', 'Clubs', 'Diamonds'],
                names: ['Ace', 2, 3, 4, 5, 6, 7, 8, 9, 10, 'Jack', 'Queen', 'King']
            };

            // Construct final settings
            var settings = $.extend({}, defaults, options);

            // Map settings to root
            $.each(settings, function(index, value) {
                that[index] = value;
            });

            // Create canvas
            that._create();

            // Call render
            that.render();

            // Setup events
            that._events();
            return;
        },

        // Create slots
        renderSlots: function(obj) {
            var that = this;

            // Save settings for laters
            that.slotSettings = obj;

            // Create and draw slots in canvas
            $.each(obj, function(name, opt) {
                var slot = opt.slot;
                var tile = opt.tile;

                if (tile instanceof Array) {
                    for (var i = 0; i < tile.length; i++) {
                        that.slots[name + i] = new slot({
                            canvas: that,
                            name: name + i,
                            group: name,
                            position: {
                                left: tile[i].split('-')[0],
                                top: tile[i].split('-')[1]
                            }
                        });
                    };
                } else {
                    that.slots[name] = new slot({
                        canvas: that,
                        name: name,
                        group: name,
                        position: {
                            left: tile.split('-')[0],
                            top: tile.split('-')[1]
                        }
                    });
                }
            });
        },

        // Render cards
        renderCards: function(obj, callback) {
            var that = this;
            var orders = {};

            // Save settings for laters
            that.cardSettings = obj;

            // Create/transfer cards in slots
            $.each(obj, function(to_name, opt) {
                if(opt.create != undefined) {
                    that.createCards({
                        to: to_name,
                        card: opt.create
                    });
                } else {
                    if (orders[opt.from] == undefined) {
                        orders[opt.from] = [];
                    }

                    if (opt.pick instanceof Array) {
                        for (var i = 0; i < opt.pick.length; i++) {
                            orders[opt.from].push({
                                name: to_name + i,
                                size: opt.pick[i]
                            });
                        };
                    } else {
                        orders[opt.from].push({
                            name: to_name,
                            size: opt.pick
                        });
                    }
                }
            });

            // Transfer cards
            $.each(orders, function(from_name, order) {
                that.placeCards({
                    from: from_name, 
                    order: order
                });
            });
        },

        // Reset cards
        resetCards: function(callback) {
            var that = this;

            // Destroy all cards
            that.destroyCards();

            // Rerender cards
            that.renderCards(that.cardSettings, callback);
        },

        // Destroy all cards
        destroyCards: function() {
            var that = this;
            var cards = [];

            // Empty all cards in slots
            $.each(that.slots, function(name, slot) {
                cards = cards.concat(slot.pickRandom(slot.cardCount()));
            });

            // Destroy all cards
            for (var i = cards.length - 1; i >= 0; i--) {
                var card = cards[i];
                card.el.remove();
            };

            // Reset infos
            that.rendered = false;
            that.moves = [];
        },

        // Create cards
        createCards: function(obj) {
            var that = this;
            var cards = [];

            // Create and draw cards in selected slot
            for (var i = 0; i < that.names.length; i++) {
                for (var j = 0; j < that.suits.length; j++) {

                    // Create new card
                    cards.push(new obj.card({
                        canvas: that,
                        name: that.names[i],
                        suit: that.suits[j],
                        zindex: i + j
                    }));
                };
            };

            // Place cards
            that.slots[obj.to].animate = false;
            that.slots[obj.to].addCards(cards);
        },

        // Transfer and place cards to slots
        placeCards: function(obj, i) {
            var that = this;

            // Default i to 0
            if (i == undefined) {
                i = 0;
            }

            // Get cards
            var name = obj.order[i].name;
            var slot = that.slots[name];
            var cards = that.slots[obj.from].pickRandom(obj.order[i].size);

            // Place cards to slot
            slot.addCards(cards, function() {
                if (i == obj.order.length - 1) {
                    that.rendered = true;
                    that.afterRender();
                } else {
                    that.placeCards(obj, i + 1);
                }
            });
        },

        // Set browse slot
        setBrowse: function(obj) {
            var that = this;
            that.slots[obj.to].browse_size = obj.size;
            that.slots[obj.from].browse_to = that.slots[obj.to];
            that.slots[obj.to].browse_from = that.slots[obj.from];
        },

        // Set checkin slots
        setCheckin: function(obj) {
            var that = this;
            $.each(obj, function(suit, name) {
                that.slots[name].checkin = suit;
            });
        },

        // Flip every last cards of group
        flipLast: function(group, callback) {
            var that = this;
            var count = 0;

            // Iterate slots and find the group
            $.each(that.slots, function(name, slot) {
                if (slot.group == group) {
                    var timeout = count * slot.anim.interval;
                    (function(timeout, slot, count) {
                        setTimeout(function() {
                            if (count == 6) {
                                slot.last.flip();
                                if (callback) callback();
                            } else {
                                slot.last.flip();
                            }
                        }, timeout);
                    })(timeout, slot, count);
                    count++;
                }
            });
        },

        // Change anim settings of group
        changeAnim: function(group, anim) {
            var that = this;

            // Iterate slots and find the group
            $.each(that.slots, function(name, slot) {
                if (slot.group == group) {
                    slot.anim = anim;
                }
            });
        },

        // Register move
        registerMove: function(move) {
            var that = this;

            // Check if allowed to register
            if (that.rendered == true) {
                that.moves.push(move);
            }
        },

        // Undo last move
        undoMove: function() {
            var that = this;

            // Return if no moves registered
            if (that.moves.length == 0) return;

            // Get last move
            var move = that.moves[that.moves.length - 1];

            switch(move.action) {
                case 'switchCards': that._undoSwitch(move); break;
                case 'browseCards': that._undoBrowse(move); break;
                case 'checkin': that._undoCheckin(move); break;
                case 'open': that._undoOpen(move); break;
            }

            // Remove last move
            that.moves.pop(); 
        },

        // Undo switch cards
        _undoSwitch: function(move) {
            var that = this;

            // Create container
            var cards = [];

            // Retrieve cards back
            for (var i = 0; i < move.actor.length; i++) {
                var slot = move.actor[i].slot;
                var card = slot.cards[slot.cardCount() - 1];
                slot.removeCards(card);
                cards.push(card);
            };

            // Transfer cards to origin
            move.origin.addCards(cards.reverse());
        },

        // Undo browse cards
        _undoBrowse: function(move) {
            var that = this;

            // Move back browsed cards
            move.origin.unbrowseCards();
        },

        // Undo card checkin
        _undoCheckin: function(move) {
            var that = this;

            // Retrieve card back
            var slot = move.actor.slot;
            var card = slot.cards[slot.cardCount() - 1];
            slot.removeCards(card);

            // Transfer card to origin
            card.el.animate({ zIndex: 999 }, 0);
            move.origin.addCards(card);
        },

        // Undo card open
        _undoOpen: function(move) {
            var that = this;

            // Close back card
            move.actor.close()
        },

        // Create canvas
        _create: function() {
            var that = this;

            // Create canvas
            var html = '<div id="' + that.el + '"></div>';
            that.el = $(html).appendTo('body');

            // Style canvas
            that.el.css({
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: that.width,
                height: that.height,
                marginLeft: (that.width / 2) * -1,
                marginTop: (that.height / 2) * -1
            });

            // Canvas offset
            that.offset = that.el.offset();
        },

        // Render events
        _events: function() {
            var that = this;

            // Unbind events
            that.el.off();

            // Iterate each events
            $.each(that.events, function(index, value) {
                var event = index.split(' ')[0];
                var elem = index.split(' ')[1];
                var action = value;

                // Bind event to elem
                $('body').on(event, elem, function(e) {
                    that[action](e);
                });
            });
        }
    });

    // Return class
    return Canvas;
});