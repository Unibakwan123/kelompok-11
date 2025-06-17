const rumahSakitJambi = [
  { name: "RSUD Raden Mattaher", lat: -1.6133, lon: 103.6134, rating: 4.2 },
  { name: "RS Siloam Jambi", lat: -1.6067, lon: 103.6175, rating: 4.3 },
  { name: "RS Bhayangkara Jambi", lat: -1.6225, lon: 103.6043, rating: 4.1 },
  { name: "RS Arafah", lat: -1.6142, lon: 103.5968, rating: 4.0 },
  { name: "RS Baiturrahim", lat: -1.6195, lon: 103.6083, rating: 4.4 },
  { name: "RSK Santo Yosef", lat: -1.6188, lon: 103.6256, rating: 3.9 }
];

function toRad(deg) {
  return deg * Math.PI / 180;
}

function haversine(a, b) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const tree = new kdTree(rumahSakitJambi, haversine, ["lat", "lon"]);

let map = L.map('map').setView([-1.6101, 103.6131], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let currentMarker = null;
let userLocation = null;

function showOnMap(rs) {
  if (currentMarker) map.removeLayer(currentMarker);

  let popupContent = `<b>${rs.name}</b><br>Rating: ${rs.rating}`;
  
  if (userLocation) {
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lon}&destination=${rs.lat},${rs.lon}`;
    popupContent += `<br><a href="${gmapsUrl}" target="_blank">Lihat Rute di Google Maps</a>`;
  }

  currentMarker = L.marker([rs.lat, rs.lon])
    .addTo(map)
    .bindPopup(popupContent)
    .openPopup();

  map.setView([rs.lat, rs.lon], 15);
}

function findNearestHospitals() {
  if (!navigator.geolocation) {
    alert("Geolocation tidak didukung.");
    return;
  }

  navigator.geolocation.getCurrentPosition(position => {
    userLocation = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    };

    map.setView([userLocation.lat, userLocation.lon], 13);

    // Marker lokasi pengguna
    L.marker([userLocation.lat, userLocation.lon])
      .addTo(map)
      .bindPopup("Lokasi Anda")
      .openPopup();

    const nearest = tree.nearest(userLocation, rumahSakitJambi.length, 10);
    const nearby = nearest.filter(([rs, dist]) => dist <= 10);

    const resultDiv = document.getElementById("results");
    resultDiv.innerHTML = "<h2>Rumah Sakit Terdekat:</h2>";
    const ul = document.createElement("ul");

    if (nearby.length === 0) {
      resultDiv.innerHTML += "<p>Tidak ada rumah sakit dalam 10 km.</p>";
      return;
    }

    nearby.forEach(([rs, dist]) => {
      const li = document.createElement("li");
      li.textContent = `${rs.name} (Rating: ${rs.rating}) - Jarak: ${dist.toFixed(2)} km`;
      li.onclick = () => showOnMap(rs);
      ul.appendChild(li);

      L.marker([rs.lat, rs.lon]).addTo(map)
        .bindPopup(`<b>${rs.name}</b><br>Rating: ${rs.rating}<br>Jarak: ${dist.toFixed(2)} km`);
    });

    resultDiv.appendChild(ul);
  }, () => {
    alert("Gagal mendapatkan lokasi.");
  });
}

function searchHospital() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!input) {
    alert("Masukkan nama rumah sakit.");
    return;
  }

  const match = rumahSakitJambi.find(rs => rs.name.toLowerCase().includes(input));
  if (!match) {
    alert("Rumah sakit tidak ditemukan.");
    return;
  }

  showOnMap(match);
}

function renderAllHospitals() {
  const list = document.getElementById("hospitalList");
  rumahSakitJambi.forEach(rs => {
    const li = document.createElement("li");
    li.textContent = `${rs.name} (Rating: ${rs.rating})`;
    li.onclick = () => showOnMap(rs);
    list.appendChild(li);
  });
}

window.onload = () => {
  renderAllHospitals();
};








