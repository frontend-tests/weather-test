const app = new Vue({
    el: "#appDiv",
    data: {
        weather: [],
        weatherUrl: "https://api.openweathermap.org/data/2.5/weather",
        currentForecast: [],
        forecastUrl: "https://api.openweathermap.org/data/2.5/forecast",
        appID: "77cae450c4cc7fd6cbb8bed4675f2125",
        currentLocation: [],
        currentTime: "00:00:00",
        currentNearbies: [],
        ipCity: "",
        ipCountryCode: ""
    },
    mounted() {
        this.getCurrentLocation();
        this.currentCity();
        this.updateWeather();
        this.updateForecast();
        this.getCurrentNearby();
        this.showTime();
    },
    methods: {
        getCurrentLocation() {
            axios.get("http://ip-api.com/json/").then(response => {
                this.ipCity = response.data["city"]
                this.ipCountryCode = response.data["countryCode"];
                axios.get("http://geodb-free-service.wirefreethought.com/v1/geo/cities?limit=5&offset=0&namePrefix=" + response.data["city"] + "&countryIds=" + response.data["countryCode"]).then(response => {
                    this.currentLocation = response.data.data[0];
                });
            });
        },        
        currentCity(currentName, currentCountry) {
            this.currentLocation["name"] = currentName;
            this.currentLocation["countryCode"] = currentCountry;
        },          
        updateWeather() {
            if (this.currentLocation.length != 0) {
                axios.get(this.weatherUrl + "?" + "q=" + this.currentLocation["name"] + "," + this.currentLocation["countryCode"] + "&appid=" + this.appID + "&units=metric").then(response => {
                    this.weather = response.data;
                });
            }
            setTimeout(this.updateWeather, 1000);
        },
        updateForecast() {
            if (this.currentLocation.length != 0) {
                axios.get(this.forecastUrl + "?" + "q=" + this.currentLocation["name"] + "," + this.currentLocation["countryCode"] + "&appid=" + this.appID + "&units=metric").then(response => {
                    this.currentForecast = response.data;
                });
            }
            setTimeout(this.updateForecast, 1000);
        },
        getCurrentNearby() {
            if (this.currentLocation.length != 0) {
                axios.get("http://geodb-free-service.wirefreethought.com/v1/geo/cities/" + this.currentLocation.id + "/nearbyCities?limit=5&offset=0&minPopulation=4000000&radius=2000").then(response => {
                    this.currentNearbies = response.data.data;
                });
            }
            setTimeout(this.getCurrentNearby, 1000);            
        },
        showTime() {
            Date.prototype.timeNow = function () {
                return ((this.getHours() < 10)?"0":"") + this.getHours() +":"+ ((this.getMinutes() < 10)?"0":"") + this.getMinutes() +":"+ ((this.getSeconds() < 10)?"0":"") + this.getSeconds();
            }
            var newDate = new Date();
            this.currentTime = newDate.timeNow();
            setTimeout(this.showTime, 500);
        },
    },
    computed: {     
        temperature() {
            if (this.weather.length != 0)
                return this.weather['main']['temp'];
        },
        cities() {
            if (this.currentNearbies.length != 0)
                return this.currentNearbies;
        },
        forecasts() {
            if (this.currentForecast.length != 0)
                return this.currentForecast.list;
        },               
        humidity() {
            if (this.weather.length != 0)
                return this.weather['main']['humidity'];
        },
        cloudCoverage() {
            if (this.weather.length != 0)
                return this.weather['clouds']['all'];
        },
        description() {
            if (this.weather.length != 0)
                return this.weather['weather'][0]['main'];
        },
        location() {
            if (this.weather.length != 0)
                return this.weather['name'];
        },
        country() {
            if (this.weather.length != 0)
                return this.weather['sys']["country"];
        },
        ipcity() {
            return this.ipCity;
        },
        ipcountry() {
            return this.ipCountryCode;
        }        
    },
    filters: {
        decimals(value, decimals) {            
            if(!value) {
                value = 0;
            }
            
            if(!decimals) {
                decimals = 1;
            }
            
            value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
            return value;
        },
        celcius(kelvinVal) {
            return (kelvinVal- 273.15).toFixed(2);
        },
        time12Hour(time) {
            time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
            if (time.length > 1) {
                time = time.slice (1);
                time[5] = +time[0] < 12 ? ' AM' : ' PM';
                time[0] = +time[0] % 12 || 12;
            }
            return time.join ('');
        }
    }
});