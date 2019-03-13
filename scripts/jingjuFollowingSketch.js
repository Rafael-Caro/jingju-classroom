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
var navigationBoxHeight = 100;

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
      print(banshiName);
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
}

function draw () {
  background(255, 255, 204);
  navigationBox.displayBack();
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
}

function CreateNavigationBox () {
  this.x1 = leftExtraSpace + 10;
  this.x2 = width - 10;
  this.y1 = height - navigationBoxHeight - 10;
  this.y2 = height - 10;
  this.w = this.x2 - this.x1;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(this.x1, this.y1, this.w, navigationBoxHeight);
    // for (var i = 0; i < samList.length; i++) {
    //   stroke(255);
    //   strokeWeight(1);
    //   var samX = map(samList[i], 0, trackDuration, this.x1+navCursorW/2, this.x2-navCursorW/2);
    //   line(samX, this.y1, samX, this.y2);
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
      print(jump);
      if (playing) {
        banguTrack.jump(jump);
        voiceTrack.jump(jump);
        accTrack.jump(jump);
        jump = undefined;
      } else {
        currentTime = jump;
      }
    }
  }
}

function audioLoader (mbid) {
  voiceTrack = loadSound("tracks/" + mbid + "-voice.mp3");
  accTrack = loadSound("tracks/" + mbid + "-acc.mp3");
  banguTrack = loadSound("tracks/" + mbid + "-bangu.wav", function () {playButton.removeAttribute("disabled");loaded=true;});
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
