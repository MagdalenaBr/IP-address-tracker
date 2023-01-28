"use strict";
const ipAdress = document.querySelector(".ip-number");
const userLocation = document.querySelector(".location-name");
const timezone = document.querySelector(".time");
const isp = document.querySelector(".ISP-name");
const inputText = document.querySelector(".search-area__input");
const btn = document.querySelector(".search-area__btn");
const container = document.querySelector(".data-container");
const errorContainer = document.querySelector(".error-container");
let map;

const renderError = function (msg) {
	container.style.display = "none";
	errorContainer.style.display = "block";
	errorContainer.insertAdjacentText("beforeend", msg);
};

// GET IP
const getIP = async function () {
	try {
		const res = await fetch("https://api.ipify.org?format=json");
		const ipNumber = await res.json();
		return ipNumber;
	} catch (err) {
		renderError(`Something went wrong. Try again.`);
		throw err;
	}
};
// GET POSITION INFO
const getPositionData = async function (ipNumber) {
	try {
		const resPos = await fetch(
			`https://geo.ipify.org/api/v2/country,city?apiKey=at_N4nr4Ibj3jPNkqKcLcl3D49bhpEnr&ipAddress=${ipNumber}`
		);

		if (!resPos.ok) throw new Error("IP number not found.Try again.");
		const data = await resPos.json();
		return data;
	} catch (err) {
		renderError(err.message);
		throw err;
	}
};
// DISPLAY ALL INFO
const dataDisplay = function (data, location) {
	ipAdress.textContent = data.ip;
	userLocation.textContent = `${location.city}, ${location.country}`;
	timezone.textContent = `UTC ${location.timezone}`;
	isp.textContent = data.isp;
};
// MAP LOADING
const mapDisplay = function (lat, lng) {
	map = L.map("map", { zoomControl: false }).setView([lat, lng], 13);

	L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
		maxZoom: 19,
		attribution:
			'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	}).addTo(map);

	const LeafIcon = L.Icon.extend({
		options: {
			iconSize: [30, 40],
			iconAnchor: [15, 40],
		},
	});
	const marker = new LeafIcon({ iconUrl: "./images/icon-location.svg" });
	L.marker([lat, lng], { icon: marker }).addTo(map);
};
// GET LOCATION DATA
const getLocationData = data => {
	const { location } = data;
	const { lat, lng } = location;
	dataDisplay(data, location);
	mapDisplay(lat, lng);
};
// MAP RENDER
const renderMapAuto = async function () {
	const ipNumber = await getIP();
	const data = await getPositionData(ipNumber.ip);
	getLocationData(data);
};

const renderMapByInput = async function (inputIp) {
	const data = await getPositionData(inputIp);
	getLocationData(data);
};

btn.addEventListener("click", function (e) {
	e.preventDefault();
	map.remove();
	if (inputText.value) renderMapByInput(inputText.value);
	inputText.value = "";
});

if (!inputText.value) renderMapAuto();
