
    create table auction_bids (
        bid_amount numeric(38,2) not null,
        bid_time timestamp(6),
        auction_session_id varchar(255) not null,
        bidder_id varchar(255) not null,
        id varchar(255) not null,
        primary key (id)
    );

    create table auction_deposits (
        amount numeric(38,2) not null,
        is_refunded boolean not null,
        deposited_at timestamp(6) not null,
        auction_session_id varchar(255) not null,
        id varchar(255) not null,
        user_id varchar(255) not null,
        primary key (id)
    );

    create table auction_sessions (
        current_highest_price numeric(38,2),
        starting_price numeric(38,2) not null,
        step_price numeric(38,2) not null,
        end_time timestamp(6) not null,
        start_time timestamp(6) not null,
        id varchar(255) not null,
        product_id varchar(255) not null unique,
        status varchar(255) check (status in ('PENDING','ONGOING','ENDED','CANCELED')),
        primary key (id)
    );

    create table audit_logs (
        created_at timestamp(6) not null,
        action varchar(255) not null,
        actor_role varchar(255) not null,
        actor_username varchar(255) not null,
        detail TEXT,
        id varchar(255) not null,
        ip_address varchar(255),
        target_id varchar(255),
        target_label varchar(255),
        target_type varchar(255),
        primary key (id)
    );

    create table blocked_users (
        created_at timestamp(6),
        blocked_id varchar(255) not null,
        blocker_id varchar(255) not null,
        id varchar(255) not null,
        primary key (id),
        unique (blocker_id, blocked_id)
    );

    create table categories (
        description varchar(255),
        icon varchar(255),
        id varchar(255) not null,
        name varchar(255) not null unique,
        parent_id varchar(255),
        primary key (id)
    );

    create table chat_messages (
        deleted_by_receiver boolean default false,
        deleted_by_sender boolean default false,
        is_read boolean default false,
        timestamp timestamp(6),
        content TEXT,
        id varchar(255) not null,
        image_url varchar(255),
        receiver_id varchar(255) not null,
        sender_id varchar(255) not null,
        primary key (id)
    );

    create table follows (
        created_at timestamp(6),
        follower_id varchar(255) not null,
        following_id varchar(255) not null,
        id varchar(255) not null,
        primary key (id),
        unique (follower_id, following_id)
    );

    create table linked_bank_accounts (
        is_default boolean default false,
        created_at timestamp(6),
        account_name varchar(255) not null,
        account_number varchar(255) not null,
        bank_name varchar(255) not null,
        id varchar(255) not null,
        user_id varchar(255) not null,
        primary key (id)
    );

    create table live_sessions (
        viewer_count integer,
        ended_at timestamp(6),
        started_at timestamp(6),
        agora_channel_name varchar(255) not null,
        auction_session_id varchar(255) not null unique,
        host_id varchar(255) not null,
        id varchar(255) not null,
        status varchar(255) not null check (status in ('LIVE','ENDED')),
        primary key (id)
    );

    create table notifications (
        is_read boolean not null,
        created_at timestamp(6),
        message varchar(500) not null,
        id varchar(255) not null,
        related_entity_id varchar(255),
        title varchar(255) not null,
        type varchar(255) not null check (type in ('AUCTION_OUTBID','AUCTION_WON','ORDER_CREATED','ORDER_PAID','ORDER_SHIPPED','ORDER_COMPLETED','ESCROW_RELEASED','ORDER_DISPUTED','ORDER_CANCELED','SYSTEM')),
        user_id varchar(255) not null,
        primary key (id)
    );

    create table orders (
        deleted_by_buyer boolean not null,
        discount_amount numeric(38,2),
        platform_fee numeric(38,2),
        quantity integer,
        shipping_fee numeric(38,2),
        total_amount numeric(38,2) not null,
        created_at timestamp(6),
        updated_at timestamp(6),
        buyer_id varchar(255) not null,
        dispute_reason TEXT,
        id varchar(255) not null,
        logistics_provider varchar(255),
        product_id varchar(255) not null,
        return_tracking_code varchar(255),
        seller_id varchar(255) not null,
        status varchar(255) check (status in ('PENDING_PAYMENT','PAID','SHIPPED','DELIVERED','COMPLETED','CANCELED','DISPUTED','RETURNING','RETURNED')),
        tracking_code varchar(255),
        voucher_id varchar(255),
        primary key (id)
    );

    create table otp_tokens (
        is_used boolean not null,
        otp varchar(6) not null,
        expiry_date timestamp(6) not null,
        id varchar(255) not null,
        user_id varchar(255) not null,
        primary key (id)
    );

    create table product_favorites (
        created_at timestamp(6),
        id varchar(255) not null,
        product_id varchar(255) not null,
        user_id varchar(255) not null,
        primary key (id)
    );

    create table product_images (
        image_url varchar(255),
        product_id varchar(255) not null
    );

    create table product_view_history (
        viewed_at timestamp(6) not null,
        id varchar(255) not null,
        product_id varchar(255) not null,
        user_id varchar(255) not null,
        primary key (id)
    );

    create table products (
        average_rating numeric(3,1) default 5.0,
        is_hidden boolean default false,
        is_live boolean default false,
        price numeric(38,2) not null,
        quantity integer,
        sold_count integer default 0,
        boosted_until timestamp(6),
        created_at timestamp(6),
        updated_at timestamp(6),
        category_id varchar(255) not null,
        condition varchar(255) check (condition in ('NEW','LIKE_NEW','GOOD','FAIR')),
        description TEXT,
        id varchar(255) not null,
        image_url varchar(255),
        location varchar(255),
        sell_type varchar(255) check (sell_type in ('BUY_NOW','AUCTION')),
        seller_id varchar(255) not null,
        status varchar(255) check (status in ('ACTIVE','SOLD','HIDDEN','DELETED','BANNED')),
        title varchar(255) not null,
        video_url varchar(255),
        primary key (id)
    );

    create table refresh_tokens (
        expiry_date timestamp(6) not null,
        token varchar(500) not null unique,
        id varchar(255) not null,
        user_id varchar(255) not null,
        primary key (id)
    );

    create table reports (
        created_at timestamp(6),
        updated_at timestamp(6),
        reason varchar(1000) not null,
        id varchar(255) not null,
        reported_product_id varchar(255) not null,
        reporter_id varchar(255) not null,
        status varchar(255) check (status in ('PENDING','RESOLVED','REJECTED')),
        primary key (id)
    );

    create table review_likes (
        review_id varchar(255) not null,
        user_id varchar(255) not null,
        primary key (review_id, user_id)
    );

    create table reviews (
        rating integer not null,
        created_at timestamp(6),
        comment varchar(1000),
        seller_reply varchar(1000),
        id varchar(255) not null,
        order_id varchar(255) not null unique,
        reviewee_id varchar(255) not null,
        reviewer_id varchar(255) not null,
        primary key (id)
    );

    create table system_configs (
        is_maintenance_mode boolean not null,
        min_withdrawal_amount numeric(38,2) not null,
        platform_fee_percent numeric(5,4) not null,
        id bigint generated by default as identity,
        primary key (id)
    );

    create table transactions (
        amount numeric(38,2) not null,
        created_at timestamp(6),
        description varchar(255),
        id varchar(255) not null,
        order_id varchar(255),
        reference_id varchar(255) unique,
        status varchar(255) check (status in ('PENDING','COMPLETED','FAILED','CANCELLED')),
        type varchar(255) check (type in ('DEPOSIT','WITHDRAW','PAYMENT','ESCROW_HOLD','ESCROW_RELEASE','REFUND','BOOST_FEE','WITHDRAWAL_FEE','AUCTION_DEPOSIT','AUCTION_REFUND','COMMISSION')),
        wallet_id varchar(255) not null,
        primary key (id)
    );

    create table user_interests (
        category_id varchar(255),
        user_id varchar(255) not null
    );

    create table users (
        is_active boolean not null,
        total_points numeric(38,2) default 0,
        created_at timestamp(6),
        last_active_at timestamp(6),
        updated_at timestamp(6),
        address varchar(255),
        avatar varchar(255),
        email varchar(255) not null unique,
        full_name varchar(255),
        id varchar(255) not null,
        password varchar(255) not null,
        phone varchar(255),
        role varchar(255) check (role in ('USER','ADMIN','STAFF')),
        tier varchar(255) check (tier in ('BRONZE','SILVER','GOLD','DIAMOND')),
        username varchar(255) not null unique,
        primary key (id)
    );

    create table voucher_usages (
        used_at timestamp(6),
        id varchar(255) not null,
        order_id varchar(255),
        user_id varchar(255) not null,
        voucher_id varchar(255) not null,
        primary key (id)
    );

    create table vouchers (
        discount_value numeric(38,2) not null,
        is_active boolean not null,
        max_discount numeric(38,2),
        min_order_value numeric(38,2),
        quantity integer not null,
        usage_limit_per_user integer default 1 not null,
        created_at timestamp(6),
        expiry_date timestamp(6) not null,
        updated_at timestamp(6),
        code varchar(255) not null unique,
        id varchar(255) not null,
        seller_id varchar(255),
        type varchar(255) not null check (type in ('FIXED_AMOUNT','PERCENTAGE','FREE_SHIPPING')),
        primary key (id)
    );

    create table wallets (
        balance numeric(38,2) not null,
        held_balance numeric(38,2),
        created_at timestamp(6),
        updated_at timestamp(6),
        id varchar(255) not null,
        user_id varchar(255) not null unique,
        primary key (id)
    );

    create index idx_audit_actor 
       on audit_logs (actor_username);

    create index idx_audit_action 
       on audit_logs (action);

    create index idx_audit_created_at 
       on audit_logs (created_at);

    alter table if exists auction_bids 
       add constraint FKt925fja5xis43vkbuvlgldisw 
       foreign key (auction_session_id) 
       references auction_sessions;

    alter table if exists auction_bids 
       add constraint FK5gyqh6puojkbrby002k00yovx 
       foreign key (bidder_id) 
       references users;

    alter table if exists auction_deposits 
       add constraint FKp421lhdvjkwd61680novjv4hm 
       foreign key (auction_session_id) 
       references auction_sessions;

    alter table if exists auction_deposits 
       add constraint FK4ot6uq3ammr9megmo1jehwnru 
       foreign key (user_id) 
       references users;

    alter table if exists auction_sessions 
       add constraint FK22lotvg0okvk74b3w8cudgh92 
       foreign key (product_id) 
       references products;

    alter table if exists blocked_users 
       add constraint FKj4jsh58k09poirh4liar3vry7 
       foreign key (blocked_id) 
       references users;

    alter table if exists blocked_users 
       add constraint FKp9eolqohxq2guwfaw720qsfwc 
       foreign key (blocker_id) 
       references users;

    alter table if exists categories 
       add constraint FKsaok720gsu4u2wrgbk10b5n8d 
       foreign key (parent_id) 
       references categories;

    alter table if exists chat_messages 
       add constraint FKand7mh9iu4kt3n1tn2w9i9of0 
       foreign key (receiver_id) 
       references users;

    alter table if exists chat_messages 
       add constraint FKgiqeap8ays4lf684x7m0r2729 
       foreign key (sender_id) 
       references users;

    alter table if exists follows 
       add constraint FKqnkw0cwwh6572nyhvdjqlr163 
       foreign key (follower_id) 
       references users;

    alter table if exists follows 
       add constraint FKonkdkae2ngtx70jqhsh7ol6uq 
       foreign key (following_id) 
       references users;

    alter table if exists linked_bank_accounts 
       add constraint FKrocu7ikqkp558mlfbu1u5pdwg 
       foreign key (user_id) 
       references users;

    alter table if exists live_sessions 
       add constraint FKpg7oc1a35xpcd19e4yyy7sadi 
       foreign key (auction_session_id) 
       references auction_sessions;

    alter table if exists live_sessions 
       add constraint FKqyffg2sc90lubl7emw4t9pe9o 
       foreign key (host_id) 
       references users;

    alter table if exists notifications 
       add constraint FK9y21adhxn0ayjhfocscqox7bh 
       foreign key (user_id) 
       references users;

    alter table if exists orders 
       add constraint FKdimvsocblb17f45ikjr6xn1wj 
       foreign key (voucher_id) 
       references vouchers;

    alter table if exists orders 
       add constraint FKhtx3insd5ge6w486omk4fnk54 
       foreign key (buyer_id) 
       references users;

    alter table if exists orders 
       add constraint FKkp5k52qtiygd8jkag4hayd0qg 
       foreign key (product_id) 
       references products;

    alter table if exists orders 
       add constraint FKsb9w6305d2be0rwbtifi7wymp 
       foreign key (seller_id) 
       references users;

    alter table if exists otp_tokens 
       add constraint FKjyk2kyj8ul2bjqjpentlrpyi1 
       foreign key (user_id) 
       references users;

    alter table if exists product_favorites 
       add constraint FKpkyejd2ayy5cedwdmsanhxeg8 
       foreign key (product_id) 
       references products;

    alter table if exists product_favorites 
       add constraint FKj4ki7h1gwbpxl7la1tx32wc8 
       foreign key (user_id) 
       references users;

    alter table if exists product_images 
       add constraint FKqnq71xsohugpqwf3c9gxmsuy 
       foreign key (product_id) 
       references products;

    alter table if exists product_view_history 
       add constraint FKgk3oim44ou0bvq5500905476x 
       foreign key (product_id) 
       references products;

    alter table if exists product_view_history 
       add constraint FK1v80upg3f9xfrp0yw3a9w0ayw 
       foreign key (user_id) 
       references users;

    alter table if exists products 
       add constraint FKog2rp4qthbtt2lfyhfo32lsw9 
       foreign key (category_id) 
       references categories;

    alter table if exists products 
       add constraint FKbgw3lyxhsml3kfqnfr45o0vbj 
       foreign key (seller_id) 
       references users;

    alter table if exists refresh_tokens 
       add constraint FK1lih5y2npsf8u5o3vhdb9y0os 
       foreign key (user_id) 
       references users;

    alter table if exists reports 
       add constraint FK5ir8y2ti7b6s0x2us7rk0fi5c 
       foreign key (reported_product_id) 
       references products;

    alter table if exists reports 
       add constraint FKd3qiw2om5d2oh5xb7fbdcq225 
       foreign key (reporter_id) 
       references users;

    alter table if exists review_likes 
       add constraint FKnual15vv88tiqnwmi60tb2l8d 
       foreign key (user_id) 
       references users;

    alter table if exists review_likes 
       add constraint FKm2uonfg8ky6jwtu6iugkilox8 
       foreign key (review_id) 
       references reviews;

    alter table if exists reviews 
       add constraint FKqwgq1lxgahsxdspnwqfac6sv6 
       foreign key (order_id) 
       references orders;

    alter table if exists reviews 
       add constraint FK1sjw2c8j34ew366vfqxergp0b 
       foreign key (reviewee_id) 
       references users;

    alter table if exists reviews 
       add constraint FKd1isgfajhtdl8mgg29up6mofi 
       foreign key (reviewer_id) 
       references users;

    alter table if exists transactions 
       add constraint FKfyxndk58yiq2vpn0yd4m09kbt 
       foreign key (order_id) 
       references orders;

    alter table if exists transactions 
       add constraint FK23bop5lktue0o5q7kr19ti8h 
       foreign key (wallet_id) 
       references wallets;

    alter table if exists user_interests 
       add constraint FKdv9fflrh61wyuujfwx2yn1tb4 
       foreign key (user_id) 
       references users;

    alter table if exists voucher_usages 
       add constraint FKc6ctsyf63q19vkjb6k3lrecev 
       foreign key (order_id) 
       references orders;

    alter table if exists voucher_usages 
       add constraint FKayocv8v53p94c3jr2ookjd4jq 
       foreign key (user_id) 
       references users;

    alter table if exists voucher_usages 
       add constraint FKguvf95urdn2namu0hgiasgttx 
       foreign key (voucher_id) 
       references vouchers;

    alter table if exists vouchers 
       add constraint FK1qjqk8k8f6nvjhy49i8c8smjl 
       foreign key (seller_id) 
       references users;

    alter table if exists wallets 
       add constraint FKc1foyisidw7wqqrkamafuwn4e 
       foreign key (user_id) 
       references users;
