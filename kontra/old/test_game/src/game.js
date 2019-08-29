kontra.init();

kontra.assetPaths.images = 'assets/images/';
kontra.loadAssets('background.png', 'player.png', 'enemy.png').then(function() {
  var player = kontra.sprite({
    x: 120,
    y: 240,
    image: kontra.images.player
  });

  var background = kontra.sprite({
    x: 0,
    y: 0,
    image: kontra.images.background
  });

  var enemy1 = kontra.sprite({
    x: 100,
    y: 130,
    dx: -1.5,
    image: kontra.images.enemy
  });

  var enemy2 = kontra.sprite({
    x: 100,
    y: 180,
    dx: -1.5,
    image: kontra.images.enemy
  });

  var enemy3 = kontra.sprite({
    x: 100,
    y: 80,
    dx: -1,
    image: kontra.images.enemy
  });

  var enemies = [enemy1, enemy2, enemy3];

  //quad tree for collision detection
 var quadtree = kontra.quadtree();
 quadtree.add(enemies);

  var enemy = kontra.sprite({
    x: 100,
    y: 100,
    dx: -1,
    image: kontra.images.enemy,
    update: function() {
      //limits on y

      if(this.position.x < 32) {
        this.position.x = 32;
        this.dx = 1;
      }
      else if(this.position.x > 200) {
        this.position.x = 200;
        this.dx = -1;
      }

      this.advance();
    }
  });


  var loop = kontra.gameLoop({
    update: function() {

      if (kontra.keys.pressed('up')) {
        player.y -= 1;
      }
      else if (kontra.keys.pressed('down')) {
        player.y += 1;
      }

      if(player.y <= 40) {
        //pause game
        loop.stop();

        alert('You have reached the goal!');

        //restart
        window.location = '';
      }

      //enemies bounce
      enemies.forEach(function(enemy){
        if(enemy.x < 32) {
          enemy.x = 32;
          enemy.dx = 1;
        }
        else if(enemy.x > 200) {
          enemy.x = 200;
          enemy.dx = -1;
        }
      });

      background.update();
      player.update();
      enemies.forEach(function(enemy){
        enemy.update();

        if(enemy.collidesWith(player)) {
          loop.stop();
          alert('GAME OVER!');
          window.location = '';
        }

      });


    },
    render: function() {
      background.render();
      player.render();
      enemies.forEach(function(enemy){enemy.render()});
    }
  });
  loop.start();

});
