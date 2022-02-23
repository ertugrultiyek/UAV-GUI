
// var initialValue = document.querySelector(".initialValue");

const rad = Math.PI / 180;
const NS = "http:\/\/www.w3.org/2000/svg";

function clearRect(node) {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}

function setSVGAttributes(element, oAtt) {
	for (var prop in oAtt) {
		element.setAttributeNS(null, prop, oAtt[prop]);
	}
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
	var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

	return {
		x: centerX + (radius * Math.cos(angleInRadians)),
		y: centerY + (radius * Math.sin(angleInRadians))
	};
}

function describeArc(x, y, radius, startAngle, endAngle){
	var start = polarToCartesian(x, y, radius, endAngle);
	var end = polarToCartesian(x, y, radius, startAngle);
	var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
	return {start: start, end: end, largeArcFlag: largeArcFlag};       
}

class Gauge {
	constructor(svg, output, options) {
		this.svg = svg;
		this.output = output;
		this.outline = svg.querySelector(".outline");
		this.fill = svg.querySelector(".fill");
		this.center = svg.querySelector(".center");
		this.needle = svg.querySelector(".needle");
		Object.assign(this, options);
		let normalized = (this.value - this.minValue) / (this.maxValue - this.minValue);
		this.angle = (normalized * (this.endAngle - this.startAngle)) + this.startAngle;
		if (this.scale) {
			this.drawScale();
		}
		this.draw();
	}

	mouse(ev) {
		let ClientRect = this.svg.getBoundingClientRect();
		let x = Math.round(ev.clientX - ClientRect.left);
		let y = Math.round(ev.clientY - ClientRect.top);
		let dx = this.cx - x;
		let dy = this.cy - y;
		let angle = Math.atan2(dy, dx) / rad - 90;
		let normalized = (angle - this.startAngle) / (this.endAngle - this.startAngle);
		let value = normalized * (this.maxValue - this.minValue) + this.minValue;
		this.setValue(value);
	}

	drawScale() {
		let scale = this.svg.querySelector(".scale");
		clearRect(scale);
		for (let n = this.minValue; n <= this.maxValue; n += this.scale.step) {
			let normalized = (n - this.minValue) / (this.maxValue - this.minValue);
			let a = normalized * (this.endAngle - this.startAngle) + this.startAngle;
			let start = polarToCartesian(this.cx, this.cy, this.rin - this.scale.delta, a);
			let end = polarToCartesian(this.cx, this.cy, this.rout + this.scale.delta, a);
			let title = polarToCartesian(this.cx, this.cy, this.rout + this.scale.titleDelta, a);

			let scaleLine = document.createElementNS(NS, "line");
			let scaleLineObj = {
				class: "scale",
				x1: start.x,
				y1: start.y,
				x2: end.x,
				y2: end.y
			};
			setSVGAttributes(scaleLine, scaleLineObj);
			scale.appendChild(scaleLine);

			var scaleText = document.createElementNS(NS, "text");
			var scaleTextObj = {
				class: "scale",
				x: title.x,
				y: title.y,
			};
			setSVGAttributes(scaleText, scaleTextObj);
			scaleText.textContent = n;
			scale.appendChild(scaleText);
		}
	}

	draw() {
		this.outline.setAttributeNS(null, "d", this.getD1());
		this.fill.setAttributeNS(null, "d", this.getD2());
		this.drawNeedle();
		this.output.innerText = this.value.toFixed(this.decPlaces);
	}

	updateInput(p) {
		var x = p.x;
		var y = p.y;
		var lx = this.cx - x;
		var ly = this.cy - y;

		var a = Math.atan2(ly, lx) / rad - 180;

		this.drawInput(a);
		// initialValue.value = Math.round((a + 180) / 1.8);
	}

	getD1() {
		let outerArc = describeArc(this.cx, this.cy, this.rout, this.startAngle, this.endAngle);
		let innerArc = describeArc(this.cx, this.cy, this.rin, this.startAngle, this.endAngle);
		return `
		M ${outerArc.start.x} ${outerArc.start.y}
		A ${this.rout} ${this.rout} 0 ${outerArc.largeArcFlag} 0 ${outerArc.end.x} ${outerArc.end.y}
		L ${innerArc.end.x} ${innerArc.end.y}
		A ${this.rin} ${this.rin} 0 ${innerArc.largeArcFlag} 1 ${innerArc.start.x} ${innerArc.start.y}
		`;
	}

	getD2() {
		let outerArc = describeArc(this.cx, this.cy, this.rout, this.startAngle, this.angle);
		let innerArc = describeArc(this.cx, this.cy, this.rin, this.startAngle, this.angle);
		return `
		M ${outerArc.start.x} ${outerArc.start.y}
		A ${this.rout} ${this.rout} 0 ${outerArc.largeArcFlag} 0 ${outerArc.end.x} ${outerArc.end.y}
		L ${innerArc.end.x} ${innerArc.end.y}
		A ${this.rin} ${this.rin} 0 ${innerArc.largeArcFlag} 1 ${innerArc.start.x} ${innerArc.start.y}
		`;
	}

	drawNeedle() {
		let a = this.angle - 90;
		var nx1 = this.cx + 5 * Math.cos((a - 90) * rad);
		var ny1 = this.cy + 5 * Math.sin((a - 90) * rad);

		var nx2 = this.cx + (this.rout + 15) * Math.cos(a * rad);
		var ny2 = this.cy + (this.rout + 15) * Math.sin(a * rad);

		var nx3 = this.cx + 5 * Math.cos((a + 90) * rad);
		var ny3 = this.cy + 5 * Math.sin((a + 90) * rad);

		var points = nx1 + "," + ny1 + " " + nx2 + "," + ny2 + " " + nx3 + "," + ny3;
		this.needle.setAttributeNS(null, "points", points);
	}

	setValue(val) {
		this.value = isNaN(val) ? 0 : val;
		this.value = Math.max(Math.min(this.value, this.maxValue), this.minValue);
		let normalized = (this.value - this.minValue) / (this.maxValue - this.minValue);
		this.angle = (normalized * (this.endAngle - this.startAngle)) + this.startAngle;
		this.draw();
	}

	eventListeners() {
		this.svg.addEventListener("mousedown", (ev) => {
			this.isDragging = true;
			this.svg.classList.add("focusable");
			this.mouse(ev);
			ev.stopPropagation();
		});
		this.svg.addEventListener("mouseup", (ev) => {
			if (this.isDragging) {
				ev.stopPropagation();
				this.isDragging = false;
				this.svg.classList.remove("focusable");
			}
		});
		this.svg.addEventListener("mouseout", (ev) => {
			this.isDragging = false;
			this.svg.classList.remove("focusable");
		});
		this.svg.addEventListener("mousemove", (ev) => {
			if (this.isDragging) {
				this.mouse(ev);
				ev.stopPropagation();
			}
		});
	}
}

function createGauge(container, options) {
	container.innerHTML = `
	  <svg class="gauge" height="${options.h}" width="${options.w}">
		<g class="scale" stroke="red"></g>
		<path class="outline" d="" />
		<path class="fill" d="" />
		<polygon class="needle" points="220,10 300,210 220,250 140,210" />
	  </svg>
	  <div class="output"></div>
	  <div class="label">${options.label}</div>
	`;
	container.classList.add("gaugeContainer");
	return new Gauge(
		container.querySelector(".gauge"),
		container.querySelector(".output"),
		options
	);
}

