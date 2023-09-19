let canvas;
let context;

let fpsInterval = 1000 / 30;  // the denominator is frames per second
let now;
let then = Date.now();
let request_id;

// Declare and initialise player
let player = {
    x : 250,
    y : 250,
    size : 32,
    max_health : 70,
    health : 70,
    max_magic : 40,
    magic : 40,
    magic_regen : 2,
    magic_regen_speed : 2000,
    physical_defense : 1,    //Lower ratio = less physical damage
    magic_defense : 1,      //Lower ratio = less magic damage
    post_collision_immunity : 20,
    item_pickup_range : 0,
    luck : 10,  //Increases drop ratio for rewards from enemies
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
    damage : 10,
    bullet_size : 5,
    max_charge : 15,
    reload_time : 35,      //in frames
    bullets_left : 15,      //before recharging
    reloading : 35
}

let spell = {
    cost : 20,
    damage : 2,
    area : 150,
    duration : 32,  //in frames
    active : 0,
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

//Player images
let playerImage = new Image();
let player_hurtImage = new Image();
let shadowImage = new Image();

//Enemies images
let skeletonImage = new Image();
let knightImage = new Image();
let beastImage = new Image();
let beast_chargingImage = new Image();
let cyclopeImage = new Image();
let cyclope_chargingImage = new Image();
let shadow_mediumImage = new Image();
let shadow_largeImage = new Image();

//Assets images
let heartImage = new Image();
let coinImage = new Image();
let gemImage = new Image();
let magicImage = new Image();
let gunImage = new Image();
let gun_reloadImage = new Image();

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

//Songs
let challenge_modeSong = new Audio();

//Set a counter to give immunity when player collides with enemy.
let immune_counter = 0;

//Counter to reduce animation speed of sprites:
let anim_speed = 0;

let distanceFromPlayer = 0;
let x, y;
let frameX = 0;

let counter = 0;

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
        }, 300);
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
        {"var": gun_reloadImage, "url": "static/gun_reload.png"},
        //Sound
        {"var": challenge_modeSong, "url": "static/sounds/challenge_mode.mp3"},
        {"var": coinSound, "url": "static/sounds/coin.wav"},
        {"var": gemSound, "url": "static/sounds/gem.wav"},
        {"var": hitSound, "url": "static/sounds/hit.wav"},
        {"var": gameoverSound, "url": "static/sounds/gameover.mp3"},
        {"var": healSound, "url": "static/sounds/heal.wav"},
        {"var": beam_attackSound, "url": "static/sounds/beam_attack.mp3"},
        {"var": beam_chargingSound, "url": "static/sounds/beam_charging.mp3"},
        {"var": firemagicSound, "url": "static/sounds/fire_magic.mp3"},
        {"var": hurtSound, "url": "static/sounds/hurt.mp3"},
        {"var": reloadSound, "url": "static/sounds/reload.mp3"}
    ], draw);
}

