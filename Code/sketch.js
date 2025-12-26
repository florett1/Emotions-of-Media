let style = document.createElement('style');
style.innerHTML = `
.ui-visible label {
   display: flex;
   align-items: center;
   color: white;
   display: inline-block;
 }
 .ui-visible input {
   margin-right: 5px;
   margin-left: 15px;
   display: inline-block;
 }

 .ui-hidden label {
   display: none;
 }
 .ui-hidden input {
    display: none;
 }

  .slider-visible {
    display: block;
  }
  .slider-hidden {
    display: none;
  }

 .dark-button {
   background-color: #000000;
   color: #555555;
   border: 3px #555555;
   padding: 5px 10px;
   }

  .dark-button:hover {
    background-color: #222222;
    color: #FFFFFF;
  }
 `;
document.head.appendChild(style);


let data;

async function preload() {
  //data = loadJSON('sampleStream2.json');
}

// create simple array of dots for a specific emotion
function createEmotionDots(emotion) {
  emotionDots = [];
  for (let i = 0; i < 600; i++) {
    let x = random(width);
    let y = random(width);
    emotionDots.push(new emotionDot(x, y, emotion));
  }

  return emotionDots;
}

// creates UI elements
function createUI() {
  movementRadioButtons = createRadio("m");
  movementRadioButtons.option("lerp", 'Lerp');
  movementRadioButtons.option("absolute", 'Absolute');
  movementRadioButtons.option("circular", 'Circular');
  movementRadioButtons.option("jagged", 'Jagged Circular');
  movementRadioButtons.option("sinus", 'Sinusoidal Circular');
  movementRadioButtons.option("perlin", 'Perlin Circular');
  movementRadioButtons.class("ui-hidden");
  movementRadioButtons.selected("lerp");
  movementRadioButtons.position(230, 39);
  movementRadioButtons.changed(onMovementMethodChange);

  alphaSlider = createSlider(150, 255, 195);
  alphaSlider.position(242, 64);
  alphaSlider.class("slider-hidden");

  
  radiusSlider = createSlider(0, 100, 50);
  radiusSlider.position(242, 89);
  radiusSlider.class("slider-hidden");

  spreadSlider = createSlider(0, 100, 50);
  spreadSlider.position(242, 114);
  spreadSlider.class("slider-hidden");

  speedSlider = createSlider(0.1, 4, 1, 0);
  speedSlider.position(242, 139);
  speedSlider.class("slider-hidden");
  speedSlider.changed(updateMovementSpeeds);
  
  showUIButton = createButton("Toggle UI");
  showUIButton.class("dark-button");
  showUIButton.position(10, 10);
  showUIButton.mousePressed(toggleUI);
}

function drawUI() {
  fill(255);
  text("Color Legend: ", 230, 25);
  text("Movement Method:", 230, 50);
  text("Dot Trailing Effect:", 230, 75);
  text("Attraction Radius:", 230, 100);
  text("Attraction Spread:", 230, 125);
  text("Movement Speed:", 230, 150);

  text("Anger: ", 293, 25);
  text("Disgust: ", 388, 25);
  text("Fear: ", 478, 25);
  text("Joy: ", 568, 25);
  text("Sadness: ", 668, 25);
  text("Surprise: ", 768, 25);
  text("Neutral: ", 868, 25);

  fill(...EMOTION_COLORS.anger);
  rect(298, 20, 10, 10);

  fill(...EMOTION_COLORS.disgust);
  rect(393, 20, 10, 10);

  fill(...EMOTION_COLORS.fear);
  rect(483, 20, 10, 10);

  fill(...EMOTION_COLORS.joy);
  rect(573, 20, 10, 10);

  fill(...EMOTION_COLORS.sadness);
  rect(673, 20, 10, 10);

  fill(...EMOTION_COLORS.surprise);
  rect(773, 20, 10, 10);

  fill(...EMOTION_COLORS.neutral);
  rect(873, 20, 10, 10);

}

function updateMovementSpeeds() {
  console.log("updating movement speeds to slider value " + speedSlider.value());
  for (let dot of emotionDotsAll) {
    dot.updateSpeeds();
  }
}

