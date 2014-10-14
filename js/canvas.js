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
                height: 550,
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

            // Run render
            that.render();
            return;
        },

        // Create slots
        renderSlots: function(obj) {
            var that = this;

            // Create and draw slots in canvas
            $.each(obj, function(name, opt) {
                var slot = opt.slot;
                var tile = opt.tile;

                if (tile instanceof Array) {
                    for (var i = 0; i < tile.length; i++) {
                        that.slots[name + i] = new slot({
                            canvas: that,
                            name: name + i,
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
                                group: to_name,
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
                that.transferCards({
                    from: from_name, 
                    order: order
                });
            });
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
        transferCards: function(obj, i) {
            var that = this;

            // Default i to 0
            if (i == undefined) {
                i = 0;
            }

            // Get cards
            var name = obj.order[i].name;
            var slot = that.slots[name];
            var cards = that.slots[obj.from].pickCards(obj.order[i].size);

            // Place cards to slot
            slot.addCards(cards, function() {
                if (i == obj.order.length - 1) {
                    that.afterRender();
                } else {
                    that.transferCards(obj, i + 1);
                }
            });
        },

        // Set browse slot
        setBrowse: function(obj) {
            var that = this;
            that.slots[obj.to].browse_size = obj.size;
            that.slots[obj.from].browse = that.slots[obj.to];
        },

        // Set checkin slots
        setCheckin: function(obj) {
            var that = this;
            $.each(obj, function(suit, name) {
                that.slots[name].checkin = suit;
            });
        },

        // Flip every last cards
        flipLast: function(group, callback) {
            var that = this;

            // Iterate slots in group
            for (var i = 0; i < 7; i++) {
                var slot = that.slots[group + i];
                var timeout = i * slot.anim.interval;
                (function(timeout, slot, i) {
                    setTimeout(function() {
                        slot.anim.speed = 'fast';
                        slot.anim.interval = 0;
                        slot.anim.ease = 0;

                        if (i == 6) {
                            slot.last.flip(75, callback);
                        } else {
                            slot.last.flip();
                        }
                    }, timeout);
                })(timeout, slot, i);
            };
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
        }
    });

    // Return class
    return Canvas;
});