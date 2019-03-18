var mainHeight = 600;
var mainWidth = 1000;
var leftExtraSpace = 0;
var topExtraSpace = 0;

var recordingsInfo;
var pitchTrack;

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
var tempoCurve = [];
var banshiBoxes = [];
var banshiBoxW = 150;
var banshiBoxH = 30;
var lyricsBoxes = [];
var lyricsBoxTop = topExtraSpace+110;
var lyricsBoxBottom;
var lyricsShift = 0;
var strokes;
var cursor;
var cursorW = 5;
var banguW = 20;

var credits;
var bpm;
var bangu;

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

  ellipseMode(CORNER);
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
    .position(leftExtraSpace+10, lyricsBoxTop)
    .changed(muteTrack)
    .parent("sketch-holder");
  voiceSlider = createSlider(0, 100)
    .value(50)
    .size(100, 20)
    .position(leftExtraSpace+10, voiceToggle.position()['y']+voiceToggle.height+10)
    .changed(updateVolume)
    .parent("sketch-holder");
  accToggle = createCheckbox(' jinghu', true)
    .position(leftExtraSpace+10, voiceSlider.position()['y']+voiceSlider.height+50)
    .changed(muteTrack)
    .parent("sketch-holder");
  accSlider = createSlider(0, 100)
    .value(50)
    .size(100, 20)
    .position(leftExtraSpace+10, accToggle.position()['y']+accToggle.height+10)
    .changed(updateVolume)
    .parent("sketch-holder");
  banguToggle = createCheckbox(' bangu', true)
    .position(leftExtraSpace+10, accSlider.position()['y']+accSlider.height+50)
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
  bpm = new CreateBpm();
  bangu = new CreateBangu();

  headingLeft = leftExtraSpace + 20 + selectMenu.width;
  headingX = headingLeft + (width - headingLeft) / 2
}