function toggleUI() {
  uiVisible = !uiVisible;
  if (uiVisible) {
    movementRadioButtons.removeClass("ui-hidden");
    movementRadioButtons.addClass("ui-visible");

    alphaSlider.removeClass("slider-hidden");
    alphaSlider.addClass("slider-visible");

    
    radiusSlider.removeClass("slider-hidden");
    radiusSlider.addClass("slider-visible");

    spreadSlider.removeClass("slider-hidden");
    spreadSlider.addClass("slider-visible");

    speedSlider.removeClass("slider-hidden");
    speedSlider.addClass("slider-visible");
    
  } else {
    movementRadioButtons.removeClass("ui-visible");
    movementRadioButtons.addClass("ui-hidden");

    alphaSlider.removeClass("slider-visible");
    alphaSlider.addClass("slider-hidden");

    
    radiusSlider.removeClass("slider-visible");
    radiusSlider.addClass("slider-hidden");

    spreadSlider.removeClass("slider-visible");
    spreadSlider.addClass("slider-hidden");

    speedSlider.removeClass("slider-visible");
    speedSlider.addClass("slider-hidden");

    fill(0);
    rect(60, 0, 235, 175);
    rect(60, 0, 900, 35);
  }
}

// inserts article into list sorted by publish time
function insertByDate(list, item) {
  let t = new Date(item.publishTime).getTime();

  for (let i = 0; i < list.length; i++) {
    let listTime = new Date(list[i].publishTime).getTime();
    if (t < listTime) {
      list.splice(i, 0, item);

      // if we inserted before the current article index, increment it to keep pointing to the same article
      if (i <= articleIndex) {
        articleIndex++;
      }

      return;
    }
  }

  list.push(item);
}

async function setup() {
  createCanvas(1536, 864);
  // set low, but still reasonable framerate to minimize framerate changing, which is 1. not handled well in time calculations and 2. visually unpleasing
  frameRate(24);
  createUI();
  uiVisible = false;

  // setup some drawing variables that will be consisent throughout the program
  noStroke();
  textAlign(RIGHT, CENTER);
  textFont("Times New Roman");
  textSize(16);


  // how many frames to wait before visualizing next article
  waitFrames = 0;

  // counter on how many times no newer article was found and waiting was needed, used to force refill after some time
  timesWaited = 0;

  // variables to manage article stream and visualization
  articles = [];
  articleIndex = 0;
  timeToNextArticle = 0;
  lastDraw = 0;

  // variable for testing purposes
  visualizedArticleCount = 0;
  apiCallsCount = 1;

  // flag to avoid multiple simultaneous refills
  isRefilling = false;

  // last URI received from article stream for fetching new articles
  streamLastUri = null;

  // define colors for each emotion
  EMOTION_COLORS = {
    anger:    [200, 0, 0], // red
    disgust:  [85, 137, 47], // dark green
    fear:     [90],// dark gray
    joy:      [255, 215, 0], // yellow
    neutral:  [200], // gray
    sadness:  [3, 20, 150], // blue
    surprise: [255, 140, 0] // orange
  };

  // create emotion dots, need to be created separately to handle order later
  emotionDotsAnger = createEmotionDots('anger');
  emotionDotsDisgust = createEmotionDots('disgust');
  emotionDotsFear = createEmotionDots('fear');
  emotionDotsJoy = createEmotionDots('joy');
  emotionDotsNeutral = createEmotionDots('neutral');
  emotionDotsSadness = createEmotionDots('sadness');
  emotionDotsSurprise = createEmotionDots('surprise');

  // combine all emotion dots into single array for easy updating and drawing
  emotionDotsAll = emotionDotsAnger.concat(
    emotionDotsDisgust,
    emotionDotsFear,
    emotionDotsJoy,
    emotionDotsNeutral,
    emotionDotsSadness,
    emotionDotsSurprise
  );

  // flag to indicate when initial articles are ready to be visualized
  // always waits for initial batch before drawing to give a buffer
  readyToVisualize = false;

  data = await getArticleStream();

  let inArticles = data.recentActivityArticles.activity;

  // process each article, get its emotion and create Article object
  for (let article of inArticles) {
    try {
      let x = map(article.source.location.long, -180, 180, 0, width);
      let y = map(article.source.location.lat, 90, -90, 0, height);
      let publishTime = article.dateTime;
      let uri = article.uri;
      let emotion = await getEmotion(article.body);

      articles.push(new Article(x, y, publishTime, emotion, uri));
      console.log("processed article number " + articles.length);
    } catch (e) {
      // just skip malformed articles, cant really use them anyway
    }
  }

  // sort articles by publish time to ensure correct order
  articles.sort((a, b) => new Date(a.publishTime) - new Date(b.publishTime));
  streamLastUri = inArticles[inArticles.length - 1].uri;

  readyToVisualize = true;
}

