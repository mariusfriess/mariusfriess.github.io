/**
 * DOM Elements
 */
let navIndicatorElement;
let navItems;

let pageWrappers;

/**
 * Google Maps API Key
 */
let apiKey = "AIzaSyBp2y6RRWKzM5LqaHCfSHdXjxpbxNbkk2k";

/**
 * This constant is a boolean value indicating whether or not the user's device is running
 * the iOS operating system
 */
const isIOS =
  navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
  navigator.userAgent.match(/AppleWebKit/);

/**
 * This function is called when the web page finishes loading. It initializes various DOM
 * elements and calls the initPageOne function to set up the first page.
 */
function onLoad() {
  navIndicatorElement = document.getElementById("nav-indicator");
  navItems = document.querySelectorAll(".nav-item");
  pageWrappers = document.querySelectorAll(".page-wrapper");

  initPageOne();
}
document.addEventListener("DOMContentLoaded", onLoad);

/**
 * Set the current active page. This Handler function is called as an onclick event handler
 * by the Navigation-Items.
 */
function setActivePage(index) {
  pageWrappers.forEach((item) => item.classList.remove("show"));
  pageWrappers[index].classList.add("show");
}

/**
 * currentPageIndex
 * 0 - Compass Page
 * 1 - Direction Page
 */
let currentPageIndex = 0;

/**
 * This function sets the current page index to a new index and updates the active page
 * and navigation indicator accordingly.
 */
function setCurrentPageIndex(newIndex) {
  currentPageIndex = newIndex;

  if (currentPageIndex === 0) {
    addActiveClassname(0);
    setActivePage(0);
    initPageOne();
    navIndicatorElement.className = "nav-item-0";
  } else if (currentPageIndex === 1) {
    addActiveClassname(1);
    setActivePage(1);
    initPageTwo();
    navIndicatorElement.className = "nav-item-1";
  }
}

/**
 * This function adds the "active" classname to a DOM element (here nav elements) and removes
 * the "active" classname from all other DOM elements in a list. The specific DOM element to
 * receive the "active" classname is specified by its index in the list.
 */
function addActiveClassname(index) {
  navItems.forEach((item) => item.classList.remove("active"));
  navItems.item(index).classList.add("active");
}

/**
 * PAGE 1 - Compass
 */
let compassCircle;
let startBtn;
let myPoint;

/**
 * This function initializes and sets up the first page of the web app. It selects various
 * DOM elements, initializes variables, and sets the active page to the first page. It also
 * starts the device compass.
 */
function initPageOne() {
  compassCircle = document.querySelector(".compass-circle");
  startBtn = document.querySelector(".start-btn");
  myPoint = document.querySelector(".my-point");

  prevRot = 0;
  rounds = 0;
  setActivePage(0);

  startDeviceCompass(compassHandler);
}

/**
 * This function allows access to the device's compass or rotation event, using different processes
 * depending on the device's operating system. It adds an event listener for either the deviceorientation
 * or deviceorientationabsolute event, passing in a handlerFunction as an argument.
 */
function startDeviceCompass(handlerFunction) {
  if (isIOS) {
    DeviceOrientationEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          window.addEventListener("deviceorientation", handlerFunction, true);
        } else {
          alert("This has to be allowed!");
        }
      })
      .catch(() => alert("Feature not supported"));
  } else {
    window.addEventListener("deviceorientationabsolute", handlerFunction, true);
  }
}

/**
 * This function is used to update the rotation of the compass element on the site based on data
 * from the compass / rotation event.
 */
function compassHandler(event) {
  const newRot = event.webkitCompassHeading || Math.abs(event.alpha - 360);

  if (prevRot > 350 && newRot < 10) rounds++;
  if (prevRot < 10 && newRot > 350) rounds--;

  prevRot = newRot;
  const rot = newRot + rounds * 360;
  compassCircle.style.transform = `translate(-50%, -50%) rotate(${-rot}deg)`;
}

/**
 * PAGE 2 - Direction
 */
/**
 * Status:
 * 0 - Waiting for Location Access
 * 1 - Location Access Denied
 * 2 - Location Access not supported
 * 3 - Location Access granted / waiting for input
 * 4 - Input processed / show direction
 */
let CURRENT_STATUS = 0;
let PAGE_STATE_WRAPPERS;

/**
 * Variable to save and update the search term entered by the user
 */
let searchTerm = "";

/**
 * Latitude and Longitude of the devices current Position
 */
let currentLat;
let currentLng;

/**
 * Latitude and Longitude of the target Location
 */
let targetLat;
let targetLng;

/**
 * Heading in direction from the current Position to the target Position
 */
let tragetPlace = "";
let targetHeading = 0;

/**
 * Interval variable later used to periodically refresh user location
 */
let locationReloadInterval;

/**
 * This function initializes and sets up the second page of the web application.
 * It also calls the getUserLocation function to retrieve the user's location.
 */
function initPageTwo() {
  PAGE_STATE_WRAPPERS = document.querySelectorAll(".page-2-state-wrapper");
  setCurrentPageTwoState(0);

  getUserLocation();
}

/**
 * This function retrieves the user's current location using the browser's geolocation API.
 * If not successfull it updates the current page state accordingly.
 */
