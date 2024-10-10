const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [MainScene, NewRoomScene], // Add scenes here
};

const game = new Phaser.Game(config);

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('player', 'sprites/charactersprites/playerblock1.png');
    this.load.image('platform', 'sprites/platformsprites/platformsprite.png');
    this.load.image('background', 'sprites/platformsprites/bgsprite.png');
    this.load.image('door', 'sprites/platformsprites/mysticaldoorway.png');
  }

  create() {
    this.add.image(400, 300, 'background');
    platforms = this.physics.add.staticGroup();

    // Create ground and platforms
    platforms.create(400, 700, 'platform').setScale(12).refreshBody();
    platforms.create(600, 400, 'platform');
    platforms.create(50, 250, 'platform');
    platforms.create(350, 250, 'platform');
    platforms.create(750, 220, 'platform');

    // Create player
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    // Enable collision between player and platforms
    this.physics.add.collider(player, platforms, () => {
      isJumping = false;
      canDoubleJump = true;
    });

    // Create door sprite for room transition
    const door = this.physics.add.staticImage(780, 450, 'door');
    door.setSize(50, 100);
    this.physics.add.overlap(player, door, this.enterRoom, null, this);

    // Set up cursors for movement
    cursors = this.input.keyboard.createCursorKeys();
    this.input.keyboard.on('keydown-RIGHTCTRL', this.dash, this);
  }

  update() {
    // Player movement left and right
    if (cursors.left.isDown) {
      player.setVelocityX(isDashing ? -320 : -160);
    } else if (cursors.right.isDown) {
      player.setVelocityX(isDashing ? 320 : 160);
    } else {
      player.setVelocityX(0);
    }

    // Jumping logic
    if (cursors.up.isDown) {
      if (!isJumping) {
        player.setVelocityY(-330);
        isJumping = true;
        canDoubleJump = true;
      } else if (canDoubleJump) {
        player.setVelocityY(-330);
        canDoubleJump = false;
      }
    }

    // Reset dash state
    if (isDashing && this.time.now > dashTimer) {
      isDashing = false;
      player.setVelocityX(
        cursors.left.isDown ? -160 : cursors.right.isDown ? 160 : 0
      );
    }
  }

  dash() {
    if (!isDashing) {
      isDashing = true;
      dashTimer = this.time.now + 200; // Dash duration
      player.setVelocityX(
        cursors.right.isDown
          ? 320
          : cursors.left.isDown
          ? -320
          : player.body.velocity.x
      ); // Dash direction
    }
  }

  enterRoom() {
    this.scene.start('NewRoomScene'); // Start the new room scene
  }
}

class NewRoomScene extends Phaser.Scene {
  constructor() {
    super({ key: 'NewRoomScene' });
  }

  preload() {
    // Load assets for the new room here if necessary
    this.load.image('newBackground', 'sprites/platformsprites/newbg.png'); // Example
    this.load.image('newPlatform', 'sprites/platformsprites/newplatform.png'); // Example
  }

  create() {
    this.add.image(400, 300, 'newBackground'); // New background
    const platforms = this.physics.add.staticGroup();
    
    // Create new platforms
    platforms.create(400, 500, 'newPlatform').setScale(4).refreshBody();
    platforms.create(600, 350, 'newPlatform');
    
    // You may want to add a new player instance or transition the existing player
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // Re-add the collider
    this.physics.add.collider(player, platforms);

    // Optionally add a way to return to the previous room
    const backDoor = this.physics.add.staticImage(780, 450, 'door');
    this.physics.add.overlap(player, backDoor, () => {
      this.scene.start('MainScene'); // Go back to the main room
    });
  }

  update() {
    // Update logic for the new room, if needed
  }
}

let player;
let cursors;
let platforms;
let isJumping = false;
let canDoubleJump = false;
let isDashing = false;
let dashTimer = 0;
