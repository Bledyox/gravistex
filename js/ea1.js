"use strict";

class Animation {
    constructor(name)
    {
        this.name = name;
        this.id = 0;
        this.src = [];
        for (let i = 0; i < 12; i++)    this.src[i] = "../img/frame/" + name + "_" + i + ".png";
    }
    moveLeft()
    {
        this.id = (this.id <= 0) ? 11 : this.id -1;
        document.getElementById(this.name).src = this.src[this.id];
    }
    moveRight()
    {
        this.id = (this.id >= 11) ? 0 : this.id + 1;
        document.getElementById(this.name).src = this.src[this.id];
    }
    start()
    {
        this.interval = setInterval(this.moveRight.bind(this), 500);
    }
    stop() {
        clearInterval(this.interval);
    }
}

let wheel = new Animation("wheel");
let globe = new Animation("globe");

// animation control
document.addEventListener('keydown', function (event) {
    switch(event.key.toUpperCase()) {
        case "ARROWUP":
            wheel.start();
            break;
        case "ARROWDOWN":
            wheel.stop();
            break;
        case "ARROWLEFT":
            wheel.moveLeft();
            break;
        case "ARROWRIGHT":
            wheel.moveRight();
            break;
        case "L":
            wheel.moveLeft();
            break;
        case "R":
            wheel.moveRight();
            break;
        case "W":
            globe.start();
            break;
        case "A":
            globe.moveLeft();
            break;
        case "S":
            globe.stop();
            break;
        case "D":
            globe.moveRight();
            break;
    }
});
