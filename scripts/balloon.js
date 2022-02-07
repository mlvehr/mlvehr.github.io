class Balloon {
  /**
   *
   * @param {p5} p
   */
  constructor(p) {
    this.p = p;
    this.r = this.p.random(90, 150);
    this.pos = this.p.createVector(this.p.random(this.p.width), this.p.random(this.p.height, this.p.height + this.p.random(300, 700)));
    this.upStep = this.p.random(4, 6);
    this.red = this.p.random(100, 255);
    this.green = this.p.random(100, 255);
    this.blue = this.p.random(100, 255);
    this.lineLen = this.p.random(150, 250);
  }

  show() {
    // 绘制线
    this.p.push();
    this.p.stroke(255);
    this.p.strokeWeight(2);
    this.p.line(
      this.pos.x, this.pos.y + this.r / 2 + 10,
      this.pos.x, this.pos.y + this.lineLen,
    );
    this.p.pop();

    // 气球
    this.p.push();
    this.p.fill(this.red, this.green, this.blue, 170);
    this.p.noStroke();
    this.p.ellipse(this.pos.x, this.pos.y, this.r, this.r + 10);

    // 节
    this.p.ellipse(this.pos.x, this.pos.y + this.r / 2 + 10, 10, 7);
    this.p.pop();
  }

  up() { this.pos.y -= this.upStep; }

  /**
   * 检查边缘
   */
  checkEdge() {
    if (this.pos.y < this.r / 2 + 5) {
      this.pos.y = this.r / 2 + 5;
    }
  }

  mouseHover() {
    return (this.pos.x + this.r / 2 > this.p.mouseX && this.pos.x - this.r / 2 < this.p.mouseX)
      && (this.pos.y + this.r / 2 > this.p.mouseY && this.pos.y - this.r / 2 < this.p.mouseY);
  }
}

/**
 * 气球
 * @param {p5} p
 */
function balloonSketch(p) {
  /**
   * 气球
   * @type {Balloon[]}
   */
  let balloons = [];
  let total = 24 * 2;
  let min = 8 * 2;
  let sfxPop;

  function appendBalloons(length = total) {
    balloons.push(...Array.from({length}, () => new Balloon(p)));
  }

  p.setup = function() {
    sfxPop = p.loadSound('assets/music/pop.mp3');
    p.createCanvas(p.windowWidth, p.windowHeight, 'p2d');
    appendBalloons();
  };

  p.draw = function() {
    p.resizeCanvas(p.windowWidth, p.windowHeight, true);
    balloons.forEach((balloon, i) => {
      balloon.show();
      balloon.up();
      balloon.checkEdge();
      if (balloon.mouseHover()) {
        sfxPop.play();
        balloons.splice(i, 1);
      }
    });
    if (balloons.length < min) {
      appendBalloons();
    }
  };
  p.keyPressed = function({key}) {
    if (key.toLowerCase() === 'enter') {
      appendBalloons();
    }
  };
}
