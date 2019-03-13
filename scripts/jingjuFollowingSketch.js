var mainHeight = 600;
var mainWidth = 800;
var leftExtraSpace = 0;
var topExtraSpace = 0;

var recordingsInfo;

var voiceTrack;
var accTrack;
var banguTrack;

var selectMenu;
var playButton;
var navigationBox;
var navigationBoxH = 100;
var banguX = [];
var banguY = [];
var cursor;
var cursorW = 5;

var loaded;
var playing;
var trackDuration;
var currentTime;
var jump;

function preload () {
  recordingsInfo = loadJSON("files/recordingsInfo.json");
}

function setup () {
  var canvas = createCanvas(mainWidth + leftExtraSpace, mainHeight + topExtraSpace);
  var div = select("#sketch-holder");
  div.style("width: " + width + "px; position: relative;");
  canvas.parent("sketch-holder");

  ellipseMode(RADIUS);
  angleMode(DEGREES);
  strokeJoin(ROUND);

  selectMenu = createSelect()
    .size(100, 20)
    .position(leftExtraSpace+10, topExtraSpace+10)
    .changed(start)
    .parent("sketch-holder");
  selectMenu.option("Elige");
  var noRec = selectMenu.child();
  noRec[0].setAttribute("selected", "true");
  noRec[0].setAttribute("disabled", "true");
  noRec[0].setAttribute("hidden", "true");
  noRec[0].setAttribute("style", "display: none");
  var mbids = Object.keys(recordingsInfo)
  for (var i = 0; i < mbids.length; i++) {
    var mbid = mbids[i]
    var aria = recordingsInfo[mbid].aria;
    var roleType0 = recordingsInfo[mbid].roleType;
    var roleType = roleType0.charAt(0).toUpperCase() + roleType0.slice(1);
    var banshi = recordingsInfo[mbid].banshi;
    var banshis = [];
    for (var b = 0; b < banshi.length; b++) {
      var banshiName = banshi[b].name;
      banshis.push(banshiName)
    }
    var banshiLine = banshis.join(", ");
    var duration = niceTime(recordingsInfo[mbid].duration);
    var option = '"' + aria + '." ' + roleType + ": " + banshiLine + ' (' + duration + ')';
    selectMenu.option(option, mbid);
  }

  playButton = createButton("Toca")
    .size(50, 50)
    .position(leftExtraSpace+10, selectMenu.position()['y']+selectMenu.height+10)
    .mousePressed(player)
    .parent("sketch-holder")
    .attribute("disabled", "true");

  navigationBox = new CreateNavigationBox();
  cursor = new CreateCursor();
}

function draw () {
  background(255, 255, 204);
  navigationBox.displayBack();

  stroke(255);
  strokeWeight(2);
  noFill();
  beginShape();
  for (var i = 1; i < banguX.length; i++) {
    vertex(banguX[i], banguY[i]);
  }
  endShape();

  if (loaded && playing) {
    currentTime = voiceTrack.currentTime();
  }
  cursor.update();
  cursor.display();

  navigationBox.displayFront();
}

function start () {
  var mbid = selectMenu.value()
  audioLoader(mbid);
  var loaded = false;
  var playing = false;
  var currentTime;
  var jump;

  var recording = recordingsInfo[mbid];
  trackDuration = recording.duration;
  bangu = recording.bangu;
  for (var i = 0; i < bangu.length; i++) {
    banguX.push(map(bangu[i].timeStamp, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2));
  }
  var bpms = [];
  for (var i = 0; i < bangu.length; i++) {
    bpms.push(bangu[i].bpm)
  }
  var maxBpm = Math.max.apply(null, bpms) + 10;
  var minBpm = Math.min.apply(null, bpms.filter(bpm => bpm > 0)) - 10;
  for (var i = 0; i < bangu.length; i++) {
    banguY.push(map(bangu[i].bpm, minBpm, maxBpm, navigationBox.y2, navigationBox.y1))
  }
}

function CreateNavigationBox () {
  this.x1 = leftExtraSpace + 10;
  this.x2 = width - 10;
  this.y1 = height - navigationBoxH - 10;
  this.y2 = height - 10;
  this.w = this.x2 - this.x1;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(this.x1, this.y1, this.w, navigationBoxH);
    // for (var i = 0; i < banguList.length; i++) {
    //   stroke(255);
    //   strokeWeight(1);
    //   var x = map(banguList[i], 0, trackDuration, this.x1+cursorW/2, this.x2-cursorW/2);
    //   line(x, this.y1, x, this.y2);
    // }
  }

  this.displayFront = function () {
    stroke(0, 150);
    strokeWeight(2);
    line(this.x1+1, this.y1, this.x2, this.y1);
    line(this.x2, this.y1, this.x2, this.y2);
    strokeWeight(1);
    line(this.x1, this.y1, this.x1, this.y2);
    line(this.x1, this.y2, this.x2, this.y2);
  }

  this.clicked = function () {
    if (mouseX > this.x1 && mouseX < this.x2 && mouseY > this.y1 && mouseY < this.y2) {
      jump = map(mouseX, this.x1, this.x2, 0, trackDuration);
      if (playing) {
        banguTrack.jump(jump);
        voiceTrack.jump(jump);
        accTrack.jump(jump);
        jump = undefined;
      } else {
        currentTime = jump;
        print(currentTime);
      }
    }
  }
}

function CreateCursor () {
  this.x;

  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2);
    if (navigationBox.x2 - cursorW/2 - this.x < 0.1) {
      playButton.html("Toca");
      banguTrack.stop();
      voiceTrack.stop();
      accTrack.stop();
      playing = false;
      currentTime = 0;
    }
  }

  this.display = function () {
    stroke("yellow");
    strokeWeight(cursorW);
    line(this.x, navigationBox.y1+cursorW/2, this.x, navigationBox.y2-cursorW/2);
  }
}

function audioLoader (mbid) {
  banguTrack = loadSound("tracks/" + mbid + "-bangu.mp3");
  voiceTrack = loadSound("tracks/" + mbid + "-voice.mp3");
  accTrack = loadSound("tracks/" + mbid + "-acc.mp3", function () {
    playButton.removeAttribute("disabled");
    loaded=true;
    currentTime = 0;
  });
}

function player () {
  if (playing) {
    banguTrack.pause();
    voiceTrack.pause();
    accTrack.pause();
    playing = false;
    playButton.html("Sigue");
  } else {
    if (jump == undefined) {
      banguTrack.play();
      voiceTrack.play();
      accTrack.play();
    } else {
      banguTrack.play();
      voiceTrack.play();
      accTrack.play();
      banguTrack.jump(jump);
      voiceTrack.jump(jump);
      accTrack.jump(jump);
      jump = undefined;
    }
    playing = true;
    playButton.html("Pausa");
  }
}

function mouseClicked () {
  if (loaded) {
    navigationBox.clicked();
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
