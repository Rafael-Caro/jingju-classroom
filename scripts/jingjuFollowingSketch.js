var mainHeight = 600;
var mainWidth = 1000;
var leftExtraSpace = 0;
var topExtraSpace = 0;

var recordingsInfo;

var voiceTrack;
var accTrack;
var banguTrack;

var selectMenu;
var langButton;
var playButton;
var voiceToggle;
var voiceSlider;
var accToggle;
var accSlider;
var banguToggle;
var banguSlider;
var navigationBox;
var navigationBoxH = 100;
var banguX = [];
var banguY = [];
var lyrics;
var lyricsBoxes = [];
var lyricsBoxTop = topExtraSpace+110;
var lyricsBoxBottom;
var cursor;
var cursorW = 5;

var aria;
var ariaChinese;
var play;
var playChinese;
var character;
var characterChinese;
var title;
var subtitle;

var loaded;
var playing;
var trackDuration;
var currentTime;
var jump;

var headingLeft;
var headingX;

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

  langButton = createButton("中")
    .size(30, 30)
    .position(width-30-10, 10)
    .mousePressed(langChange)
    .parent("sketch-holder")
    .attribute("disabled", "true");

  playButton = createButton("Toca")
    .size(100, 50)
    .position(leftExtraSpace+10, selectMenu.position()['y']+selectMenu.height+10)
    .mousePressed(player)
    .parent("sketch-holder")
    .attribute("disabled", "true");

  voiceToggle = createCheckbox(' voz', true)
    .position(leftExtraSpace+10, playButton.position()['y']+playButton.height+10)
    .changed(muteTrack)
    .parent("sketch-holder");
  voiceSlider = createSlider(0, 100)
    .value(50)
    .size(100, 20)
    .position(leftExtraSpace+10, voiceToggle.position()['y']+voiceToggle.height+10)
    .changed(updateVolume)
    .parent("sketch-holder");
  accToggle = createCheckbox(' jinghu', true)
    .position(leftExtraSpace+10, voiceSlider.position()['y']+voiceSlider.height+20)
    .changed(muteTrack)
    .parent("sketch-holder");
  accSlider = createSlider(0, 100)
    .value(50)
    .size(100, 20)
    .position(leftExtraSpace+10, accToggle.position()['y']+accToggle.height+10)
    .changed(updateVolume)
    .parent("sketch-holder");
  banguToggle = createCheckbox(' bangu', true)
    .position(leftExtraSpace+10, accSlider.position()['y']+accSlider.height+20)
    .changed(muteTrack)
    .parent("sketch-holder");
  banguSlider = createSlider(0, 100)
    .value(50)
    .size(100, 20)
    .position(leftExtraSpace+10, banguToggle.position()['y']+banguToggle.height+10)
    .changed(updateVolume)
    .parent("sketch-holder");
  voiceToggle.attribute("disabled", "true");
  voiceSlider.attribute("disabled", "true");
  accToggle.attribute("disabled", "true");
  accSlider.attribute("disabled", "true");
  banguToggle.attribute("disabled", "true");
  banguSlider.attribute("disabled", "true");

  navigationBox = new CreateNavigationBox();
  lyricsBoxBottom = navigationBox.y1-20;
  cursor = new CreateCursor();

  headingLeft = leftExtraSpace + 20 + selectMenu.width;
  headingX = headingLeft + (width - headingLeft) / 2
}

