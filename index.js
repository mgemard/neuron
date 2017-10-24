"strict mode";
let canvas    = {width:150, height:150};
let step      = 0.1; //if step = 0.01
let precision = 1;   //then precision = 2
let training  = 0;   //counter
let delay     = 10;  //between trainings
let timer;
////////////////////////////////////////////////////////////////////////////////
let target = {
  weight : 2,
  bias   : 10,

  output : function(input) {
    return removeFloatingPointError(this.weight * input + this.bias);
  },
};
////////////////////////////////////////////////////////////////////////////////
let neuron = {
  weight : 0,
  bias   : 0,
  derivative : {weight:0, bias:0},

  reset : function() {
    this.weight = getRandomNumber();
    this.bias   = getRandomNumber();
  },

  output : function(input, dWeight, dBias) {
    if (!dWeight) {dWeight = 0;}
    if (!dBias)   {dBias   = 0;}
    return removeFloatingPointError((this.weight + dWeight) * input + (this.bias + dBias));
  },
};
////////////////////////////////////////////////////////////////////////////////
function changeStep(newStep, newPrecision) {
  step      = newStep;
  precision = newPrecision;
}
////////////////////////////////////////////////////////////////////////////////
function changeDelay(newDelay) {
  delay = newDelay;
}
////////////////////////////////////////////////////////////////////////////////
function getRandomNumber() {
  return Math.round(Math.random()*20-10); // -10 to 10
  //return Math.round(Math.random()*10);    //   0 to 10
}
////////////////////////////////////////////////////////////////////////////////
function removeFloatingPointError(number) {
  return Number(number.toFixed(precision));
}
////////////////////////////////////////////////////////////////////////////////
function resetCanvas(ctx) {
  //Erase
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Axes
  ctx.beginPath();
  ctx.strokeStyle = "gray";
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.moveTo(0, canvas.height/2);
  ctx.lineTo(canvas.width, canvas.height/2);
  ctx.stroke();
}
////////////////////////////////////////////////////////////////////////////////
function drawTarget() {
  let ctx = document.getElementById("target").getContext("2d");
  resetCanvas(ctx);

  //Line
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.moveTo(-canvas.width/2, target.weight *   canvas.width/2  + target.bias);
  ctx.lineTo( canvas.width/2, target.weight * (-canvas.width/2) + target.bias);
  ctx.stroke();
  ctx.restore();

  //Info
	ctx.font = "15px Helvetica";
  ctx.fillStyle = "black";
	ctx.fillText(`y = ${target.weight} * x + (${target.bias})`, 0, 15);
}
////////////////////////////////////////////////////////////////////////////////
function drawNeuron() {
  let ctx = document.getElementById("neuron").getContext("2d");
  resetCanvas(ctx);

  //Line
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.moveTo(-canvas.width/2, neuron.weight *   canvas.width/2  + neuron.bias);
  ctx.lineTo( canvas.width/2, neuron.weight * (-canvas.width/2) + neuron.bias);
  ctx.stroke();
  ctx.restore();

  //Info
	ctx.font = "15px Helvetica";
  ctx.fillStyle = "black";
	ctx.fillText(`y = ${neuron.weight} * x + (${neuron.bias})`, 0, 15);
}
////////////////////////////////////////////////////////////////////////////////
function drawError(error) {
  let ctx = document.getElementById("error").getContext("2d");
  resetCanvas(ctx);

  //Line
  ctx.save();
  ctx.translate(canvas.width/2, canvas.height/2);
  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.moveTo(error, -canvas.height/2);
  ctx.lineTo(error,  canvas.height/2);
  ctx.stroke();
  ctx.restore();

  //Info
	ctx.font = "15px Helvetica";
  ctx.fillStyle = "black";
	ctx.fillText(`${error}`, 0, 15);
}
////////////////////////////////////////////////////////////////////////////////
function predict() {
  stop(); //if training is already running
  let input = getRandomNumber();

  let error  = Math.abs(target.output(input) - neuron.output(input));
      error = removeFloatingPointError(error);

  document.getElementById("input").innerHTML  = `x = ${input}`;
  document.getElementById("targetOutput").innerHTML = `y = ${target.output(input)}`;
  document.getElementById("neuronOutput").innerHTML = `y = ${neuron.output(input)}`;

  drawError(error);
  return {input:input, error:error};
}
////////////////////////////////////////////////////////////////////////////////
function train(once) {
  stop(); //if training is already running
  let prediction = predict();
  let input      = prediction.input;
  let error      = prediction.error;

  if (error !== 0) {
    let errorBias  = Math.abs(target.output(input) - neuron.output(input, 0, step));
    let dErrorBias = (errorBias - error);
    neuron.derivative.bias = dErrorBias/step;

    let errorWeight  = Math.abs(target.output(input) - neuron.output(input, step, 0));
    let dErrorWeight = (errorWeight - error);
    neuron.derivative.weight = dErrorWeight/step;

    console.log(`weight: - (${removeFloatingPointError(neuron.derivative.weight * step)})`);
    console.log(  `bias: - (${removeFloatingPointError(neuron.derivative.bias   * step)})`);
    neuron.bias   = removeFloatingPointError(neuron.bias   - (neuron.derivative.bias * step));
    neuron.weight = removeFloatingPointError(neuron.weight - (neuron.derivative.weight * step));
    console.log(`y = ${neuron.weight} * x + (${neuron.bias})`);

    training += 1;
    drawNeuron();
    document.getElementById("training").innerHTML  = training;
  }

  if (!once) {timer = setTimeout(train, delay);}
}
////////////////////////////////////////////////////////////////////////////////
function stop() {clearTimeout(timer);}
////////////////////////////////////////////////////////////////////////////////
function reset() {
  stop(); //if training is already running
  neuron.reset();
  training = 0;
  drawTarget();
  drawNeuron();
  drawError(0);
  document.getElementById("input").innerHTML        = `x = 0`;
  document.getElementById("targetOutput").innerHTML = `y = 0`;
  document.getElementById("neuronOutput").innerHTML = `y = 0`;
  document.getElementById("training").innerHTML     = training;
  console.log(`Start: y = ${neuron.weight} * x + (${neuron.bias})`);
}
////////////////////////////////////////////////////////////////////////////////
reset();
