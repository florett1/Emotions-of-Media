// class representing a single emotion dot with various movement methods
class emotionDot {
  constructor(x, y, emotion) {
    // initial general variables
    this.x = x;
    this.y = y;
    this.uses = 0;

    this.movementMethod = this.moveLerp;

    this.goalX = random(width);
    this.goalY = random(height);

    this.centerX = x;
    this.centerY = y;
    this.radius = random(5, 75);

    // straight movement variables
    this.baseLerpSpeed = random(0.001, 0.003);
    this.baseFastLerpSpeed = random(0.05, 0.1);
    this.baseAbsoluteSpeed = random(0.2, 1);
    this.baseFastAbsoluteSpeed = random(7, 10);

    this.lerpSpeed = this.baseLerpSpeed;
    this.absoluteSpeed = this.baseAbsoluteSpeed;

    // general rotation variables
    this.rotationCenter = createVector(width/2, height/2);
    this.rotationRadius = dist(this.x, this.y, this.rotationCenter.x, this.rotationCenter.y);
    this.angle = atan2(this.y - this.rotationCenter.y, this.x - this.rotationCenter.x);
    this.targetRadius = this.rotationRadius;

    this.baseRotationSpeed = random(0.001, 0.01);
    this.baseFastRotationSpeed = random(0.01, 0.03);
    this.baseSpiralSpeed = 0.015;

    this.rotationSpeed = this.baseRotationSpeed;
    this.spiralSpeed = this.baseSpiralSpeed;

    // jagged rotation variables
    this.wiggleRate = random(20, 50);
    this.currentWiggle = this.wiggleRate / 2;
    this.wigglingOut = random() < 0.5;
    this.rotationOffsetX = 0;
    this.rotationOffsetY = 0;

    // sinus rotation variables
    this.wigglePhase = random(TWO_PI);
    this.wiggleSpeedSinus = random(0.03, 0.05);
    this.wiggleAmplitudeSinus = random(10, 15);

    // perlin rotation variables
    this.wiggleTime = random(1000);
    this.wiggleSpeedPerlin = random(0.03, 0.06);
    this.maxWiggleAmplitudePerlin = random(10, 20);
    this.currentWiggleAmplitudePerlin = 0;

    // for remapping offset
    this.baseOffset = random(-1, 1);

    this.color = EMOTION_COLORS[emotion];
  }

  // new center point around which the dot will move
  // the center point is basically the article position
  setNewCenter(newX, newY) {
    this.centerX = newX;
    this.centerY = newY;

    this.setNewGoal();

    this.rotationCenter = createVector(newX, newY);
    this.targetRadius = this.radius;
    this.rotationRadius = dist(this.x, this.y, this.rotationCenter.x, this.rotationCenter.y);
    this.angle = atan2(this.y - this.rotationCenter.y, this.x - this.rotationCenter.x);

    this.lerpSpeed = this.baseFastLerpSpeed * speedSlider.value();
    this.rotationSpeed = this.baseFastRotationSpeed * speedSlider.value();
  }

  // non rotation movements are based on random goal points within radius around center point
  setNewGoal() {
    let angle = random(TWO_PI);
    let r = random(this.radius);

    this.goalX = this.centerX + r * cos(angle);
    this.goalY = this.centerY + r * sin(angle);
  }

  /* ############# movement methods ############# */

  // simply rotates around center point at a certain radius
  moveCircular() {
    // always rotate
    this.angle += this.rotationSpeed;

    // smoothly spiral inward toward targetRadius
    this.rotationRadius += (this.targetRadius - this.rotationRadius) * this.spiralSpeed;

    // update position based on current angle and radius
    this.x = this.rotationCenter.x + this.rotationRadius * cos(this.angle);
    this.y = this.rotationCenter.y + this.rotationRadius * sin(this.angle);
  }

  // rotates around center point with a radius that increases and decreases linearly
  moveCircularJagged() {
    // always rotate
    this.angle += this.rotationSpeed;

    // smoothly spiral inward toward targetRadius
    this.rotationRadius += (this.targetRadius - this.rotationRadius) * this.spiralSpeed;

    // calculate an offset for the radius that increases and decreases linearly, creating a "jagged" effect
    if (this.wigglingOut) {
      let offset = random(0.5, 1);

      this.rotationOffsetX += offset;
      this.rotationOffsetY += offset;
      this.currentWiggle--;
    } else {
      let offset = random(0.5, 1);
      
      this.rotationOffsetX -= offset;
      this.rotationOffsetY -= offset;
      this.currentWiggle++;
    }

    if (this.currentWiggle <= 0) {
      this.wigglingOut = false;
    }
    if (this.currentWiggle >= this.wiggleRate) {
      this.wigglingOut = true;
    }

    // update position based on current angle and radius
    this.x = this.rotationCenter.x + this.rotationOffsetX * cos(this.angle) + this.rotationRadius * cos(this.angle);
    this.y = this.rotationCenter.y + this.rotationOffsetY * sin(this.angle) + this.rotationRadius * sin(this.angle);
  }