function draw () {
  background(255, 255, 204);

  if (selectMenu.value() != 'Elige') {
    textAlign(CENTER, TOP);
    stroke(0);
    strokeWeight(5);
    fill("Yellow");
    textSize(20);
    text(title, headingX, topExtraSpace+22);
    noStroke();
    fill(0);
    textSize(18);
    text(subtitle, headingX, topExtraSpace+50);
  }

  fill(255);
  stroke(0);
  strokeWeight(1);
  rect(headingLeft+10, lyricsBoxTop, width-headingLeft-30, lyricsBoxBottom-lyricsBoxTop);

  navigationBox.displayBack();

  for (var i = 0; i < lyricsBoxes.length; i++) {
    lyricsBoxes[i].update();
    lyricsBoxes[i].display();
  }

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

  langButton.removeAttribute("disabled");
  langButton.html("中");
  voiceToggle.attribute("disabled", "true");
  voiceSlider.attribute("disabled", "true");
  accToggle.attribute("disabled", "true");
  accSlider.attribute("disabled", "true");
  banguToggle.attribute("disabled", "true");
  banguSlider.attribute("disabled", "true");

  var recording = recordingsInfo[mbid];
  aria = recording.aria;
  ariaChinese = recording.ariaChinese;
  play = recording.play;
  playChinese = recording.playChinese;
  character = recording.character;
  characterChinese = recording.characterChinese;
  title = '"' + aria + '"';
  subtitle = play + ' (' + character + ')';
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
  lyrics = recording.lyrics;
  for (var i = 0; i < lyrics.length; i++) {
     var lyricsBox = new CreateLyricsBox(lyrics[i], i);
     lyricsBoxes.push(lyricsBox);
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

function CreateLyricsBox (lyrics, i) {
  this.x1 = map(lyrics.start, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2)
  this.x2 = map(lyrics.end, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2)
  this.fill = color(0, 50);
  this.stroke = color(255, 255, 204, 100);
  this.txtBack = color(255, 0);
  this.lyrics = lyrics.lyrics;
  this.lyricsChinese = lyrics.lyricsChinese;
  this.lyrics2display;

  this.update = function () {
    if (cursor.x >= this.x1 && cursor.x <= this.x2) {
      this.fill = color(255, 255, 0, 50);
      this.stroke = color(255, 255, 0, 50);
      this.txtBack = color(255, 255, 0, 50);
    } else {
      this.fill = color(0, 50);
      this.stroke = color(255, 255, 204, 100);
      this.txtBack = color(255, 0);
    }
    if (langButton.html() == "中") {
      this.lyrics2display = this.lyrics;
    } else {
      this.lyrics2display = this.lyricsChinese;
    }
  }

  this.display = function () {
    fill(this.fill);
    stroke(this.stroke);
    strokeWeight(1);
    rect(this.x1, navigationBox.y1, this.x2-this.x1, navigationBoxH);
    fill(this.txtBack);
    noStroke();
    rect(headingLeft + 10, lyricsBoxTop + 20*i, width-headingLeft-30, 20);
    textAlign(LEFT, BOTTOM);
    textSize(15);
    fill(0);
    text(this.lyrics2display, headingLeft+20, lyricsBoxTop + 20 * i, width-headingLeft-30, 20);
  }
}

function audioLoader (mbid) {
  banguTrack = loadSound("tracks/" + mbid + "-bangu.mp3");
  voiceTrack = loadSound("tracks/" + mbid + "-voice.mp3");
  accTrack = loadSound("tracks/" + mbid + "-acc.mp3", function () {
    playButton.removeAttribute("disabled");
    loaded=true;
    currentTime = 0;
    voiceToggle.removeAttribute("disabled");
    voiceSlider.removeAttribute("disabled");
    accToggle.removeAttribute("disabled");
    accSlider.removeAttribute("disabled");
    banguToggle.removeAttribute("disabled");
    banguSlider.removeAttribute("disabled");
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

function muteTrack () {
  if (loaded) {
    if (voiceToggle.checked()) {
      voiceTrack.setVolume(0.5);
    } else {
      voiceTrack.setVolume(0);
    }
    if (accToggle.checked()) {
      accTrack.setVolume(0.5);
    } else {
      accTrack.setVolume(0);
    }
    if (banguToggle.checked()) {
      banguTrack.setVolume(0.5);
    } else {
      banguTrack.setVolume(0);
    }
  }
}

function updateVolume () {
  voiceTrack.setVolume(voiceSlider.value()/100);
  accTrack.setVolume(accSlider.value()/100);
  banguTrack.setVolume(banguSlider.value()/100);
}

function langChange () {
  if (langButton.html() == "中") {
    title = ariaChinese;
    subtitle = playChinese + " （" + characterChinese + "）"
    langButton.html("ES");
  } else {
    title = '"' + aria + '"';
    subtitle = play + ' (' + character + ')';
    langButton.html("中");
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
