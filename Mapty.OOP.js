///______ : USING THE GEOLOCATION API : _________>
// let map, mapEvent; // global variable ;
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

// Workout Class : -- >
class Workout {
  date = new Date();
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescription() {
    // prettier-ignore : ==>
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } / ${this.date.getDate()}`;
  } // now whenEver the new Object is created , the discription should be set..
}

class Running extends Workout {
  type = `running`;
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration); // always write paramaters in order :>
    this.cadence = cadence;
    this.calcpPace();
    this._setDescription();
  }
  calcpPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = `cycling`;
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration); // always write paramaters in order :>
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

// OOP: == >
class App {
  // private instance properties: == >  Properties that are gonna be present on all the instances created through this class : ==>
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    this._getPosition();
    // whenEver the user press Enter : it will also triggers "submit" :>
    form.addEventListener("submit", this._newWorkout.bind(this));

    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this), // will return a new func... / this points to current object :>
        function () {
          alert("Could not get your position !");
        }
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    const coords = [latitude, longitude];

    //   var map = L.map("map").setView([51.505, -0.09], 13);  // instead :>
    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      // fr/hot : to change layout of map :<
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // For getting the latlng : ==>
    this.#map.on("click", this._showForm.bind(this)); // Right here!  // this => points to #map
  }

  // this method is used as an EventHaldler func...
  // Just like Js , The this keyword in this func__ here will then be set to the object onto which the event handler is attached __> this.#map
  _showForm(mapE) {
    // we don't need it here, but we need it  when the form is submitted. :>
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        "";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  _newWorkout(e) {
    e.preventDefault();

    // Using helper func (validInput) to check if all the values are number & (allPositive) func.. to check if all numbers are positive :  number > 0
    const allPositive = (...inputs) => inputs.every((numbers) => numbers > 0);
    const validInput = (...inputs) =>
      inputs.every((numbers) => Number.isFinite(numbers));

    // Getting data from the form :>
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If workout running, Create running object :>
    if (type === "running") {
      const cadence = +inputCadence.value;
      // Check if data is valid :>// Using Guard Clause :>
      if (
        !allPositive(cadence, distance, duration) ||
        !validInput(cadence, distance, duration)
      )
        return alert(
          "(distance, duration, cadence):> Should have to be Positive !"
        );

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, Create cycling object :>
    if (type === "cycling") {
      const elevationGain = +inputElevation.value;
      // Check if data is valid :>// Using Guard Clause :>
      if (
        !validInput(distance, duration, elevationGain) ||
        !allPositive(distance, duration)
      )
        return alert("(distance, duration):> Should have to be Positive !");

      workout = new Cycling([lat, lng], distance, duration, elevationGain);
    }

    // Add new object to workout array :>
    this.#workouts.push(workout);
    console.log(workout);
    // Render workout on map as marker :>
    this._renderworkoutMarker(workout);

    // Render workout :>
    this._renderworkout(workout);

    // hide the form when user submits it : >
    this._hideForm();
  }

  _renderworkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup(); // adds marker to map
  }

  _renderworkout(workout) {
    let html = `
      <li class="workout ${workout.type}--running" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div> 
          `;
    if (workout.type === "running")
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;
    if (workout.type === "cycling")
      html += `<div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;

    form.insertAdjacentHTML("afterend", html);
  }
}
const app = new App();
