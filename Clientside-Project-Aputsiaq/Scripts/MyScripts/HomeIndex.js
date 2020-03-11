$(document).ready(function () {
    var forecastData = [];

    var jqxhr = $.get("https://api.openweathermap.org/data/2.5/forecast?q=viborg&units=metric&appid=c469cabb7125c6795d1af4cd6ad746e7", function () {
        //alert( "success" );
    })
        .done(function (data) {
            //console.log(data);
            forecastData = handleWeatherData(data);
        })
        .fail(function (data) {
            alert("error");
            console.log(data);
        })
        .always(function () {
            //alert( "finished" );
        });

    $("#clickTest").click(function () {
        console.log(forecastData);
    });
});


function get_date_as_string(i) {
    let today = new Date();
    if (!i || i == 0) {
        return today.toISOString().split('T')[0];
    } else {
        let other_day = new Date(today);
        other_day.setDate(other_day.getDate() + i);

        return other_day.toISOString().split('T')[0];
    }
}

function handleWeatherData(data) {
    let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let weatherForecastData = {};
    let weatherForecastDataObjectNames = [];


    data.list.forEach(function (entry) {
        let weatherDate = String(entry.dt_txt).substring(0, 10);

        if (!(weatherDate in weatherForecastData)) {
            weatherForecastData[weatherDate] = [entry];
            weatherForecastDataObjectNames.push(weatherDate);
        } else {
            weatherForecastData[weatherDate].push(entry);
        }
    });

    if (weatherForecastDataObjectNames.length < 6) {
        $("#weather-day6-tab").hide();
    }

    let i = 1;
    weatherForecastDataObjectNames.forEach(function (entry) {
        //insert data to tabs
        let weatherSum = summaryOfADaysWeather(weatherForecastData[entry]);

        $("#weather-day" + i + "-tab-date").append(days[new Date(weatherSum.day).getDay()]);
        $("#weather-day" + i + "-tab-temp").append(weatherSum.coldest + "°C / " + weatherSum.warmest + "°C");
        $("#weather-day" + i + "-tab-details").append(weatherSum.weatherDescription);

        $("weather-day" + i + "-tab-icon").removeAttr("src")
        if (weatherSum.icon) {
            $("#weather-day" + i + "-tab-icon").attr("src", "http://openweathermap.org/img/wn/" + weatherSum.icon + ".png")
        }

        console.log(entry);
        console.log(i);
        //insert data to content
        $("#weather-day" + i + "-table").DataTable({
            autoWidth: false,
            paging: false,
            info: false,
            searching: false,
            data: weatherForecastData[entry],
            columns: [
                {
                    data: "dt_txt"
                },
                {
                    data: "main.temp"
                },
                {
                    data: "weather[0].main"
                },
                {
                    data: "wind.speed"
                },
                {
                    render: function (data, type, row) {
                        if (row.rain) return row.rain["3h"];
                        return "0";
                    }
                },
                {
                    data: "main.humidity"
                }
            ]
        });
        i++;
    });

    console.log(weatherForecastData["2020-03-12"]);
    $("#tableTest").DataTable({
        autoWidth: false,
        paging: false,
        info: false,
        searching: false,
        data: weatherForecastData["2020-03-12"],
        columns: [
            {
                data: "main.temp"
            },
            {
                data: "weather[0].description"
            }
        ]
    });
    return weatherForecastData;
}

function summaryOfADaysWeather(weatherArray) {
    let summary = {
        day: String(weatherArray[0].dt_txt).substring(0, 10),
        warmest: null,
        coldest: null,
        weatherDescription: null,
        icon: null
    }

    weatherArray.forEach(function (entry) {
        if (String(entry.dt_txt).endsWith("12:00:00")) {
            summary.weatherDescription = entry.weather[0].description;
            summary.icon = entry.weather[0].icon
        }

        if (!summary.warmest || entry.main.temp > summary.warmest) {
            summary.warmest = entry.main.temp;
        }
        if (!summary.coldest || entry.main.temp < summary.coldest) {
            summary.coldest = entry.main.temp;
        }
    });

    return summary;
}