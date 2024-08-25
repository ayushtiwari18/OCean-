const map = L.map("map", {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxBounds: [
    [-90, -180],
    [90, 180],
  ],
  maxBoundsViscosity: 1.0,
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
  noWrap: true,
  bounds: [
    [-90, -180],
    [90, 180],
  ],
}).addTo(map);

function adjustMapView() {
  const viewportWidth = document.documentElement.clientWidth;
  const zoom = Math.ceil(Math.log2(viewportWidth / 256));
  const center = [20, 0];
  map.setView(center, zoom);
}

adjustMapView();
window.addEventListener("resize", adjustMapView);

const locations = [
  {
    name: "Titanic Sinking Spot",
    lat: 41.7325,
    lng: -49.9469,
    summary: "Location where the RMS Titanic sank in 1912.",
    description:
      "On April 15, 1912, the RMS Titanic sank in the North Atlantic Ocean after hitting an iceberg during her maiden voyage. The tragedy resulted in the deaths of more than 1,500 passengers and crew.",
  },
  {
    name: "Bermuda Triangle",
    lat: 25.0,
    lng: -71.0,
    summary: "Area where numerous ships and aircraft have disappeared.",
    description:
      "The Bermuda Triangle is a region in the western part of the North Atlantic Ocean where numerous ships and aircraft are said to have disappeared under mysterious circumstances. The area has been the subject of many theories and conspiracies.",
  },
  {
    name: "Mary Celeste",
    lat: 38.4,
    lng: -35.5,
    summary: "Location where the Mary Celeste was found abandoned.",
    description:
      "The Mary Celeste was an American merchant brigantine discovered adrift and deserted in the Atlantic Ocean off the Azores Islands on December 5, 1872. The fate of the crew remains unknown and has been the subject of much speculation.",
  },
  {
    name: "Lost City of Atlantis",
    lat: 36.1333,
    lng: -7.6167,
    summary: "Hypothetical location of the legendary lost city.",
    description:
      "Atlantis is a fictional island mentioned in Plato's works Timaeus and Critias. Many have searched for the real location of this legendary advanced civilization, with theories ranging from the Mediterranean to the Atlantic Ocean.",
  },
  {
    name: "Baltic Sea Anomaly",
    lat: 55.0745,
    lng: 19.7795,
    summary: "Unusual sonar image discovered in the Baltic Sea.",
    description:
      "The Baltic Sea Anomaly is a sonar image resembling a UFO, discovered in 2011 by the Swedish diving team Ocean X. While some claim it's a crashed UFO, others argue it's a natural geological formation.",
  },
  {
    name: "Lost Flight of MH370",
    lat: -39.2833,
    lng: 88.2167,
    summary: "Last known location of Malaysia Airlines Flight 370.",
    description:
      "Malaysia Airlines Flight 370 was a scheduled international passenger flight that disappeared on March 8, 2014, while flying from Kuala Lumpur to Beijing. Despite extensive searches, the aircraft's fate remains unknown.",
  },
  {
    name: "Dwarka Nagri",
    lat: 22.2442,
    lng: 68.9685,
    summary: "Ancient submerged city off the coast of Gujarat, India.",
    description:
      "Dwarka Nagri, also known as the Lost City of Dwarka, is an ancient submerged city located off the coast of Dwarka in Gujarat, India. According to Hindu tradition, it was the legendary city of Lord Krishna. Marine archaeological explorations have revealed structures and artifacts dating back thousands of years, sparking debates about its true age and historical significance.",
  },
];

let boat = L.marker([15, 90], {
  icon: L.icon({
    iconUrl: "boat2.png",
    iconSize: [100, 100],
    iconAnchor: [50, 50],
  }),
}).addTo(map);

function getOceanPath(start, end) {
  const path = [start];

  // Define key navigation points
  const suezCanal = { lat: 30, lng: 32 };
  const babElMandeb = { lat: 12, lng: 43 };
  const capeOfGoodHope = { lat: -35, lng: 20 };
  const capeHorn = { lat: -56, lng: -67 };
  const panamaCanal = { lat: 9, lng: -80 };

  // Check if we need to go around Africa or through Suez Canal
  if ((start.lng < 20 && end.lng > 70) || (start.lng > 70 && end.lng < 20)) {
    if (start.lat > 0 && end.lat > 0) {
      // Use Suez Canal
      path.push(babElMandeb);
      path.push(suezCanal);
    } else {
      // Go around Africa
      path.push(capeOfGoodHope);
    }
  }
  // Check if we need to go around South America or through Panama Canal
  else if (
    (start.lng < -40 && end.lng > -70) ||
    (start.lng > -70 && end.lng < -40)
  ) {
    if (start.lat > -20 && end.lat > -20) {
      // Use Panama Canal
      path.push(panamaCanal);
    } else {
      // Go around South America
      path.push(capeHorn);
    }
  }

  path.push(end);
  return path;
}

function distance(p1, p2) {
  const dx = p1.lng - p2.lng;
  const dy = p1.lat - p2.lat;
  return Math.sqrt(dx * dx + dy * dy);
}

function moveBoat(targetLat, targetLng) {
  const start = boat.getLatLng();
  const end = L.latLng(targetLat, targetLng);
  const path = getOceanPath(start, end);

  let currentLeg = 0;
  const speed = 15; // Adjust for desired speed

  function animate() {
    if (currentLeg < path.length - 1) {
      const start = path[currentLeg];
      const end = path[currentLeg + 1];
      const d = distance(start, end);
      const steps = Math.ceil(d * 5);

      let step = 0;
      function animateLeg() {
        if (step < steps) {
          const i = step / steps;
          const lat = start.lat + (end.lat - start.lat) * i;
          const lng = start.lng + (end.lng - start.lng) * i;
          boat.setLatLng([lat, lng]);
          step++;
          setTimeout(animateLeg, speed);
        } else {
          currentLeg++;
          animate();
        }
      }
      animateLeg();
    }
  }
  animate();
}

locations.forEach((location) => {
  const marker = L.marker([location.lat, location.lng]).addTo(map);

  marker.bindTooltip(location.summary);

  marker.on("click", () => {
    document.getElementById("info-title").textContent = location.name;
    document.getElementById("info-description").textContent =
      location.description;
    document.getElementById("dive-button").onclick = () => {
      console.log(`Diving into ${location.name}`);
    };
    document.getElementById("info-panel").classList.remove("hidden");

    moveBoat(location.lat, location.lng);
  });
});

document.getElementById("close-info").addEventListener("click", () => {
  document.getElementById("info-panel").classList.add("hidden");
});

console.log("Map and markers should be loaded now.");