function draw() {
  background(0, 255 - alphaSlider.value());

  if (uiVisible) {
    drawUI();
  }

  // in the beginning, always wait a bit to let things load
  if (frameCount < 120) {
    return;
  }

  // update and display all emotion dots
  for (let dot of emotionDotsAll) {
    dot.move();
    dot.display();
  }

  // only proceed if ready to visualize initial articles
  if (!readyToVisualize) {
    return;
  }

  // if running low on articles, fetch more asynchronously
  if ((articleIndex + 10 >= articles.length || timesWaited > 10) && !isRefilling) {
    console.log("article list running low, fetching more articles");
    timesWaited = 0;
    apiCallsCount++;
    refillArticles();
  }

  // wait frames before visualizing next article, can happen e.g. if visualization is faster than article publish rate
  if (waitFrames > 0) {
    waitFrames--;
    return;
  }

  let thisFrame = frameCount

  // if its time to visualize next article
  if (thisFrame > lastDraw + timeToNextArticle) {
    try {
      let foundNext = false;
      // this will in practice skip the very first article, but thats ok because the API tends to return a few older articles at first
      let currentArticleTime = new Date(articles[articleIndex].publishTime);
      let currentTime = Date.now();

      // look for next article that is newer than current article and not older than 15 minutes
      while (!foundNext && articleIndex + 1 < articles.length) {
        let nextArticle = articles[articleIndex + 1];
        let nextArticleTime = new Date(nextArticle.publishTime).getTime();

        // next article is newer than last visualized article
        if (nextArticleTime >= currentArticleTime.getTime()) {
          // but not older than 15 minutes
          if (nextArticleTime < currentTime - 1000 * 60 * 15) {
            console.log("next article " + (articleIndex + 1) + " is older than 15 minutes at " + nextArticle.publishTime + ", skipping");
          } else {
            // we found a valid next article to visualize
            //console.log("found next article " + (articleIndex + 1) + " at " + nextArticle.publishTime +  " with URI " + nextArticle.uri);
            foundNext = true;
            // so calculate time to next article after this one
            timeToNextArticle = calculateTimeToNextArticle(articles[articleIndex], articles[articleIndex + 1]); 
          }
        } else {
          console.log("skipping article " + (articleIndex + 1) + " as it is not newer than current");
        }

        // always increment article index, because either we are looking for next article or want to point to the one we found
        articleIndex++;
      }

      // if no newer article was found, add some wait time and try again later
      if (!foundNext) {
        console.log("no newer article found, waiting...");
        waitFrames = 60;
        timesWaited++;
        return;
      }

      // visualize the found article
      visualizeArticle(articles[articleIndex]);
      visualizedArticleCount++;
      console.log("Visualized article " + articleIndex + " at " + articles[articleIndex].publishTime + "with URI " + articles[articleIndex].uri +  ", total visualized: " + visualizedArticleCount + " over " + apiCallsCount + " API calls");
      lastDraw = thisFrame;
    // TypeError typically means articles[articleIndex] is undefined, meaning we ran out of articles and need to wait for more
    } catch (TypeError) {
      console.log("next article seems undefined, adding wait time to let async calls catch up");
      waitFrames = 60;
      timesWaited++;
    }
  }
}

