// simple class to hold article data and emotion scores
class Article {
  constructor(x, y, publishTime, emotionObject, uri) {
    this.x = x;
    this.y = y;
    this.publishTime = publishTime;
    this.uri = uri;

    this.anger = 0;
    this.disgust = 0;
    this.fear = 0;
    this.joy = 0;
    this.neutral = 0;
    this.sadness = 0;
    this.surprise = 0;

    // this is needed because the order of emotions in emotionObject is not guaranteed simply thanks to the architecture of the emotion detection model
    for (let item of emotionObject[0]) {
      const label = item.label.toLowerCase();
      const score = item.score;

      if (this.hasOwnProperty(label)) {
        this[label] = score;
      }
    }
  }
}