  // rotates around center point with a radius that increases and decreases sinusoidally
  moveCircularSinus() {
    // always rotate
    this.angle += this.rotationSpeed;

    // smoothly spiral inward toward targetRadius
    this.rotationRadius += (this.targetRadius - this.rotationRadius) * this.spiralSpeed;

    // calculate a sinusoidal wiggle/offset for the radius
    this.wigglePhase += this.wiggleSpeedSinus;
    let wiggle = sin(this.wigglePhase) * this.wiggleAmplitudeSinus;

    let finalRadius = this.rotationRadius + wiggle;

    // update position based on current angle and radius
    this.x = this.rotationCenter.x + finalRadius * cos(this.angle);
    this.y = this.rotationCenter.y + finalRadius * sin(this.angle);
  }

  // rotates around center point with a radius that varies according to Perlin noise
  moveCircularPerlin() {
    // always rotate
    this.angle += this.rotationSpeed;

    // smoothly spiral inward toward targetRadius
    this.rotationRadius += (this.targetRadius - this.rotationRadius) * this.spiralSpeed;

    // calculate a Perlin noise-based wiggle/offset for the radius
    this.wiggleTime += this.wiggleSpeedPerlin;
    let wiggle = map(noise(this.wiggleTime), 0, 1, -this.currentWiggleAmplitudePerlin, this.currentWiggleAmplitudePerlin);

    // smoothly increase current wiggle amplitude toward max wiggle amplitude
    // used to avoid sudden jumps when switching to this movement method
    this.currentWiggleAmplitudePerlin += (this.maxWiggleAmplitudePerlin - this.currentWiggleAmplitudePerlin) * 0.05;

    let finalRadius = this.rotationRadius + wiggle;

    // update position based on current angle and radius
    this.x = this.rotationCenter.x + finalRadius * cos(this.angle);
    this.y = this.rotationCenter.y + finalRadius * sin(this.angle);
  }

  // helper function to move toward a target point at a given speed
  moveTowardXY(x, y, targetX, targetY, speed) {
    let deltaX = targetX - x;
    let deltaY = targetY - y;
    let dist = Math.max(sqrt(deltaX * deltaX + deltaY * deltaY), 1);

    return {
      x: x + deltaX / dist * speed,
      y: y + deltaY / dist * speed
    };
  }

  // moves in a straight line toward goal point somewhere within a radius from the center point, at a fixed speed
  moveAbsolute() {
    // set a faster speed of far from center
    let mSpeed = this.absoluteSpeed;
    if (dist(this.x, this.y, this.centerX, this.centerY) > this.radius + 3 && this.uses > 0) {
      mSpeed = this.fastAbsoluteSpeed;
    }

    // calculate and apply movement
    let moveResult = this.moveTowardXY(this.x, this.y, this.goalX, this.goalY, mSpeed);

    this.x = moveResult.x;
    this.y = moveResult.y;

    // if close to goal, set a new goal
    if (dist(this.x, this.y, this.goalX, this.goalY) < this.absoluteSpeed) {
      this.setNewGoal();
    }
  }

  // moves in a straight line toward goal point somewhere within a radius from the center point, using lerpiing
  moveLerp() {
    this.x = lerp(this.x, this.goalX, this.lerpSpeed);
    this.y = lerp(this.y, this.goalY, this.lerpSpeed);

    if (dist(this.x, this.y, this.goalX, this.goalY) < 10) {
      this.setNewGoal();
    }
  }

  // simple functional programming to set movement method
  setMovementMethod(method) {
    this.movementMethod = method;

    // Reset rotation variables for smooth transition from linear movements
    this.rotationRadius = dist(this.x, this.y, this.rotationCenter.x, this.rotationCenter.y);
    this.angle = atan2(this.y - this.rotationCenter.y, this.x - this.rotationCenter.x);

    // Reset jagged rotation variables for smooth transition
    this.rotationOffsetX = 0;
    this.rotationOffsetY = 0;
    this.currentWiggle = this.wiggleRate / 2;

    // Reset sinus rotation variables for smooth transition
    this.wigglePhase = 0;

    // Reset perlin rotation variables for smooth transition
    this.currentWiggleAmplitudePerlin = 0;
  }

  updateSpeeds() {
    if (this.uses > 0) {
      this.lerpSpeed = this.baseFastLerpSpeed * speedSlider.value();
      this.absoluteSpeed = this.baseFastAbsoluteSpeed * speedSlider.value();
      this.rotationSpeed = this.baseFastRotationSpeed * speedSlider.value();
    } else {
      this.lerpSpeed = this.baseLerpSpeed * speedSlider.value();
      this.absoluteSpeed = this.baseAbsoluteSpeed * speedSlider.value();
      this.rotationSpeed = this.baseRotationSpeed * speedSlider.value();
    }
  }

  // calls the current movement method
  move() {
    if (this.uses > 0) {
      this.radius = radiusSlider.value() + map(this.baseOffset, -1, 1, -spreadSlider.value(), spreadSlider.value());
      this.targetRadius = this.radius;
    }

    this.movementMethod();
  }

  // displays the dot, unused dots are given a lower alpha value
  display() {
    fill(...this.color, 50);

    if (this.uses > 0) {
      fill(...this.color);
    }
    // a "dot" is a rect for performance reasons
    rect(this.x, this.y, 2, 2);
  }
}