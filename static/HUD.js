const BottomRightPanel = document.getElementById("BottomRightPanel");
const BottomRightPanelContent = BottomRightPanel.querySelector(".content");

const camButton = document.getElementById("camButton");
let cambox = new Floating("cambox", 400, 1.5);
cambox.setPosition("10px", "290px");
camButton.addEventListener("click", cambox.toggle.bind(cambox));
cambox.movable();
cambox.resizable();

const defaultGaugeCenter = 160;
const defaultGaugeRin = 95;
const defaultGaugeRout = 125;
const defaultGaugeSize = 320;

let vsiGauge = createGauge(
	document.getElementById("vsiGauge"),
	{
		label: "VSI",
		w: defaultGaugeSize, h: defaultGaugeSize,
		cx: defaultGaugeCenter, cy: defaultGaugeCenter,
		rin: defaultGaugeRin, rout: defaultGaugeRout,
		startAngle: -260, endAngle: 80,
		minValue: -10, maxValue: 10,
		decPlaces: 2,
		value: 0,
		scale: {
			step: 2,
			delta: 5,
			titleDelta: 20,
		}
	}
);
//vsiGauge.eventListeners();

let speedGauge = createGauge(
	document.getElementById("speedGauge"),
	{
		label: "Speed",
		w: defaultGaugeSize, h: defaultGaugeSize,
		cx: defaultGaugeCenter, cy: defaultGaugeCenter,
		rin: defaultGaugeRin, rout: defaultGaugeRout,
		startAngle: -160, endAngle: 160,
		minValue: 0, maxValue: 120,
		decPlaces: 2,
		value: 10,
		scale: {
			step: 10,
			delta: 5,
			titleDelta: 20,
		}
	}
);
//speedGauge.eventListeners();

let batteryGauge = createGauge(
	document.getElementById("batteryGauge"),
	{
		label: "Battery",
		w: defaultGaugeSize, h: defaultGaugeSize,
		cx: defaultGaugeCenter, cy: defaultGaugeCenter,
		rin: defaultGaugeRin, rout: defaultGaugeRout,
		startAngle: -160, endAngle: 160,
		minValue: 0, maxValue: 100,
		decPlaces: 1,
		value: 70,
		scale: {
			step: 10,
			delta: 5,
			titleDelta: 20,
		}
	}
);
//batteryGauge.eventListeners();

let altitudeGauge = createGauge(
	document.getElementById("altitudeGauge"),
	{
		label: "Altitude",
		w: defaultGaugeSize, h: defaultGaugeSize,
		cx: defaultGaugeCenter, cy: defaultGaugeCenter,
		rin: defaultGaugeRin, rout: defaultGaugeRout,
		startAngle: -170, endAngle: 170,
		minValue: 0, maxValue: 200,
		decPlaces: 1,
		value: 70,
		scale: {
			step: 10,
			delta: 5,
			titleDelta: 20,
		}
	}
);
altitudeGauge.eventListeners();

let attitudeIndicator = createAttitudeIndicator(
	document.getElementById("attitudeIndicator"),
	document.getElementById("attitudeBank"),
	document.getElementById("attitudePitch")
);
attitudeIndicator.draw();

let headingIndicator = createHeadingIndicator(
	document.getElementById("headingIndicator"),
	document.getElementById("headingBank"),
	document.getElementById("headingPitch")
);
headingIndicator.draw();

BottomRightPanel.show = function(info=null) {
	BottomRightPanel.contentInfo = info;
	BottomRightPanel.classList.remove("hidden");
}

BottomRightPanel.hide = function () {
	BottomRightPanel.contentInfo = null;
	BottomRightPanel.classList.add("hidden");
	if (graph) graph.onPanelHide();
}

function createTextInput(target, name, value) {
	let div = target.append("div");
	div.append("label").attr("for", name).text(name + ":");
	let input = div.append("input").attr("type", "text").property("value", value);
	return input;
}

