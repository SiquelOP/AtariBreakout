const myCanvas = document.querySelector(".my-canvas");
const ctx = myCanvas.getContext("2d");

myCanvas.width = window.innerWidth;
myCanvas.height = window.innerHeight;

const startScreen = document.querySelector(".start-screen");
const timeout = document.querySelector(".timeout");
const timeoutH1 = document.querySelector(".timeout > h1");

let blocks;
const padding = 5;
let blockWidth;
const blockHeight = 30;
const rows = 4;
const cols = 12;

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  add(vector) {
    this.x += vector.x;
    this.y += vector.y;
  }

  changeDirX() {
    this.x *= -1;
  }

  changeDirY() {
    this.y *= -1;
  }
}

let velocity = new Vector2(5, 5);
let paddleVelocity = new Vector2(0, 0);

const colors = ["#cee3dc", "#9EC8B9", "#5C8374", "#1B4242"];

let ballRadius;
const paddleHeight = 20;
let paddleWidth;

let myInterval;

let ballPos;
let paddlePos;

let points = 0;
let gamePaused = false;
let itrr = 0;

const prepareGame = async () => {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);
  document.querySelector(".game-over").classList.remove("active");
  
  points = 0;
  itrr = 0;
  timeoutH1.textContent = 5;
  gamePaused = false;

  blocks = [];

  blockWidth = (myCanvas.width - (cols - 1) * padding) / cols;
  ballRadius = blockWidth / 16;

  createBlock();

  paddleWidth = blockWidth * 1.5;

  ballPos = new Vector2(
    myCanvas.width / 2 - ballRadius,
    myCanvas.height / 3 - ballRadius
  );

  paddlePos = new Vector2(
    myCanvas.width / 2 - paddleWidth / 2,
    myCanvas.height - 100
  );

  draw();
  drawBall();
  drawPaddle();

  randomNumber();

  startScreen.classList.add("anim");
  const time = parseFloat(
    getComputedStyle(startScreen).getPropertyValue("--time").replace("ms", "")
  );

  setTimeout(() => {
    startScreen.style.display = "none";
    myCanvas.style.display = "block";
  }, time);

  timeout.classList.add("numbers");
  myInterval = setInterval(countDown, 1000);
};

const countDown = () => {
  if (itrr >= 5) {
    clearInterval(myInterval);
    timeout.classList.remove("numbers");
    startGame();
    return;
  }
  let temp = parseInt(timeoutH1.textContent);
  timeoutH1.textContent = temp - 1;
  itrr++;
};

const createBlock = () => {
  for (let i = 0; i < rows; i++) {
    blocks[i] = [];
    for (let j = 0; j < cols; j++) {
      blocks[i][j] = {
        x: j * (blockWidth + padding),
        y: i * (blockHeight + padding),
        durability: rows - i,
        visible: true,
      };
    }
  }
};

const draw = () => {
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let temp = blocks[i][j];

      if (!temp.visible) continue;
      if ( blocks[i][j]. durability <= 0) blocks[i][j].visible = false;

      ctx.beginPath();
      ctx.rect(temp.x, temp.y, blockWidth, blockHeight);
      ctx.fillStyle = colors[temp.durability - 1];
      ctx.fill();
      ctx.closePath();
    }
  }
};

const drawBall = () => {
  if (ballPos.x + ballRadius * 2 >= myCanvas.width) velocity.changeDirX();
  if (ballPos.x <= 0) velocity.changeDirX();

  if (ballPos.y + ballRadius * 2 >= myCanvas.height) gameOver();
  if (ballPos.y <= 0) velocity.changeDirY();

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (blocks[i][j].visible) {
        const blockLeft = blocks[i][j].x;
        const blockRight = blocks[i][j].x + blockWidth;
        const blockTop = blocks[i][j].y;
        const blockBottom = blocks[i][j].y + blockHeight;

        if ( ballPos.x + ballRadius >= blockLeft && ballPos.x - ballRadius <= blockRight && ballPos.y + ballRadius >= blockTop && ballPos.y - ballRadius <= blockBottom ) {
            switch (blocks[i][j].durability) {
              case 4:
                points += 50;
                break;
              case 3:
                points += 25;
                break;
              case 2:
                points += 10;
                break;
              case 1: 
                points += 100;
            }
            if ( ballPos.x >= blockLeft && ballPos.x <= blockRight) {
              velocity.changeDirY();
              blocks[i][j].durability -= 1;
              console.log("Change X");
            }
            
            if ( ballPos.y <= blockBottom && ballPos.y >= blockTop) {
              velocity.changeDirX();
              blocks[i][j].durability -= 1;
              console.log("Change Y");
            }
        }
      }
    }
  }

  if(ballPos.x >= paddlePos.x && ballPos.x <= paddlePos.x + paddleWidth && ballPos.y >= paddlePos.y) {
    velocity.changeDirY();
  }

  ballPos.add(velocity);

  ctx.beginPath();
  ctx.arc(ballPos.x, ballPos.y, ballRadius * 2, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.stroke();
  ctx.closePath();
};

const drawPaddle = () => {
  if ( (paddleVelocity.x > 0 && paddlePos.x + paddleWidth + paddleVelocity.x > myCanvas.width) || (paddleVelocity.x < 0 && paddlePos.x + paddleVelocity.x < 0) ) {
    paddleVelocity.x = 0;
  } 
  
  else {
    paddlePos.add(paddleVelocity);
  }
  
  ctx.beginPath();
  ctx.rect(
    paddlePos.x,
    paddlePos.y,
    paddleWidth,
    paddleHeight
  );
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.closePath();
};

const whichKey = (event) => {
  if (event.key == 'd' || event.key == "ArrowRight") {
    paddleVelocity.x = 15;
  }

  if (event.key == 'a' || event.key == "ArrowLeft") {
    paddleVelocity.x = -15;
  }
}

const removeVelocity = () => {
  paddleVelocity.x = 0;
}

document.addEventListener("keydown", whichKey);
document.addEventListener("keyup", removeVelocity);

const randomNumber = () => {
  let temp = 0;
  temp = Math.round(Math.random() * (2) );
  if(temp == 0) {
    velocity.changeDirX();
  }
};

const isOver = () => {
  let temp = 0;
  for ( let i = 0; i < rows; i++ ) {
    for ( let j = 0; j < cols; j++ ) {
      if ( blocks[i][j].visible == true ) temp++;
    }
  }

  if ( temp != 0 ) return;

  gameWon();
}

const startGame = () => {
  ctx.clearRect(0, 0, myCanvas.width, myCanvas.height);

  drawBall();
  draw();
  drawPaddle();

  isOver();

  if (!gamePaused) {
    requestAnimationFrame(startGame);
  }
};

const gameOver = () => {
  gamePaused = true;
  document.querySelector(".game-over").classList.add("active");
  let pointsElem = document.querySelector(".points");
  pointsElem.textContent = points;
  pointsElem.style.color = "white";
}

const gameWon = () => {
  gamePaused = true;

  document.querySelector(".end-screen").classList.add("victory");
  document.querySelector(".points2").textContent = " " + points;
}