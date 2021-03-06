"use strict";

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gameDiv');

var player;
var platform;
var background;
var evilPlatform;
var point;  
var goal;

var score = 0;

var startText;
var startButton;
var input;
var button;

var cursors;
var jumpButton;
var loginText;

var user = firebase.auth().currentUser;

var mainMenu = {

  preload: function () {

    // game.add.plugin(Fabrique.Plugins.InputField);
    game.load.image('startButton', "app/images/startButton.png");

  },

  create: function () {

    // input = game.add.inputField(30, 90);
    button = game.add.button(game.world.centerX - 95, 400, 'startButton', startGame, this, 2, 1, 0);

    // startText = game.add.text(game.world.centerX, game.world.centerY, 'Start', {font: '32px Arial', fill: '#fff'});
    loginText = game.add.text(game.world.centerX, game.world.centerY, 'Please Login to Continue', {font: '32px Arial', fill: '#fff'});
    loginText.visible = false;

    // startText.onInputUp.add(startGame, this);
    // button.onInputUp.add(startGame, this);

  },

  update: function () {

  }

};

var restartButton;



function startGame () {
  // console.log("start", input.value);
  if (!user) {
    loginText.visible = true;
    return;
  }
  game.state.start('mainState');
}

var gameOver = {

  preload: function () {
    game.load.image('startButton', "app/images/startButton.png");

  },

  create: function () {

    restartButton = game.add.button(game.world.centerX - 95, 400, 'startButton', playAgain, this, 2, 1, 0);

  },

  update: function () {

  }

};

function playAgain () {
  game.state.start('mainState');
  // console.log("play again" );

}

var playAgainButton;

var mainState = {

  preload: function () {

    game.load.image('platform', "assets/gameLayout-assets/basicPlatform.png");
    game.load.image('evilPlatform', "app/images/evilPlatform.png");
    game.load.image('player', "app/images/player.png");
    // game.load.image('player', "assets/gameLayout-assets/player.png");
    game.load.image('point', "app/images/point.png");

    game.load.image('background', 'assets/gameLayout-assets/background.png');
    game.load.image('playAgain', 'assets/gameLayout-assets/playAgain.png');

    game.load.image('startButton', "app/images/startButton.png");
    game.load.image('goal', "app/images/goal.png");


  },


  create: function () {

    background = game.add.tileSprite(0, 0, 4189, 4204, 'background');

    platform = game.add.physicsGroup();

    goal = game.add.physicsGroup();

    goal.create(1950, 400, 'goal');
    game.physics.arcade.enable(goal);

    playAgainButton = game.add.button( 50, 3950, 'playAgain', playAgain, this, 2, 1, 0);
    playAgainButton.anchor.setTo( 0.5, 0.5);
    playAgainButton.visible = false;


    platform.create(-100, 3950, 'platform');
    platform.create(650, 3950, 'platform');
    platform.create(1300, 3850, 'platform');

    point = game.add.physicsGroup();

    point.create(525, 3750, 'point');
    point.create(1100, 3750, 'point');

    game.physics.arcade.enable(point);

    // platform.visible = false;

    evilPlatform = game.add.physicsGroup();

    // evilPlatform = game.add.tileSprite(0, 650, 2000, 50, 'evilPlatform')
    evilPlatform.create(0, 4200, 'evilPlatform');
    // evilPlatform.visible = false;
    evilPlatform.setAll('body.immovable', true);


    player = game.add.sprite(100, 3742, 'player');
    // player = game.add.sprite(game.world.centerX, game.world.centerY, 'player');

    game.physics.arcade.enable(player);

    game.world.setBounds(0, 0, 4189, 4204);

    player.body.collideWorldBounds = true;
    player.body.gravity.y = 500;

    platform.setAll('body.immovable', true);

    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    game.camera.follow(player, Phaser.Camera.FOLLOW_PLATFORMER);

  },

  update: function () {

    game.physics.arcade.collide(player, evilPlatform, death);

    game.physics.arcade.collide(player, goal, winGame);

    // game.physics.arcade.collide(player, evilPlatform);

    game.physics.arcade.collide(player, platform, function () {
    });

    game.physics.arcade.overlap(player, point, scorePoint);

    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -250;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 250;
    }

    if (jumpButton.isDown && (player.body.onFloor() || player.body.touching.down))
    {
        player.body.velocity.y = -400;
    }

  }

};

function winGame ( player, goal ) {
  goal.kill();
  player.kill();
  console.log("you win");
  score += 50;
  postScore();
}

function death (player, evilPlatform) {
  playAgainButton.visible = true;
  playAgainButton.centerX = (game.camera.x + 200);
    // game.state.start('mainMenu');
  player.body.velocity.x = 0;  
  player.kill();
  console.log("death");
  postScore()
  .then( function (scoreObject) {
    console.log("final score: ", scoreObject);
  })

}

function scorePoint (player, point) {
  point.kill();
  score += 10;
}

function postScore () {
  let scoreObject = {
    score, 
    userName: user.displayName.split(" ")[0],
    uid: user.uid
  };

  return new Promise(function(resolve, reject) {
    $.ajax({
      url: "https://game-capstone.firebaseio.com/scores.json",
      type: "POST",
      data: JSON.stringify(scoreObject),
      dataType: "json"
    }).done( function ( scoreId ) {
      resolve(scoreId); 
    });
  });
}

game.state.add('mainState', mainState);

game.state.add('mainMenu', mainMenu);
// game.state.add('gameOver', gameOver);

// game.state.start('mainState');
game.state.start('mainMenu');