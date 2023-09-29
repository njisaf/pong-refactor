/**
 * @namespace PongGame
 * @description The namespace that encapsulates all components of the Pong game.
 */
import i from "jquery";
import "./styles.css";

/**
 * @function initPage
 * @description Initializes the Pong game on the web page.
 */
function initPage() {
  var t = i("#arena"),
    e = i("#player"),
    s = i("#computer"),
    h = i("#ball"),
    r = i("#user-score"),
    n = i("#computer-score"),
    l = i("#gameover");

  /**
   * @class Ball
   * @memberof PongGame
   * @description Represents the game ball and its behavior.
   * @param {jQuery} i - The ball element.
   */
  var Ball = function (i) {
    this.x = t.innerWidth() / 2 - h.innerWidth();
    this.y = t.innerHeight() / 2 - h.innerHeight();
    this.velocityX = 5;
    this.velocityY = 5;
    this.speed = 5;
    this.radius = 25;

    /**
     * @method update
     * @memberof PongGame.Ball
     * @description Updates the position of the ball based on its velocity.
     */
    this.update = function () {
      this.x = this.x + this.velocityX;
      this.y = this.y + this.velocityY;
    };

    /**
     * @method reset
     * @memberof PongGame.Ball
     * @description Resets the ball's position and speed.
     */
    this.reset = function () {
      this.speed = 5;
      this.x = t.innerWidth() / 2 - h.innerWidth();
      this.y = t.innerHeight() / 2 - h.innerHeight();
      p.velocityX = -this.velocityX;
    };

    /**
     * @method edges
     * @memberof PongGame.Ball
     * @description Checks if the ball hits the top or bottom edges of the arena.
     */
    this.edges = function () {
      (this.y < 0 || this.y > t.innerHeight() - this.radius) &&
        (this.velocityY *= -1);
    };

    /**
     * @method draw
     * @memberof PongGame.Ball
     * @description Draws the ball on the screen with specified styles.
     */
    this.draw = function () {
      i.css({
        width: this.radius,
        height: this.radius,
        borderRadius: this.radius,
        backgroundColor: "#fd1d1d",
        zIndex: 5,
        left: this.x,
        top: this.y,
      });
    };
  };

  /**
   * @class Player
   * @memberof PongGame
   * @description Represents the player's paddle.
   * @param {jQuery} i - The player element.
   */
  var Player = function (i) {
    this.x = 0;
    this.y = t.innerHeight() / 2 - i.innerHeight() / 2;
    this.score = 0;

    /**
     * @method draw
     * @memberof PongGame.Player
     * @description Draws the player's paddle on the screen.
     */
    this.draw = function () {
      i.css({
        top: this.y,
        left: this.x,
      });
    };
  };

  /**
   * @class Computer
   * @memberof PongGame
   * @description Represents the computer's paddle.
   * @param {jQuery} i - The computer element.
   */
  var Computer = function (i) {
    this.x = t.innerWidth() - i.innerWidth();
    this.y = t.innerHeight() / 2 - i.innerHeight() / 2;
    this.score = 0;

    /**
     * @method draw
     * @memberof PongGame.Computer
     * @description Draws the computer's paddle on the screen.
     */
    this.draw = function () {
      i.css({
        top: this.y,
        left: this.x,
      });
    };
  };

  /**
   * @class CollisionDetector
   * @memberof PongGame
   * @description Detects collisions between the ball and player/computer paddles.
   * @param {PongGame.Ball} ball - The ball object.
   * @param {PongGame.Player|PongGame.Computer} player - The player or computer paddle object.
   */
  var CollisionDetector = function (ball, player) {
    this.ball = ball;
    this.player = player;
    this.player.top = this.player.y;
    this.player.bottom = this.player.y + 100;
    this.player.left = this.player.x;
    this.player.right = this.player.x + 15;
    this.ball.top = this.ball.y - this.ball.radius;
    this.ball.bottom = this.ball.y + this.ball.radius;
    this.ball.left = this.ball.x - this.ball.radius;
    this.ball.right = this.ball.x + this.ball.radius;

    /**
     * @method check
     * @memberof PongGame.CollisionDetector
     * @description Checks for collisions between the ball and player/computer paddles.
     * @returns {boolean} True if there is a collision, false otherwise.
     */
    this.check = function () {
      return (
        this.ball.right > this.player.left &&
        this.ball.top < this.player.bottom &&
        this.ball.left < this.player.right &&
        this.ball.bottom > this.player.top
      );
    };
  };

  /**
   * @function checkGameEnd
   * @memberof PongGame
   * @description Checks if the game has ended and displays the winner.
   * @param {PongGame.Player} player - The player object.
   * @param {PongGame.Computer} computer - The computer object.
   */
  var checkGameEnd = function (player, computer) {
    var winner = "";
    if (player.score === 3 || computer.score === 3) {
      winner = player.score === 3 ? "player" : "computer";
      clearInterval(f);
      i(document).off();
      e.hide();
      s.hide();
      l.css({ display: "flex" });
      l.html("Game over, winner: " + winner);
    }
  };

  // Create instances of player, computer, and ball
  var player = new Player(e);
  var computer = new Computer(s);
  var ball = new Ball(h);

  // Draw initial game elements
  computer.draw();
  player.draw();
  ball.draw();

  // Set up game loop
  var f = setInterval(function () {
    checkGameEnd(player, computer);

    // Move computer paddle towards the ball
    computer.y += (ball.y - (computer.y + s.innerHeight() / 2)) * 0.2;
    computer.draw();

    // Determine the paddle to check for collision
    let paddleToCheck = player.x < t.innerWidth() / 2 ? computer : player;

    // Check for collision and update ball velocity
    if (new CollisionDetector(ball, paddleToCheck).check()) {
      let distanceFromCenter = ball.y - (player.y + e.innerHeight() / 2);
      let angle = (Math.PI / 4) * (distanceFromCenter /= e.innerHeight() / 2);
      let direction = player.x < t.innerWidth() / 2 ? 1 : -1;
      ball.velocityX = direction * ball.speed * Math.cos(angle);
      ball.velocityY = ball.speed * Math.sin(angle);
      ball.speed += 1;
    }

    // Update and check ball position
    ball.update();
    ball.edges();
    ball.draw();

    // Check for scoring
    if (ball.x - ball.radius < 0) {
      computer.score++;
      n.html(computer.score);
      ball.reset();
    }
    if (ball.x + ball.radius > t.innerWidth()) {
      player.score++;
      r.html(player.score);
      ball.reset();
    }
  }, 25);

  // Handle player paddle movement
  i(document).on("mousemove", function (event) {
    player.y = event.clientY - t.innerHeight() + e.innerHeight();
    player.draw();
  });
}

// Initialize the game when the page loads
i(initPage);
