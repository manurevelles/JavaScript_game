let canvas;
let context;

let fpsInterval = 1000 / 30;  // the denominator is frames per second
let now;
let then = Date.now();
let request_id;

// Declare and initialise player
let player = {
    x : 250,
    y : 44,
    size : 32,
    max_health : 50,
    health : 50,
    magic_item : false,
    max_magic : 40,
    magic : 40,
    magic_regen : 2,
    magic_regen_speed : 2000,
    physical_defense : 1,    //Lower ratio = less physical damage
    magic_defense : 1,      //Lower ratio = less magic damage
    post_collision_immunity : 20,
    item_pickup_range : 0,
    luck : 10,  //Increases drop ratio for rewards from enemies
    second_chance : false,      //Allows to come back from the death
    coins : 0,
    item_stay_time : 4000,
    xChange : 4,
    yChange : 4,
    frameX : 0,
    frameY : 0,
    continuous_damage : false //Allows for player blinking animation if receiving constant damage by an attack (ie. light beams)
}

//Regenerate magic every X seconds (time set on magic_regen_speed property in player object)
setInterval(magic_regeneration, player.magic_regen_speed);

let weapon = {
    shoot_speed : 10,
    damage : 4,
    bullet_size : 5,
    max_charge : 15,
    reload_time : 20,      //in frames
    bullets_left : 15,      //before recharging
    reloading : 20
}

let spell = {
    cost : 20,
    damage : 2,
    area : 150,
    duration : 32,  //in frames
    active : 0,     //Counter for spell to only last the specified duration
    colours : ["rgb(255,0,0,0.2)", "rgb(255,255,0,0.2)", "rgb(255,165,0,0.2)", "rgb(255,165,0,0.2)", "rgb(255,100,0,0.2)"]
}

// Set variables for movement and spell casting to false
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
let cast_spell = false;

//Bullets
let bullets = [];

//Enemies and rewards
let enemies = [];
let rewards = [];

//Enemies movement speed and direction:
let direction = [-3,-2,-1,0,1,2,3];

let boss_direction = [-1.6,-1.2,-0.8,0.8,1.2,1.6]

//Boss
let boss = {
    x : 190,
    y : 60,
    xChange : boss_direction[randint(0,5)],
    yChange : boss_direction[randint(0,5)],
    damage : 20,
    bullet_damage : 7,
    max_health : 600,
    health : 600,
    frameX : 0,
    size : 128,
    bullets_attack : false,
    enemies_attack : false
}

//Boss bullets
let boss_bullets = []
//Boss bullets directions (like cardinal points)
let boss_b_direction = [-3,-2,-1,0,1,2,3,4];        //boss bullets direction

//Player images + characters
let playerImage = new Image();
let player_hurtImage = new Image();
let shadowImage = new Image();
let oldmanImage = new Image();
let lumberjackImage = new Image();

//Enemies images
let skeletonImage = new Image();
let knightImage = new Image();
let beastImage = new Image();
let beast_chargingImage = new Image();
let cyclopeImage = new Image();
let cyclope_chargingImage = new Image();
let shadow_mediumImage = new Image();
let shadow_largeImage = new Image();
let bossImage = new Image();

//Assets images
let heartImage = new Image();
let coinImage = new Image();
let gemImage = new Image();
let magicImage = new Image();
let gunImage = new Image();
let start_screenImage = new Image();
let WASD_keysImage = new Image();
let mouseImage = new Image();
let guiding_arrowsImage = new Image();
let life_potionImage = new Image();
let death_potionImage = new Image();
let armour_potionImage = new Image();
let vigour_potionImage = new Image();
let shop_iconImage = new Image();
let close_iconImage = new Image();
let sold_outImage = new Image();
let buy_iconImage = new Image();
let dialogue_boxImage = new Image();
let dialogue_box_bossImage = new Image();
let text_boxImage = new Image();
let boss_bulletImage = new Image();
let night_skyImage = new Image();

//Tileset images
let tileset_field = new Image();
let tileset_floor = new Image();
let tileset_house = new Image();
let tileset_nature = new Image();
let tileset_dungeon = new Image();
let tileset_hole = new Image();

let tilesPerRow, tileSize;

//Audio clips
let coinSound = new Audio();
let hitSound = new Audio();
let gameoverSound = new Audio();
let healSound = new Audio();
let firemagicSound = new Audio();
let gemSound = new Audio();
let beam_attackSound = new Audio();
let beam_chargingSound = new Audio();
let hurtSound = new Audio();
let reloadSound = new Audio();
let item_acquiredSound = new Audio();
let successSound = new Audio();
let windSound = new Audio();
let boss_laughSound = new Audio();
let boss_explosionSound = new Audio();

//Songs
let battleSong = new Audio();
let townSong = new Audio();
let lost_forestSong = new Audio();
let mysticalSong = new Audio();
let bossSong = new Audio();

//Set a counter to give immunity when player collides with enemy.
let immune_counter = 0;

//Counter to reduce animation speed of sprites:
let anim_speed = 0;

//Other variables initialisation
let distanceFromPlayer = 0;
let x, y;
let frameX = 0;
let transition = 0;             //counter used for transitions between scenes
let dialogue_counter = 800;     //duration of dialogues
let shop_catalogue = false;
let mountain_blocked = true;    //references mountain access in level forest_3()

let create_level_enemies = true;   //Flag to stop creating enemies when false
let enemy_counter = 0;

let mountain_orb = true;    //Orbs to open the gates to the castle
let desert_orb = true;

let orb_particles = [];
let enemies_exploding = [];

let boss_battle_counter = 0;
let final_cutscene = 0;    //counter used for ending after boss is defeated

//MAX ENEMIES PER LEVEL (if any):
let max_enemies = { 
    forest_0 : 2,
    forest_1 : 3,
    forest_2 : 4,
    forest_3 : 0,
    forest_S1 : 0,
    forest_S2 : 0,
    forest_S3 : 3,
    forest_B1 : 3,
    forest_B2 : 0,
    forest_B4 : 2,
    forest_B5 : 0,
    mountain_1 : 2,
}

let shop_items = {
    life_potion: {
        price: 20,
        name: "LIFE POTION",
        effect: "Increases you max. health by 30.",
        image: life_potionImage,
        x: 50,
        y: 75,
        available: true
    },
    armour_potion: {
        price: 15,
        name: "ARMOUR POTION",
        effect: "Increases your physical defence.",
        image: armour_potionImage,
        x: 50,
        y: 125,
        available: true
    },
    vigour_potion: {
        price: 10,
        name: "VIGOUR POTION",
        effect: "Increases your running speed.",
        image: vigour_potionImage,
        x: 50,
        y: 175,
        available: true
    },
    death_potion: {
        price: 30,
        name: "WEAPON RAGE BALM",
        effect: "Damage, firing speed and bullets are all increased.",
        image: death_potionImage,
        x: 50,
        y: 225,
        available: true
    }
}


document.addEventListener("DOMContentLoaded", init, false);

function init() {
    canvas = document.querySelector("canvas");
    context = canvas.getContext("2d");

    window.addEventListener("keydown", activate, false);
    window.addEventListener("keyup", deactivate, false);
    canvas.addEventListener('click', shoot, false);
    window.addEventListener('contextmenu', (event) => {     //Disabling context menu response to right-click: https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
        event.preventDefault()
      });
    canvas.addEventListener("contextmenu", function(){  //Adding delay in an event listener: https://stackoverflow.com/questions/29755233/trouble-with-settimeout-with-addeventlistener
        setTimeout(function(){
            reload_weapon_now();
        }, 600);
    });

    //Call draw function after loading all assets
    load_assets([
        //Images
        {"var": playerImage, "url": "static/hero.png"},
        {"var": player_hurtImage, "url": "static/hero_hurt.png"},
        {"var": shadowImage, "url": "static/shadow.png"},
        {"var": shadow_mediumImage, "url": "static/shadow_medium.png"},
        {"var": shadow_largeImage, "url": "static/shadow_large.png"},
        {"var": skeletonImage, "url": "static/skeleton.png"},
        {"var": knightImage, "url": "static/knight.png"},
        {"var": beastImage, "url": "static/beast.png"},
        {"var": beast_chargingImage, "url": "static/beast_charging.png"},
        {"var": cyclopeImage, "url": "static/cyclope.png"},
        {"var": cyclope_chargingImage, "url": "static/cyclope_charging.png"},
        {"var": heartImage, "url": "static/heart.png"},
        {"var": coinImage, "url": "static/coin.png"},
        {"var": gemImage, "url": "static/gem.png"},
        {"var": magicImage, "url": "static/magic.png"},
        {"var": gunImage, "url": "static/gun.png"},
        {"var": start_screenImage, "url": "static/start_screen2.png"},
        {"var": WASD_keysImage, "url": "static/WASD_keys.png"},
        {"var": mouseImage, "url": "static/mouse.png"},
        {"var": guiding_arrowsImage, "url": "static/guiding_arrows.png"},
        {"var": oldmanImage, "url": "static/oldman.png"},
        {"var": life_potionImage, "url": "static/life_potion.png"},
        {"var": death_potionImage, "url": "static/death_potion.png"},
        {"var": vigour_potionImage, "url": "static/vigour_potion.png"},
        {"var": armour_potionImage, "url": "static/armour_potion.png"},
        {"var": shop_iconImage, "url": "static/icon_shop.png"},
        {"var": close_iconImage, "url": "static/icon_close.png"},
        {"var": sold_outImage, "url": "static/sold_out.png"},
        {"var": buy_iconImage, "url": "static/icon_buy.png"},
        {"var": dialogue_boxImage, "url": "static/dialogue_box.png"},
        {"var": dialogue_box_bossImage, "url": "static/dialogue_box_boss.png"},
        {"var": text_boxImage, "url": "static/text_box.png"},
        {"var": lumberjackImage, "url": "static/lumberjack.png"},
        {"var": bossImage, "url": "static/boss.png"},
        {"var": boss_bulletImage, "url": "static/boss_bullet2.png"},
        {"var": night_skyImage, "url": "static/night_sky.webp"},
        //Tilesets
        {"var": tileset_field, "url": "static/tileset_field.png"},
        {"var": tileset_floor, "url": "static/tileset_floor.png"},
        {"var": tileset_house, "url": "static/tileset_house.png"},
        {"var": tileset_nature, "url": "static/tileset_nature.png"},
        {"var": tileset_dungeon, "url": "static/tileset_dungeon.png"},
        {"var": tileset_hole, "url": "static/tileset_hole.png"},
        //Sound clips
        {"var": coinSound, "url": "static/sounds/coin.wav"},
        {"var": gemSound, "url": "static/sounds/gem.wav"},
        {"var": hitSound, "url": "static/sounds/hit.wav"},
        {"var": gameoverSound, "url": "static/sounds/gameover.mp3"},
        {"var": healSound, "url": "static/sounds/heal.wav"},
        {"var": beam_attackSound, "url": "static/sounds/beam_attack.mp3"},
        {"var": beam_chargingSound, "url": "static/sounds/beam_charging.mp3"},
        {"var": firemagicSound, "url": "static/sounds/fire_magic.mp3"},
        {"var": hurtSound, "url": "static/sounds/hurt.mp3"},
        {"var": reloadSound, "url": "static/sounds/reload.mp3"},
        {"var": item_acquiredSound, "url": "static/sounds/item_acquired.mp3"},
        {"var": successSound, "url": "static/sounds/success.mp3"},
        {"var": windSound, "url": "static/sounds/wind_sound.mp3"},
        {"var": boss_laughSound, "url": "static/sounds/boss_laugh.mp3"},
        {"var": boss_explosionSound, "url": "static/sounds/boss_explosion.mp3"},
        //Songs
        {"var": battleSong, "url": "static/sounds/battle_song.ogg"},
        {"var": townSong, "url": "static/sounds/town_song.ogg"},
        {"var": lost_forestSong, "url": "static/sounds/lost_forest_song.ogg"},
        {"var": mysticalSong, "url": "static/sounds/mystical_song.ogg"},
        {"var": bossSong, "url": "static/sounds/boss_song.mp3"},
    ], start_game());
}

/////-------------------START RUNNING GAME-------------------------------------------------------------------------------------------------------------------

function start_game() {
    request_id = window.requestAnimationFrame(start_game);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(start_screenImage, 0, 0, canvas.width, canvas.height);
    context.drawImage(WASD_keysImage, 80, canvas.height-70, 80, 52);
    context.drawImage(mouseImage, canvas.width-80, canvas.height-60, 30, 44);

    slow_animation();
    
    if (transition > 200) {
        context.drawImage(guiding_arrowsImage, canvas.width-60, 125, 50, 64)
    }

    draw_bullets();

    draw_player();
    hero_movement();

    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        b.x = b.x + b.velocity_x;
        b.y = b.y + b.velocity_y;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {      //Remove bullet from array if it leaves the canvas
            bullets.splice(i, 1);
            i -= 1;
        }
    }

    context.fillStyle = "white";
    context.font = "16px monospace";
    context.fillText("MOVEMENT:", 10, canvas.height-60);
    context.fillText("ATTACK*:", canvas.width-150, canvas.height-60);
    if (transition > 100) {
        context.font = "italic 11px monospace";
        context.fillText("*RIGHT CLICK: manually reload", 330, canvas.height-2);
    }

    //Initial fade-out
    if (transition < 10) {
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else if (transition < 20) {
        context.fillStyle = "rgb(0,0,0,0.8)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else if (transition < 30) {
        context.fillStyle = "rgb(0,0,0,0.6)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else if (transition < 40) {
        context.fillStyle = "rgb(0,0,0,0.4)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else if (transition < 50) {
        context.fillStyle = "rgb(0,0,0,0.2)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    transition += 1;
    
    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight && transition > 150) {
        player.x = 0;
        reset_level(request_id);
        forest_0();
    }
}

/////-------------------LEVEL: FOREST(0)-------------------------------------------------------------------------------------------------------------------
function forest_0() {
    battleSong.play();
    request_id = window.requestAnimationFrame(forest_0);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 278, 165, 166, 166, 166, 167, 275, 277, 275, 275, 275, 275, 275, 275],
        [166, 166, 166, 215, 254, 188, 192, 211, 275, 275, 275, 278, 275, 275, 165, 166],
        [210, 210, 210, 210, 210, 210, 211, 275, 275, 275, 277, 275, 275, 275, 209, 210],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 234, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,16,17,16,17,174,16,17,18,19,174,18,19,16,17,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_0) {
            create_skeleton();
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    draw_enemies();
    draw_bullets();
    update_bullet_position();
    slow_animation();
    draw_rewards();
    update_enemy_direction();
    draw_player();
    hero_movement();
    player_enemy_collision();

    draw_screen_borders();

    draw_hud();

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        battleSong.pause();
        battleSong.currentTime = 0;
        reset_level(request_id);
        town();
    }
}


