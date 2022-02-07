/**
 * @typedef {Object} Options
 * @protected {number} [width] 画布宽度(px)
 * @protected {number} [height] 画布高度(px)
 * @protected {number} [max=80] 道具数量
 * @protected {string[]} [props=["circle", "square", "triangle", "line"]] 道具种类
 * @protected {[number,number,number][]} [colors=[[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]]] 道具颜色
 * @protected {number} [size=1] 道具尺寸
 * @protected {number} [clock=25] 道具下落速度
 * @protected {boolean} [rotate=false] 道具旋转
 * @protected {boolean} [start_from_edge=false] 道具从边缘开始
 * @protected {boolean} [respawn=true] 道具离开屏幕时重置
 * @protected {boolean} [animate=true] 开启动画
 */

/**
 * Confetti 类
 * @class
 */
class Confetti {
  frameId;
  particles = [];

  /**
   * Confetti 构造函数
   * @constructor
   * @param {string|HTMLCanvasElement} [target="#confetti-holder"]
   * @param {Options} [options]
   */
  constructor(target = '#confetti-holder', options = {}) {
    // 获取 <canvas> 元素
    this.canvas = typeof target === 'string' ? document.querySelector(target) : target;
    // 检查 <canvas> 元素
    if (!(this.canvas instanceof HTMLCanvasElement)) {
      throw new Error(`目标元素 不存在或不是 <canvas> 元素`);
    }
    this.context = this.canvas.getContext('2d');

    this.options = options;
  }

  /**
   * 渲染道具（五彩纸屑）
   * @param {Options} [options]
   * @returns {number}
   */
  render(options = this.options) {
    const {width, height, max = 80, animate = true, respawn = true, props, colors, ...params} = Object.assign({
      width: this.canvas.getBoundingClientRect().width,
      height: this.canvas.getBoundingClientRect().height,
      rotate: false,
      size: 1,
      clock: 25,
    }, options);

    this.width = width;
    this.height = height;
    this.animate = animate;
    this.respawn = respawn;

    /* 格式化道具颜色 */
    this.colors = (
      (Array.isArray(colors) && colors.length)
        ? options.colors
        : [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]]
    );

    /* 格式化道具种类 */
    this.props = (
      (Array.isArray(props) && props.length)
        ? props
        : ['circle', 'square', 'triangle', 'line']
    ).map(prop => {
      if (typeof prop === 'string') { prop = {type: prop}; }
      // 额外处理 图片格式
      if (prop.type === 'svg') {
        prop.image = new window.Image();
        prop.image.src = prop.src;
        prop.image.size = prop.size || 15;
        delete prop.size;
      }
      return Object.assign({}, params, {weight: 1}, prop);
    });
    this.weight = this.props.reduce((value, prop) => value + prop.weight, 0);

    /* 随机生成道具 */
    this.particles = Array.from({length: max}, () => this._generate());

