

  (function() {
    kontra.init("game-canvas-10");
    var canvas = document.querySelector("#game-canvas-10");
    canvas.width = 600;
    canvas.height = 600;
    var context = canvas.getContext("2d");

    //context.font = "30px Arial";
    //context.fillText("Hello World", 10, 50);

    // exclude-code:start
  let { init, Sprite, GameLoop } = kontra;
  // exclude-code:end

  let sprites = [];

  function createAsteroid(x,y,radius) {
    let asteroid = kontra.Sprite({
      type:'asteroid',
      x: x,
      y: y,
      dx: Math.random() * 2 - 1,
      dy: Math.random() * 2 - 1,
      radius: radius,

      render() {
        this.context.strokeStyle = 'green';
        this.context.beginPath();  // start drawing a shape
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        this.context.stroke();     // outline the circle

      }
    });
    sprites.push(asteroid);
  }

  let planetX = kontra.Sprite();
  function createPlanet(x,y,radius,mass) {
    let planet = kontra.Sprite({
      type:'planet',
      x: x,
      y: y,
      dx: 0, // Math.random() * 0.5 - 0.25,
      dy: 0, // Math.random() * 0.5 - 0.25,
      radius: radius,
      mass: mass,  /// would measure attraction power

      render() {
        this.context.strokeStyle = 'blue';
        this.context.beginPath();  // start drawing a shape
        this.context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        this.context.stroke();     // outline the circle
        context.fill(); //fill the circle
      }
    });
    sprites.push(planet);
    planetX = planet; /// lazy global
  }
  createPlanet(300,300,10,0.005);

  for (var i = 0; i < 4; i++) {
    createAsteroid(Math.random()*canvas.width,Math.random()*canvas.height,30);
  }

  let spriteX = Sprite({
    x: 100,        // starting x,y position of the sprite
    y: 80,
    color: 'red',  // fill color of the sprite rectangle
    width: 20,     // width and height of the sprite rectangle
    height: 40,
    dx: 2,          // move the sprite 2px to the right every frame
    dy: 2
  });

  sprites.push(spriteX);

  kontra.initKeys();
  // helper function to convert degrees to radians
  function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
  }


  let ship = kontra.Sprite({
    type:'ship',
    x: 150,
    y: 150,
    width: 6,  // we'll use this later for collision detection
    rotation: 120,  // 0 degrees is to the right
    dt: 0,
    kills: 0,
    damagetaken: 0,
    killmod:0,
    winner: 0,

    render() {
      this.context.save();

      // transform the origin and rotate around it
      // using the ships rotation
      this.context.translate(this.x, this.y);
      this.context.rotate(degreesToRadians(this.rotation));

      // draw a right facing triangle
      this.context.strokeStyle = 'red';
      this.context.beginPath();
      this.context.moveTo(-3, -5);
      this.context.lineTo(12, 0);
      this.context.lineTo(-3, 5);
      this.context.closePath();
      this.context.stroke();
      this.context.restore();
      this.context.fillText("Kills Count:  " + this.kills , 10, 30);
      this.context.fillText("Damage Taken: " + this.damagetaken , 10, 40);
      this.context.fillText("Weapon Power: " + this.killmod, 10, 50);
      if (this.winner == 1)
        this.context.fillText("!!!!!YOU WIN!!!!!", 300, 250);
    },
    update() {
      // rotate the ship left or right
      if (kontra.keyPressed('left')) {
        this.rotation += -4
      }
      else if (kontra.keyPressed('right')) {
        this.rotation += 4
      }

      // move the ship forward in the direction it's facing
      const cos = Math.cos(degreesToRadians(this.rotation));
      const sin = Math.sin(degreesToRadians(this.rotation));

      if (kontra.keyPressed('up')) {
        this.ddx = cos * 0.005;
        this.ddy = sin * 0.005;
      }
      else {
        this.ddx = this.ddy = 0;
      }

      this.advance();
      // set a max speed
      const magnitude = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      if (magnitude > 5) {
        this.dx *= 0.95;
        this.dy *= 0.95;
      }


      // allow the player to fire no more than 1 bullet every 1/4 second
      this.dt += 1/60;

      this.killmod = Math.log10(Math.max(this.kills-this.damagetaken,1)) + 1;

      if (kontra.keyPressed('space') && this.dt > 0.25  ) {
        this.dt = 0;

        for (let i=0; i<this.killmod; i++) {

          let bullet = kontra.Sprite({
            type: 'bullet',
            // start the bullet on the ship at the end of the triangle
            x: this.x + cos * 12,
            y: this.y + sin * 12,
            // move the bullet slightly faster than the ship
            dx: this.dx + cos * (2 + this.killmod * Math.random()) ,
            dy: this.dy + sin * (2 + this.killmod * Math.random()),
            // live only 50 frames
            ttl: 50,
            // bullets are small
            width: 2,
            height: 2,
            color: 'red'
          });
          sprites.push(bullet);
        }


      }
    }
  });

  function createShip(){

    ship.init();
    ship.x = 150;
    ship.y = 150;
    ship.width = 6;  // we'll use this later for collision detection
    ship.rotation = 60;  // 0 degrees is to the right
    ship.dt = 0;

    sprites.push(ship);
  }

  createShip();

  let loop = GameLoop({  // create the main game loop
    update: function() { // update the game state

      if (!ship.isAlive()) {
        createShip();
      }





      sprites.map(sprite => {



        sprite.update();

        // glue the borders
        if (sprite.x > canvas.width) {
          sprite.x = 0;
          sprite.dx /= 2;
        }
        if (sprite.y > canvas.height) {
          sprite.y = 0;
          sprite.dy /= 2;
        }
        if (sprite.x < 0) {
          sprite.x = canvas.width;
          sprite.dx /= 2;
        }
        if (sprite.y < 0) {
          sprite.y = canvas.height;
          sprite.dy /= 2;
        }


      // gravity attraction
        if (sprite.type !== 'planet') {
          let distanceSquared = (sprite.x - planetX.x)**2 + (sprite.y - planetX.y)**2
          let distance = Math.sqrt(distanceSquared);
          let force = planetX.mass / distanceSquared;
          //sprite.dx += (sprite.x - planetX.x) / distance;
          sprite.dx += planetX.mass * (-sprite.x + planetX.x) / distance;
          sprite.dy += planetX.mass * (-sprite.y + planetX.y) / distance;

        }
      });





      // collision detection
      for (let i = 0; i < sprites.length; i++) {

        // only check for collision against asteroids
        if (sprites[i].type === 'asteroid') {

          for (let j = 0; j < sprites.length; j++) {
            // don't check asteroid vs. asteroid collisions
            if (i!=j && sprites[j].type !== 'asteroid' && sprites[j].type !== 'planet') {
              let asteroid = sprites[i];
              let sprite = sprites[j];
              // circle vs. circle collision detection
              let dx = asteroid.x - sprite.x;
              let dy = asteroid.y - sprite.y;
              if (Math.sqrt(dx * dx + dy * dy) < asteroid.radius + sprite.width) {
                asteroid.ttl = 0;

                if (sprite.type === 'bullet')
                  ship.kills++;

                if (sprite.type === 'ship') {
                  ship.kills++;
                  ship.damagetaken += asteroid.radius*3;
                }



                if (asteroid.radius > sprite.width)
                  sprite.ttl = 0;

                // split the asteroid only if it's large enough
                if (asteroid.radius > 1) {
                  for (var x = 0; x < 3; x++) {
                    createAsteroid(asteroid.x, asteroid.y, asteroid.radius / 2.5);
                  }
                }


                break;
              }
            }
          }
        }
        let asteroidcount = 0;
        for (let i = 0; i < sprites.length; i++)
          if (sprites[i].type === 'asteroid')
            asteroidcount++;

        if (asteroidcount == 0) {
          /// there is nothing more to do
          ship.winner = 1;
          //alert('GAME OVER!');
        } else {
          ship.winner = 0;
        }

      }

      sprites = sprites.filter(sprite => sprite.isAlive());
    },
    render: function() { // render the game state
        sprites.map(sprite => sprite.render());
    }


    //var canvas = document.getElementById("myCanvas");
    //var ctx = canvas.getContext("2d");
    //context.font = "30px Arial";
    //context.fillText("Hello World", 10, 50);

  });

  loop.start();    // start the game
  })();
