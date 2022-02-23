
var saveCount = 0;
/* constants related to rendering graph */

var Colors = {
	blue: "#0000FF",
	green: "#24B700",
	darkred: "#c70039",
	shadow: "#574f7d",
	red: "#FDDC01",
}

const lineWeight = 6;
const hoveredLineWeight = 8;
const nodeRadius = 9;
const nodeWeight = 2;


const antPathDashArray = [2, 40];
const antPathDelay = 700;

var Icons = {};

const IconSize = [50, 50];
const IconAnchor = [25, 25];

Icons.crosshair = L.icon({
    iconUrl: 'target.png',
    iconSize:     IconSize, // size of the icon
    iconAnchor:   IconAnchor, // point of the icon which will correspond to marker's location
});


// graph helper functions

function createAntPath(route) {
	return L.polyline.antPath(route, {
		delay: antPathDelay,
		dashArray: antPathDashArray,
		color: Colors.blue,
		pulseColor: "#FFFFFF",
		weight: lineWeight,
		smoothFactor: 1,
		paused: false,
		reversed: false,
		"hardwareAccelerated": true,
		pane: "nodes"
	});
}

function createArrow(route) {
	return L.polyline(route, {
		color: Colors.blue,
		weight: lineWeight,
		smoothFactor: 1,
		pane: "nodes"
	});
}

function createArrowDecorator(line) {
	return L.polylineDecorator( line, {
		patterns: [
			//{offset: '100%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true}})}
			{offset: '50%', repeat: 0, symbol: L.Symbol.arrowHead({
				pixelSize: 25, pathOptions: {
					color: Colors.blue,
					fillOpacity: 1, weight: 0
				},
			})}

		]
	});
}


const RequiredFields = ["name", "nodes", "view", "zoom"];
class Graph {
	constructor(map, options) {
		this.map = map;
		this.lastHover = { type: null, data: null, hovered: false };
		this.lastEdit = { type: null, data: null, active: false };
		this.nodes = [];
		// this field becomes true if the user enters edit mode
		// (modifies the graph)
		this.dirty = false;
		this.name = "unnamed"
		Object.assign(this, options);
		this.nodeOnClick = this.nodeOnEdit;
		this.lineOnClick = this.lineOnEdit;
		this.rerender();
	}
	clear() {
		this.lastHover = { type: null, data: null, hovered: false };
		this.lastEdit = { type: null, data: null, active: false };
		this.nodes = [];
		this.rerender();
		BottomRightPanelContent.innerHTML =
			`<h1>Clear</h1>
			<p>Cleared flight path</p>
			`;
	}
	loadGraph(g) {
		RequiredFields.forEach(field => {
			if(g[field]) {
				this[field] = g[field];
			} else {
				console.log("Warning: field not found in graph:", field);
			}
		});
		BottomRightPanel.classList.add("hidden");
		if(g.view && g.zoom) {
			this.map.flyTo(g.view, g.zoom);
		}
		this.dirty = false;
		this.rerender();
	}
	readFile(event) {
		var file = event.target.files[0];
		if (!file) {
			return;
		}
		var reader = new FileReader();
		reader.onload = (e) => {
			var contents = e.target.result;
			let parsed;
			try {
				parsed = JSON.parse(contents);
			} catch(error) {
				let div = d3.create("div").style("margin", "40vh 0");
				div.append("h1").text("Error while reading file");
				div.append("p").style("font-family", "monospace")
					.text(error.message);
				showModalOverlay(div.node(), { warning: true });
				return;
			}
			if(parsed.nodes) {
				this.loadGraph(parsed);
				this.rerender();
			} else {
				let div = d3.create("div");
				div.append("h1").text("Malformed File");
				div.append("p").text("Given JSON lacks at least one of the following fields:");
				div.append("ul").selectAll("li")
					.data(RequiredFields).join("li")
					.text(d => d);
				showModalOverlay(div.node(), { warning: true });
			}
		};
		reader.readAsText(file);
	}
	serialize() {
		let g = {};
		if(this.name) g.name = this.name;
		g.nodes = this.nodes.map(n => {
			return {
				latlng: n.latlng,
				altitude: n.altitude,
				// name: n.name,
			};
		});
		g.view = this.map.getCenter();
		g.zoom = this.map.getZoom();
		return g;
	}
	/**
	 * Returns the JSON.stringified version of the serialized graph
	 * Indented.
	 */
	getJson() {
		return JSON.stringify(this.serialize(), null, 4);
	}
	saveFile(filename=null) {
		if(!filename) filename = "flight"+saveCount+".json";
		downloadData(filename, this.getJson());
		saveCount++;
	}

