

var Overlay = document.getElementById("Overlay");
var HUD = document.getElementById("HUD");
var MenuButton = document.getElementById("MenuButton");
var PanelContainer = document.getElementById("PanelContainer");
var TopLeftPanel = document.getElementById("TopLeftPanel");
var TopRightPanel = document.getElementById("TopRightPanel");

var attributionHTML = `
  <h1>Attributions</h1>
  Leaflet
  https://github.com/bbecquet/Leaflet.PolylineDecorator
  j
  `;

Overlay.show = function () {
	Overlay.classList.remove("hidden");
	PanelContainer.classList.add("disabled");
	TopLeftPanel.classList.add("hidden");
	TopRightPanel.classList.add("hidden");
}

Overlay.hide = function () {
	Overlay.classList.add("hidden");
	PanelContainer.classList.remove("disabled");
	TopLeftPanel.classList.remove("hidden");
	TopRightPanel.classList.remove("hidden");
}

function aboutButton() {
	document.getElementById("OverlayContent").innerHTML = `
	  <div id="CentredContent">${attributionHTML}</div>
	`;
	Overlay.show();
}
function settingsButton() {
	document.getElementById("OverlayContent").innerHTML = `
	  <div id="CentredContent">
	  <h1>TODO</h1>
	  <h2>lol</h2>
	  </div>
	`;
	Overlay.show();
}


function statsButton() {
	let content = d3.select("#OverlayContent").html("")
		.append("div").attr("id", "OverlayBottom");
}


function generateSideBar() {
	let div = d3.create("div").attr("id", "OverlayTopBar");
	div.append("div").attr("class", "blockButton")
		.text("X")
		.on("click", () => {
			Overlay.classList.add("hidden");
		});
	div.append("hr");
	div.append("div").attr("class", "blockButton")
		.text("Stats")
		.on("click", () => {
			Overlay.classList.add("hidden");
		});
	return div.node();
}

function onMenuButton() {
	Overlay.innerHTML = `
		<div id="OverlayContent"></div>
		<div id="OverlayTopBar" class="dropAnimation">
			<div class="blockButton" onclick="aboutButton()">About</div>
			<div class="block">
				<div class="blockButton" onclick="statsButton()">Stats</div>
				<div class="blockButton" onclick="settingsButton()">Settings</div>
			</div>
			<div class="blockButton" onclick="Overlay.hide()">X</div>
		</div>
		`;
	statsButton();
	Overlay.show();
}

MenuButton.addEventListener("click", onMenuButton);


function showModalOverlay(content, options = {}) {
	Overlay.innerHTML = `
	<div id="Centred">
	  <div id="OverlayClose" class="blockButton">X</div>
	  <div id="CentredContent"></div>
	</div>
	`;
	document.getElementById("OverlayClose").addEventListener("click", function () {
		Overlay.classList.add("hidden");
		Overlay.classList.remove("warning");
	});
	if (options.warning) Overlay.classList.add("warning");
	Overlay.classList.remove("hidden");
	document.getElementById("CentredContent").appendChild(content);
}
