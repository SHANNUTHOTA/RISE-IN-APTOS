module resource_game::resource_manager {
    use std::string::{String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event;
    use aptos_framework::signer;
    use aptos_framework::timestamp;

    struct PlayerInventory has key {
        wood: u64,
        stone: u64,
        gold: u64,
        last_gathered: u64,
    }

    struct TradeOffer has key, store {
        creator: address,
        offered_resource: String,
        offered_amount: u64,
        requested_resource: String,
        requested_amount: u64,
    }

    struct GameState has key {
        trade_offers: vector<TradeOffer>,
        resources_gathered_events: event::EventHandle<ResourcesGathered>,
        trade_offer_created_events: event::EventHandle<TradeOfferCreated>,
    }

    #[event]
    struct ResourcesGathered has store, drop, copy {
        player: address,
        wood_gathered: u64,
        stone_gathered: u64,
        gold_gathered: u64,
    }

    #[event]
    struct TradeOfferCreated has store, drop, copy {
        offer_id: u64,
        creator: address,
        offered_resource: String,
        offered_amount: u64,
        requested_resource: String,
        requested_amount: u64,
    }

    fun init_module(sender: &signer) {
        move_to(sender, GameState { 
            trade_offers: vector::empty<TradeOffer>(),
            resources_gathered_events: account::new_event_handle<ResourcesGathered>(sender),
            trade_offer_created_events: account::new_event_handle<TradeOfferCreated>(sender),
        });
    }

    public entry fun init_player_inventory(sender: &signer) {
        let player_address = signer::address_of(sender);
        if (!exists<PlayerInventory>(player_address)) {
            move_to(sender, PlayerInventory { wood: 100, stone: 50, gold: 10, last_gathered: timestamp::now_seconds() });
        }
    }

    public entry fun gather_resources(sender: &signer) acquires PlayerInventory, GameState {
        let player_address = signer::address_of(sender);
        let inventory = borrow_global_mut<PlayerInventory>(player_address);
        let game_state = borrow_global_mut<GameState>(@resource_game);

        let now = timestamp::now_seconds();
        assert!(now - inventory.last_gathered >= 60, 1); // 60 second cooldown

        inventory.wood = inventory.wood + 10;
        inventory.stone = inventory.stone + 5;
        inventory.gold = inventory.gold + 1;
        inventory.last_gathered = now;

        event::emit_event<ResourcesGathered>(
            &mut game_state.resources_gathered_events,
            ResourcesGathered {
                player: player_address,
                wood_gathered: 10,
                stone_gathered: 5,
                gold_gathered: 1,
            }
        );
    }

    public entry fun create_trade_offer(
        sender: &signer,
        offered_resource: String,
        offered_amount: u64,
        requested_resource: String,
        requested_amount: u64
    ) acquires PlayerInventory, GameState {
        let player_address = signer::address_of(sender);
        let inventory = borrow_global_mut<PlayerInventory>(player_address);
        let game_state = borrow_global_mut<GameState>(@resource_game);

        // Check if the player has enough resources to offer
        if (offered_resource == std::string::utf8(b"wood")) {
            assert!(inventory.wood >= offered_amount, 2);
            inventory.wood = inventory.wood - offered_amount;
        } else if (offered_resource == std::string::utf8(b"stone")) {
            assert!(inventory.stone >= offered_amount, 2);
            inventory.stone = inventory.stone - offered_amount;
        } else if (offered_resource == std::string::utf8(b"gold")) {
            assert!(inventory.gold >= offered_amount, 2);
            inventory.gold = inventory.gold - offered_amount;
        } else {
            abort(3); // Invalid resource
        };

        let offer_id = vector::length(&game_state.trade_offers);
        let trade_offer = TradeOffer {
            creator: player_address,
            offered_resource,
            offered_amount,
            requested_resource,
            requested_amount,
        };
        vector::push_back(&mut game_state.trade_offers, trade_offer);

        event::emit_event<TradeOfferCreated>(
            &mut game_state.trade_offer_created_events,
            TradeOfferCreated {
                offer_id,
                creator: player_address,
                offered_resource,
                offered_amount,
                requested_resource,
                requested_amount,
            }
        );
    }
}