/////-------------------LEVEL: TOWN-------------------------------------------------------------------------------------------------------------------
function town() {
    canvas.removeEventListener("click", shoot, false);
    townSong.play();
    request_id = window.requestAnimationFrame(town);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 20;
    tileSize = 32;
    
    let background = [
        [141,141,141,141,141,124,128,127,141,141,141,141,141,141,141,141],
        [141,141,141,141,141,143,220,143,141,141,141,141,141,141,141,141],
        [141,141,141,141,141,143,222,143,141,141,141,141,141,141,141,141],
        [272,272,272,272,272,272,263,272,272,272,272,272,272,272,272,272],
        [272,272,272,272,272,240,288,242,272,272,272,272,272,272,272,272],
        [301,301,301,301,301,326,261,325,301,301,301,301,301,301,301,301],
        [272,272,272,272,272,260,261,262,272,272,272,272,272,272,272,272],
        [272,272,272,272,272,280,268,282,272,272,272,272,272,272,272,272],
        [272,272,272,272,272,272,263,272,272,272,272,272,272,272,272,272],
        [272,272,272,272,272,272,263,272,272,272,272,272,272,272,272,272],
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_floor,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 33;
    tileSize = 32;

    let houses = [
        [0,1,2,3,-1,-1,-1,-1,-1,19,20,21,22,23,24,25],
        [33,34,35,36,-1,-1,-1,-1,-1,52,53,54,55,56,57,58],
        [66,101,68,69,-1,-1,-1,-1,-1,85,86,87,88,89,101,91],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = houses[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize + 12, tileSize, tileSize);
            }
        }
    }

    slow_animation();

    draw_player();
    //Movement + frame of sprites set
    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 70);
        player.frameX = 1;
    }
    draw_screen_borders();
    draw_hud();

    if (player.x > 185 && player.x <210 && player.y < 72 && moveUp) {
        player.y = canvas.height-player.size/2;
        reset_level(request_id);
        townSong.pause();
        townSong.currentTime=0;
        canvas.addEventListener("click", shoot, false);
        forest_1();
    }
    
    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        reset_level(request_id);
        townSong.pause();
        townSong.currentTime=0;
        canvas.addEventListener("click", shoot, false);
        forest_0();
    }

    if (player.x > 345 && player.x <365 && player.y < 74 && moveUp) {
        player.y = canvas.height-player.size*3;
        player.x = canvas.width/2-player.size/2;
        reset_level(request_id);
        shop();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 99 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        castle_gate();
    }

    if (player.x > 165 && player.x <230 && player.y === canvas.height - player.size && moveDown) {
        player.y = 103;
        reset_level(request_id);
        townSong.pause();
        townSong.currentTime=0;
        canvas.addEventListener("click", shoot, false);
        desert_1();
    }
}

/////-------------------LEVEL: SHOP-------------------------------------------------------------------------------------------------------------------
function shop() {
    townSong.play();
    canvas.addEventListener("click", shop_products_hud, false);
    request_id = window.requestAnimationFrame(shop);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    context.clearRect(0, 0, canvas.width, canvas.height);

    slow_animation();

    tilesPerRow = 20;
    tileSize = 32;
    
    let background = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,211,211,211,211,211,211,211,211,211,211,211,211,-1,-1],
        [-1,-1,211,211,211,211,211,211,211,211,211,211,211,211,-1,-1],
        [-1,-1,211,211,211,211,211,211,211,211,211,211,211,211,-1,-1],
        [-1,-1,211,211,211,211,211,211,211,211,211,211,211,211,-1,-1],
        [-1,-1,211,211,211,211,211,211,211,211,211,211,211,211,-1,-1],
        [-1,-1,211,211,211,211,211,211,211,211,211,211,211,211,-1,-1],
        [-1,-1,211,211,211,211,211,211,211,211,211,211,211,211,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,211,211,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_floor,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 33;
    tileSize = 32;

    let decoration = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,154,155,155,156,188,189,187,188,154,155,156,154,-1,-1],
        [-1,-1,187,188,188,189,446,514,482,515,187,188,189,187,-1,-1],
        [-1,-1,414,445,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,611,612,612,612,612,612,612,612,612,613,414,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,610,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,643,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,676,481,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,658,659,-1,-1,-1,-1,,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    draw_player();
    //Movement + frame of sprites set
    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size*3);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size*5+4);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 60);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 135);
        player.frameX = 1;
    }

    //Dialogue with shop-man
    if (player.x > 290 && player.x < 325 && player.y < 138) {
        if (dialogue_counter != 0) {
        context.drawImage(dialogue_boxImage, 5,canvas.height-100,canvas.width-10,95);
        context.fillStyle = "white";  
        context.font = "bold 14px arial";
        context.fillText("Alfred", 35,235)
        context.fillStyle = "black";    
        context.font = "bold 16px arial";
        if (dialogue_counter > 700) {
            context.fillText("Welcome to my beautiful shop, stranger.", 25,270)
        }  else if (dialogue_counter > 500) {
            context.fillText("It is nice to see someone around even if it looks", 25,270)
            context.fillText("as famished as you *coughs*", 25,290)
        } else if (dialogue_counter > 250) {
            context.fillText("Click on the SHOP button to see the products.", 25,270)
        } else if (dialogue_counter > 100) {
            context.fillText("I hope you have money...", 25,270)
        } else {
            context.fillText("...if not you can take the door out.", 25,270)
        }
        dialogue_counter -= 1.5; 
        }
    } else {
        dialogue_counter = 800;
        draw_hud();
    }

    context.drawImage(shop_iconImage, canvas.width-75, 5, 64, 32);

    context.drawImage(oldmanImage,
        0, 0, 32, 32,
        300, 95, 32, 32);


    //Draw shop products
    if (shop_catalogue) {
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0,0,canvas.width, canvas.height);
        let decoration = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,318,318,318,318,318,318,318,318,318,318,318,318,318,318,-1],
            [-1,351,351,351,351,351,351,351,351,351,351,351,351,351,351,-1],
            [-1,351,351,351,351,351,351,351,351,351,351,351,351,351,351,-1],
            [-1,351,351,351,351,351,351,351,351,351,351,351,351,351,351,-1],
            [-1,351,351,351,351,351,351,351,351,351,351,351,351,351,351,-1],
            [-1,351,351,351,351,351,351,351,351,351,351,351,351,351,351,-1],
            [-1,351,351,351,351,351,351,351,351,351,351,351,351,351,351,-1],
            [-1,384,384,384,384,384,384,384,384,384,384,384,384,384,384,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    
        for (let r = 0; r < 10; r += 1) {
            for (let c = 0; c < 16; c += 1) {
                let tile = decoration[r][c];
                if (tile >= 0) {
                    let tileRow = Math.floor(tile / tilesPerRow);
                    let tileCol = Math.floor(tile % tilesPerRow);
                    context.drawImage(tileset_house,
                        tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                        c * tileSize, r * tileSize, tileSize, tileSize);
                }
            }
        }
        draw_hud();
        context.drawImage(close_iconImage, canvas.width-75, 5, 64, 32);
        //Draw shop item boxes
        context.fillStyle = "rgb(255,255,255)";
        context.fillRect(40,70,canvas.width-80, 40);
        context.fillRect(40,120,canvas.width-80, 40);
        context.fillRect(40,170,canvas.width-80, 40);
        context.fillRect(40,220,canvas.width-80, 40);

        //Draw shop items:
        context.font = "bold 12px Arial";
        for (let item in shop_items) {      //Looping through objects: https://www.freecodecamp.org/news/how-to-iterate-over-objects-in-javascript/
            context.drawImage(shop_items[item].image, shop_items[item].x, shop_items[item].y, 32, 32);
            if (shop_items[item].available) {
                context.fillStyle = "black";
                context.fillText(shop_items[item].name, shop_items[item].x+35, shop_items[item].y+10)
                context.fillText(shop_items[item].effect, shop_items[item].x+45, shop_items[item].y+25)
                if (player.coins >= shop_items[item].price ) {
                    context.fillStyle = "green";
                    context.drawImage(buy_iconImage, shop_items[item].x+370, shop_items[item].y, 48, 32);
                } else {
                    context.fillStyle = "red";
                }
                context.fillText(shop_items[item].price + " COINS", shop_items[item].x+240, shop_items[item].y+10)            }
            else {
                context.drawImage(sold_outImage, shop_items[item].x+120, shop_items[item].y, 194, 32);
            }
        }
    }

    if (player.x > 210 && player.x < 282 && player.y === canvas.height - player.size*3 && moveDown) {
        player.y = 74;
        player.x = 350;
        canvas.removeEventListener("click", shop_products_hud, false);
        shop_catalogue = false;
        reset_level(request_id);
        town();
    }
}