	/**
	 * Event handlers
	 */
	nodeOnMouseOver (event) {
		this.lastHover.type = "node";
		this.lastHover.data = event.target.node;
		this.lastHover.pos = event.target._latlng;
		this.lastHover.hovered = true;
		event.target.setRadius(nodeRadius*1.25);
		let node = event.target.node;
		console.log(node);
		let altitude = node.altitude;
		// Lat: ${Math.round(10000*event.target._latlng.lat)/10000} <br/>
		// Lng: ${Math.round(10000*event.target._latlng.lng)/10000}
		Tooltip.div.innerHTML =
			`<b>Node #${this.nodes.indexOf(node)}</b> <br/>
			Altitude: ${altitude}
		`;
		Tooltip.show(event.originalEvent);
	}
	nodeOnMouseOut (event) {
		this.lastHover.hovered = false;
		event.target.setRadius(nodeRadius);
		Tooltip.hide();
	}
	nodeOnEdit(event) {
		let node = event.target.node;
		this.lastEdit.type = "node";
		this.lastEdit.data = node;
		this.lastEdit.active = true;
		BottomRightPanel.show();
		BottomRightPanelContent.innerHTML = `
			<h1>Node #${this.nodes.indexOf(node)}</h1>
			`;
		let controls = d3.create("div");
		// let nameInput = createTextInput(controls, "Name", node.name);
		let latInput = createTextInput(controls, "Lat", node.latlng[0]);
		let lngInput = createTextInput(controls, "Lng", node.latlng[1]);
		let altitudeInput = createTextInput(controls, "Altitude", 
			node.altitude ? node.altitude : "Unknown");
		controls.append("div").classed("blockButton", true)
			.text("OK")
			.on("click", () => {
				let lat = parseFloat(latInput.property("value"));
				let lng = parseFloat(lngInput.property("value"));
				node.latlng = [
					isNaN(lat) ? node.latlng[0] : lat,
					isNaN(lng) ? node.latlng[1] : lng,
				];
				latInput.property("value", node.latlng[0]);
				lngInput.property("value", node.latlng[1]);
				let altitude = parseFloat(altitudeInput.property("value"));
				if(isNaN(altitude)) {
					node.altitude = null;
				} else {
					node.altitude = altitude;
				}
				altitudeInput.property("value", node.altitude);
				/*
				let newName = nameInput.property("value");
				if(newName.length > 0) node.name = newName;
				else delete node.name;
				*/
				this.rerender();
			});
		BottomRightPanelContent.appendChild(controls.node());
	}
	lineOnMouseOver (event) {
		this.lastHover.type = "branch";
		this.lastHover.data = event.target.branch;
		this.lastHover.pos = event.target._latlng;
		this.lastHover.hovered = true;
		event.target.setStyle({ weight: hoveredLineWeight });
		Tooltip.div.innerHTML =
			`Line<br/>
			line
		`;
		Tooltip.show(event.originalEvent);
	}
	lineOnEdit(event) {
		let line = event.target;
		BottomRightPanel.show();
		BottomRightPanelContent.innerHTML =
			`<h1>Line</h1>
			<p>Between nodes #${line.index} and #${line.index+1}</p>
			`;
	}
	lineOnMouseOut (event) {
		this.lastHover.hovered = false;
		event.target.setStyle({ weight: lineWeight });
		Tooltip.hide();
	}


