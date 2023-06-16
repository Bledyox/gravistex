const app = (function () {

  let canvas;

  let interval;

  let animation;

  let position;

  let clockwise;

  const keyMapping = {
    1: () => console.log('1'),
    2: () => console.log('2'),
    ARROWUP: () => play(),
    ARROWRIGHT: () => console.log('AR'),
    ARROWDOWN: () => pause(),
    ARROWLEFT: () => console.log('AL'),
  };

  const image = {
    disc: '../img/disc/frame.svg',
    globe: [
      '../img/globe/frame-0.svg',
      '../img/globe/frame-1.svg',
      '../img/globe/frame-2.svg',
      '../img/globe/frame-3.svg',
      '../img/globe/frame-4.svg',
      '../img/globe/frame-5.svg',
      '../img/globe/frame-6.svg',
      '../img/globe/frame-7.svg',
      '../img/globe/frame-8.svg',
      '../img/globe/frame-9.svg',
    ],
  };


  window.addEventListener('load', () => init());

  window.addEventListener('keydown', event => handle(event));

  function init() {
    setup();
    build();
  }

  function handle(event) {
    if (event.key.toUpperCase() in keyMapping) keyMapping[event.key.toUpperCase()]();
  }

  function setup() {
    canvas = document.getElementById('webgl-canvas');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    position = 0;
    clockwise = false;
  }

  function build() {
    const disc = document.getElementById('disc');
    const globe = document.getElementById('globe');
    position = 0;
    if (disc.checked) {
      animation = disc.value;
      draw(image[animation]);
    } else if (globe.checked) {
      animation = globe.value;
      canvas.style.transform = null;
      draw(image[animation][position]);
    }
  }

  function draw(frame) {
    canvas.src = frame;
    canvas.alt = frame;
  }

  function animate() {
    if (animation === 'disc') {
      rotate();
    } else if (animation === 'globe') {
      replace();
    }
  }

  function rotate() {
    if (clockwise) {
      position = (position <= 0) ? 330 : position - 30;
    } else {
      position = (position >= 330) ? 0 : position + 30;
    }
    canvas.style.transform = `rotate(${position}deg)`;
    draw(image[animation]);
  }

  function replace() {
    if (clockwise) {
      position = (position <= 0) ? 9 : position - 1;
    } else {
      position = (position >= 9) ? 0 : position + 1;
    }
    draw(image[animation][position]);
  }

  function play() {
    interval = setInterval(animate.bind(this), 500);
  }

  function pause() {
    clearInterval(interval);
  }

  return {
    start: init,
    update: build,
    play: play,
    pause: pause,
  };
}());

//
// class Animation {
//   constructor(name) {
//     this.name = name;
//     this.id = 0;
//     this.src = [];
//     for (let i = 0; i < 12; i++) this.src[i] = "../img/frame/" + name + "_" + i + ".png";
//   }
//
//   moveLeft() {
//     this.id = (this.id <= 0) ? 11 : this.id - 1;
//     document.getElementById(this.name).src = this.src[this.id];
//   }
//
//   moveRight() {
//     this.id = (this.id <= 0) ? 11 : this.id - 1;
//     document.getElementById(this.name).src = this.src[this.id];
//   }
//
//   start() {
//     this.interval = setInterval(this.moveRight.bind(this), 500);
//   }
//
//   stop() {
//     clearInterval(this.interval);
//   }
// }
//
// let wheel = new Animation("wheel");
// let globe = new Animation("globe");
//
//
// document.addEventListener('load', () => {
//   const canvas = document.getElementById('image-canvas');
//
// });
//
// // animation control
// document.addEventListener('keydown', function (event) {
//   switch (event.key.toUpperCase()) {
//     case "ARROWUP":
//       wheel.start();
//       break;
//     case "ARROWDOWN":
//       wheel.stop();
//       break;
//     case "ARROWLEFT":
//       wheel.moveLeft();
//       break;
//     case "ARROWRIGHT":
//       wheel.moveRight();
//       break;
//     case "L":
//       wheel.moveLeft();
//       break;
//     case "R":
//       wheel.moveRight();
//       break;
//     case "W":
//       globe.start();
//       break;
//     case "A":
//       globe.moveLeft();
//       break;
//     case "S":
//       globe.stop();
//       break;
//     case "D":
//       globe.moveRight();
//       break;
//   }
// });
