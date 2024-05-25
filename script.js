const inputbar = document.querySelector(".inputbar");
const searchbutton = document.querySelector(".search-btn");
const currlocationbtn = document.querySelector(".location-btn");
const currentweatherdetails = document.querySelector(".weather-details");
const fivedaycards = document.querySelector(".fiveday-cards");
const locationbtn = document.querySelector(".location-btn");
const recentsearch = document.querySelector(".search-history");

//Constants for API KEY
const API_key = `ae584af383504ed695e1c82aa5a41e9b`


const searcharray = [];
//dropdown bar for recent search and update data by recent history
function dropdown() {
  if(!inputbar.value) return;
    else if(inputbar.value){
        searcharray.unshift(inputbar.value)
        
        let recenthtmllist = ""

        for(let i =0; i<searcharray.length; i++) {
            recenthtmllist += `<ul>
            <li>${searcharray[i]}</li>
        </ul>`
    }
        recentsearch.innerHTML = recenthtmllist;  
        
        const searchitems = document.querySelectorAll(".search-history li") 
            searchitems.forEach(item => {
                item.addEventListener("click", ()=> {
                    inputbar.value = item.innerHTML;
                    getdata();
                })
            })  

        while(searcharray.length > 1) {
            searcharray.pop()
        }
    }
    else {
        inputbar.style.display = "none"
    }
}

//update the Ui with fetch weather data
function fectcarddata(cityname, weatheritem, index){
   if(index === 0) {
    return `<div class="current-weather">
    <h2>${cityname} <span>(${weatheritem.dt_txt.split(" ")[0]})</span></h2>
    <h5>Temperature : <span class="temperature">${(weatheritem.main.temp - 273.15).toFixed(2)} °C</span></h5>
    <h5>Wind : <span class="Wind">${weatheritem.wind.speed} M/S</span></h5>
    <h5>Humidity : <span class="temperature">${weatheritem.main.humidity}%</span></h5>
    </div>
    <div class="image-cloud">
        <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png">
        <p>${weatheritem.weather[0].description}</p>
    </div>`
   }
    return `<li class="cards">
    <h3>(${weatheritem.dt_txt.split(" ")[0]})</h5>
    <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" class="cardone-image">
    <h5 class="temp">Temp : <span>${(weatheritem.main.temp - 273.15).toFixed(2)}°C</span></h5>
    <h5 class="wind">Wind : <span>${weatheritem.wind.speed} M/S</span></h5>
    <h5 class="humidity">Humidity : <span>${weatheritem.main.humidity}%</span></h5>
</li>`
}

// funtion for fetch next 5 day weather data
function getfivedayweather(cityname, lat, lon){
    // api for fetch cityname by latitude and longitude
    const fivedayapi = `http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_key}`

    fetch(fivedayapi)
    .then((response)=> {
       return response.json()
    }).then((data)=> {
        const forcaste_u= [];
        const fivedayforcast = data.list.filter(forcast => {
            const forcastdate = new Date(forcast.dt_txt).getDate();
            if(!forcaste_u.includes(forcastdate)){
                return forcaste_u.push(forcastdate)
            }
        })

        inputbar.value = ""
        currentweatherdetails.innerHTML = ""
        fivedaycards.innerHTML = "";

        fivedayforcast.forEach((weatheritem, index)=> {
            if(index === 0) {
                currentweatherdetails.insertAdjacentHTML("beforeend", fectcarddata(cityname,weatheritem, index));
            }
            else {
                fivedaycards.insertAdjacentHTML("beforeend", fectcarddata(cityname, weatheritem, index));
            }
      })
    })

    .catch((error)=> {
        console.log("failed to access coordinates")
    })
}

// function for get weather forcast data 
function getdata(){
    const cityname = inputbar.value.trim(); 
    if(cityname === "") {
        return alert("please enter city name") 
    }
    
    //api for fetch current weather
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityname}&limit=1&appid=${API_key}`

      fetch(API_URL)
      .then((response)=> {
          return response.json();
        })
      .then((data)=> {
        if(data.length === 0) {
            return alert(`No Coordinates Found for " ${cityname} " Please Enter Coorect City Name`)
        }
        dropdown();
        const { name, lat, lon } = data[0]
        getfivedayweather(name, lat, lon)

    })
    
    .catch((error)=> {
        alert("An Error Occur While Fetching The coordinates")
    })
}

//fetch current location 
function getuserlocation() {
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords; 
            // API for fetch current location
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_key}`;
            fetch(API_URL)
            .then((response)=> {
               return response.json();
            })
            .then((data)=> {            
                const { name } = data[0]
                getfivedayweather(name, latitude, longitude)
            })
            .catch((error)=> {
                console.log("an error occur while fetching current city")
            })
        },
        error => { // Show alert if User Denied Permission
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocation request denied. Please reset location permission to grant access again.");
            } else {
                alert("Geolocation request error. Please reset location permission.");
            }
        })
    }
   
    //event listerner for search button
    searchbutton.addEventListener("click", getdata)
    //event listener for current location button
    locationbtn.addEventListener("click", getuserlocation)
    //event listener for input filed
    inputbar.addEventListener("keyup", e => e.key === "Enter" && getdata())