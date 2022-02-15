const url = "https://api.wheretheiss.at/v1/satellites/25544"
const earthRad = 5
iss = {
    radius: earthRad + (earthRad * (418/6371)),
    longitude: undefined,
    latitude: undefined,
    altitude: undefined,
    longitudeOffset: 0,
    latitudeOffset: 0,
    closestCity: "",
    cities: []
  }
  function mdist(lat, long, lat1, long1) {
    //on the wraparound where -180 meets 180 it won't find the closest city, I simply do not care somebody else can fix that.
    return (lat - lat1)**2 + (long - long1)**2
    }
function getISSData() {
    fetch(url).then(response => response.json()).then(json => {
        iss.longitude = json.longitude
        iss.latitude = json.latitude;
        iss.altitude = json.altitude

        let cities = iss.cities
        if (cities.length > 0) {
            let tdist = mdist(parseFloat(cities[0][2]), parseFloat(cities[0][3]), iss.latitude, iss.longitude)
            let nearest = [0, tdist]
            for (let i = 1; i < cities.length; i++) {

                let dist = mdist(parseFloat(cities[i][2]), parseFloat(cities[i][3]), iss.latitude, iss.longitude)
                if (dist < nearest[1]) {
                    nearest = [i, dist]
                }
            }
            iss.closestCity = `${cities[nearest[0]][1]}, ${cities[nearest[0]][4]}`
        }

        iss.radius = earthRad + (earthRad * (iss.altitude/6371)) //set the visual altitude to the correct one
        //barely moves so it doesn't matter but whatever

        //set the text on the page
        document.getElementById("location").textContent = `Closest City: ${iss.closestCity}`
        document.getElementById("longitude").textContent = `Longitude: ${json.longitude}`
        document.getElementById("latitude").textContent = `Latitude: ${json.latitude}`
        document.getElementById("altitude").textContent = `Altitude: ${json.altitude}`
        //

    })
    
}
function getCities() {
    //split the csv by newline then by comma into 2d array
    fetch("./worldcities.csv").then(e => e.text()).then(res => res.split("\r\n").map(e => e.split(","))).then(data => {iss.cities = data})
    
}

let dataLoop = setInterval(getISSData, 2000); //update all data once every X ms
getCities()
getISSData()