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

    $("#news-table").DataTable({
        //autoWidth: false,
        dom: 't',
        pageLength: 5,
        //info: false,
        //searching: false,
        language: {
            emptyTable: "No news found."
        },
        ajax: {
            url: "https://newsapi.org/v2/top-headlines?sortBy=publishedAt&language=en&apiKey=5a86fa9080d244c3bb23a27e64778dd1",
            dataSrc: "articles"
        },
        columns: [
            {
                render: function (data, type, row) {
                    
                    return "<a class='no-decoration' href='" + row.url + "'>" +
                        "<div class'thumbnail'>" +
                        "<img style='max-width: 100%; height:auto;' src='" + row.urlToImage + "'>" +
                        "<div class='caption'>" +
                        "<h3>" + row.title + "</h3>" +
                        "</div</div></a>";
                }
            }
        ]
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


        //insert data to content

        //headings
        $("#weather-day" + i + "-panel-header").append(days[new Date(weatherSum.day).getDay()]);

        //tables
        $("#weather-day" + i + "-table").DataTable({
            autoWidth: false,
            paging: false,
            info: false,
            searching: false,
            data: weatherForecastData[entry],
            columns: [
                {
                    render: function (data, type, row) {
                        return String(row.dt_txt).substring(10, 16);
                    }
                },
                {
                    data: "main.temp"
                },
                {
                    render: function (data, type, row) {
                        return "<img src='http://openweathermap.org/img/wn/" + row.weather[0].icon + ".png'>"
                    }
                    //data: "weather[0].main"
                },
                {
                    render: function (data, type, row) {
                        if (row.wind.speed < 0) {
                            return Math.ceil(row.wind.speed);
                        }

                        return Math.floor(row.wind.speed);
                    }
                    //data: "wind.speed"
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