const confetti = (function(global, document) {
  global.addEventListener('resize', draw, false);

  let canvas;
  let context;
  /**
   * @type {Confetti} 五彩纸屑
   */
  let confetti;

  function init() {
    VanillaTiltMin.init(document.querySelector(CARD || '#card'), {
      startX: 20,
      startY: -10,
      speed: 600,
      easing: 'cubic-bezier(.03,.98,.52,.99)',
      perspective: 800,
      glare: true,
      reverse: true,
      'max-glare': 0.9,
      'full-page-listening': true,
    });

    // 获取并检查 <canvas> 元素
    if (!((canvas = document.querySelector(CANVAS || '#container')) instanceof HTMLCanvasElement)) {
      throw new Error(`目标元素 ${CANVAS || '#container'} 不存在或不是 <canvas> 元素`);
    }
    context = canvas.getContext('2d');

    confetti = new Confetti(canvas);
    confetti.render({
      max: 256,
      clock: 16,
      rotate: true,
    });
    // 绘制彩带 & 气球
    draw();
  }

  function draw() {
    // 获取 <body> 的 宽高
    let {width, height} = document.body.getBoundingClientRect();

    // 重置 canvas 的宽高，并清空画布
    canvas.width = width;
    canvas.height = height;
    confetti.stop(true);
    confetti.start({width, height, animate: true});
  }

  return init;
})(window, document);

document.addEventListener('DOMContentLoaded', () => {
  const cardContainer = document.querySelector('.card');
  const cakeContainer = document.querySelector('.card-face.cake');
  const giftBox = document.querySelector('.gift-box-wrapper');
  const box = document.querySelector('.gift-box');
  const cakeWrapper = document.querySelector('.cake-wrapper');
  const cakeOperate = document.querySelector('.cake-operate');
  const arrows = document.querySelectorAll('.arrows');

  const cake = document.createElement('img');
  cake.className = 'cake-image';
  cake.style.cursor = 'pointer';

  let step = window.innerWidth < 500 ? 1 : 0;
  let running = false;
  let playing = false;
  let music;
  toggle();

  function toggle(value) {
    if (value == null) {
      const currentStep = /\bstep-([0-9]+\b)/.exec(cakeContainer.className);
      value = currentStep ? Number.parseInt(currentStep[1], 10) : step;
    }
    onPlay();
    switch (value) {
      case 0: {
        cakeOperate.style.display = 'block';
      }
      case 1: {
        cakeOperate.innerHTML = '拆开礼物';
        giftBox.style.display = 'block';
        cakeWrapper.style.display = 'none';
        break;
      }
      /* 礼盒打开，放飞气球 */
      case 2: {
        cakeOperate.style.display = 'none';
        new p5(balloonSketch, document.body);
        break;
      }
      /**
       * 1. 隐藏礼物盒子 🎁
       * 2. 添加并显示蛋糕 🍰
       */
      case 3: {
        cakeWrapper.style.backgroundColor = '#e05b7b';
        giftBox.style.display = 'none';
        cake.src = 'assets/images/cake.svg';
        cake.addEventListener('load', () => {
          cakeWrapper.append(cake);
          cakeWrapper.style.display = 'flex';
        });
        cake.addEventListener('click', onCake, {once: true});
        break;
      }
      /**
       * 1. 蛋糕动画加载完成
       */
      case 4: {
        running = false;
        cakeOperate.style.display = 'block';
        cakeOperate.innerHTML = '许个愿望，吹灭蜡烛';
        break;
      }
      /**
       * 1. 蜡烛吹灭
       */
      case 5: {
        cakeOperate.style.display = 'none';
        cakeWrapper.classList.add('blow');
        break;
      }
      /**
       * 1. 蜡烛复燃 🕯️
       * 2. 翻页 ㊗️
       */
      case 6: {
        setTimeout(() => {
          cakeWrapper.classList.remove('blow');
          arrows.forEach(el => {
            el.style.display = 'block';
          });
          confetti();
        }, 1000);
        flip();
        break;
      }
    }

    step = value;
    if (!cakeContainer.classList.replace(`step-${step - 1}`, `step-${step}`)) {
      cakeContainer.classList.add(`step-${step}`);
    }
    return step;
  }

  function flip() {
    cardContainer.classList.toggle('reversal');
  }

  function openPresent(step) {
    step = toggle(step);
    if (step > 3) {return;}
    setTimeout(() => openPresent(step + 1), [2000, 2000, 1000, 7000][step]);
  }

  function onCake() {
    cake.removeEventListener('click', onCake);
    toggle(5);
    setTimeout(() => { toggle(6); }, 1500);
  }

  function onPlay() {
    if (music && !playing) {
      music.play().then(() => { playing = true; });
    }
  }

  arrows.forEach(el => {
    el.addEventListener('click', flip);
  });
  box.addEventListener('click', () => { openPresent(step + 1);}, {once: true});
  cakeOperate.addEventListener('click', () => {
    if (running) { return; }
    running = true;
    if (step === 4) {
      onCake();
    } else {
      openPresent(step + 1);
    }
  });

  music = new Audio('assets/music/happy-birthday.mp3');
  music.loop = true;
}, {once: true});

