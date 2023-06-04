var stage, loader, prk, jumpListener, pipeCreator, score, scoreText;
var started;
var polygon;

function init() {
  stage = new createjs.StageGL("gameCanvas");

  createjs.Ticker.timingMode = createjs.Ticker.RAF_SYNCHED;
  createjs.Ticker.framerate = 60;
  createjs.Ticker.addEventListener("tick", stage);

  var background = new createjs.Shape();
  background.graphics.beginLinearGradientFill(["#FFC0CB", "#FF7514", "#FAF6AE"], [0, 0.85, 1], 0, 0, 0, 480)
  .drawRect(0, 0, 320, 480);
  background.x = 0;
  background.y = 0;
  background.name = "background";
  background.cache(0, 0, 320, 480);

  stage.addChild(background);

  var manifest = [
    { "src": "cloud.png", "id": "cloud" },
    { "src": "scooter.png", "id": "prk" },
    { "src": "pipe.png", "id": "pipe" },
    { "src": "pipe2.png", "id": "pipe2" },
  ];

  loader = new createjs.LoadQueue(true);
  loader.addEventListener("complete", handleComplete);
  loader.loadManifest(manifest, true, "./imgs/");
}

function handleComplete() {
  started = false;
  createClouds();
  createPrk();
  createScore();
  jumpListener = stage.on("stagemousedown", jumpPrk);
  createjs.Ticker.addEventListener("tick", checkCollision);
  polygon = new createjs.Shape();
  stage.addChild(polygon);
}

function createClouds() {
  var clouds = [];
  for (var i = 0; i < 3; i++) {
    clouds.push(new createjs.Bitmap(loader.getResult("cloud")));
  }

  clouds[0].x = 40;
  clouds[0].y = 20;
  clouds[1].x = 140;
  clouds[1].y = 70;
  clouds[2].x = 100;
  clouds[2].y = 130;

  for (var i = 0; i < 3; i++) {
    var directionMultiplayer = i % 2 == 0 ? -1 : 1;
    var originalX = clouds[i].x;
    createjs.Tween.get(clouds[i], { loop: true})
    .to({ x: clouds[i].x - (200 * directionMultiplayer)}, 3000, createjs.Ease.getPowInOut(2))
    .to({ x: originalX }, 3000, createjs.Ease.getPowInOut(2));
    stage.addChild(clouds[i]);
  }
}

function createPrk() {
  prk = new createjs.Bitmap(loader.getResult("prk"));
  prk.regX = prk.image.width / 2;
  prk.regY = prk.image.height / 2;
  prk.x = stage.canvas.width / 2;
  prk.y = stage.canvas.height / 2;
  stage.addChild(prk);
}

function jumpPrk() {
  if (!started) {
    startGame();
  }
  createjs.Tween.get(prk, { override: true }).to( { y: prk.y - 60, rotation: -10 }, 350, createjs.Ease.getPowOut(2))
  .to({ y: stage.canvas.height + (prk.image.width / 2), rotation: 30 }, 1150, createjs.Ease.getPowIn(2))
  .call(gameOver);
}

function createPipes() {
  var topPipe, bottomPipe;
  var position = Math.floor(Math.random() * 250 + 150);

  topPipe = new createjs.Bitmap(loader.getResult("pipe2"));
  topPipe.y = position - 225;
  topPipe.x = stage.canvas.width + (topPipe.image.width / 32);
  topPipe.rotation = - 180;
  topPipe.skewY = - 180;
  topPipe.name = "pipe2";

  bottomPipe = new createjs.Bitmap(loader.getResult("pipe"));
  bottomPipe.y = position + 50;
  bottomPipe.x = stage.canvas.width + (bottomPipe.image.width / 1);
  bottomPipe.skewY = 180;
  bottomPipe.name = "pipe";

  topPipe.regX = bottomPipe.regX = topPipe.image.width / 2;

  createjs.Tween.get(topPipe).to({ x: 0 - topPipe.image.width }, 10000).call(function() { removePipe(topPipe); })
  .addEventListener("change", updatePipe);
  createjs.Tween.get(bottomPipe).to({ x: 0 - bottomPipe.image.width }, 10000).call(function() { removePipe(bottomPipe); });

  var scoreIndex = stage.getChildIndex(scoreText);

  stage.addChildAt(bottomPipe, topPipe, scoreIndex);
}

function removePipe(pipe) {
  stage.removeChild(pipe);
}

function updatePipe(event) {
  var pipeUpdated = event.target.target;
  if ((pipeUpdated.x - pipeUpdated.regX + pipeUpdated.image.width) < (prk.x - prk.regX)) {
    event.target.removeEventListener("change", updatePipe);
    incrementScore();
  }
}

function createScore() {
  score = 0;
  scoreText = new createjs.Text(score, "bold 48px Arial", "#FFFFFF");
  scoreText.textAlign = "center";
  scoreText.textBaseline = "middle";
  scoreText.x = 40;
  scoreText.y = 40;
  var bounds = scoreText.getBounds();
  scoreText.cache(-40, -40, bounds.width*3 + Math.abs(bounds.x), bounds.height + Math.abs(bounds.y));

scoreTextOutline = scoreText.clone();
scoreTextOutline.color = "#000000";
scoreTextOutline.outline = 2;
bounds = scoreTextOutline.getBounds();
scoreTextOutline.cache(-40, -40, bounds.width*3 + Math.abs(bounds.x), bounds.height + Math.abs(bounds.y));


  stage.addChild(scoreText, scoreTextOutline);
}

function incrementScore() {
  score++;
  scoreText.text = scoreTextOutline.text = score;
  scoreText.updateCache();
  scoreTextOutline.updateCache();
}

function startGame() {
  started = true;
  createPipes();
  pipeCreator = setInterval(createPipes, 6000);
}

function checkCollision() {
  var leftX = prk.x - prk.regX - 25;
  var leftY = prk.y - prk.regY - 25;
  var points = [
    new createjs.Point(leftX, leftY),
    new createjs.Point(leftX + prk.image.width - 25, leftY),
    new createjs.Point(leftX, leftY + prk.image.height - 25),
    new createjs.Point(leftX + prk.image.width - 25, leftY + prk.image.height - 25)
  ];

  polygon.graphics.clear().beginStroke("black")
  polygon.graphics.moveTo(points[0].x, points[0].y).lineTo(points[2].x, points[2].y).lineTo(points[3].x, points[3].y)
  .lineTo(points[1].x, points[1].y).lineTo(points[0].x, points[0].y);

  for (var i = 0; i < points.length; i++) {
    var objects = stage.getObjectsUnderPoint(points[i].x, points[i].y);
    if (objects.filter((object) => object.name == "pipe").length > 0) {
      gameOver();
      return;
    }
  }
}

function gameOver() {
  createjs.Tween.removeAllTweens();
  stage.off("stagemousedown", jumpListener);
  clearInterval(pipeCreator);
  createjs.Ticker.removeEventListener("tick", checkCollision);
  setTimeout(function () {
    stage.on("stagemousedown", resetGame, null, true);
  }, 2000);
}

function resetGame() {
  var childrenToRemove = stage.children.filter((child) => child.name != "background");
  for (var i = 0; i < childrenToRemove.length; i++) {
    stage.removeChild(childrenToRemove[i]);
  }
  handleComplete();
}