function getUserLocation() {
  if (navigator.geolocation) {
    // Call getCurrentPosition with success and failure callbacks
    navigator.geolocation.getCurrentPosition(
      onLocationServiceSuccess,
      onLocationServiceFail
    );
  } else {
    // Location service is not supported
    setCurrentPageTwoState(2);
  }
}

/**
 * This function is a success callback for the browser's geolocation API. It is called
 * when the user's location is successfully retrieved and updates values accordingly.
 */
function onLocationServiceSuccess(position) {
  setCurrentPageTwoState(3);
  currentLat = position.coords.latitude;
  currentLng = position.coords.longitude;
}

/**
 * This function is a failure callback for the browser's geolocation API. It is called
 * when the user's location could not be retrieved and sets the state accordingly.
 */
function onLocationServiceFail() {
  setCurrentPageTwoState(1);
}

/**
 * This function sets the current page state for the second page by showing the page
 * state wrapper element specified by the index argument and hiding all other page
 * state wrapper elements.
 */
function setCurrentPageTwoState(index) {
  PAGE_STATE_WRAPPERS.forEach((item) => (item.style.display = "none"));
  PAGE_STATE_WRAPPERS[index].style.display = "block";
}

/**
 * This function sets the search term after the input field's value has changed.
 */
function setSearch(event) {
  searchTerm = event.target.value;
  document.getElementById("direction-not-found-error").classList.remove("show");
  document.getElementById("direction-general-error").classList.remove("show");
}

/**
 * This function searches for a place using the Google Maps API and displays the location
 * and error messages based on the search result. It also updates the page with new
 * location data and starts the device compass.
 */
function findPlace() {
  const mapElement = document.getElementById("map");
  const service = new google.maps.places.PlacesService(mapElement);

  const request = {
    query: searchTerm,
    fields: ["name", "geometry"],
  };

  service.findPlaceFromQuery(request, function (results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      if (results[0]) {
        const result = results[0];
        tragetPlace = result.name;
        targetLat = result.geometry.location.lat();
        targetLng = result.geometry.location.lng();

        const selectedLocationElement =
          document.getElementById("selected-location");
        selectedLocationElement.innerHTML = tragetPlace;

        onLocationDataUpdate();
        startDeviceCompass(compassHandlerPageTwo);
        setCurrentPageTwoState(4);

        locationReloadInterval = setInterval(() => {
          navigator.geolocation.getCurrentPosition((position) => {
            currentLat = position.coords.latitude;
            currentLng = position.coords.longitude;
            onLocationDataUpdate();
          }, onLocationServiceFail);
        }, 10000);
      } else {
        const directionNotFoundErrorElement = document.getElementById(
          "direction-not-found-error"
        );
        directionNotFoundErrorElement.classList.add("show");
      }
    } else {
      const directionGeneralErrorElement = document.getElementById(
        "direction-general-error"
      );
      directionGeneralErrorElement.classList.add("show");
    }
  });
}

/**
 * This function is called whenever the user's location is updated or when the
 * initial location is loaded.
 */
function onLocationDataUpdate() {
  calculateHeading();
  computeDistanceToTarget();
}

/**
 * This function calculates the heading (direction) in degrees from the user's
 * current location to the target location using the Google Maps API. It normalizes
 * the heading value to a value between 0 and 359 degrees.
 */
function calculateHeading() {
  const point1 = new google.maps.LatLng(currentLat, currentLng);
  const point2 = new google.maps.LatLng(targetLat, targetLng);
  const heading = google.maps.geometry.spherical.computeHeading(point1, point2);

  targetHeading = heading < 0 ? heading + 360 : heading;
}

/**
 * This function calculates the distance between the user's current location and the
 * target location using the Google Maps API.
 */
function computeDistanceToTarget() {
  const point1 = new google.maps.LatLng(currentLat, currentLng);
  const point2 = new google.maps.LatLng(targetLat, targetLng);
  const distance = google.maps.geometry.spherical.computeDistanceBetween(
    point1,
    point2
  );

  const distanceElement = document.getElementById("location-distance");
  distanceElement.innerHTML = `${formatNumberWithDots(
    Math.floor(distance)
  )} Meter`;
}

/**
 * This function formats a number by adding points as thousand separators.
 */
function formatNumberWithDots(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * This function is a device rotation handler that rotates an arrow element on
 * the web page to point towards a target location according to the device's
 * current orientation.
 */
function compassHandlerPageTwo(event) {
  const rot = event.webkitCompassHeading || Math.abs(event.alpha - 360);

  let adjustedRot = rot - targetHeading;

  // Tilt arrow only a maximum of +- 70 degrees to left and right; just a design joice
  if (
    (70 < adjustedRot && adjustedRot < 180) ||
    (-290 < adjustedRot && adjustedRot < -180)
  ) {
    adjustedRot = 70;
  } else if (
    (-180 < adjustedRot && adjustedRot < -70) ||
    (290 > adjustedRot && adjustedRot > 180)
  ) {
    adjustedRot = -70;
  }

  const arrowOuter = document.getElementById("direction-arrow-outer");
  arrowOuter.style.transform = `rotate(${adjustedRot}deg)`;

  // Set custom arrow style if under the threshold of +- 12 degrees
  const arrow = document.getElementById("direction-arrow");
  arrow.classList.toggle("green", Math.abs(adjustedRot) <= 12);
}