	/**
	 * Renders
	 */
	render (map) {
		this.nodes.forEach(node => {
			node.prevLine = null;
			node.nextLine = null;
		});
		if(this.blinkTimer) clearTimeout(this.blinkTimer);
		var markers = [];
		var circles = [];
		var lines = [];
		var decorators = [];
		let altitudeInterpolator;
		if(Settings.colorized) 
			altitudeInterpolator = d3.interpolateRgb(Colors.shadow, Colors.blue);
		else
			altitudeInterpolator = (_) => Colors.shadow;

		// add lines
		for(var i = 0; i < this.nodes.length-1; ++i) {
			// let branch = this.branches[i];
			let route = [this.nodes[i].latlng, this.nodes[i+1].latlng];
			let line;
			if(Settings.animateAnts) {
				line = createAntPath(route);
			} else {
				line = createArrow(route);
			}
			/*
			line = L.polyline(route, {
				color: Colors.shadow,
				weight: lineWeight,
				smoothFactor: 1,
				pane: "nodes"
			});
			*/
			if(Settings.arrows) {
				decorators.push(createArrowDecorator(line));
			}
			line.index = i;
			line.prevNode = this.nodes[i];
			line.nextNode = this.nodes[i+1];
			line.on("mouseover", this.lineOnMouseOver.bind(this));
			line.on("click", this.lineOnClick.bind(this));
			line.on("mouseout", this.lineOnMouseOut.bind(this));
			lines.push(line);
			this.nodes[i].nextLine = line;
			this.nodes[i+1].prevLine = line;
		}
		// add nodes
		for(var i = 0; i<this.nodes.length; ++i) {
			let node = this.nodes[i];
			let latlng = node.latlng;
			let color;
			color = altitudeInterpolator(node.altitude/100.0);
			//markers.push(L.marker(latlng, {icon: testIcon}));
			let circle = L.circleMarker(latlng, {
				color: Colors.shadow,
				fillColor: color,
				fillOpacity: 1.0,
				radius: nodeRadius,
				weight: nodeWeight,
				pane: "nodes"
			});
			node.index = i;
			circle.index = i;
			circle.node = node;
			circle.on("mouseover", this.nodeOnMouseOver.bind(this));
			circle.on("mouseout", this.nodeOnMouseOut.bind(this));
			circle.on("click", this.nodeOnClick.bind(this));
			circles.push(circle);
		}
		this.markerLayer = L.layerGroup(markers);
		this.circleLayer = L.layerGroup(circles);
		this.lineLayer = L.layerGroup(lines);
		this.decoratorLayer = L.layerGroup(decorators);

		this.map = map;
		this.decoratorLayer.addTo(map);
		this.lineLayer.addTo(map);
		this.circleLayer.addTo(map);
	}
	/**
	 * Generates a random system with len nodes.
	 * For testing purposes.
	 */
	generateRandom (len) {
		const variety = 0.01;
		let lat = 41;
		let lng = 29.045;
		this.nodes = [];
		this.branches = [];
		for(var i =0; i<len; ++i) {
			lat += (Math.random()*variety)-(variety/2);
			lng += (Math.random()*variety)-(variety/2);
			let node = { latlng: [lat,lng] };
			if(i>0) {
				this.branches.push({
					nodes: [i-1, i],
					status: (Math.random() < 0.2) ? -1 : (Math.random() < 0.5) ? 0 : 1
				});
			}
			this.nodes.push(node);
		}
	}
	pushNode(position) {
		let newNode = {
			"latlng": position,
			"altitude": 100
		}
		this.nodes.push(newNode);
	}
	addNode(position, index) {
		let newNode = {
			"latlng": position,
			"altitude": 100
		}
		this.nodes.splice(index, 0, newNode);
	}
	removeElement(victim) {
		let i;
		let data = victim.data;
		switch(victim.type) {
			case "node":
				i = this.nodes.indexOf(data);
				this.nodes.splice(i, 1);
				return true;
			default:
				return false;
		}
		
	}
	handleKeyDown(event) {
		if(this.mode == 1) {
			switch(event.key) {
				case "a":
					if(!this.map.mousePos) return;
					this.pushNode(this.map.mousePos);
					this.rerender();
					break;
				case "x":
					if(this.lastHover.hovered) {
						if(this.removeElement(this.lastHover)) {
							this.rerender();
						}
					}
					break;
				default:
					break;
			}
		}
	}
	clearLayers() {
		if(this.decoratorLayer) {
			this.decoratorLayer.clearLayers();
			this.decoratorLayer.remove();
		}
		if(this.markerLayer) {
			this.markerLayer.clearLayers();
			this.markerLayer.remove();
		}
		if(this.circleLayer) {
			this.circleLayer.clearLayers();
			this.circleLayer.remove();
		}
		if(this.lineLayer) {
			this.lineLayer.clearLayers();
			this.lineLayer.remove();
		}
	}
	/**
	 * Renders the graph. If it is already rendered, clears before rendering.
	 */
	rerender() {
		this.clearLayers();
		this.render(this.map);
	}
	contextMenu(event) {
		let position = [event.latlng.lat, event.latlng.lng];
		let menu = d3.select("#ContextMenu").html("");
		if(this.lastHover.hovered) {
			menu.append("div")
				.text("Remove")
				.on("click", () => {
					if(this.removeElement(this.lastHover))
						this.rerender();
				});
		} else {
			if(this.lastEdit.active && this.lastEdit.type == "node") {
				menu.append("div")
					.text("Move Selected Node Here")
					.on("click", () => {
						this.lastEdit.data.latlng = position;
						this.rerender();
					});
				menu.append("div")
					.text("Add Node After Selected")
					.on("click", () => {
						console.log(this.lastEdit.data)
						this.addNode(position, this.lastEdit.data.index+1);
						this.rerender();
					});
			}
			menu.append("div")
				.text("Add Node After Last")
				.on("click", () => {
					this.pushNode(position);
					this.rerender();
				});
		}
	}
	emptyState() {
		for(let node of this.nodes) {
			node.status = 0;
		}
	}
	onPanelHide() {
		this.lastEdit.active = false;
	}
} //end Graph


window.addEventListener("keydown", function(event) {
	switch(event.key){
		default:
			graph.handleKeyDown(event);
			break;
	}
});