function createSelectBox(target, data, name, value) {
	let info = { value: value };
	let currentName = data.find(d => d.value == value).name;
	let div = target.append("div").style("display", 'flex');
	div.append("label").text(name + ":");
	var innerDiv;
	const wrapperDiv = div.append("div")
		.attr("class", "CustomSelect")
		.style("flex-grow", 1);
	var headDiv = wrapperDiv.append("div")
		.attr("class", "CustomSelectHead")
		.text(currentName)
		.on("click", function () {
			innerDiv.classList.toggle("open");
		}).node();
	const ul = wrapperDiv.append("div").attr("class", "CustomSelectList")
		.append("div");
	innerDiv = ul.node();

	ul.selectAll("div").data(data).join("div")
		.attr("class", "CustomSelectElement")
		.text(d => d.name)
		.on("click", d => {
			info.value = d.value;
			headDiv.innerText = d.name;
			innerDiv.classList.remove("open");
		});
	return info;
}

function createCustomSelectBox(div, data, currentIndex = 0, zIndex = 1) {
	let current = data[currentIndex];
	var innerDiv;
	const wrapperDiv = div.append("div")
		.attr("class", "CustomSelect")
		.style("flex-grow", 1)
		.style("z-index", zIndex);
	var headDiv = wrapperDiv.append("div")
		.attr("class", "CustomSelectHead")
		.html(current.name)
		.on("click", function () {
			innerDiv.classList.toggle("open");
		}).node();
	const ul = wrapperDiv.append("div").attr("class", "CustomSelectList")
		.append("div");
	innerDiv = ul.node();

	ul.selectAll("div").data(data).join("div")
		.attr("class", "CustomSelectElement")
		.html(d => d.name)
		.on("click", d => {
			d.func();
			headDiv.innerHTML = d.name;
			innerDiv.classList.remove("open");
		});
}

function createCheckbox(target, label, onChange) {
	let id = label.toLowerCase().replace(/\s+/g, "-");
	let div = target.append("div").classed("customCheckbox", true);
	let checkbox = div.append("input")
		.attr("id", id)
		.attr("type", "checkbox")
		.on("change", () => {
			onChange(checkbox.node().checked);
		});
	//checkbox.node().checked = Settings.animateAnts;
	div.append("label")
		.attr("for", id)
		.text(label);
	return div;
}

function addSpinnerDiv(div) {
	let out = div.append("div").classed("spinnerWrapper", true);
	out.append("div").classed("spinner", true);
	return out;
}



function AdvancedCopy(theText) {
	//create our hidden div element
	var hiddenCopy = document.createElement('div');
	//set the innerHTML of the div
	hiddenCopy.innerText = theText;
	//set the position to be absolute and off the screen
	hiddenCopy.style.position = 'absolute';
	hiddenCopy.style.left = '-9999px';

	//check and see if the user had a text selection range
	var currentRange;
	if (document.getSelection().rangeCount > 0) {
		//the user has a text selection range, store it
		currentRange = document.getSelection().getRangeAt(0);
		//remove the current selection
		window.getSelection().removeRange(currentRange);
	}
	else {
		//they didn't have anything selected
		currentRange = false;
	}

	//append the div to the body
	document.body.appendChild(hiddenCopy);
	//create a selection range
	var CopyRange = document.createRange();
	//set the copy range to be the hidden div
	CopyRange.selectNode(hiddenCopy);
	//add the copy range
	window.getSelection().addRange(CopyRange);

	//since not all browsers support this, use a try block
	try {
		//copy the text
		document.execCommand('copy');
	}
	catch (err) {
		window.alert("Your Browser Doesn't support this! Error : " + err);
	}
	//remove the selection range (Chrome throws a warning if we don't.)
	window.getSelection().removeRange(CopyRange);
	//remove the hidden div
	document.body.removeChild(hiddenCopy);

	//return the old selection range
	if (currentRange) {
		window.getSelection().addRange(currentRange);
	}
}

let LeftFlightPanel = document.getElementById("LeftFlightPanel");
let RightFlightPanel = document.getElementById("RightFlightPanel");
let flightButtons = document.getElementById("flightButtons");
let planButtons = document.getElementById("planButtons");

// 0 is plan, 1 is flight
let currentMode = 0;

function setFlightMode() {
	LeftFlightPanel.classList.remove("hidden");
	RightFlightPanel.classList.remove("hidden");
	flightButtons.classList.remove("hidden");
	planButtons.classList.add("hidden");
	currentMode = 1;
	attitudeIndicator.startAnimation();
	headingIndicator.startAnimation();
}

function setPlanMode() {
	LeftFlightPanel.classList.add("hidden");
	RightFlightPanel.classList.add("hidden");
	flightButtons.classList.add("hidden");
	planButtons.classList.remove("hidden");
	currentMode = 0;
}