/////-------------------LEVEL: DESERT(1)-------------------------------------------------------------------------------------------------------------------
function desert_1() {
    battleSong.play();
    request_id = window.requestAnimationFrame(desert_1);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;

    let background = [
        [110, 110, 110, 110, 110, 110, 110, 113, 110, 110, 110, 110, 22, 24, 110, 110],
        [113, 110, 110, 112, 110, 110, 110, 110, 110, 110, 110, 111, 22, 24, 113, 110],
        [110, 111, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 44, 46, 110, 110],
        [110, 110, 113, 0, 1, 1, 1, 2, 110, 112, 110, 69, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 22, 27, 46, 110, 110, 110, 113, 110, 110, 112, 110],
        [110, 111, 110, 110, 110, 44, 46, 110, 110, 110, 112, 110, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 110, 113, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 110, 110, 110, 111, 112, 110, 110, 110, 112, 110, 110],
        [110, 110, 112, 111, 110, 0, 1, 2, 110, 110, 110, 113, 110, 110, 110, 110],
        [114, 110, 110, 111, 113, 22, 23, 24, 112, 110, 110, 110, 110, 111, 114, 110]
    ];    
    

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 20;
    tileSize = 32;
    
    let wall = [
        [141,141,141,141,141,141,141,141,141,141,141,141,141,141,141,141],
        [141,141,141,141,141,124,128,127,141,141,141,141,141,141,141,141],
        [141,141,141,141,141,143,220,143,141,141,141,141,141,141,141,141],
        [141,141,141,141,141,143,222,143,141,141,141,141,141,141,141,141],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = wall[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_floor,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [135,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,134],
        [151,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,150],
        [135,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [151,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
        [197,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [213,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
        [197,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,134]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_enemy_direction();
    update_bullet_position();
    slow_animation();

    draw_player();
    draw_screen_borders();
    draw_hud();


    player_enemy_collision();

    //Movement + frame of sprites set
    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 102);
        player.frameX = 1;
    }

    if (player.x > 185 && player.x <210 && player.y < 103 && moveUp) {
        battleSong.pause();
        battleSong.currentTime = 0;
        player.y = canvas.height;
        reset_level(request_id)
        town();
    }

    if (player.x > 160 && player.x <230 && player.y === canvas.height - player.size && moveDown) {
        player.y = 0;
        reset_level(request_id);
        townSong.pause();
        townSong.currentTime=0;
        canvas.addEventListener("click", shoot, false);
        desert_2();
    }
}

/////-------------------LEVEL: DESERT(2)-------------------------------------------------------------------------------------------------------------------
function desert_2() {
    battleSong.play();
    request_id = window.requestAnimationFrame(desert_2);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_1) {
            create_skeleton();
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;

    let background = [
        [110, 110, 110, 110, 110, 22, 23, 24, 110, 110, 110, 110, 110, 110, 110, 110],
        [113, 110, 110, 110, 110, 22, 23, 24, 110, 110, 110, 110, 112, 110, 114, 110],
        [110, 110, 110, 110, 110, 22, 23, 24, 110, 110, 110, 110, 110, 110, 110, 110],
        [110, 110, 112, 110, 110, 22, 23, 49, 1, 1, 1, 1, 1, 1, 1, 1],
        [110, 110, 110, 110, 110, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23],
        [110, 110, 110, 110, 110, 44, 45, 45, 45, 45, 45, 45, 45, 45, 45, 45],
        [110, 114, 110, 110, 110, 110, 110, 110, 110, 110, 110, 113, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 110, 110, 110, 114, 110, 110, 110, 110, 110, 110, 110],
        [110, 110, 110, 113, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 114, 110]
      ];    

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_enemy_direction();
    update_bullet_position();
    slow_animation();

    draw_player();
    draw_screen_borders();

    player_enemy_collision();

    hero_movement();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [213,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
        [214,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,134],
        [197,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,150],
        [213,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [135,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [151,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [197,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [213,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
        [197,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [213,196,197,134,135,196,197,196,197,196,197,134,135,196,197,212],
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    draw_hud();

    if (player.x > 185 && player.x <210 && player.y === 0 && moveUp) {
        player.y = canvas.height;
        reset_level(request_id)
        desert_1();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 80 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        desert_3();
    }
}

/////-------------------LEVEL: DESERT(3)-------------------------------------------------------------------------------------------------------------------
function desert_3() {
    if (desert_orb) {
        windSound.play();
        battleSong.pause();
        battleSong.currentTime = 0;
    } else {
        windSound.pause();
        battleSong.play();
    }
    request_id = window.requestAnimationFrame(desert_3);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (desert_orb) {
        if (create_level_enemies) {
            while (enemy_counter < 20) {
                create_skeleton();
                enemy_counter += 1;
                if (enemy_counter > 12) {
                    create_knight();
                    enemy_counter += 1;
                }
            }
            create_beast();
            create_level_enemies = false;
            console.log("true");
        }
    }

    if (enemies.length === 0 && desert_orb) {
        desert_orb = false;
        successSound.play();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;

    let background = [
        [110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [113, 110, 110, 114, 110, 110, 110, 110, 110, 110, 110, 114, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 110, 114, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [ 1, 2, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [ 23, 24, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [ 45, 46, 110, 110, 110, 110, 110, 110, 110, 114, 110, 110, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110],
        [110, 110, 110, 110, 110, 114, 110, 110, 110, 110, 110, 110, 110, 114, 110, 110],
        [110, 110, 110, 110, 110, 110, 114, 110, 110, 110, 114, 110, 110, 110, 110, 110],
      ];    

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();


    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [213,212,213,212,213,212,213,214,212,213,212,213,150,151,214,212],
        [135,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,214],
        [151,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
        [197,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [213,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
        [197,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,196],
        [213,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,212],
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_enemy_direction();
    update_bullet_position();
    slow_animation();

    draw_player();
    draw_screen_borders();
    draw_hud();

    player_enemy_collision();

    hero_movement();

    //Draw desert orb and rocks
    tilesPerRow = 16;
    tileSize = 32;

    let orb_rocks = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,93,94,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,108,109,110,111,-1,-1,-1,-1,-1,-1,-1],
        [-1,196,197,196,197,124,125,126,127,196,197,196,197,196,197,-1],
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = orb_rocks[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize+14, tileSize, tileSize);
            }
        }
    }

    //Pillar
    tilesPerRow = 33;
    tileSize = 32;

    let pillar = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,627,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,693,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = pillar[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize-17, r * tileSize-25, tileSize, tileSize);
            }
        }
    }

    //Orb
    tilesPerRow = 9;
    tileSize = 32;

    let dungeon;
    if (desert_orb) {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,24,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    } else {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,21,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    }

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = dungeon[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_dungeon,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize-17, r * tileSize-25, tileSize, tileSize);
            }
        }
    }

    //Create power particles while mountain orb is active
    if (desert_orb) {
        let colours = ["darkred","orange","wheat"]

        for (let i = 0; i < 50; i += 1) {
            let p = {
                x : 223,
                y : 200,
                size : 1.1,
                xChange : randint(-10, 10),
                yChange : randint(-10, 10),
                colour : colours[randint(0,3)]
            }
            orb_particles.push(p);
        }
    }

    //Draw and update particles
    for (let p of orb_particles) {
        context.fillStyle = p.colour;
        context.fillRect(p.x, p.y, p.size, p.size);
    }

    for (let p of orb_particles) { 
        if (p.yChange === 0) {
            p.yChange = 1;
        } else if (p.xChange === 0) {
            p.xChange = 1;
        }
        p.x = p.x + p.xChange;
        p.y = p.y + p.yChange;
        p.yChange = p.yChange + 0.5;
    }

    for (let i = 0; i < orb_particles.length; i++) {
        let p = orb_particles[i];
        if (p.y > canvas.height || p.x < 0 || p.x > canvas.width) {
            orb_particles.splice(i, 1);
            i -= 1;
        }
    }

    if (player.x < 21 && player.y > 80 && player.y < 180 && moveLeft) {
        player.x = canvas.width-player.size;
        windSound.pause();
        reset_level(request_id);
        desert_2();
    }
}

/////-------------------LEVEL: FOREST(1)-------------------------------------------------------------------------------------------------------------------
function forest_1() {
    battleSong.play();
    request_id = window.requestAnimationFrame(forest_1);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_1) {
            create_skeleton();
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;

    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 187, 189, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 187, 189, 278, 275],
        [275, 276, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 209, 211, 275, 275],
        [275, 275, 278, 165, 166, 166, 166, 167, 275, 277, 275, 234, 275, 275, 275, 275],
        [275, 275, 275, 187, 253, 188, 192, 211, 275, 275, 275, 278, 275, 275, 277, 275],
        [275, 276, 275, 209, 210, 210, 211, 275, 275, 275, 277, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 277, 275, 275],
        [275, 275, 277, 276, 275, 165, 166, 167, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 187, 188, 189, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();


    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,17,16,17,174,16,17,18,19,174,18,19,-1,-1,16,17],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_enemy_direction();
    update_bullet_position();
    slow_animation();

    draw_player();
    draw_screen_borders();
    draw_hud();


    player_enemy_collision();

    hero_movement();

    if (player.x > 185 && player.x <210 && player.y === canvas.height-player.size && moveDown) {
        battleSong.pause();
        battleSong.currentTime = 0;
        player.y = 70;
        reset_level(request_id)
        town();
    }

    if (player.x > 350 && player.x <450 && player.y === 0 && moveUp) {
        player.y = canvas.height-player.size/2;
        reset_level(request_id)
        forest_2();
    }
}

/////-------------------LEVEL: FOREST(2)-------------------------------------------------------------------------------------------------------------------
function forest_2() {
    battleSong.play();
    request_id = window.requestAnimationFrame(forest_2);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_2) {
            create_skeleton();
            create_knight();
            enemy_counter += 2;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 279, 277, 275, 275, 275, 275, 278, 275, 275, 275, 277, 276, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 276, 275],
        [275, 275, 278, 165, 166, 167, 279, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [166, 166, 166, 215, 254, 214, 166, 167, 275, 275, 275, 276, 275, 275, 165, 166],
        [209, 210, 210, 210, 210, 210, 210, 211, 275, 279, 275, 275, 275, 275, 209, 210],
        [275, 275, 275, 276, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 275, 278, 165, 167, 275, 275, 275],
        [275, 275, 279, 275, 275, 275, 275, 275, 275, 275, 275, 187, 189, 275, 275, 275],
        [279, 275, 276, 275, 278, 275, 275, 275, 277, 277, 275, 187, 189, 275, 277, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();


    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [19,16,17,18,19,18,19,174,16,17,18,19,16,17,174,0],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [175,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [175,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    

    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();
    draw_player();
    draw_hud();
    draw_screen_borders();
    player_enemy_collision();
    update_enemy_direction();

    hero_movement();

    if (player.x > 350 && player.x <450 && player.y === canvas.height-player.size && moveDown) {
        reset_level(request_id);
        player.y = 0;
        forest_1();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        battleSong.pause();
        battleSong.currentTime = 0;
        reset_level(request_id);
        forest_S1();
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        reset_level(request_id);
        forest_3();
    }
}


/////-------------------LEVEL: FOREST(S1)-------------------------------------------------------------------------------------------------------------------
function forest_S1() {
    lost_forestSong.play();
    request_id = window.requestAnimationFrame(forest_S1);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_S1) {
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [166, 167, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [210, 211, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,16,17,18,19,18,19,-1,-1,174,18,19,16,17,174,0],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    hero_movement();

    if (player.y === canvas.height-player.size && moveDown) {
        reset_level(request_id);
        player.y = 0;
        forest_B1();
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        player.x = canvas.width;
        reset_level(request_id);
        forest_2();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_S2();
    }

    if (player.x > 225 && player.x <270 && player.y === 0 && moveUp) {
        player.y = canvas.height-player.size/2;
        reset_level(request_id)
        forest_S1();
    }
}

/////-------------------LEVEL: FOREST(B1)-------------------------------------------------------------------------------------------------------------------
function forest_B1() {
    lost_forestSong.play();
    request_id = window.requestAnimationFrame(forest_B1);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_B1) {
            create_skeleton();
            create_skeleton();
            create_beast();
            enemy_counter += 3;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 278, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 277, 275, 275, 275, 278, 275, 275, 275, 275, 277, 275],
        [275, 275, 275, 275, 275, 275, 276, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [275, 276, 275, 275, 275, 275, 275, 275, 275, 275, 277, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 279, 275, 278, 275, 275, 275, 275, 275, 276, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 277, 276, 275, 275, 275, 275, 278, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 275, 276, 278, 275, 275, 275, 279, 275, 275, 275, 275, 277, 275, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    hero_movement();

    if (player.y === canvas.height-player.size && moveDown) {
        reset_level(request_id);
        player.y = 0;
        forest_B2();
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        reset_level(request_id);
        forest_2();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_S2();
    }
}

/////-------------------LEVEL: FOREST(B2)-------------------------------------------------------------------------------------------------------------------
function forest_B2() {
    lost_forestSong.play();
    request_id = window.requestAnimationFrame(forest_B2);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_B2) {
            create_skeleton();
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [275, 278, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 279],
        [275, 275, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [0,1,0,1,2,3,0,1,2,3,2,3,2,3,0,1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    

    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size*2);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 0);
        player.frameX = 1;
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        reset_level(request_id);
        forest_2();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_S1();
    }
}

/////-------------------LEVEL: FOREST(S2)-------------------------------------------------------------------------------------------------------------------
function forest_S2() {
    lost_forestSong.play();
    request_id = window.requestAnimationFrame(forest_S2);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_S2) {
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 278, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 277, 275, 275, 275, 278, 275, 275, 275, 275, 277, 275],
        [275, 275, 275, 275, 275, 275, 276, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [275, 276, 275, 275, 275, 275, 275, 275, 275, 275, 277, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 279, 275, 278, 275, 275, 275, 275, 275, 276, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 277, 276, 275, 275, 275, 275, 278, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 275, 276, 278, 275, 275, 275, 279, 275, 275, 275, 275, 277, 275, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,16,17,18,19,18,19,-1,-1,174,18,19,16,17,174,0],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    hero_movement();

    if (player.y === canvas.height-player.size && moveDown) {
        reset_level(request_id);
        player.y = 0;
        forest_B2();
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        reset_level(request_id);
        forest_2();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_B4();
    }

    if (player.x > 225 && player.x <270 && player.y === 0 && moveUp) {
        player.y = canvas.height-player.size/2;
        reset_level(request_id)
        forest_S3();
    }
}


/////-------------------LEVEL: FOREST(B4)-------------------------------------------------------------------------------------------------------------------
function forest_B4() {
    lost_forestSong.play();
    request_id = window.requestAnimationFrame(forest_B4);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_B4) {
            create_beast();
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [275, 278, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 279],
        [275, 275, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,16,17,18,19,18,19,-1,-1,174,18,19,16,17,174,0],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    hero_movement();

    if (player.y === canvas.height-player.size && moveDown) {
        reset_level(request_id);
        player.y = 0;
        forest_S1();
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        reset_level(request_id);
        forest_2();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_S1();
    }

    if (player.x > 225 && player.x <270 && player.y === 0 && moveUp) {
        player.y = canvas.height-player.size*1.5;
        reset_level(request_id)
        forest_B5();
    }
}


/////-------------------LEVEL: FOREST(B5)-------------------------------------------------------------------------------------------------------------------
function forest_B5() {
    lost_forestSong.play();
    request_id = window.requestAnimationFrame(forest_B5);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_B5) {
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [19,16,17,18,19,18,19,18,19,18,19,16,17,18,19,0],
        [3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [1,0,1,0,1,0,1,-1,-1,0,1,0,1,0,1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size*2);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 0);
        player.frameX = 1;
    }

    if (player.x > 225 && player.x <270 && player.y === canvas.height-player.size*2 && moveDown) {
        reset_level(request_id);
        player.y = 0;
        forest_S1();
    }
}


/////-------------------LEVEL: FOREST(S3)-------------------------------------------------------------------------------------------------------------------
function forest_S3() {
    lost_forestSong.play();
    request_id = window.requestAnimationFrame(forest_S3);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_S3) {
            create_beast();
            create_skeleton();
            create_skeleton();
            enemy_counter += 3;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [275, 278, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 279],
        [275, 275, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [1,16,17,18,19,18,19,-1,-1,174,18,19,16,17,174,0],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    hero_movement();

    if (player.y === canvas.height-player.size && moveDown) {
        reset_level(request_id);
        player.y = 0;
        forest_S2();
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        reset_level(request_id);
        forest_2();
    }

    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_S1();
    }

    if (player.x > 225 && player.x <270 && player.y === 0 && moveUp) {
        player.y = canvas.height-player.size/2;
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        reset_level(request_id)
        forest_ALTAR();
    }
}

/////-------------------LEVEL: FOREST(ALTAR)-------------------------------------------------------------------------------------------------------------------
function forest_ALTAR() {
    mysticalSong.play();
    request_id = window.requestAnimationFrame(forest_ALTAR);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [19,18,19,18,19,18,19,18,19,18,19,18,19,18,19,18],
        [2,3,2,3,2,3,288,289,290,2,3,2,3,2,3,2],
        [18,19,18,19,18,19,304,305,306,18,19,18,19,18,19,18],
        [2,3,-1,-1,-1,-1,320,321,322,-1,-1,-1,-1,-1,2,3],
        [18,19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,19],
        [2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3],
        [18,19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,19],
        [2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3],
        [18,19,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,19],
        [2,3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,3]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    update_bullet_position();
    slow_animation();

    draw_screen_borders();

    player_enemy_collision();

    if (!player.magic_item && player.x > 215 && player.x < 242 && player.y === 120 ) {
            dialogue_counter -=1;
        }

    if (dialogue_counter < 0) {
        dialogue_counter = 800;
    } else if (dialogue_counter != 800) {
        context.fillStyle = "rgb(0,0,0,1)"; 
        context.fillRect(0,0,192, canvas.height);
        context.fillRect(190,0,125,30);
        context.fillRect(288,0,canvas.width,canvas.height);
        context.fillRect(190,canvas.height-100,125,canvas.height);
        context.drawImage(text_boxImage, 5,canvas.height-90,canvas.width-10,85);
        context.fillStyle = "blue"; 
        context.font = "italic bold 15px arial";
        if (dialogue_counter > 700) {
            context.fillStyle = "black";
            context.font = "bold 15px arial";
            context.fillText("A MAGIC POWER EMANATES FROM THE ELDEST TREE!!!", 25,270)
        }  else if (dialogue_counter > 620) {
            context.fillText('OH, HERO FROM FAR LANDS...', 25,270)
        } else if (dialogue_counter > 490) {
            context.fillText("OUR WORLD HAS BEEN SUFFERING FROM THE WRATH", 25,270)
            context.fillText("OF THE DARK LORD.", 25,290)
        } else if (dialogue_counter > 340) {
            context.fillText("100 YEARS AGO HE FOUND ME. HE SWORE TO HAVE PURE", 25,270)
            context.fillText("INTENTIONS TO MAKE A BETTER WORLD...", 25,290)
        } else if (dialogue_counter > 190) {
            context.fillText("MISTAKENLY, I GIFTED HIM PART OF MY POWER, WHICH WAS", 25,270)
            context.fillText("USED TO POPULATE THIS LAND WITH TERRIBLE MONSTERS.", 25,290)
        } else if (dialogue_counter > 130) {
            player.magic_item = true;
            player.health = player.max_health;
            context.fillStyle = "black";
            context.font = "bold 15px arial";
            context.fillText("Press the 'SPACE' key to release your new power.", 25,270)
        } else if (dialogue_counter > 70) {
            context.fillStyle = "black"; 
            context.font = "bold 15px arial";
            context.fillText("Your magic will replenish over time.", 25,270)
        } else {
            context.fillText("PLEASE, USE MY POWER WISELY...", 25,270)
            context.fillText("                               OUR WORLD IS IN YOUR HANDS...", 25,290)
        }
        dialogue_counter -= 0.4; 
        spell_casting();
    }

    draw_player();

    if (dialogue_counter === 800) {
        draw_hud()
        //Movement + frame of sprites set
        if (moveDown) {
            player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
            player.frameX = 0;
        }
        if (moveRight) {
            player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 55);
            player.frameX = 3;
        }
        if (moveLeft) {
            player.x = Math.max(player.x - player.xChange, 55);
            player.frameX = 2;
        }
        if (moveUp) {
            player.y = Math.max(player.y - player.yChange, 120);
            player.frameX = 1;
        }
    }

    if (player.y === canvas.height-player.size && moveDown) {
        player.y = 0;
        dialogue_counter = 800;
        mysticalSong.pause();
        mysticalSong.currentTime = 0;
        reset_level(request_id);
        player.magic = player.max_magic;
        forest_2();
    }
}

/////-------------------LEVEL: FOREST(3)-------------------------------------------------------------------------------------------------------------------
function forest_3() {
    if (transition === 0) {
        battleSong.play();
    } else {
        battleSong.pause();     //Pauses the song if the player burns the spikes that block the access to the mountain
    }
    request_id = window.requestAnimationFrame(forest_3);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_3) {
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [166, 166, 166, 166, 166, 166, 166, 166, 166, 166, 166, 166, 166, 166, 166, 166],
        [210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210, 210],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;
    let decoration;
    if (mountain_blocked) {
        decoration = [
            [9,24,25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
            [25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
            [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
            [25,148,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
            [148,148,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [9,148,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
            [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
            [25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
            [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
        ]
    } else {
        decoration = [
            [9,24,25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
            [25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
            [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
            [25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
            [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
            [25,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
            [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16]
        ]
    }

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    //house
    tilesPerRow = 33;
    tileSize = 32;

    let decoration2 = [
        [-1,-1,-1,-1,-1,-1,-1,-1,289,290,291,292,-1,-1,-1,-1],
        [-1,-1,-1,526,527,-1,-1,-1,322,323,324,325,-1,-1,593,-1],
        [-1,176,141,-1,-1,-1,-1,-1,421,422,423,424,-1,625,626,-1],
        [-1,-1,173,176,176,176,176,176,454,100,456,457,176,176,176,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = decoration2[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    draw_screen_borders();

    if (mountain_blocked) {
        context.drawImage(shadowImage, 39, 224, 24, 14);
        context.drawImage(lumberjackImage,
            96, 0, 32, 32,
            35, 200, 32, 32);
        //Dialogue with lumberjack (mountain blocked)
        if (player.x === 64 && player.y < 210 && player.y > 190) {
            if (dialogue_counter != 0) {
            context.drawImage(dialogue_boxImage, 5,canvas.height-77,canvas.width-10,75);
            context.fillStyle = "white";  
            context.font = "bold 13px arial";
            context.fillText("Steve", 35,256)
            context.fillStyle = "black";    
            context.font = "bold 16px arial";
            if (dialogue_counter > 700) {
                context.fillText("Hi! You don't seem from around here... My name is Steve.", 25,280);
            }  else if (dialogue_counter > 500) {
                context.fillText("The access to the mountain has been blocked by this", 25,280);
                context.fillText("magical spikes for a long, long time.", 25,300);
            } else if (dialogue_counter > 250) {
                context.fillText("The legends say that the forgotten forest had an old tree", 25,280);
                context.fillText("with magic like the one that was used here.", 25,300);
            } else if (dialogue_counter > 100) {
                context.fillText("The problem is that the forest is hard to navigate.", 25,280);
                context.fillText("No-one has ever come out alive from it...", 25,300);
            } else {
                context.fillText("Anyway, these days it's dangerous to go anywhere!", 25,280);
            }
            dialogue_counter -= 1; 
            }
        } else {
            dialogue_counter = 800;
            draw_hud();
        }
    } else {
        context.drawImage(shadowImage, 44, 119, 24, 14);
        context.drawImage(lumberjackImage,
            0, 0, 32, 32,
            40, 95, 32, 32);
        //Dialogue with lumberjack (mountain open)
        if (player.x > 25 && player.x < 70 && player.y < 110) {
            if (dialogue_counter != 0) {
            context.drawImage(dialogue_boxImage, 5,canvas.height-77,canvas.width-10,75);
            context.fillStyle = "white";  
            context.font = "bold 13px arial";
            context.fillText("Steve", 35,256)
            context.fillStyle = "black";    
            context.font = "bold 16px arial";
            if (dialogue_counter > 650) {
                context.fillText("THAT WAS INCREDIBLE!", 25,280);
            }  else if (dialogue_counter > 500) {
                context.fillText("It seems like you went to the forgotten forest after all.", 25,280);
            } else if (dialogue_counter > 350) {
                context.fillText("The mountain is finally free to go up.", 25,280);
            } else if (dialogue_counter > 100) {
                context.font = "italic bold 13px arial";
                context.fillText("Only a lunatic would go there though...", 25,280);
            } else {
                context.fillText("I mean... GOOD LUCK!", 25,280);
            }
            dialogue_counter -= 2; 
            }
        } else {
            dialogue_counter = 800;
            draw_hud();
        }
    }

    //Remove blocking spikes from mountain (fade to white animation)
    if (mountain_blocked && player.x > 60 && player.x < 120 && player.y > 90 && player.y < 180 && spell.active != 0 && player.magic_item) {
        if (transition != spell.duration-10) {
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
                //Draw magic and player over white transition:
                context.fillStyle = spell.colours[anim_speed]
                context.fillRect(player.x +player.size/2 - spell.area/2, player.y+15 + player.size/2 - spell.area/2, spell.area, spell.area)
                context.drawImage(magicImage,
                    160 * frameX, 0, spell.area, spell.area,
                    player.x+player.size/2 - spell.area/2-18, player.y + player.size/2 - spell.area/2-4, spell.area+27, spell.area+27);
                if ((anim_speed === 4)) {
                    frameX = (frameX + 1) % 6;
                }
                draw_player();
            transition += 1;
            console.log(transition, spell.active, spell.duration);
        } else {
            successSound.play();
            mountain_blocked = false;
            transition = 0;
        }
    }

    draw_player();
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_enemy_direction();
    update_bullet_position();
    slow_animation();

    player_enemy_collision();

    if (mountain_blocked) {
        //Movement + frame of sprites set
        if (moveDown) {
            player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
            player.frameX = 0;
        }
        if (moveRight) {
            player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
            player.frameX = 3;
        }
        if (moveLeft) {
            player.x = Math.max(player.x - player.xChange, 64);
            player.frameX = 2;
        }
        if (moveUp) {
            player.y = Math.max(player.y - player.yChange, 105);
            player.frameX = 1;
        }
    } else {
        if (moveDown) {
            player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
            player.frameX = 0;
        }
        if (moveRight) {
            player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
            player.frameX = 3;
        }
        if (moveLeft) {
            player.x = Math.max(player.x - player.xChange, 20);
            player.frameX = 2;
        }
        if (moveUp) {
            player.y = Math.max(player.y - player.yChange, 105);
            player.frameX = 1;
        }
    }


    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_2();
    }

    if (player.x === 20 && player.y > 100 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        reset_level(request_id);
        mountain_1();
    }
}


/////-------------------LEVEL: MOUNTAIN(1)-------------------------------------------------------------------------------------------------------------------
function mountain_1() {
    battleSong.play();
    request_id = window.requestAnimationFrame(mountain_1);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.mountain_1) {
            create_cyclope();
            create_skeleton();
            enemy_counter += 4;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [418, 418, 418, 418, 418, 418, 418, 330, 332, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 419, 418, 418, 418, 418, 352, 354, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 419, 418, 421, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 421, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 420, 418, 418, 418, 418, 418, 418, 418, 418, 418, 308, 309],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 352, 353],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 420, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [9,26,27,26,27,26,27,-1,-1,26,27,26,27,26,27,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1], 
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    hero_movement();


    if (player.x === canvas.width-player.size-20 && player.y > 100 && player.y < 180 && moveRight) {
        player.x = 0;
        reset_level(request_id);
        forest_3();
    }

    if (player.x > 225 && player.x <270 && player.y === 0 && moveUp) {
        player.y = canvas.height-player.size/2;
        reset_level(request_id)
        mountain_2();
    }
}

/////-------------------LEVEL: MOUNTAIN(2)-------------------------------------------------------------------------------------------------------------------
function mountain_2() {
    battleSong.play();
    request_id = window.requestAnimationFrame(mountain_2);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.mountain_1) {
            create_cyclope();
            create_knight();
            create_skeleton();
            enemy_counter += 4;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [418, 418, 418, 418, 418, 418, 418, 330, 332, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 422, 418, 418, 418, 352, 354, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 419, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418],
        [418, 419, 418, 418, 421, 418, 418, 418, 418, 418, 421, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418],
        [418, 420, 418, 418, 418, 418, 419, 418, 418, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 421, 418, 308, 310, 418, 418, 418, 420, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 330, 332, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 330, 332, 418, 418, 418, 418, 418, 418, 418]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [9,26,27,26,27,26,27,-1,-1,26,27,26,27,26,27,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8], 
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    hero_movement();

    if (player.x > 225 && player.x <270 && player.y === 0 && moveUp) {
        player.y = canvas.height-player.size/2;
        lost_forestSong.pause();
        lost_forestSong.currentTime = 0;
        reset_level(request_id)
        mountain_3();
    }

    if (player.y === canvas.height-player.size && player.x > 220 && player.x < 265 && moveDown) {
        player.y = 0;
        reset_level(request_id);
        mountain_1();
    }
}


/////-------------------LEVEL: MOUNTAIN(3)-------------------------------------------------------------------------------------------------------------------
function mountain_3() {
    if (mountain_orb) {
        windSound.play();
        battleSong.pause();
        battleSong.currentTime = 0;
    } else {
        windSound.pause();
        battleSong.play();
    }
    request_id = window.requestAnimationFrame(mountain_3);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (mountain_orb) {
        if (create_level_enemies) {
            let x = 180;
            while (enemy_counter < 2) {
                let e = {
                    type : "cyclope",
                    x : x,
                    y : 100,
                    size : 32,
                    initial_health : 90,
                    health : 90,
                    damage : 8,
                    shoot_damage : 0.3,
                    xChange : 0,
                    yChange : 0,
                    frameX : 0,
                    frameY : 0,
                    idle_time : randint(140,170),   //Time (in frames) until starting charge
                    shoot_time : 30,    //Time (in frames) until charges against character
                    set_dir : false
                } 
                enemies.push(e);
                enemy_counter += 1;
                x += 150;
            }
            create_level_enemies = false;
            console.log("true");
        }
    }

    if (enemies.length === 0 && mountain_orb) {
        mountain_orb = false;
        successSound.play();
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.drawImage(night_skyImage, 0, 0, 1280, 720,
        0,-40, canvas.width, 288)

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,418,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,418, 418, 418, 418, 418, 418, 418,-1,-1,-1,-1],
        [418, 418, 418, 418, 420, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 418, 418, 418, 420, 418, 418, 418, 418, 418],
        [418, 418, 418, 418, 418, 421, 418, 308, 310, 418, 418, 418, 420, 418, 418, 418],
        [418, 418, 418, 418, 418, 418, 418, 330, 332, 418, 418, 418, 418, 418, 418, 418]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    context.fillStyle = "rgb(0,0,150,0.1)";
    context.fillRect(0,160,canvas.width, canvas.height);

    spell_casting();

    tilesPerRow = 11;
    tileSize = 32;

    let hole = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1, 3,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1, 0, 1, 1, 14, 1, 1, 2, -1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = hole[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_hole,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8], 
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8],
        [27,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,26],
        [9,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,8]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize+20, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 33;
    tileSize = 32;

    let background2 = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,627,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,693,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background2[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize+5, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 9;
    tileSize = 32;

    let dungeon;

    if (mountain_orb) {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,22,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    } else {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,21,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    }

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = dungeon[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_dungeon,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize+5, tileSize, tileSize);
            }
        }
    }

    //Create power particles while mountain orb is active
    if (mountain_orb) {
        let colours = ["blue","lightblue","white"]

        for (let i = 0; i < 20; i += 1) {
            let p = {
                x : 272,
                y : 45,
                size : 1.1,
                xChange : randint(-10, 10),
                yChange : randint(-10, 10),
                colour : colours[randint(0,3)]
            }
            orb_particles.push(p);
        }
    }

    //Draw and update particles
    for (let p of orb_particles) {
        context.fillStyle = p.colour;
        context.fillRect(p.x, p.y, p.size, p.size);
    }

    for (let p of orb_particles) { 
        if (p.yChange === 0) {
            p.yChange = 1;
        } else if (p.xChange === 0) {
            p.xChange = 1;
        }
        p.x = p.x + p.xChange;
        p.y = p.y + p.yChange;
        p.yChange = p.yChange + 0.3;
    }

    for (let i = 0; i < orb_particles.length; i++) {
        let p = orb_particles[i];
        if (p.y > 158 || p.x < 0 || p.x > canvas.width) {
            orb_particles.splice(i, 1);
            i -= 1;
        }
    }



    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 150);
        player.frameX = 1;
    }


    if (player.y === canvas.height-player.size && player.x > 220 && player.x < 265 && moveDown) {
        player.y = 0;
        reset_level(request_id);
        mountain_2();
    }
}


/////-------------------LEVEL: Castle gate-------------------------------------------------------------------------------------------------------------------
function castle_gate() {
    if (mountain_orb || desert_orb) {
        townSong.play();
    }
    else {
        townSong.pause();
        townSong.currentTime=0;
        windSound.play();
    }
    request_id = window.requestAnimationFrame(castle_gate);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_S1) {
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [166, 167, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [210, 211, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 33;
    tileSize = 32;

    let background2 = [
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,627,538,539,539,539,539,540,627,-1,-1,-1,-1],
        [-1,-1,-1,-1,660,538,539,539,539,539,540,660,-1,-1,-1,-1],
        [-1,-1,-1,-1,693,571,572,572,572,572,573,693,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background2[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [2,3,-1,18,19,-1,-1,-1,-1,-1,-1,18,19,2,3,158],
        [18,19,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,19,174],
        [0,1,16,17,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,2],
        [16,17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16,17,-1,18],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,16],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18],
        [3,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0],
        [19,2,3,2,3,0,1,2,3,0,1,0,1,2,3,16]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 9;
    tileSize = 32;

    let dungeon;

    if (mountain_orb && desert_orb) {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,24,-1,-1,-1,-1,-1,-1,22,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    } else if (mountain_orb && !desert_orb) {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,21,-1,-1,-1,-1,-1,-1,22,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    } else if (!mountain_orb && desert_orb) {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,24,-1,-1,-1,-1,-1,-1,21,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    } else {
        dungeon = [
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,21,-1,-1,-1,-1,-1,-1,21,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
            [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]
    }

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = dungeon[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_dungeon,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    if (mountain_orb || desert_orb) {
        let colours = ["red", "white", "black"];
        context.strokeStyle = colours[anim_speed % 3];
        context.lineWidth = 3;
        for (let i = 70; i < 120; i += 10) {
            context.beginPath();
            context.moveTo(150, i);
            context.lineTo(360, i);
            context.stroke();
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    //Movement + frame of sprites set
    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size*2);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 100);
        player.frameX = 1;
    }


    if (player.x === 20 && player.y > 99 && player.y < 180 && moveLeft) {
        player.x = canvas.width;
        reset_level(request_id);
        windSound.pause();
        windSound.currentTime=0;
        town();
    }

    if (player.x > 167 && player.x < 315 && player.y === 100 && moveUp && !mountain_orb && !desert_orb) {
        player.y = canvas.height-player.size/2;
        reset_level(request_id);
        townSong.pause();
        townSong.currentTime=0;
        canvas.addEventListener("click", shoot, false);
        castle_1();
    }
}


/////-------------------LEVEL: Castle(1)-------------------------------------------------------------------------------------------------------------------
function castle_1() {
    windSound.play();
    request_id = window.requestAnimationFrame(castle_1);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        stop();
    }

    player.continuous_damage = false;

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }

    //Create enemies
    if (create_level_enemies) {
        while (enemy_counter < max_enemies.forest_S1) {
            enemy_counter += 1;
        }
        create_level_enemies = false;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 275, 275, 275],
        [278, 275, 275, 277, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 275, 275, 275, 275, 276, 275, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [275, 276, 275, 275, 275, 275, 277, 275, 275, 275, 277, 275, 275, 275, 278, 275],
        [275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275, 275, 278, 275, 275, 275],
        [275, 275, 275, 275, 275, 275, 275, 275, 276, 277, 275, 275, 275, 275, 275, 275],
        [275, 275, 277, 276, 275, 275, 275, 275, 275, 275, 275, 278, 275, 275, 275, 275],
        [279, 275, 275, 276, 278, 275, 275, 275, 277, 275, 275, 275, 275, 276, 279, 275]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_field,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 20;
    tileSize = 32;
    
    let wall = [
        [32,34,32,32,91,32,32,32,32,32,32,32,32,32,34,32],
        [32,34,91,32,32,32,32,32,32,32,32,32,32,91,34,32],
        [32,34,32,32,32,32,32,32,32,32,32,32,32,32,34,32],
        [32,54,32,91,32,32,32,32,32,32,32,91,32,32,54,32],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = wall[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_floor,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 33;
    tileSize = 32;

    let background2 = [
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,538,539,539,539,539,540,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,627,538,539,539,539,539,540,627,-1,-1,-1,-1],
        [-1,-1,-1,-1,660,538,539,539,539,539,540,660,-1,-1,-1,-1]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background2[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 16;
    tileSize = 32;

    let decoration = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2],
        [17,-1,2,3,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,18],
        [3,-1,18,19,-1,-1,-1,-1,-1,-1,-1,-1,16,17,141,142],
        [19,-1,-1,2,3,-1,-1,-1,-1,-1,-1,2,3,-1,-1,158],
        [2,3,-1,18,19,-1,-1,-1,-1,-1,-1,18,19,2,3,158],
        [18,19,0,1,-1,-1,-1,-1,-1,-1,-1,-1,-1,18,19,174],
        [0,1,16,17,-1,-1,-1,-1,-1,-1,-1,-1,0,1,-1,2]
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = decoration[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_nature,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    spell_casting();

    tilesPerRow = 9;
    tileSize = 32;

    let dungeon = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,21,-1,-1,-1,-1,-1,-1,21,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1]
        ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 22; c += 1) {
            let tile = dungeon[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_dungeon,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }
    
    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();

    draw_player();
    
    draw_hud();
    draw_screen_borders();

    player_enemy_collision();

    update_enemy_direction();

    //Movement + frame of sprites set
    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, 310);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 170);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 20);
        player.frameX = 1;
    }

    if (player.y === 20 && moveUp) {
        player.y = canvas.height-player.size/2;
        reset_level(request_id);
        castle_2();
    }

    if (player.y === canvas.height-player.size && moveDown) {
        player.y = 100;
        reset_level(request_id);
        windSound.pause();
        castle_gate();
    }
}

/////-------------------LEVEL: CASTLE(2)-------------------------------------------------------------------------------------------------------------------
function castle_2() {
    windSound.play();
    request_id = window.requestAnimationFrame(castle_2);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    if (weapon.bullets_left === 0) {
        reload_weapon();
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [33,34,34,34,34,59,65,64,65,64,62,34,34,34,34,35],
        [33,34,34,34,34,37,87,86,87,86,40,34,34,34,34,35],
        [33,34,34,34,34,59,65,64,65,64,62,34,34,34,34,35],
        [33,34,34,34,34,37,87,86,87,86,40,34,34,34,34,35],
        [33,34,34,34,34,59,65,64,65,64,62,34,34,34,34,35],
        [33,34,34,34,34,37,87,86,87,86,40,34,34,34,34,35],
        [33,34,34,34,34,59,65,64,65,64,62,34,34,34,34,35],
        [33,34,34,34,34,55,82,83,82,83,57,34,34,34,34,35],
        [33,34,34,34,34,34,34,34,34,34,34,34,34,34,34,35],
        [55,56,56,56,56,56,56,56,56,56,56,56,56,56,56,57]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_floor,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    tilesPerRow = 33;
    tileSize = 32;

    let background2 = [
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1],
        [-1,-1,-1,-1,-1,505,506,506,506,506,507,-1,-1,-1,-1,-1],
    ]

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background2[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_house,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }



    draw_rewards();
    draw_bullets();
    draw_enemies();
    update_bullet_position();
    slow_animation();
    spell_casting();
    draw_player();

    draw_screen_borders();
    draw_hud();

    player_enemy_collision();

    update_enemy_direction();

    //Movement + frame of sprites set
    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size*2);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 0);
        player.frameX = 1;
    }

    if (player.x > 167 && player.x < 315 && player.y < 10 && moveUp) {
        player.y = canvas.height;
        reset_level(request_id);
        windSound.pause();
        windSound.currentTime=0;
        boss_battle();
    }

    if (player.x > 167 && player.x < 315 && player.y === canvas.height-player.size*2 && moveDown) {
        player.y = 20;
        reset_level(request_id)
        castle_1();
    }
}


/////-------------------LEVEL: CASTLE(3) --- BOSS BATTLE -------------------------------------------------------------------------------------------------------------------
function boss_battle() {
    if (final_cutscene < 165) {
        bossSong.play();
    }
    request_id = window.requestAnimationFrame(boss_battle);
    let now = Date.now();
    let elapsed = now - then;
    if (elapsed <= fpsInterval) {
        return;
    }
    then = now - (elapsed % fpsInterval);

    if (weapon.bullets_left === 0 && boss.health > 0) {
        reload_weapon();
    }

    player.continuous_damage = false;

    //Losing condition: player health reaches 0.
    if (player.health <= 0) {
        transition = 0;
        final_cutscene = 0;
        boss.x = 190,
        boss.y = 60,
        boss.health = boss.max_health;
        boss_battle_counter = 0;
        boss.enemies_attack = false;
        boss.bullets_attack = false;
        dialogue_counter = 800;
        boss_bullets = [];
        stop();
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    tilesPerRow = 22;
    tileSize = 32;
    
    let background = [
        [11,12,12,12,12,12,12,12,12,12,12,12,12,12,12,13],
        [33,34,34,34,34,34,34,34,34,34,34,34,34,34,34,35],
        [33,34,11,12,12,12,12,12,12,12,12,12,12,13,34,35],
        [33,34,33,34,34,34,34,38,39,34,34,34,34,35,34,35],
        [33,34,33,38,39,34,34,60,61,34,34,38,39,35,34,35],
        [33,34,33,60,61,34,34,34,34,34,34,60,61,35,34,35],
        [33,34,55,56,56,56,56,56,56,56,56,56,56,57,34,35],
        [33,34,34,34,34,37,87,86,87,86,40,34,34,34,34,35],
        [33,34,34,34,34,59,65,64,65,64,62,34,34,34,34,35],
        [33,34,34,34,34,37,87,86,87,86,40,34,34,34,34,35]
    ];

    for (let r = 0; r < 10; r += 1) {
        for (let c = 0; c < 16; c += 1) {
            let tile = background[r][c];
            if (tile >= 0) {
                let tileRow = Math.floor(tile / tilesPerRow);
                let tileCol = Math.floor(tile % tilesPerRow);
                context.drawImage(tileset_floor,
                    tileCol * tileSize, tileRow * tileSize, tileSize, tileSize,
                    c * tileSize, r * tileSize, tileSize, tileSize);
            }
        }
    }

    if (transition < 600) {
        //Initial fade-out
        if (transition < 70) {
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, canvas.width, canvas.height);
        } else if (transition < 75) {
            context.fillStyle = "rgb(0,0,0,0.8)";
            context.fillRect(0, 0, canvas.width, canvas.height);
        } else if (transition < 85) {
            context.fillStyle = "rgb(0,0,0,0.6)";
            context.fillRect(0, 0, canvas.width, canvas.height);
        } else if (transition < 90) {
            context.fillStyle = "rgb(0,0,0,0.4)";
            context.fillRect(0, 0, canvas.width, canvas.height);
        } else if (transition < 95) {
            context.fillStyle = "rgb(0,0,0,0.2)";
            context.fillRect(0, 0, canvas.width, canvas.height);
        }

        let e = {};

        if (transition === 70) {
            e = {
                type : "knight",
                x : 112,
                y : 135,
                size : 32,
                initial_health : 50,
                health : 50,
                damage : 10,
                xChange : 0,
                yChange : 0,
                frameX : 0,
                frameY : 0
                } 
            enemies.push(e);
            e = {
                type : "knight",
                x : 368,
                y : 135,
                size : 32,
                initial_health : 50,
                health : 50,
                damage : 10,
                xChange : 0,
                yChange : 0,
                frameX : 0,
                frameY : 0
                } 
            enemies.push(e);
        }
        

        for (let e of enemies) {
            context.drawImage(shadowImage, e.x+5, e.y + 23, 24, 14); //Shadow
            context.drawImage(knightImage,
                e.size * e.frameX, (e.size+0.5) * e.frameY, e.size, e.size,
                e.x, e.y, e.size, e.size);
        }

        //Dialogue with boss
        if (transition > 100) {
            context.drawImage(dialogue_box_bossImage, 5, 4 ,canvas.width-10,75);
            context.fillStyle = "gold";  
            context.font = "bold 13px arial";
            context.fillText("DARK LORD", 20, 17)
            context.fillStyle = "white";    
            context.font = "italic bold 16px arial";
            if (dialogue_counter > 720) {
                context.fillText("FINALLY WE MEET.", 25,50);
            }  else if (dialogue_counter > 610) {
                context.fillText("SHALL I WELCOME WHO DARES TO WALK", 25,41);
                context.fillText("INTO MY WORLD...", 25,61);
            } else if (dialogue_counter > 500) {
                context.fillText("SHALL I TEACH YOU THE GREATNESS OF THAT", 25,41);
                context.fillText("MAGIC YOU CALL NOW YOURS...", 25,61);
            } else if (dialogue_counter > 480) {
                context.fillText("OR SHALL YOU JUST", 25,50);
            } else if (dialogue_counter > 460) {
                context.fillText("OR SHALL YOU JUST.", 25,50);
            } else if (dialogue_counter > 440) {
                context.fillText("OR SHALL YOU JUST..", 25,50);
            } else if (dialogue_counter > 410) {
                context.fillText("OR SHALL YOU JUST...", 25,50);
            } else {
                context.font = "italic bold 20px arial";
                context.fillText("KNEEL BEFORE ME?", 27,52);
                boss_laughSound.play();
            }
            dialogue_counter -= 1;
            }

        player.y = 270;
        player.frameX = 1;
        player.frameY = 0;
        draw_boss();

        //Draw player (function not called so that frames aren't updated if movement keys pressed)
        context.drawImage(shadowImage, player.x+4, player.y + 23, 24, 14);
        context.drawImage(playerImage,
            player.size * player.frameX, player.size * player.frameY, player.size, player.size,
            player.x, player.y, player.size, player.size);

        slow_animation();
        if (transition === 559) {
            for (let e of enemies) {
                e.xChange = direction[randint(0,5)];
                e.yChange = direction[randint(0,5)];
            }
        }
        transition += 1;

    } else if (boss.health > 0) {

        spell_casting();
        slow_animation();
        draw_rewards();
        draw_bullets();
        draw_enemies();
    
        update_bullet_position();
    
        //Draw boss bullets behind boss
        for (let b of boss_bullets) {
            if (b.y < boss.y + boss.size/2) {
                context.drawImage(boss_bulletImage, 
                    b.size * b.frameX, 0, b.size, b.size,
                    b.x, b.y, b.size, b.size);
            }
        }
    
        //Draw player first than boss (and vice versa) depending on each others height(y)
        if (player.y < boss.y+70) {
            draw_player();
            draw_boss();
        } else {
            draw_boss();
            draw_player();
        }
    
        //Draw boss bullets in front of boss
        for (let b of boss_bullets) {
            if (b.y >= boss.y + boss.size/2) {
                context.drawImage(boss_bulletImage, 
                    b.size * b.frameX, 0, b.size, b.size,
                    b.x, b.y, b.size, b.size);
            }
        }
    
        draw_screen_borders();
        draw_hud();
    
        player_enemy_collision();
    
        update_enemy_direction();
        
        //Boss health bar
        if (boss.health > 0) {
            context.fillStyle = "black";
            context.fillRect(110, 280, 306, 12);
            //Remaining health
            context.fillStyle = "darkred";
            context.fillRect(113, 283, boss.health/2, 6);
        }
        
        //Check for player's bullets collision with boss
        for (let i = 0; i < bullets.length; i++) {
            let b = bullets[i];
            if (b.x + b.size >= boss.x+40 && b.x <= boss.x + boss.size-40 && b.y + b.size >= boss.y+10 && b.y <= boss.y + boss.size-40) {
                bullets.splice(i, 1);
                i -= 1;
                boss.health = boss.health - weapon.damage;
                if (boss.health <= 0) {
                    boss.health = 0;
                }
            }
        }
    
        //Damage from spell to boss
        if (spell.active != 0) {
            if (player.x + player.size + spell.area/2 < boss.x + 60|| 
            boss.x + boss.size - 60 < player.x - spell.area/2 || 
            player.y - spell.area/2 > boss.y + boss.size - 60 || 
            boss.y > player.y + player.size + spell.area/2) {
                //pass (boss not in spell area)
            } else {
                boss.health -= spell.damage*0.8;
                if (boss.health <= 0) {
                    boss.health = 0;
                }
            }
        }
    
        //Reduce health if player collides with boss. There is half a second (accurate: 20frames) where player is immune after collision.
        if (immune_counter == 0 && !(player.x + player.size < boss.x + 45 || 
            boss.x + boss.size - 45 < player.x || 
            player.y > boss.y + boss.size - 40|| 
            boss.y > player.y + player.size - 70)) {
            hitSound.play();
            hurtSound.play();
            player.health -= boss.damage * player.physical_defense;
            immune_counter = player.post_collision_immunity;
        }

        //Boss attacking counter
        if (boss_battle_counter === 100) {
            boss.bullets_attack = true;
            if (boss.health > boss.max_health*0.3) {
                boss.xChange = 0;
                boss.yChange = 0;
            }
        } else if (boss_battle_counter === 400) {
            boss.bullets_attack = false;
            boss.xChange = boss_direction[randint(0,1)];
            boss.yChange = boss_direction[randint(0,1)];
        } else if (boss_battle_counter === 500) {
            boss_laughSound.play();
            boss.enemies_attack = true;
            boss_battle_counter = 0;
        } else if (boss_battle_counter === 600) {
            boss_battle_counter = 0;
        }

        let bullets_rate = 16

        if (boss.health < boss.max_health * 0.20) {
            bullets_rate = 10
        } else if (boss.health < boss.max_health * 0.10) {
            bullets_rate = 7
        }

        if (boss.bullets_attack) {
            //Create bullets    (They will go randomly when the boss health is less than 50%)
            if (boss_battle_counter % bullets_rate === 0) {
                for (let i = 0; i <= direction.length; i++) {
                    let rad = boss_b_direction[i] * 0.78;
                    if (boss.health < boss.max_health/2) {
                        let random_offset = Math.random() * 0.7 - 0.1;
                        rad += random_offset;
                    }
                    let b = {
                        x: boss.x + boss.size / 2 - 6,  //Center of boss
                        y: boss.y + boss.size / 2,
                        direction_x: Math.cos(rad) * 3,
                        direction_y: Math.sin(rad) * 3,
                        size: 12,
                        frameX: 0
                    }
                    boss_bullets.push(b);
                }
            }
        }
        
        if (boss.enemies_attack) {
            let num = randint(0,3);
            if (num === 0) {
                create_knight();
                create_knight();
            } else if (num === 1) {
                create_skeleton();
                create_skeleton();
                create_skeleton();
            } else if (num === 2) {
                create_cyclope();
                create_skeleton();
            } else if (num === 3) {
                create_beast();
                create_knight();
            }
            boss.enemies_attack = false;
        }

        boss_bullets_update();
    
        boss_movement();
    
        //Movement + frame of sprites set
        if (moveDown) {
            player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
            player.frameX = 0;
        }
        if (moveRight) {
            player.x = Math.min(player.x + player.xChange, canvas.width - player.size);
            player.frameX = 3;
        }
        if (moveLeft) {
            player.x = Math.max(player.x - player.xChange, 0);
            player.frameX = 2;
        }
        if (moveUp) {
            player.y = Math.max(player.y - player.yChange, 0);
            player.frameX = 1;
        }

        boss_battle_counter += 1;

    } else { //BOSS DEFEATED
        window.removeEventListener("keydown", activate, false);
        window.removeEventListener("keyup", deactivate, false);
        window.removeEventListener("click", shoot, false);
        moveDown = false;
        moveUp = false;
        moveLeft = false;
        moveRight = false;
        player.frameY = 0;
        immune_counter = 0;

        bossSong.pause();
        if (final_cutscene < 270) {
            windSound.play();
        }

        let colours = ["violet","purple","wheat"];
        let size = [0.9, 1, 1.1];

        if (final_cutscene < 160) {
            if (final_cutscene < 30) {
                for (let e of enemies) {
                    for (let i = 0; i < 50; i += 1) {
                        let p = {
                            x : e.x + e.size/2,
                            y : e.y + e.size/2,
                            size : size[randint(0,2)],
                            xChange : randint(-4, 4),
                            yChange : randint(-4, 4),
                            colour : colours[randint(0,2)],
                            counter : 0
                        }
                        enemies_exploding.push(p);
                    }
                }
            }
    
            //Draw and update particles
            for (let p of enemies_exploding) {
                context.fillStyle = p.colour;
                context.fillRect(p.x, p.y, p.size, p.size);
            }
        
            for (let i = 0; i < enemies_exploding.length; i++) {
                let p = enemies_exploding[i];
                if (p.counter < 15) {
                    if (p.yChange === 0) {
                        p.yChange = 1;
                    } else if (p.xChange === 0) {
                        p.xChange = 1;
                    }
                    p.x = p.x + p.xChange;
                    p.y = p.y + p.yChange;
                    p.yChange = p.yChange + 0.05;
                    p.counter += 1;
                } else {
                    enemies_exploding.splice(i, 1);
                    i -= 1;
                }
            }
            
            //Draw boss bullets behind boss
            for (let b of boss_bullets) {
                if (b.y < boss.y + boss.size/2) {
                    context.drawImage(boss_bulletImage, 
                        b.size * b.frameX, 0, b.size, b.size,
                        b.x, b.y, b.size, b.size);
                }
            }
        
            //Draw player first than boss (and vice versa) depending on each others height(y)
            if (player.y < boss.y+70) {
                draw_player();
                draw_boss();
            } else {
                draw_boss();
                draw_player();
            }
        
            //Draw boss bullets in front of boss
            for (let b of boss_bullets) {
                if (b.y >= boss.y + boss.size/2) {
                    context.drawImage(boss_bulletImage, 
                        b.size * b.frameX, 0, b.size, b.size,
                        b.x, b.y, b.size, b.size);
                }
            }
    
            boss_bullets_update();
            slow_animation();

            context.fillStyle = "white";    
            context.font = "italic bold 30px arial";

            if (final_cutscene > 30 && final_cutscene < 80) {
                context.fillText("YOU... YOU DID BEAT ME!!", 67,150);
            } else if (final_cutscene > 100 && final_cutscene < 150) {
                context.fillText("NO... NO!!!!", 170,150);
            }

            if (final_cutscene === 85) {
                beam_chargingSound.play();
            }

        } else {    //Boss explodes and ending

            draw_player();

            size = [0.9, 1.3, 1.7];
            if (final_cutscene < 210) {
                boss_explosionSound.play();
                for (let i = 0; i < 100; i += 1) {
                    let p = {
                        x : boss.x + boss.size/2,
                        y : boss.y + boss.size/2,
                        size : size[randint(0,2)],
                        xChange : randint(-10, 10),
                        yChange : randint(-10, 10),
                        colour : colours[randint(0,2)],
                        counter : randint(0,20)
                    }
                    enemies_exploding.push(p);
                }
            }

            //Draw and update particles
            for (let p of enemies_exploding) {
                context.fillStyle = p.colour;
                context.fillRect(p.x, p.y, p.size, p.size);
            }
        
            for (let i = 0; i < enemies_exploding.length; i++) {
                let p = enemies_exploding[i];
                if (p.counter < 55) {
                    if (p.yChange === 0) {
                        p.yChange = 1;
                    } else if (p.xChange === 0) {
                        p.xChange = 1;
                    }
                    p.x = p.x + p.xChange;
                    p.y = p.y + p.yChange;
                    p.counter += 1;
                } else {
                    enemies_exploding.splice(i, 1);
                    i -= 1;
                }
            }
        
        }

        boss_bullets_update();
        slow_animation();

        if (final_cutscene > 260) {
            //Initial fade-out
            if (final_cutscene < 280) {
                context.fillStyle = "rgb(0,0,0,0.2)";
                context.fillRect(0, 0, canvas.width, canvas.height);
            } else if (final_cutscene < 300) {
                context.fillStyle = "rgb(0,0,0,0.4)";
                context.fillRect(0, 0, canvas.width, canvas.height);
            } else if (final_cutscene < 320) {
                context.fillStyle = "rgb(0,0,0,0.6)";
                context.fillRect(0, 0, canvas.width, canvas.height);
            } else if (final_cutscene < 340) {
                context.fillStyle = "rgb(0,0,0,0.8)";
                context.fillRect(0, 0, canvas.width, canvas.height);
            } else if (final_cutscene >= 340) {
                context.fillStyle = "rgb(0,0,0)";
                context.fillRect(0, 0, canvas.width, canvas.height);
                if (final_cutscene > 360) {
                    context.fillStyle = "white";    
                    context.font = "bold 40px arial";
                    context.fillText("THE END", 170,100);
                    if (final_cutscene > 420) {
                        context.font = "bold 13px arial";
                        context.fillText("This game was made over the course of two and a half weeks of my last month", 20,170);
                        context.fillText("at UCC. It will always be my proudest work to come out of it.", 75,190);
                    }
                    if (final_cutscene > 540) {
                        context.font = "italic 14px arial";
                        context.fillText("Thanks for playing!", 340,270);
                    }
                }
            }
        }
        final_cutscene += 1;
    }
}



////----------GAME FUNCTIONS---------------------------------------------------------------------------------------------------------------------

function activate(event) {
    let key = event.key;
    if (key === "a" || key ==="A") {      //Makes player stop at the edges of the canvas. Needs fixing. As it is the player will continue going unless key is released.
        moveLeft = true;
    } else if (key === "d" || key === "D") {
        moveRight = true;
    } else if (key === "w" || key === "W") {
        moveUp = true;
    } else if (key === "s" || key === "S") {
        moveDown = true;
    } else if (key === " " && spell.cost <= player.magic && spell.active === 0) {
        cast_spell = true;
    }
}

function deactivate(event) {
    let key = event.key;
    if (key === "a" || key === "A"){
        moveLeft = false;
    } else if (key === "d" || key === "D") {
        moveRight = false;
    } else if (key === "w" || key === "W") {
        moveUp = false;
    } else if (key === "s" || key === "S") {
        moveDown = false; 
    }else if (key === " ") {
        cast_spell = false;
    }
}

function hero_movement() {
    //Movement + frame of sprites set
    if (moveDown) {
        player.y = Math.min(player.y + player.yChange, canvas.height - player.size);
        player.frameX = 0;
    }
    if (moveRight) {
        player.x = Math.min(player.x + player.xChange, canvas.width - player.size - 20);
        player.frameX = 3;
    }
    if (moveLeft) {
        player.x = Math.max(player.x - player.xChange, 20);
        player.frameX = 2;
    }
    if (moveUp) {
        player.y = Math.max(player.y - player.yChange, 0);
        player.frameX = 1;
    }
}

function shoot(event) {
    console.log(event.offsetX, event.offsetY)
    //Better understanding for bullets: https://stackoverflow.com/questions/48493189/shooting-bullets-from-player-towards-mouse
    if (weapon.bullets_left != 0) {
        let vx = event.offsetX - (player.x + player.size / 2);
        let vy = event.offsetY - (player.y + player.size / 2);
        let dist = Math.sqrt(vx * vx + vy * vy);
        let dx = vx / dist;
        let dy = vy / dist;
    
        let b = {
            x : player.x + player.size / 2,   // Start bullet at center of player
            y : player.y + player.size / 2,
            velocity_x : dx * weapon.shoot_speed,   // Increment shooting speed according to the weapon shoot_speed property
            velocity_y : dy * weapon.shoot_speed,
            size : weapon.bullet_size
        };
        bullets.push(b);

        weapon.bullets_left -= 1;
    } 
}

function reload_weapon() {
    reloadSound.play();
    if (weapon.reloading === 0) {
        weapon.bullets_left = weapon.max_charge;
        weapon.reloading = weapon.reload_time;
    } else {
        weapon.reloading -=1;
    }
}

function reload_weapon_now() {      //Only when right click
    if (weapon.bullets_left < weapon.max_charge && weapon.reloading === weapon.reload_time) {
        reloadSound.play();
        weapon.bullets_left = weapon.max_charge;
    } 
}

function player_collides(e) {
    if (player.x + player.size-2 < e.x || 
        e.x + e.size < player.x+2 || 
        player.y+2 > e.y + e.size || 
        e.y > player.y + player.size-2) {
        return false;
    } else {
        return true;
    }
}

function player_gets_reward(r) {
    if (player.x + player.size-2 + player.item_pickup_range < r.x || 
        r.x + r.size < player.x+2 - player.item_pickup_range || 
        player.y+2 - player.item_pickup_range> r.y + r.size || 
        r.y > player.y + player.size-2 + player.item_pickup_range) {
        return false;
    } else {
        return true;
    }
}

function enemy_collides(e) {
    if (player.x + player.size + spell.area/2 < e.x || 
        e.x + e.size < player.x - spell.area/2 || 
        player.y - spell.area/2 > e.y + e.size || 
        e.y > player.y + player.size + spell.area/2) {
        return false;
    } else {
        return true;
    }
}

function player_enemy_collision() {
    //Reduce health if player collides with enemy. There is half a second (accurate: 20frames) where player is immune after collision.
    for (let e of enemies) {
        if (immune_counter == 0 && player_collides(e)) {
            hitSound.play();
            hurtSound.play();
            player.health -= e.damage * player.physical_defense;
            immune_counter = player.post_collision_immunity;
        }
    }
    //Decrease immune counter by 1 every frame while not 0
    if (immune_counter != 0) {
        immune_counter -= 1;
    }
}


function magic_regeneration() {
    player.magic += player.magic_regen;
    if (player.magic > player.max_magic) {
        player.magic = player.max_magic;
    }
}

function reset_level() {
    window.cancelAnimationFrame(request_id);
    enemies = [];
    bullets = [];
    rewards = [];
    create_level_enemies = true;
    enemy_counter = 0;
    transition = 0;
    orb_particles = [];
}

//Randomize reward after killing enemy (dependant of luck of player)
function reward(e) {
    let num = randint(0,20);

    if ((20 - num < player.luck*0.7) || (e.type === "cyclope")) {      //Get heart
        let r = {
            type : "heart",
            x : e.x+5,
            y : e.y+e.size/2,
            size : 20,
        };
        rewards.push(r);
        r.timeout_id = setTimeout(reward_disappearance, player.item_stay_time, r);

    } else if (num < player.luck) {     //Get coin
        let r = {};
        if (num === 7) {
            r = {
                type : "gem",
                x : e.x+5,
                y : e.y+e.size/2,
                frameX : 0,
                anim_speed : 0,
                size : 20,
            };
        } else {
            r = {
                type : "coin",
                x : e.x+5,
                y : e.y+e.size/2,
                frameX : 0,
                anim_speed : 0,
                size : 20,
            };
        }
        rewards.push(r);
        r.timeout_id = setTimeout(reward_disappearance, player.item_stay_time, r);
    }
}

//Reward removal from array
function reward_disappearance(r) {
    let index = rewards.indexOf(r);
    rewards.splice(index, 1);
}

function stop() {
    reset_level(request_id);
    window.cancelAnimationFrame(request_id);
    setTimeout(gameOver, 1);
}

function gameOver() {
    battleSong.pause();
    battleSong.currentTime = 0;
    townSong.pause();
    bossSong.pause();
    bossSong.currentTime = 0;
    gameoverSound.play();
    //Draw dead player
    context.fillStyle = "rgb(126,40,40)";
    context.fillRect(0,0,canvas.width, canvas.height);
    context.drawImage(playerImage,
        0, player.size * 6, player.size, player.size,
        player.x, player.y, player.size, player.size);

    context.fillStyle = "rgb(0,0,0,0.3)";
    context.fillRect(0,0,canvas.width, canvas.height);
    context.fillStyle = "rgb(240,240,240)";
    context.font = "Bold 60px Courier New";
    context.fillText("GAME OVER", 100, canvas.height/2);
    context.font = "Bold 20px Courier New";
    context.fillStyle = "rgb(0,0,0,0.6)";
    context.fillRect(180, 280, 165, 28);
    context.fillStyle = "rgb(240,240,240)";
    context.fillText("TRY AGAIN", 210, 300);
    canvas.addEventListener('click', replay, false);
}


//Restart again from town level
function replay(event) { 
    if ((event.offsetX >= 180) && (event.offsetX <= 180 + 165) && (event.offsetY >= 280) && (event.offsetY <= 280 + 28)) {
        player.health = player.max_health;
        player.magic = player.max_magic;
        immune_counter = 0;
        player.continuous_damage = false;
        player.x = canvas.width/2 - player.size;
        player.y = canvas.height/2 - player.size;
        player.frameY = 0;
        player.frameX = 0;
        canvas.removeEventListener('click', replay, false);
        healSound.play();
        town();
    }

}


function slow_animation() {
    //Slow sprites animation (execute movement every 4 frames)
    if (anim_speed === 4) {
        anim_speed = 0;
    } else {
        anim_speed += 1;
    }
}

function randint(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

function load_assets(assets, callback) {
    let num_assets = assets.length;
    let loaded = function() {
        console.log("loaded");
        num_assets = num_assets - 1;
        if (num_assets === 0) {
            callback();
        }
    };
    for (let asset of assets) { 
        let element = asset.var;
        if ( element instanceof HTMLImageElement ) {
            console.log("img");
            element.addEventListener("load", loaded, false);
        }
        else if ( element instanceof HTMLAudioElement ) {
            console.log("audio");
            element.addEventListener("canplaythrough", loaded, false);
        }
        element.src = asset.url;
    }
}

function draw_bullets() {
    //Draw bullets
    for (let b of bullets) {
        context.fillStyle = "tomato";
        context.fillRect(b.x-0.5, b.y-0.5, b.size+1, b.size+1);
        context.fillStyle = "orange";
        context.fillRect(b.x, b.y, b.size, b.size);
    }
}

function update_bullet_position() {
    //Change bullet position:
    for (let i = 0; i < bullets.length; i++) {
        let b = bullets[i];
        b.x = b.x + b.velocity_x;
        b.y = b.y + b.velocity_y;
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {      //Remove bullet from array if it leaves the canvas
            bullets.splice(i, 1);
            i -= 1;
        } else {   //Check for collision with enemies in screen
            for (let j = 0; j < enemies.length; j++) {
                let e = enemies[j];
                if (b.x + b.size >= e.x && b.x <= e.x + e.size && b.y + b.size >= e.y && b.y <= e.y + e.size) {
                    bullets.splice(i, 1);
                    i -= 1;
                    e.health = e.health - weapon.damage;
                    if (e.health <= 0) {
                        enemies.splice(j, 1);
                        reward(e);
                        break;
                    } else {
                        break; //Avoids that a bullet can hit 2 enemies that are close.
                    }
                }
            }
        }
    }
}


function spell_casting() {
    if (player.magic_item === true) {
        if (cast_spell) {
            firemagicSound.play();
            spell.active = spell.duration;
            player.magic -= spell.cost;
            cast_spell = false;
        }

        if (spell.active != 0) {
            context.fillStyle = spell.colours[anim_speed]
            context.fillRect(player.x +player.size/2 - spell.area/2, player.y+15 + player.size/2 - spell.area/2, spell.area, spell.area)
            context.drawImage(magicImage,
                160 * frameX, 0, spell.area, spell.area,
                player.x+player.size/2 - spell.area/2-18, player.y + player.size/2 - spell.area/2-4, spell.area+27, spell.area+27);
            if ((anim_speed === 4)) {
                frameX = (frameX + 1) % 6;
            }
            for (let j = 0; j < enemies.length; j++) {
                let e = enemies[j];
                if (enemy_collides(e)) {
                    e.health = e.health - spell.damage;
                    if (e.health <= 0) {
                        enemies.splice(j, 1);
                        reward(e);
                    }
                }
            }
            spell.active -= 1;
        }
    }

}


function draw_rewards() {
    //Draw rewards and check for player collision with rewards (will increase coin count, health or magic)
    for (let r of rewards) {
        if (r.type === "coin") {
            context.drawImage(coinImage, 
                r.size * r.frameX, 0, r.size, r.size,
                r.x, r.y, r.size, r.size);
            r.anim_speed += 1;
            if (r.anim_speed === 5) {
                r.frameX = (r.frameX + 1) % 4;        
                r.anim_speed = 0;
            }
            if (player_gets_reward(r) && (player.coins < 99)) {
                coinSound.playbackRate = 2;
                coinSound.play();
                player.coins += 1;
                reward_disappearance(r);
                clearTimeout(r.timeout_id);
            }
        } else if (r.type === "gem") {
            context.drawImage(gemImage, 
                r.size * r.frameX, 0, r.size, r.size,
                r.x, r.y, r.size, r.size);
            r.anim_speed += 1;
            if (r.anim_speed === 5) {
                r.frameX = (r.frameX + 1) % 4;        
                r.anim_speed = 0;
            }
            if (player_gets_reward(r) && (player.coins < 99)) {
                gemSound.playbackRate = 2;
                gemSound.play();
                player.coins += 3;
                if (player.coins > 99) {
                    player.coins = 99;
                }
                reward_disappearance(r);
                clearTimeout(r.timeout_id);
            }
        } else if (r.type === "heart") {
            context.drawImage(heartImage, 
                r.x, r.y, r.size, r.size);
            if (player_gets_reward(r)) {
                healSound.playbackRate = 2;
                healSound.play();
                player.health += 10;
                if (player.health > player.max_health) {
                    player.health = player.max_health
                }
                reward_disappearance(r);
                clearTimeout(r.timeout_id);
            }
        } else if (r.type === "potion") {       //NEEDS TO BE DONE... POTIONS AS REWARDS???? .......TO BE DONE[!]
            context.fillStyle = "blue";
            context.fillRect(r.x, r.y, r.size, r.size);
            if (player_gets_reward(r)) {
                player.magic += 10;
                reward_disappearance(r);
                clearTimeout(r.timeout_id);
            }
        }
    }
}

function draw_player() {
    //Draw player + shadow
    context.drawImage(shadowImage, player.x+4, player.y + 23, 24, 14);
    if ((immune_counter > 5) || (player.continuous_damage && anim_speed % 2 === 0)) {       //If player has collided with enemy, show player blinking white
        context.drawImage(player_hurtImage,
            player.size * player.frameX, player.size * player.frameY, player.size, player.size,
            player.x, player.y, player.size, player.size);
        if ((anim_speed % 3 === 0) && (moveLeft || moveRight || moveUp || moveDown) &&
            !(moveRight && moveLeft) && !(moveUp && moveDown)) {
            player.frameY = (player.frameY + 1) % 4;
        }
    } else {
        context.drawImage(playerImage,
            player.size * player.frameX, player.size * player.frameY, player.size, player.size,
            player.x, player.y, player.size, player.size);
        if ((anim_speed === 0) && (moveLeft || moveRight || moveUp || moveDown) &&
            !(moveRight && moveLeft) && !(moveUp && moveDown)) {
            player.frameY = (player.frameY + 1) % 4;
        }
    }
}

//BOSS FUNCTIONS
function draw_boss() {
    context.drawImage(bossImage,
        boss.size * boss.frameX, 0, boss.size, boss.size,
        boss.x, boss.y, boss.size, boss.size);
    if ((anim_speed === 3)) {
        boss.frameX = (boss.frameX + 1) % 14;
    }
}

function boss_movement() {
    if (( boss.x < -40) || (boss.x + boss.size - 40 >= canvas.width)){
        boss.xChange *= -1;
    }
    boss.x += boss.xChange;
    if ( (boss.y < -10) || ( boss.y + boss.size - 40 >= canvas.height)) {
        boss.yChange *= -1;
    }
    boss.y += boss.yChange;
}

function boss_bullets_update() {
    for (let i = 0; i < boss_bullets.length; i++) {
        let b = boss_bullets[i];
        b.x += b.direction_x;
        b.y += b.direction_y;
        if (b.x < -10 || b.x > canvas.width || b.y < -10 || b.y > canvas.height) {      //Remove bullet from array if it leaves the canvas
            boss_bullets.splice(i, 1);
            i -= 1;
        //Check for player collision with bullets (removes bullet from array and if immune counter is 0 does damage)
        } else if (!(player.x + player.size - 5 < b.x || b.x + b.size < player.x + 5 || player.y + 5 > b.y + b.size || b.y > player.y + player.size)) {
            boss_bullets.splice(i, 1);
            i -= 1;
            if (immune_counter === 0 && boss.health > 0) {
                hitSound.play();
                hurtSound.play();
                player.health -= boss.bullet_damage * player.magic_defense;
                immune_counter = player.post_collision_immunity;
            }
        } else if (anim_speed === 0) {
            b.frameX = (b.frameX + 1) % 4;
        }       
    }
}

//-----------------Draws player's HUD: health, magic, coins and gun bars
function draw_hud() {
    if (player.health < 0) {
        player.health = 0;
    }
    context.fillStyle = "black";                    //Borders of health and magic bars
    context.fillRect(8, 8, player.max_health*2+4, 16);
    context.fillStyle = "rgb(60,60,60)";        //#B0BDAF  //Grey background if health/magic reduced
    context.fillRect(10, 10, player.max_health*2, 12);
    //Remaining health (traffic-lights colour coded)
    if (player.health < player.max_health*0.3) {
        context.fillStyle = "darkred";
        context.fillRect(10, 10, player.health*2, 12);
        if (player.health < player.max_health*0.2) {
            if (anim_speed % 3 === 0) {
                context.fillStyle = "red";
                context.fillRect(10, 10, player.health*2, 12);
            }
        }
    } else if (player.health < player.max_health*0.6) {
        context.fillStyle = "gold";
    } else {
        context.fillStyle = "seagreen";        
    }
    context.fillRect(10, 10, player.health*2, 12);

    context.fillStyle = "rgb(0,0,0,0.3)";
    context.fillRect(10, 18, player.health*2, 4);  //Shadow in bar

    if (player.magic_item === true) {
        context.fillStyle = "black";                    //Borders of health and magic bars
        context.fillRect(8, 26, player.max_magic*2+4, 12);
        context.fillStyle = "rgb(60,60,60)";    //#B0BDAF  //Grey background if magic reduced
        context.fillRect(10, 28, player.max_magic*2, 8);
        //Remaining magic
        context.fillStyle = "royalblue";
        context.fillRect(10, 28, player.magic*2, 8);
        context.fillStyle = "rgb(0,0,0,0.3)";
        context.fillRect(10, 33, player.magic*2, 3);  //Shadow in bar
    }

    //Draw coins bar
    context.fillStyle = "white";  //semi transparent background
    context.fillRect(7, 41, 33, 12);
    context.drawImage(coinImage, 0, 0, 20, 20,
                10, 42, 10, 10);
    context.fillStyle = "black";
    context.font = "bold 14px arial";
    if (player.coins < 10) {
        context.fillText("0" + player.coins, 22, 52);
    } else {
        context.fillText(player.coins, 22, 52);
    }

    //Draw bullets bar
    if (weapon.max_charge >= 25) {
        context.fillStyle = "black";  //semi transparent background
        context.fillRect(15, canvas.height-22, weapon.max_charge*8*0.9, 15);
        context.fillStyle = "rgb(255, 255, 255,0.2)";  //semi transparent background
        context.fillRect(13, canvas.height-20, weapon.max_charge*8*0.9, 11);
    } else {
        context.fillStyle = "black";  //semi transparent background
        context.fillRect(15, canvas.height-22, weapon.max_charge*8, 15);
        context.fillStyle = "rgb(255, 255, 255,0.2)";  //semi transparent background
        context.fillRect(13, canvas.height-20, weapon.max_charge*8, 11);
    }

    let bullet_count = 0;
    let bullet_space = 23;
    while (bullet_count < weapon.bullets_left) {
        context.fillStyle = "tomato";
        context.fillRect(18+bullet_count+bullet_space, canvas.height-17, 4, 5);
        context.fillStyle = "orange";
        context.fillRect(18.5+bullet_count+bullet_space, canvas.height-16.5, 3, 4);
        bullet_count += 1;
        bullet_space += 5;
    }
    context.drawImage(gunImage, 2, canvas.height-24, 34, 17);
}

function draw_screen_borders() {
    context.fillStyle = ("rgb(0,0,0,0.07)");
    context.fillRect(0,0,28,canvas.height);
    context.fillRect(28,0,canvas.width,30);
    context.fillRect(canvas.width-28,30,canvas.width,canvas.height);
    //context.fillRect(28,canvas.height-28,canvas.width-56,canvas.height);
}


////---------------------ENEMY CREATION ---------------------------------------------------------------------------------------------

function create_skeleton() {
    //Pick random position...
    do {
        x = randint(40, canvas.width-53);
        y = randint(40, canvas.height-53);
        distanceFromPlayer = Math.sqrt((x - player.x)**2 + (y - player.y)**2);
    } while (distanceFromPlayer < 150); //...until it is farther than 150px from the player
    let e;
    do {
        e = {
            type : "skeleton",
            x : x,
            y : y,
            size : 32,
            initial_health : 30,
            health : 30,
            damage : 3,
            xChange : direction[randint(0,5)],
            yChange : direction[randint(0,5)],
            frameX : 0,
            frameY : 0
        } 
    } while ((e.xChange === 0) && (e.yChange === 0)); //Avoid steady enemies
    enemies.push(e);
}

function create_knight() {
    //Pick random position...
    do {
        x = randint(40, canvas.width-53);
        y = randint(40, canvas.height-53);
        distanceFromPlayer = Math.sqrt((x - player.x)**2 + (y - player.y)**2);
    } while (distanceFromPlayer < 150); //...until it is farther than 150px from the player
    let e;
    do {
        e = {
            type : "knight",
            x : x,
            y : y,
            size : 32,
            initial_health : 50,
            health : 50,
            damage : 5,
            xChange : direction[randint(0,5)],
            yChange : direction[randint(0,5)],
            frameX : 0,
            frameY : 0
        } 
    } while ((e.xChange === 0) && (e.yChange === 0)); //Avoid steady enemies
    enemies.push(e);
}

function create_beast() {
    //Pick random position...
    do {
        x = randint(70, canvas.width-68);
        y = randint(70, canvas.height-68);
        distanceFromPlayer = Math.sqrt((x - player.x)**2 + (y - player.y)**2);
    } while (distanceFromPlayer < 200); //...until it is farther than 150px from the player
    let e;
    do {
        e = {
            type : "beast",
            x : x,
            y : y,
            size : 48,
            initial_health : 80,
            health : 80,
            damage : 15,
            xChange : direction[randint(0,5)]*0.3,
            yChange : direction[randint(0,5)]*0.3,
            frameX : 0,
            frameY : 0,
            walk_time : randint(150,300),   //Time (in frames) until starting charge
            stand_by : 30,    //Time (in frames) until charges against character
            set_dir : false
        }
    } while ((e.xChange === 0) && (e.yChange === 0)); //Avoid steady enemies
    enemies.push(e);
}

function create_cyclope() {
    //Pick random position...
    do {
        x = randint(50, canvas.width-53);
        y = randint(50, canvas.height-53);
        distanceFromPlayer = Math.sqrt((x - player.x)**2 + (y - player.y)**2);
    } while (distanceFromPlayer < 200); //...until it is farther than 150px from the player
    let e = {
            type : "cyclope",
            x : x,
            y : y,
            size : 32,
            initial_health : 70,
            health : 70,
            damage : 8,
            shoot_damage : 0.3,
            xChange : 0,
            yChange : 0,
            frameX : 0,
            frameY : 0,
            idle_time : randint(140,170),   //Time (in frames) until starting charge
            shoot_time : 30,    //Time (in frames) until charges against character
            set_dir : false
        } 
    enemies.push(e);
}



//Draw enemies and their health bars
function draw_enemies() {
    for (let e of enemies) {
        if (e.type === "skeleton") {
            context.drawImage(shadowImage, e.x+5, e.y + 23, 24, 14); //Shadow
            context.drawImage(skeletonImage,
                e.size * e.frameX, e.size * e.frameY, e.size, e.size,
                e.x, e.y, e.size, e.size);
            //Change enemy sprite's frame column (direction dependant)
            if ((e.xChange === 0) && (e.yChange > 0)) {
            e.frameX = 0;
            } else if ((e.xChange > 0) && (e.yChange >= 0)) {
                e.frameX = 3;
            } else if ((e.xChange < 0) && (e.yChange >= 0)) {
                e.frameX = 2;
            } else {
                e.frameX = 1;
            }
            if ((anim_speed === 3)) {
                e.frameY = (e.frameY + 1) % 4;
            }       
        }
        if (e.type === "knight") {
            //Minute 23 of this YouTube video: https://www.youtube.com/watch?v=eI9idPTT0c4&list=PLpPnRKq7eNW16Wq1GQjQjpTo_E0taH0La
            //Also, as with bullets, understanding distance calculation over here: https://stackoverflow.com/questions/48493189/shooting-bullets-from-player-towards-mouse

            //Angle between enemy and player
            let angle = Math.atan2(player.y - e.y, player.x - e.x);
            //Calculate direction for x and y of enemy
            e.xChange = Math.cos(angle);
            e.yChange = Math.sin(angle);
            // Update the enemy's position
            e.x += e.xChange;
            e.y += e.yChange;

            context.drawImage(shadowImage, e.x+5, e.y + 23, 24, 14); //Shadow
            context.drawImage(knightImage,
                e.size * e.frameX, (e.size+0.5) * e.frameY, e.size, e.size,
                e.x, e.y, e.size, e.size);
            
                //Change enemy sprite's frame column (direction dependant)
                if (e.yChange > 0.7) {
                e.frameX = 0;
            } else if (e.yChange < -0.7) {
                e.frameX = 1;
            } else if (e.xChange > 0) {
                e.frameX = 3;
            } else if (e.xChange < 0) {
                e.frameX = 2;
            }

            if ((anim_speed === 3)) {
                e.frameY = (e.frameY + 1) % 4;
            }       
        }

        if (e.type === "cyclope") {
            //Minute 23 of this YouTube video: https://www.youtube.com/watch?v=eI9idPTT0c4&list=PLpPnRKq7eNW16Wq1GQjQjpTo_E0taH0La
            //Also, as with bullets, understanding distance calculation over here: https://stackoverflow.com/questions/48493189/shooting-bullets-from-player-towards-mouse
            //Change enemy sprite's frame column (direction dependant)

            context.drawImage(shadow_mediumImage, e.x+1, e.y + 21, 31, 18); //Shadow
            
            if ((e.xChange === 0) && (e.yChange > 0)) {
                e.frameX = 0;
                } else if ((e.xChange > 0) && (e.yChange >= 0)) {
                    e.frameX = 3;
                } else if ((e.xChange < 0) && (e.yChange >= 0)) {
                    e.frameX = 2;
                } else {
                    e.frameX = 1;
                }
                let angle = Math.atan2(player.y - e.y, player.x - e.x);
                let dirx = Math.cos(angle);
                let diry = Math.sin(angle);

                if (diry > 0.7) {
                    e.frameX = 0;
                } else if (diry < -0.7) {
                    e.frameX = 1;
                } else if (dirx > 0) {
                    e.frameX = 3;
                } else if (dirx < 0) {
                    e.frameX = 2;
                }

                if (e.idle_time === 0) {
                    if (e.shoot_time === 0) {   //Shooting finished
                        e.idle_time = randint(140,170);
                        e.shoot_time = 30;
                    } else {  //Shoot light beam
                        player.continuous_damage = true;
                        player.health -= e.shoot_damage * player.magic_defense;
                        if (e.health < e.initial_health){
                            e.health += e.shoot_damage*player.magic_defense*2;
                        }
                        let vx = player.x + player.size / 2 - e.x;
                        let vy = player.y + player.size / 2 - e.y;
                        let dist = Math.sqrt(vx * vx + vy * vy);
                        let dx = vx / dist;
                        let dy = vy / dist;
                        let colours = ["red", "white", "black"];
                        context.strokeStyle = colours[e.shoot_time % 3];
                        context.lineWidth = 3;
                        // Draw the line
                        context.beginPath();
                        context.moveTo(e.x+e.size/2, e.y+e.size/2);
                        context.lineTo(e.x + dx * dist, e.y + dy * dist);
                        context.stroke();
                        e.shoot_time -= 1;
                    }
                } else {
                    e.idle_time -= 1;
                }
                if (e.idle_time < 64) {
                    if (e.idle_time % 4 === 0) {
                        context.drawImage(cyclopeImage,
                            (e.size+0.2) * e.frameX, (e.size+0.4) * e.frameY, e.size, e.size,
                            e.x-1, e.y-2, e.size+3, e.size+3);
                    } else {
                        context.drawImage(cyclopeImage,
                            (e.size+0.2) * e.frameX, (e.size+0.4) * e.frameY, e.size, e.size,
                            e.x, e.y, e.size, e.size);
                    }
                } else {
                context.drawImage(cyclopeImage,
                    (e.size+0.2) * e.frameX, (e.size+0.4) * e.frameY, e.size, e.size,
                    e.x, e.y, e.size, e.size);
                }
                if (e.idle_time === 64) {
                    beam_chargingSound.play();
                }
                if (e.idle_time === 4) {
                    beam_attackSound.play();
                }
        }

        if (e.type === "beast") {
            //Change enemy sprite's frame column (direction dependant)
            if ((e.xChange === 0) && (e.yChange > 0)) {
            e.frameX = 0;
            } else if ((e.xChange > 0) && (e.yChange >= 0)) {
                e.frameX = 3;
            } else if ((e.xChange < 0) && (e.yChange >= 0)) {
                e.frameX = 2;
            } else {
                e.frameX = 1;
            }
            if ((anim_speed === 3)) {
                e.frameY = (e.frameY + 1) % 4;
            }       
            
            if (e.walk_time === 0) {
                if (!e.set_dir && e.stand_by === 5) {    //Calculate enemy direction
                    let angle = Math.atan2(player.y - e.y, player.x - e.x);
                    e.xChange = Math.cos(angle);
                    e.yChange = Math.sin(angle);
                    e.set_dir = true;
                } 
                if (e.stand_by === 0) {
                    if ((e.x < 40) || (e.x + e.size >= canvas.width-40) || (e.y < 40) || (e.y + e.size >= canvas.height-30)) {
                        e.walk_time = randint(150,250);
                        e.stand_by = 30;
                        e.set_dir = false;
                        e.xChange = direction[randint(0,5)]*0.3,
                        e.yChange = direction[randint(0,5)]*0.3
                    } else {    //Charge against enemy direction
                        e.x += e.xChange*25;
                        e.y += e.yChange*25;
                        context.drawImage(shadow_largeImage, e.x+1, e.y + 32, 48, 28); //Shadow
                        context.drawImage(beast_chargingImage,
                            (e.size+0.2) * e.frameX, (e.size+0.2) * e.frameY, e.size, e.size,
                            e.x, e.y, e.size, e.size);
                    }
                } else {    //Display stand_by image
                    context.drawImage(shadow_largeImage, e.x+1, e.y + 32, 48, 28); //Shadow
                    context.drawImage(beast_chargingImage,
                        0, 0, e.size, e.size,
                        e.x, e.y, e.size, e.size);
                    e.stand_by -= 1;
                }
            } else {
                e.walk_time -= 1;
                context.drawImage(shadow_largeImage, e.x+1, e.y + 32, 48, 28); //Shadow
                context.drawImage(beastImage,
                    (e.size+0.2) * e.frameX, (e.size+0.2) * e.frameY, e.size, e.size,
                    e.x, e.y, e.size, e.size);
            }
        }

        //Health bar (enemy)
        if (e.health != e.initial_health) {
            context.fillStyle = "black";
            context.fillRect(e.x-1 - (50-e.size)/2, e.y-e.size/4-1, 52, 8);
            //Remaining health
            context.fillStyle = "darkred";
            context.fillRect(e.x - (50-e.size)/2, e.y-e.size/4, 50 * (e.health/e.initial_health), 6);
        }
    }
}

//Change enemy direction; they will flip when touching limits of canvas
function update_enemy_direction() {
    for (let e of enemies) {
        if (( e.x < 20) || (e.x + e.size >= canvas.width - 20)){
            e.xChange *= -1;
        }
        e.x += e.xChange;
        if ( (e.y < 0) || ( e.y + e.size >= canvas.height)) {
            e.yChange *= -1;
        }
        e.y += e.yChange;
    }
}


function shop_products_hud(event) {
    if (!shop_catalogue && event.offsetX > 435 && event.offsetX < 500 && event.offsetY > 5 && event.offsetY < 40) {
        shop_catalogue = true;
    } else if (shop_catalogue) {
        if (shop_catalogue && event.offsetX > 435 && event.offsetX < 500 && event.offsetY > 5 && event.offsetY < 40) {
            shop_catalogue = false;
        }
        else if (shop_catalogue && shop_items["life_potion"].available && shop_items["life_potion"].price <= player.coins && event.offsetX > 423 && event.offsetX < 465 && event.offsetY > 77 && event.offsetY < 107) {
            item_acquiredSound.play();
            player.max_health += 30;
            player.health = player.max_health;
            player.coins -= shop_items["life_potion"].price;
            shop_items["life_potion"].available = false;
        } else if (shop_catalogue && shop_items["armour_potion"].available && shop_items["armour_potion"].price <= player.coins && event.offsetX > 423 && event.offsetX < 465 && event.offsetY > 127 && event.offsetY < 157) {
            item_acquiredSound.play();
            player.physical_defense = 0.7;
            player.coins -= shop_items["armour_potion"].price;
            shop_items["armour_potion"].available = false;
        } else if (shop_catalogue && shop_items["vigour_potion"].available && shop_items["vigour_potion"].price <= player.coins && event.offsetX > 423 && event.offsetX < 465 && event.offsetY > 177 && event.offsetY < 207) {
            item_acquiredSound.play();
            player.xChange = 5;
            player.yChange = 5;
            player.coins -= shop_items["vigour_potion"].price;
            shop_items["vigour_potion"].available = false;
        } else if (shop_catalogue && shop_items["death_potion"].available && shop_items["death_potion"].price <= player.coins && event.offsetX > 423 && event.offsetX < 465 && event.offsetY > 227 && event.offsetY < 257) {
            item_acquiredSound.play();
            weapon.shoot_speed = 15;
            weapon.damage = 6;
            weapon.max_charge = 25;
            weapon.bullets_left = weapon.max_charge;
            player.coins -= shop_items["death_potion"].price;
            shop_items["death_potion"].available = false;
        }
    }
}