    return requestAnimationFrame(this._draw.bind(this));
  }

  /**
   * 开启动画
   * @param {Object} options
   * @param {number} options.width
   * @param {number} options.height
   * @param {boolean} options.animate
   */
  start(options = {}) {
    const {width = this.width, height = this.height, animate = this.animate} = options;
    this.width = width;
    this.height = height;
    this.animate = animate;
    this.frameId = requestAnimationFrame(this._draw.bind(this));
  }

  /**
   * 停止动画
   * @param {boolean} [clear=false] 清空画布
   */
  stop(clear = false) {
    this.animate = false;
    if (clear) { this.context.clearRect(0, 0, this.width, this.height); }
    try { cancelAnimationFrame(this.frameId); } catch (e) {}
  }

  /**
   * 绘制画布
   * @private
   */
  _draw() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.particles.forEach((particle, index) => {
      this._drawParticle(particle, index);
      this._updateParticle(particle, index);
    });
    if (this.particles.every(particle => !particle)) { this.stop(true); }
    if (this.animate) { this.start(); }
  }

  /**
   * 生成道具
   * @param {Object} [options]
   * @param {number} [options.x]
   * @param {number} [options.y]
   * @returns {Particle}
   * @private
   */
  _generate(options = {}) {
    let random = Math.random() * this.weight;
    for (const prop of this.props) {
      const weight = prop.weight;
      if (random < weight) {
        const color = this.colors[Tool.random(this.colors.length, true)];
        return new Particle({...prop, color, ...options}, {width: this.width, height: this.height});
      }
      random -= weight;
    }
  }

  /**
   * 绘制道具
   * @param {Particle} particle 道具
   * @param {number} index 道具索引
   * @private
   */
  _drawParticle(particle, index) {
    if (!particle || typeof particle !== 'object') { return; }
    const ctx = this.context;
    const {prop, point: [x, y], size, color} = particle;
    ctx.fillStyle = ctx.strokeStyle = `rgba(${color})`;
    this.context.beginPath();

    switch (prop) {
      case 'circle': {
        const {radius} = particle;
        ctx.moveTo(x, y);
        ctx.arc(x, y, radius * size, 0, Math.PI * 2, true);
        ctx.fill();
        break;
      }
      case 'triangle': {
        const {angles: [a, b, c, d]} = particle;
        ctx.moveTo(x, y);
        ctx.lineTo(x + a * size, y + b * size);
        ctx.lineTo(x + c * size, y + d * size);
        ctx.closePath();
        ctx.fill();
        break;
      }
      case 'line': {
        const {line, radius} = particle;
        ctx.moveTo(x, y);
        ctx.lineTo(x + line * size, y + radius * 5);
        ctx.lineWidth = 2 * size;
        ctx.stroke();
        break;
      }
      case 'square': {
        const {rotation} = particle;
        ctx.save();
        ctx.translate(x + 15, y + 5);
        ctx.rotate(rotation);
        ctx.fillRect(-15 * size, -5 * size, 15 * size, 5 * size);
        ctx.restore();
        break;
      }
      case 'svg': {
        const {image, rotate, rotation} = particle;
        const s = image.size;
        ctx.save();
        ctx.translate(x + s / 2, y + s / 2);
        if (rotate) { ctx.rotate(rotation); }
        if (image) { ctx.drawImage(image, -(s / 2) * size, -(s / 2) * size, s * size, s * size); }
        ctx.restore();
        break;
      }
    }
  }

  /**
   * 更新道具及坐标
   * @param {Particle} particle 道具
   * @param {number} index 道具索引
   * @private
   */
  _updateParticle(particle, index) {
    if (!particle || typeof particle !== 'object') { return; }
    const {speed, rotate} = particle;
    if (this.animate) { particle.point[1] += speed; }
    if (rotate) { particle.rotation += speed / 35; }
    if (
      (speed >= 0 && particle.point[1] > this.height) ||
      (speed < 0 && particle.point[1] < 0)
    ) {
      if (this.respawn) {
        particle = this._generate({
            x: Tool.random(this.width, true),
            y: speed >= 0 ? -10 : this.height,
          },
        );
      } else {
        particle = null;
      }
    }
    // 更新
    this.particles[index] = particle;
  }
}

/**
 * 道具元素类
 * @class
 */
class Particle {
  line = Tool.random(65, true) - 30;
  radius = Tool.random(4) + 1;
  angles = [
    Tool.random(10, true) + 2,
    Tool.random(10, true) + 2,
    Tool.random(10, true) + 2,
    Tool.random(10, true) + 2,
  ];
  rotation = Tool.random(360, true) * Math.PI / 180;

  /**
   *
   * @param {Object & {x?:number,y?:number}} prop
   * @param {string} prop.type 道具类型
   * @param {[number,number,number]} prop.color 道具颜色
   * @param {number} prop.size 道具尺寸
   * @param {number} prop.clock 道具下落速度
   * @param {boolean} prop.rotate 道具旋转
   * @param {boolean} prop.start_from_edge 道具从边缘开始
   * @param {HTMLImageElement & {size:number} } [prop.images]
   *
   * @param {Object} options 画布配置
   * @param {number} options.width
   * @param {number} options.height
   */
  constructor(
    prop,
    options,
  ) {
    const {type, size, rotate, image} = prop;
    this.prop = type;
    this.size = size;
    this.rotate = rotate;
    // 仅 [type=svg]
    this.image = image;

    const {width, height} = options;
    const {color, start_from_edge, clock} = prop;
    const {
      x = Tool.random(width),
      y = (start_from_edge
          ? (clock >= 0 ? -10 : height + 10)
          : Tool.random(height)
      ),
    } = prop;
    // 坐标 [x, y]
    this.point = [x, y];
    this.speed = Tool.random(clock / 7) + (clock / 30);
    this.color = [...color, (this.radius <= 3) ? 0.4 : 0.8].join(',');
  }
}

/**
 * 工具类
 */
class Tool {
  static random(limit = 1, floor = false) {
    const value = Math.random() * limit;
    return !floor ? value : Math.floor(value);
  }
}
