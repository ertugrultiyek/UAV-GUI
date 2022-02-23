let dispW, dispH;
let disp = [];
let dispVar = 0;

// onload && onresize
function setup(){
	const cont = document.getElementById("lft");
	dispW = cont.offsetWidth;
	dispH = cont.offsetHeight;
  // console.log("w: ", dispW, "h: ", dispH);

	disp.push(document.getElementById("display1"));
	disp.push(document.getElementById("display2"));
	disp.push(document.getElementById("display3"));
	disp.push(document.getElementById("display4"));

	for (i in disp){
		// console.log(disp[i]);
		disp[i].height = dispH/2;
		disp[i].width = dispW;
	}
}

// looping function
function draw(){
	for (i in disp)
		setTimeout(updateDisplay(disp[i]),100);
}


// temsili göstergeler
function updateDisplay(display){

	const midX = dispW/2;
	const midY = dispH/4;

	const ctx = display.getContext("2d")

	// this will updated by telemetry values
	dispVar = 28+Math.random()*5;

	ctx.fillStyle = "#031e11";
	ctx.fillRect(0,0,dispW,dispH);
	ctx.strokeStyle = "#14FDCE";
	ctx.lineWidth = 7;
	ctx.beginPath();
	ctx.arc(midX, midY, dispH/6, 0.5*Math.PI, (0.015*dispVar+0.5)*Math.PI, false);
	ctx.lineTo(midX, midY);
	ctx.stroke();
	ctx.beginPath();
	ctx.arc(midX,midY,dispH/20, 0, 2*Math.PI);
	ctx.lineWidth = 4;
	ctx.fill();
	ctx.stroke();
	ctx.font = "20px Comic Sans MS";
	ctx.fillStyle = "#14FDCE";
	ctx.textAlign = "center";
	ctx.fillText(dispVar.toFixed(0), midX, midY*1.05);


}