function draw() {
    challenge_modeSong.play();
    request_id = window.requestAnimationFrame(draw);
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

    if (enemies.length < 3) {
        //Pick random position...
        do {
            x = randint(40, canvas.width-40);
            y = randint(40, canvas.height-40);
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
                damage : 5,
                xChange : direction[randint(0,5)],
                yChange : direction[randint(0,5)],
                frameX : 0,
                frameY : 0
            } 
        } while ((e.xChange === 0) && (e.yChange === 0)); //Avoid steady enemies
        enemies.push(e);

        //Pick random position...
        do {
            x = randint(40, canvas.width-40);
            y = randint(40, canvas.height-40);
            distanceFromPlayer = Math.sqrt((x - player.x)**2 + (y - player.y)**2);
        } while (distanceFromPlayer < 150); //...until it is farther than 150px from the player
        do {
            e = {
                type : "knight",
                x : x,
                y : y,
                size : 32,
                initial_health : 50,
                health : 50,
                damage : 10,
                xChange : direction[randint(0,5)],
                yChange : direction[randint(0,5)],
                frameX : 0,
                frameY : 0
            } 
        } while ((e.xChange === 0) && (e.yChange === 0)); //Avoid steady enemies
        enemies.push(e);

        
        //Pick random position...
        do {
            x = randint(60, canvas.width-60);
            y = randint(60, canvas.height-60);
            distanceFromPlayer = Math.sqrt((x - player.x)**2 + (y - player.y)**2);
        } while (distanceFromPlayer < 200); //...until it is farther than 150px from the player
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

        //Pick random position...
        do {
            x = randint(60, canvas.width-60);
            y = randint(60, canvas.height-60);
            distanceFromPlayer = Math.sqrt((x - player.x)**2 + (y - player.y)**2);
        } while (distanceFromPlayer < 200); //...until it is farther than 150px from the player
            e = {
                type : "cyclope",
                x : x,
                y : y,
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
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    if (counter < 55) {
        context.fillStyle = "rgb(90, 124, 91)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else if (counter < 110) {
        context.fillStyle = "rgb(124, 90, 124)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else if (counter < 165) {
        context.fillStyle = "rgb(124, 124, 91)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else if (counter < 210) {
        context.fillStyle = "rgb(90, 124, 124)";
        context.fillRect(0, 0, canvas.width, canvas.height);
    } else {
        context.fillStyle = "rgb(90, 124, 124)";
        context.fillRect(0, 0, canvas.width, canvas.height);
        counter = 0;
    }

    //Spell casting execution
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
                healSound.play()
                player.health += 5;
                if (player.health > player.max_health) {
                    player.health = player.max_health
                }
                reward_disappearance(r);
                clearTimeout(r.timeout_id);
            }
        } else if (r.type === "potion") {
            context.fillStyle = "blue";
            context.fillRect(r.x, r.y, r.size, r.size);
            if (player_gets_reward(r)) {
                player.magic += 5;
                reward_disappearance(r);
                clearTimeout(r.timeout_id);
            }
        }
    }

    //Draw bullets
    for (let b of bullets) {
        context.fillStyle = "tomato";
        context.fillRect(b.x-0.5, b.y-0.5, b.size+1, b.size+1);
        context.fillStyle = "orange";
        context.fillRect(b.x, b.y, b.size, b.size);
    }

    //Draw enemies
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
                        context.drawImage(cyclope_chargingImage,
                            (e.size+0.2) * e.frameX, (e.size+0.4) * e.frameY, e.size, e.size,
                            e.x-1, e.y-2, e.size+3, e.size+3);
                    } else {
                        context.drawImage(cyclope_chargingImage,
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
                    if ((e.x < 26) || (e.x + e.size >= canvas.width-26) || (e.y < 26) || (e.y + e.size >= canvas.height-26)) {
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
    
    //Slow sprites animation (execute movement every 4 frames)
    if (anim_speed === 4) {
        anim_speed = 0;
    } else {
        anim_speed += 1;
    }

    //Draw player + shadow
    context.drawImage(shadowImage, player.x+4, player.y + 23, 24, 14);
    if ((immune_counter > 10) || (player.continuous_damage && anim_speed % 2 === 0)) {       //If player has collided with enemy, show player blinking white
        context.drawImage(player_hurtImage,
            player.size * player.frameX, player.size * player.frameY, player.size, player.size,
            player.x, player.y, player.size, player.size);
        if ((anim_speed === 3) && (moveLeft || moveRight || moveUp || moveDown) &&
            !(moveRight && moveLeft) && !(moveUp && moveDown)) {
            player.frameY = (player.frameY + 1) % 4;
        }
    } else {
        context.drawImage(playerImage,
            player.size * player.frameX, player.size * player.frameY, player.size, player.size,
            player.x, player.y, player.size, player.size);
        if ((anim_speed === 3) && (moveLeft || moveRight || moveUp || moveDown) &&
            !(moveRight && moveLeft) && !(moveUp && moveDown)) {
            player.frameY = (player.frameY + 1) % 4;
        }
    }
    
    //Player health bar and magic bar
    if (player.health < 0) {
        player.health = 0;
    }
    //context.fillStyle = "rgb(255, 255, 255, 0.5)";  //semi transparent background
    //context.fillRect(5, 6, player.max_health*2+10, 40);
    context.fillStyle = "black";                    //Borders of health and magic bars
    context.fillRect(8, 8, player.max_health*2+4, 16);
    context.fillRect(8, 26, player.max_magic*2+4, 12);
    context.fillStyle = "rgb(60,60,60)";        //#B0BDAF  //Grey background if health/magic reduced
    context.fillRect(10, 10, player.max_health*2, 12);
    context.fillRect(10, 28, player.max_magic*2, 8);
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
    //Remaining magic
    context.fillStyle = "royalblue";
    context.fillRect(10, 28, player.magic*2, 8);
    context.fillStyle = "rgb(0,0,0,0.3)";
    context.fillRect(10, 33, player.magic*2, 3);  //Shadow in bar

    //Draw coins bar
    context.fillStyle = "rgb(255, 255, 255)";  //semi transparent background
    context.fillRect(22, 41, 18, 12);
    context.drawImage(coinImage, 0, 0, 20, 20,
                10, 42, 10, 10);
    context.fillStyle = "black";
    context.font = "bold 16px monospace";
    if (player.coins < 10) {
        context.fillText("0" + player.coins, 22, 52);
    } else {
        context.fillText(player.coins, 22, 52);
    }

    //Draw bullets bar
    context.fillStyle = "black";
    context.fillRect(11, canvas.height-22, weapon.max_charge*9, 15);
    context.fillStyle = "rgb(255, 255, 255,0.2)";  //semi transparent background
    context.fillRect(13, canvas.height-20, weapon.max_charge*9-4, 11);

    let bullet_count = 0;
    let bullet_space = 23;
    while (bullet_count < weapon.bullets_left) {
        context.fillStyle = "tomato";
        context.fillRect(bullet_count+bullet_space, canvas.height-17, 4, 5);
        context.fillStyle = "orange";
        context.fillRect(0.5+bullet_count+bullet_space, canvas.height-16.5, 3, 4);
        bullet_count += 1;
        bullet_space += 7;
    }
    if (weapon.reloading != weapon.reload_time) {
        context.drawImage(gun_reloadImage, 4, canvas.height-29, 34, 17);
    } else {
    context.drawImage(gunImage, 4, canvas.height-29, 34, 17);        
    }




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


    //Change enemies direction if they touch canvas limits
    for (let e of enemies) {
        if ( e.x < 0 ) {
            e.xChange = e.xChange * -1;
        } else if ( e.x + e.size >= canvas.width ) {
            e.xChange = e.xChange * -1;
        }
            e.x = e.x + e.xChange;
        if ( e.y < 0 ) {
            e.yChange = e.yChange * -1;
        } else if ( e.y + e.size >= canvas.height ) {
            e.yChange = e.yChange * -1;
        }
            e.y = e.y + e.yChange;
    }

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

    counter += 1;
}


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

function shoot(event) { 
    // console.log(event.offsetX, event.offsetY)
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

function magic_regeneration() {
    player.magic += player.magic_regen;
    if (player.magic > player.max_magic) {
        player.magic = player.max_magic;
    }
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
    window.removeEventListener("keydown", activate, false);
    window.removeEventListener("keyup", deactivate, false);
    window.removeEventListener("click", shoot, false);
    window.cancelAnimationFrame(request_id);
    setTimeout(gameOver, 100);
}

function gameOver() {
    challenge_modeSong.pause();
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
    context.fillText("PLAY AGAIN", 200, 300);
    canvas.addEventListener('click', replay, false);
}

function replay(event) { 
    if ((event.offsetX >= 180) && (event.offsetX <= 180 + 165) && (event.offsetY >= 280) && (event.offsetY <= 280 + 28)) {
        window.location.reload();
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