function draw () {
  background(255, 255, 204);

  if (selectMenu.value() != 'Elige') {
    textAlign(CENTER, TOP);
    stroke(0);
    strokeWeight(5);
    fill(255, 255, 0);
    textSize(20);
    textStyle(BOLD);
    text(title, headingX, topExtraSpace+22);
    noStroke();
    fill(0);
    textSize(18);
    text(subtitle, headingX, topExtraSpace+50);
    credits.display();
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

  for (var i = 0; i < banshiBoxes.length; i++) {
    banshiBoxes[i].update();
    banshiBoxes[i].display();
  }

  stroke(255);
  strokeWeight(2);
  noFill();
  for (var i = 0; i < tempoCurve.length; i++) {
    beginShape();
    for (var j = 0; j < tempoCurve[i].length; j++) {
      vertex(tempoCurve[i][j][0], tempoCurve[i][j][1]);
    }
    endShape();
  }

  if (loaded && playing) {
    currentTime = voiceTrack.currentTime();
  }
  cursor.update();
  cursor.display();

  navigationBox.displayFront();

  if (loaded) {
    bpm.update();
    bpm.display();
    bangu.update();
    bangu.display();
  }
}

function start () {
  if (loaded) {
    voiceTrack.stop();
    accTrack.stop();
    banguTrack.stop();
  }
  var mbid = selectMenu.value()
  audioLoader(mbid);
  loaded = false;
  playing = false;
  currentTime = undefined;
  jump = undefined;
  lyricsShift = 0;
  banshiBoxes = [];
  lyricsBoxes = [];
  tempoCurve = [];
  playButton.html("Toca");
  playButton.attribute("disabled", "true");

  pitchTrack = loadJSON('files/pitchTracks/' + mbid + '-pitchTrack.json')

  langButton.removeAttribute("disabled");
  langButton.html("中");
  voiceToggle.attribute("disabled", "true");
  voiceSlider.attribute("disabled", "true");
  accToggle.attribute("disabled", "true");
  accSlider.attribute("disabled", "true");
  banguToggle.attribute("disabled", "true");
  banguSlider.attribute("disabled", "true");

  var recording = recordingsInfo[mbid];
  credits = new CreateCredits(recording);
  aria = recording.aria;
  ariaChinese = recording.ariaChinese;
  play = recording.play;
  playChinese = recording.playChinese;
  character = recording.character;
  characterChinese = recording.characterChinese;
  title = '"' + aria + '"';
  subtitle = play + ' (' + character + ')';
  trackDuration = recording.duration;
  var bpms = [];
  var banshi = recording.banshi;
  for (var i = 0; i < banshi.length; i++) {
    var banshiBox = new CreateBanshiBox(banshi[i], i);
    banshiBoxes.push(banshiBox);
    var lines = banshi[i].lines;
    for (var j = lines[0]; j <= lines[1]; j++) {
      var banshiLine = new CreateBanshiLine(j);
      banshiBox.banshiLines.push(banshiLine);
    }
    for (var j = 0; j < banshi[i].bangu.length; j++) {
      bpms.push(banshi[i].bangu[j].bpm);
    }
  }
  var maxBpm = Math.max.apply(null, bpms) + 10;
  var minBpm = Math.min.apply(null, bpms.filter(bpm => bpm > 0)) - 10;
  for (var i = 0; i < banshi.length; i++) {
    var tempoCurveChunk = [];
    for (var j = 0; j < banshi[i].bangu.length; j++) {
      var x = map(banshi[i].bangu[j].t, 0, trackDuration, navigationBox.x1+cursorW, navigationBox.x2-cursorW);
      var y = map(banshi[i].bangu[j].bpm, minBpm, maxBpm, navigationBox.y2, navigationBox.y1);
      tempoCurveChunk.push([x, y]);
    }
    tempoCurve.push(tempoCurveChunk);
  }
  var lyrics = recording.lyrics;
  for (var i = 0; i < lyrics.length; i++) {
     var lyricsBox = new CreateLyricsBox(lyrics[i], i);
     lyricsBoxes.push(lyricsBox);
  }
}

function CreateCredits (recording) {
  textSize(15);
  this.artist = [recording.artist + '    |    ', recording.artistChinese + '    |    '];
  this.roleType = [recording.roleType + ': ', recording.hangdang + '：'];
  this.jinghuArtist = [recording.jinghu, recording.jinghuChinese];
  this.jinghu = ['jinghu: ', '京胡：'];
  this.txtX = [headingX - (textWidth(this.roleType[0]) + textWidth(this.artist[0]) + textWidth(this.jinghu[0]) +
   textWidth(this.jinghuArtist[0]) + 20)/2, headingX - (textWidth(this.roleType[1]) + textWidth(this.artist[1]) +
   textWidth(this.jinghu[1]) + textWidth(this.jinghuArtist[1]) + 20)/2];
  this.credits;

  this.display = function () {
    var i;
    if (langButton.html() =="ES") {
      i = 1;
    } else {
      i = 0;
    }
    textAlign(LEFT, TOP);
    textStyle(NORMAL);
    textSize(15);
    var x = this.txtX[i];
    text(this.roleType[i], x, topExtraSpace+80);
    x += textWidth(this.roleType[i]);
    textStyle(BOLD);
    text(this.artist[i], x, topExtraSpace+80);
    x += textWidth(this.artist[i]);
    textStyle(NORMAL);
    text(this.jinghu[i], x, topExtraSpace+80)
    x += textWidth(this.jinghu[i]);
    textStyle(BOLD);
    text(this.jinghuArtist[i], x, topExtraSpace+80);
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
      }
    }
  }
}

