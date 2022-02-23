
const colorSky = "#0b8d7194";
const colorSurface = "#000f0894";
const colorGuide = "white";

const rotationGuideImage = new Image();
rotationGuideImage.src = "images/attitude_rotation_guides.png";
const crosshairImage = new Image();
crosshairImage.src = "images/attitude_crosshair.png";

class AttitudeIndicator {
	constructor(canvas, bankDiv, pitchDiv, options) {
		this.canvas = canvas;
		this.bankDiv = bankDiv;
		this.pitchDiv = pitchDiv;
		this.ctx = canvas.getContext("2d");
		Object.assign(this, options);
		this.cx = this.w / 2.0;
		this.cy = this.h / 2.0;
		// Angle is in radians
		this.angle = 0;
		this.pitchTranslate = 0;
		this.isDragging = false;
		//this.eventListeners();

		this.updateDiv();

		// Clipping circle
		// NOTE: repeating this command in draw function severely
		// affects the performance
		this.ctx.beginPath();
		this.ctx.arc(this.w * 0.5, this.h*0.5, this.r, 0, Math.PI * 2);
		this.ctx.clip();
	}

	draw() {
		// Clear the canvas
		this.ctx.clearRect(0, 0, this.w, this.h);
		this.ctx.save(); // save current state

		// Apply rotation around center
		this.ctx.translate(this.w/2, this.h/2);
		this.ctx.rotate(this.angle);
		this.ctx.translate(-this.w/2, -this.h/2);

		this.ctx.save();
		this.ctx.translate(0, this.pitchTranslate);

		// Horizon
		this.ctx.fillStyle = colorSky;
		this.ctx.fillRect(-this.w, -this.h, this.w * 3, this.h * 1.5);
		this.ctx.fillStyle = colorSurface;
		this.ctx.fillRect(-this.w, this.h*0.5, this.w * 3, this.h * 1.5);
		// draw pitch guides
		this.ctx.translate(this.w/2, this.h/2);
		this.ctx.lineWidth = this.pglw;
		this.ctx.strokeStyle = colorGuide;
		for (let i = 0; i < this.npg; ++i) {
			let y = i * this.dpg;
			this.ctx.beginPath();
			this.ctx.moveTo(-this.pgw / 2, y);
			this.ctx.lineTo(this.pgw / 2, y);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(-this.pgw / 2, -y);
			this.ctx.lineTo(this.pgw / 2, -y);
			this.ctx.stroke();
		}
		this.ctx.lineWidth = this.pglw2;
		for (let i = 0; i < this.npg2; ++i) {
			let y = i * this.dpg + this.pgo2;
			this.ctx.beginPath();
			this.ctx.moveTo(-this.pgw2 / 2, y);
			this.ctx.lineTo(this.pgw2 / 2, y);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(-this.pgw2 / 2, -y);
			this.ctx.lineTo(this.pgw2 / 2, -y);
			this.ctx.stroke();
		}

		// rotation only
		this.ctx.restore();

		// draw
		this.ctx.drawImage(rotationGuideImage, 0, 0, this.w, this.h);

		// Restore the unrotated state
		this.ctx.restore();

		this.ctx.drawImage(crosshairImage, 0, 0, this.w, this.h);
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
				// console.log("AttitudeIndicator FPS:", refreshes);
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
		this.pitchTranslate = 1.5*Math.sqrt(dx * dx + dy * dy) - 80;
		this.updateDiv();
	}

		updateValues(angle, pitch) {
			this.angle = angle;
			this.pitchTranslate = pitch;
			this.updateDiv();
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

function createAttitudeIndicator(canvas, bankDiv, pitchDiv) {
	return new AttitudeIndicator(canvas, bankDiv, pitchDiv, {
		w: 320, h: 320, r: 140,
		pgw: 80, // Pitch guide width
		pglw: 2, // Pitch guide line width
		npg: 3, // Pitch guide number
		dpg: 40, // difference in pixels between pitch guides
		pgw2: 60,
		pglw2: 1,
		npg2: 2,
		pgo2: 20,
	});
}
