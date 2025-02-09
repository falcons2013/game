'use strict';
const WIDTH = 512;
const HEIGHT = 512;
const LVL_WIDTH = 1229;
const LVL_HEIGHT = 1024;


const BG_LAYER = 0; //background, tiles
const MOB_LAYER = 1; //players
const HUD_LAYER = 3;

var gameOver = false;


/** @type {Phaser.Types.Curves} */
let cursors;
/** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody} */
let player; //todo: use class to construct instead
let player_max_health = 200;
let player_health = player_max_health - 60;  

/** @type {Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[]} */
let enemies = [];
let crates = [];
let space_key;

/**  @type {Phaser.GameObjects. Text } */
let health_hud;

class GameScene extends Phaser.Scene {
    constructor() {
        super();
    }
    preload() {
        cursors = this.input.keyboard.createCursorKeys();

        this.load.image('sky', 'assets/sky.png');
        this.load.spritesheet('dog', "assets/dogan.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('sqrl', "assets/sqrl.png", { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('HELTH', "assets/HELTH.png", { frameWidth: 19, frameHeight: 14 });
    }
    create() {
        health_hud = this.add.text(0, 0, `HP: ${player_health}`);
        health_hud.setDepth(HUD_LAYER);

        let img = this.add.image(0, 0, 'sky');
        img.setDepth(0);

        player = this.physics.add.sprite(100, 450, 'player');
        player.setDepth(MOB_LAYER);

        space_key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // create animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dog', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dog', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'left_bark',
            frames: this.anims.generateFrameNumbers('dog', { start: 6, end: 10 }),
            frameRate: 10,
        });

        this.anims.create({
            key: 'right_bark',
            frames: this.anims.generateFrameNumbers('dog', { start: 11, end: 15 }),
            frameRate: 10,
        });

        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNumbers('dog', { start: 16, end: 18 }),
            frameRate: 10,
        });
        this.anims.create({
            key: 'health_a',
            frames: this.anims.generateFrameNumbers('HELTH', { start: 0, end: 1 }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'health_b',
            frames: this.anims.generateFrameNumbers('HELTH', { start: 0, end: 1 }),
            frameRate: 12,
            repeat: -1
        });
        
        this.anims.create({
            key: 'sqrl_left',
            frames: this.anims.generateFrameNumbers('sqrl', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'sqrl_right',
            frames: this.anims.generateFrameNumbers('sqrl', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.cameras.main.setSize(WIDTH, HEIGHT);
        this.cameras.main.startFollow(player);

        player.anims.play("left");
        player.width = 32;
        player.height = 32;

        for (let i = 0; i < 4; i++) {
            let enemy = this.physics.add.sprite(Phaser.Math.Between(0, LVL_WIDTH/2), Phaser.Math.Between(0, LVL_HEIGHT/2));
            enemy.anims.play("sqrl_right");
            //console.log(enemy);
            enemy.setDepth(MOB_LAYER);
            enemies.push(enemy);
        }
        for (let i = 0; i < 4; i++) {
            let crate = this.physics.add.sprite(Phaser.Math.Between(0, LVL_WIDTH/3), Phaser.Math.Between(0, LVL_HEIGHT/3));
            crate.anims.play("health_a");
            //console.log(crate);
            crate.setDepth(MOB_LAYER);
            crates.push(crate);
        }        
    }
    update() {

        
        const MAX_VEL = 100;
        health_hud.setText(`HP: ${player_health}`);
        health_hud.x = player.x;
        health_hud.y = player.y;
        //health_hud.updateText();

        if (player_health <= 0) {
            player.anims.play("death", true);
            player.setVelocityX(0);
            player.setVelocityY(50);
            return;
        }
        if (cursors.up.isDown) {
            player.setVelocityY(-MAX_VEL);
        } else if (cursors.down.isDown) {
            player.setVelocityY(MAX_VEL);
        } else if (cursors.left.isDown) {
            player.anims.play("left");
            player.setVelocityX(-MAX_VEL);
        } else if (cursors.right.isDown) {
            player.anims.play("right");
            player.setVelocityX(MAX_VEL);
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);
        }

        if (space_key.isDown) {
            //moving right, so bark right
            player.anims.play("right_bark", true);
            console.log(player);
            console.log(player.x);
            console.log(player.y);
        }

        
        let no_sqrl_touch = true;
        // per frame? should be something else
        for (let sqrl of enemies) {
            // get direction vector towards the player
            //let ran_x_vel = Phaser.Math.Between(20, 100);
            //let ran_y_vel = Phaser.Math.Between(20, 100);

            // check vel before and after set accel. If it switches, then switch facing.
            let x_vel = sqrl.body.velocity.x;
            let is_face_left = true;
            if (x_vel < 0) {
                is_face_left = false;
            }            
            
            this.physics.accelerateToObject(sqrl, player, 50, 80, 80);

            x_vel = sqrl.body.velocity.x;
            // did the velocity change directions?
            if (x_vel < 0) {
                is_face_left = false;
            }        
            
            this.physics.overlap(player, sqrl, (pl, en) => {
                player_health -= 1;
                no_sqrl_touch = false;
            })
            //console.log('cc');
            //console.log(x_vel);
            
            //sqrl.setVelocityX(ran_x_vel);
            //sqrl.setVelocityY(ran_y_vel);
        }
        // update enemy ai

        // Looped over all sqrls, are none touching??
        if (no_sqrl_touch) {
            if (player_health < player_max_health) {
                let rand_roll = Phaser.Math.Between(1, 1000);
                if (rand_roll >= 999) {
                    player_health += 1;
                }
            }
        }
        
        for (let box of crates) {

            this.physics.overlap(player, box, (pl, en) => {
                player_health += 50;
                
                // To do, also remove the crate from the board (maybe replace it with a new one?)
                // Or maybe don't remove it, just move it to a new random spot on the map...
                //this.physics.moveTo(box, 222,222);
                //console.log('boxxxx');
                //console.log(box);
                box.x = Phaser.Math.Between((0 - (LVL_WIDTH/2))  , LVL_WIDTH/2);
                box.y = Phaser.Math.Between((0 - (LVL_HEIGHT/2)) , LVL_HEIGHT/2);
                
                //this.setPosition(111,222); // This should work??  // No, "this" isn't the box, maybe this is the scene or something
            })
        }        
        
        
        
        if (player_health < 0) {
            gameOver = true;
        }
    
        
    }
}

let config = {
    type: Phaser.AUTO,
    width: WIDTH,
    height: HEIGHT,
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
    },
    scene: GameScene,
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
        }
    }
};


let game = new Phaser.Game(config);