function CreateCursor () {
  this.x;

  this.update = function () {
    this.x = map(currentTime, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2);
    if (navigationBox.x2 - cursorW/2 - this.x < 0.1) {
      print('stop');
      playButton.html("Toca");
      banguTrack.stop();
      voiceTrack.stop();
      accTrack.stop();
      playing = false;
      currentTime = 0;
      lyricsShift = 0;
    }
  }

  this.display = function () {
    stroke(255, 255, 0);
    strokeWeight(cursorW);
    line(this.x, navigationBox.y1+cursorW/2, this.x, navigationBox.y2-cursorW/2);
  }
}

function CreateLyricsBox (lyrics, i) {
  this.start = lyrics.start
  this.x1 = map(this.start, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2);
  this.x2 = map(lyrics.end, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2);
  this.y1 = navigationBox.y1;
  this.h = navigationBoxH;
  this.lx1 = headingLeft + banshiBoxW + 10;
  this.lx2 = width-20;
  this.ly1 = lyricsBoxTop + 20*i;
  this.ly2 = this.ly1+20;
  this.fill = color(0, 50);
  this.stroke = color(255, 255, 204, 100);
  this.txtBack = color(255, 0);
  this.lyrics = lyrics.lyrics;
  this.lyricsChinese = lyrics.lyricsChinese;
  this.lyrics2display;
  this.hidden;

  this.update = function () {
    if (cursor.x >= this.x1 && cursor.x < this.x2) {
      this.fill = color(255, 255, 0, 75);
      this.stroke = color(255, 255, 0, 75);
      this.txtBack = color(255, 255, 0, 75);
      if (this.ly1+lyricsShift < lyricsBoxTop) {
        lyricsShift = lyricsBoxTop - this.ly1;
      } else if (this.ly2+lyricsShift > lyricsBoxBottom) {
        lyricsShift = lyricsBoxBottom - this.ly2;
      }
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
    rect(this.x1, this.y1, this.x2-this.x1, this.h);
    if (this.ly2+lyricsShift > lyricsBoxTop && this.ly1+lyricsShift < lyricsBoxBottom) {
      this.hidden = false;
      fill(this.txtBack);
      noStroke();
      rect(this.lx1, this.ly1+lyricsShift, this.lx2-this.lx1, 20);
      textAlign(LEFT, BOTTOM);
      textStyle(NORMAL);
      textSize(15);
      fill(0);
      text(this.lyrics2display, this.lx1+10, this.ly1+lyricsShift, this.lx2-this.lx1, 20);
    } else {
      this.hidden = true;
    }
  }

  this.clicked = function () {
    if (mouseX > this.lx1 && mouseX < this.lx2 && mouseY > this.ly1+lyricsShift && mouseY < this.ly2+lyricsShift
       && !this.hidden) {
      jump = this.start;
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

function CreateBanshiBox (banshi, i) {
  this.start = banshi.start
  this.x1 = map(this.start, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2);
  this.x2 = map(banshi.end, 0, trackDuration, navigationBox.x1+cursorW/2, navigationBox.x2-cursorW/2);
  this.y1 = navigationBox.y1;
  this.h = banshiBoxH;
  this.bangu = banshi.bangu;
  this.fill = color(0, 50);
  this.stroke = color(255, 255, 204, 100);
  this.txtBack = color(255, 0);
  this.name = banshi.name;
  this.nameChinese = banshi.nameChinese;
  this.banshiLines = []
  this.banshi2display;

  this.update = function () {
    if (cursor.x >= this.x1 && cursor.x < this.x2) {
      this.fill = color(255, 255, 0, 75);
      this.stroke = color(255, 255, 0, 75);
      this.txtBack = color(255, 255, 0, 75);
    } else {
      this.fill = color(0, 50);
      this.stroke = color(255, 255, 204, 100);
      this.txtBack = color(255, 0);
    }
    if (langButton.html() == "中") {
      this.banshi2display = this.name;
    } else {
      this.banshi2display = this.nameChinese;
    }
  }

  this.display = function () {
    fill(this.fill);
    // stroke(this.stroke);
    stroke(0);
    strokeWeight(1);
    rect(this.x1, this.y1, this.x2-this.x1, this.h);
    var banshiDisplayed = false;
    for (var i = 0; i < this.banshiLines.length; i++) {
      var banshiLine = this.banshiLines[i];
      if (banshiLine.y2+lyricsShift > lyricsBoxTop && banshiLine.y1+lyricsShift < lyricsBoxBottom) {
        banshiLine.hidden = false;
        noStroke();
        fill(this.txtBack);
        rect(banshiLine.x1, banshiLine.y1+lyricsShift, banshiBoxW, 20)
        if (!banshiDisplayed) {
          textAlign(LEFT, BOTTOM);
          textStyle(BOLD);
          textSize(15);
          fill(0);
          text(this.banshi2display, banshiLine.x1+10, banshiLine.y1+lyricsShift, banshiBoxW, 20);
          banshiDisplayed = true;
        }
      } else {
        banshiLine.hidden = true;
      }
    }
  }

  this.clicked = function () {
    for (var i = 0; i < this.banshiLines.length; i++) {
      var banshiLine = this.banshiLines[i];
      if (mouseX > banshiLine.x1 && mouseX < banshiLine.x2 && mouseY > banshiLine.y1+lyricsShift &&
          mouseY < banshiLine.y2+lyricsShift && !banshiLine.hidden) {
        jump = this.start;
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
}

function CreateBanshiLine (i) {
  this.x1 = headingLeft + 10;
  this.x2 = this.x1+banshiBoxW;
  this.y1 = lyricsBoxTop + 20 * i;
  this.y2 = this.y1+20;
  this.hidden;
}

function CreateBpm () {
  this.bpm;
  this.style;
  this.update = function () {
    var bpm = pitchTrack[currentTime.toFixed(2)].bpm;
    if (bpm=='s') {
      this.style = ITALIC;
      this.bpm = 'disperso';
    } else if (bpm=='') {
      this.bpm = '';
    } else {
      this.style = NORMAL;
      this.bpm = str(bpm) + ' bpm';
    }
  }
  this.display = function () {
    textAlign(RIGHT, BOTTOM);
    textStyle(this.style);
    textSize(15);
    noStroke();
    fill(0);
    text(this.bpm, headingLeft, lyricsBoxBottom);
  }
}

function CreateBangu () {
  this.color;
  this.stroke = color(0);
  this.disabled = false;
  this.update = function () {
    if (this.disabled) {
      this.color = color(0, 0);
    } else {
      var bg = pitchTrack[currentTime.toFixed(2)].bg;
      if (bg == "") {
        this.color = color(0, 50);
      } else if (bg == 1) {
        this.color = color(255, 255, 0);
      } else if (bg == 2) {
        this.color = color(255, 160, 122);
      }
    }
  }
  this.display = function () {
    stroke(this.stroke);
    strokeWeight(1);
    fill(this.color);
    ellipse(leftExtraSpace+10, lyricsBoxBottom-banguW, banguW, banguW);
  }
  this.clicked = function () {
    if (dist(mouseX, mouseY, leftExtraSpace+10+banguW/2, lyricsBoxBottom-banguW/2) < banguW/2) {
      if (this.disabled) {
        this.stroke = color(0);
        this.disabled = false;
      } else {
        this.stroke = color(0, 150);
        this.disabled = true;
      }
    }
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
    for (var i = 0; i < lyricsBoxes.length; i++) {
      lyricsBoxes[i].clicked();
    }
    for (var i = 0; i < banshiBoxes.length; i++) {
      banshiBoxes[i].clicked();
    }
    bangu.clicked();
  }
}

function niceTime (seconds) {
  var niceTime;
  var sec = int(seconds%60);
  var min = int(seconds/60);
  niceTime = str(min).padStart(2, "0") + ":" + str(sec).padStart(2, "0");
  return niceTime
}