// async function to refill articles from stream
// adds found and processed articles into articles array sorted by publish time
// keeps the same array so the visualization loop can continue using it
async function refillArticles() {
  // prevent multiple simultaneous refills
  if (isRefilling || articles.length === 0) {
    return;
  }

  isRefilling = true;
  console.log("refilling articles from stream...");

  try {
    // use last known URI to get only newer articles
    // works ok but API will still return a few older articles sometimes, which is handled in other parts of the code
    let lastUri = streamLastUri;

    let data = await getArticleStreamAfterUri(lastUri);
    let newArticles = data.recentActivityArticles.activity;

    // process each new article and add to the already existing articles array
    for (let article of newArticles) {
      try {
        let x = map(article.source.location.long, -180, 180, 0, width);
        let y = map(article.source.location.lat, 90, -90, 0, height);
        let publishTime = article.dateTime;
        let emotion = await getEmotion(article.body);

        let processed = new Article(x, y, publishTime, emotion);
        processed.uri = article.uri;

        insertByDate(articles, processed);

        //console.log("refilled article, total count: " + articles.length);
      } catch (e) {
        // silently skip malformed articles
      }
    }
    // update last URI for next refill
    if (newArticles.length > 0) {
      streamLastUri = newArticles[newArticles.length - 1].uri;
    }
  } catch (e) {
    console.log("error while refilling articles", e);
  } finally {
    console.log("refill complete, total articles: " + articles.length);
    isRefilling = false;
  }
}

// called when movement radio button selection changes
// updates movement method of all emotion dots accordingly
function onMovementMethodChange() {
  const selectedMethod = movementRadioButtons.value();

  switch (selectedMethod) {
    case "lerp":
      for (let dot of emotionDotsAll) {
        dot.setMovementMethod(dot.moveLerp.bind(dot));
      }
      break;
    case "absolute":
      for (let dot of emotionDotsAll) {
        dot.setMovementMethod(dot.moveAbsolute.bind(dot));
      }
      break;
    case "circular":
      for (let dot of emotionDotsAll) {
        dot.setMovementMethod(dot.moveCircular.bind(dot));
      }
      break;
    case "jagged":
      for (let dot of emotionDotsAll) {
        dot.setMovementMethod(dot.moveCircularJagged.bind(dot));
      }
      break;
    case "sinus":
      for (let dot of emotionDotsAll) {
        dot.setMovementMethod(dot.moveCircularSinus.bind(dot));
      }
      break;
    case "perlin":
      for (let dot of emotionDotsAll) {
        dot.setMovementMethod(dot.moveCircularPerlin.bind(dot));
      }
      break;
  }
}

// attracts specified number of dots from given array to specified position
// selects dots with least uses first to simulate aging of articles
function attractDotsTo(count, x, y, emotionDotsArray) {
  emotionDotsArray.sort((a, b) => a.uses - b.uses);

  let maxUses = emotionDotsArray[emotionDotsArray.length - 1].uses + 1;

  for (let i = 0; i < count; i++) {
    emotionDotsArray[i].setNewCenter(x, y);
    emotionDotsArray[i].uses = maxUses;

    maxUses++;
  }

  if (maxUses > 1000) {
    // reset uses to avoid overflow
    for (let dot of emotionDotsArray) {
      dot.uses -= 400;
    }
  }
}

// calculates how many frames to wait until next article based on their publish times and current framerate
// framerate can change after calculation so this is an estimate
function calculateTimeToNextArticle(prevArticle, nextArticle) {
  let t1 = new Date(prevArticle.publishTime).getTime();
  let t2 = new Date(nextArticle.publishTime).getTime();

  let deltaSeconds = (t2 - t1) / 1000;

  let currentFps = frameRate();

  console.log("frames to next article: " + (deltaSeconds * currentFps) + " at framerate " + currentFps);

  // a bit of a hack to cover up a bug that I didnt have time to fix properly :)
  if (visualizedArticleCount == 0) {
    return 60;
  }  

  // cap to avoid extreme waits since these are often caused by old articles from the API
  return Math.min(deltaSeconds * currentFps, 3000);
}

// visualizes given article by attracting dots according to its emotion scores
function visualizeArticle(article) {
  let totalDots = 50;

  // could this be a for loop? yes but i know the scope of the project so a more dynamic approach is just overkill
  attractDotsTo(floor(article.anger * totalDots), article.x, article.y, emotionDotsAnger);
  attractDotsTo(floor(article.disgust * totalDots), article.x, article.y, emotionDotsDisgust);
  attractDotsTo(floor(article.fear * totalDots), article.x, article.y, emotionDotsFear);
  attractDotsTo(floor(article.joy * totalDots), article.x, article.y, emotionDotsJoy);
  attractDotsTo(floor(article.neutral * totalDots), article.x, article.y, emotionDotsNeutral);
  attractDotsTo(floor(article.sadness * totalDots), article.x, article.y, emotionDotsSadness);
  attractDotsTo(floor(article.surprise * totalDots), article.x, article.y, emotionDotsSurprise);
}