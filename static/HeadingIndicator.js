

const colorBlueFG = "#14fdce";

const headingPlaneImage = new Image();
headingPlaneImage.src = "images/heading_plane.png";

class HeadingIndicator {
	constructor(canvas, options) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		Object.assign(this, options);
		this.cx = this.w / 2.0;
		this.cy = this.h / 2.0;
		// Angle is in radians
		this.angle = 0;
		this.isDragging = false;
		//this.eventListeners();
		this.ctx.font = "16px sans-serif";

		// this.updateDiv();
	}

	draw() {
		// Clear the canvas
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.save(); // save current state

		this.ctx.translate(this.w/2, this.h/2);

		this.ctx.beginPath();
		this.ctx.arc(0, 0, this.circleR, 0, 2 * Math.PI);
		this.ctx.lineWidth = this.circleWidth;
		this.ctx.strokeStyle = colorSurface;
		this.ctx.fillStyle = colorSky;
		this.ctx.fill();
		this.ctx.stroke();

		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillStyle = colorGuide;
		this.ctx.strokeStyle = colorGuide;
		this.ctx.lineWidth = this.lineWidth;
		for(let label = 0; label < 360; label += 30){
			let angle = (label - 90) / 180 * Math.PI;
			let x = Math.cos(this.angle + angle);
			let y = Math.sin(this.angle + angle);
			this.ctx.fillText(
				label,
				x * this.textR,
				y * this.textR
			);
			this.ctx.beginPath();
			this.ctx.moveTo(x * this.lineInnerR, y * this.lineInnerR);
			this.ctx.lineTo(x * this.lineOuterR, y * this.lineOuterR);
			this.ctx.stroke();
		}
		this.ctx.lineWidth = this.thinLineWidth;
		for(let label = 15; label < 360; label += 30){
			let angle = (label - 90) / 180 * Math.PI;
			let x = Math.cos(this.angle + angle);
			let y = Math.sin(this.angle + angle);
			this.ctx.beginPath();
			this.ctx.moveTo(x * this.thinLineInnerR, y * this.thinLineInnerR);
			this.ctx.lineTo(x * this.thinLineOuterR, y * this.thinLineOuterR);
			this.ctx.stroke();
		}

		// Restore the unrotated state
		this.ctx.restore();

		// Draw plane
		this.ctx.drawImage(headingPlaneImage, 0, 0, this.w, this.h);

		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";
		this.ctx.fillStyle = colorGuide;
		this.ctx.fillText(
			(((-this.angle / Math.PI * 180) + 360) % 360).toFixed(1) + '°',
			this.w/2, this.h/2
		);
	}

	startAnimation() {
		const self = this;
		let start;
		let refreshes = 0;
		function anim (timestamp) {
			if (start === undefined)
				start = timestamp;
			const elapsed = timestamp - start;
			if (elapsed >= 1000) {
				// console.log("HeadingIndicator FPS:", refreshes);
				start = timestamp;
				refreshes = 0;
			}
			self.draw();
			++refreshes;
			if (currentMode == 1) {
				// continue if still in flight mode
				window.requestAnimationFrame(anim);
			}
		}
		window.requestAnimationFrame(anim);
	}

	updateDiv() {
		this.bankDiv.innerText =
			(-this.angle / Math.PI * 180).toFixed(1) + '°';
		this.pitchDiv.innerText =
			(this.pitchTranslate/2).toFixed(1) + '°';
	}

	mouse(ev) {
		let ClientRect = this.canvas.getBoundingClientRect();
		let x = Math.round(ev.clientX - ClientRect.left);
		let y = Math.round(ev.clientY - ClientRect.top);
		let dx = this.cx - x;
		let dy = this.cy - y;
		this.angle = Math.atan2(dy, dx) - Math.PI/2;
		// this.updateDiv();
	}

	eventListeners() {
		this.canvas.addEventListener("mousedown", (ev) => {
			this.isDragging = true;
			this.mouse(ev);
			ev.stopPropagation();
		});
		this.canvas.addEventListener("mouseup", (ev) => {
			if (this.isDragging) {
				ev.stopPropagation();
				this.isDragging = false;
			}
		});
		this.canvas.addEventListener("mouseout", (ev) => {
			this.isDragging = false;
		});
		this.canvas.addEventListener("mousemove", (ev) => {
			if (this.isDragging) {
				this.mouse(ev);
				ev.stopPropagation();
			}
		});
	}
}

function createHeadingIndicator(canvas) {
	return new HeadingIndicator(canvas, {
		w: 320, h: 320, textR: 130,
		lineInnerR: 75,
		lineOuterR: 110,
		lineWidth: 3,
		thinLineInnerR: 75,
		thinLineOuterR: 95,
		thinLineWidth: 1,
		circleR: 95,
		circleWidth: 30,
	});
}
