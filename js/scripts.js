
$(function () {


    // *** APIs ***
    // clima, previsão 12 horas e previsão 5 dias: https://developer.accuweather.com/apis
    // pegar coordenadas geográficas pelo nome da cidade: https://docs.mapbox.com/api/
    // pegar coordenadas do IP: http://www.geoplugin.net
    // gerar gráficos em JS: https://www.highcharts.com/demo


    //variavel global chave,para usar em todas as urls do sitema, para acessar os dados necessários
    var accuweatherAPIKey = "V4A79CBsIx2A7AoAg7awgq3O0eOLmIB5";
    var mapboxToken = "pk.eyJ1IjoibWFyY29hbnRvbmlvdGVpeGVpcmEiLCJhIjoiY2s2MjN1M2c2MGFoaTNqcDY2djljZTNqNCJ9.hqW7WULD0P7PzZpYCxQ0Gg";



    //objeto criado para não ter que passar sempre cidade, estado e pais 
    var weatherObject = {
        cidade: "",
        estado: "",
        pais: "",
        temperatura: "",
        texto_clima: "",
        icone_clima: ""
    };

    function preencherClimaAgora(cidade, estado, pais, temperatura, texto_clima, icone_clima) {

        var texto_local = cidade + ", " + estado + ". " + pais;
        $("#texto_local").text(texto_local);
        $("#texto_clima").text(texto_clima);
        $("#texto_temperatura").html(String(temperatura) + "&deg;");
        $("#icone_clima").css("background-image", "url('" + weatherObject.icone_clima + "')");

    }

    function gerarGrafico(horas, temperaturas) {

        Highcharts.chart('hourly_chart', {
            chart: {
                type: 'line'
            },
            title: {
                text: 'Temperatura Hora a Hora'
            },

            xAxis: {
                categories:horas
            },
            yAxis: {
                title: {
                    text: 'Temperature (°C)'
                }
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: false
                    },
                    enableMouseTracking: false
                }
            },
            series: [{
                showInLegend: false,
                data: temperaturas

            }]
        });
    }

    gerarGrafico();

    function pegarPrevisaoHoraAHora(localCode) {
        

        $.ajax({
            url : "http://dataservice.accuweather.com/forecasts/v1/hourly/12hour/" + localCode + "?apikey=" + accuweatherAPIKey +"&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function(data){
                // console.log("hourly forecast: ", data);

                var horarios = [];
                var temperaturas = [];

                for( var i = 0; i < data.length; i++){
                    var hora = new Date( data[i].DateTime ).getHours();

                    horarios.push( String(hora) + "h" );//ex: 21h
                    temperaturas.push( data[i].Temperature.Value );
                    
                    gerarGrafico(horarios, temperaturas);
                   // $('.refresh-loader').fadeOut();
                }
            },
            error: function () {
                console.log("Erro");
                gerarErro("Erro ao obter a hora");

            }
        });

    }


    function preencherPrevisao5Dias(previsoes) {

        $("#info_5dias").html("");
        var diasSemana = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

        for (var i = 0; i < previsoes.length; i++) {

            var dataHoje = new Date(previsoes[i].Date);
            var dia_semana = diasSemana[dataHoje.getDay()];

            var iconNumber = previsoes[i].Day.Icon <= 9 ? "0" + String(previsoes[i].Day.Icon) : String(previsoes[i].Day.Icon);

            iconeClima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";
            maxima = String(previsoes[i].Temperature.Maximum.Value);
            minima = String(previsoes[i].Temperature.Minimum.Value);

            elementoHTMLDia = '<div class="day col">';
            elementoHTMLDia += '<div class="day_inner">';
            elementoHTMLDia += '<div class="dayname">';
            elementoHTMLDia += dia_semana;
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '<div style="background-image: url(\'' + iconeClima + '\')" class="daily_weather_icon"></div>'
            elementoHTMLDia += '<div class="max_min_temp">';
            elementoHTMLDia += minima + '&deg; / ' + maxima + '&deg;';
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '</div>';
            elementoHTMLDia += '</div>';

            $("#info_5dias").append(elementoHTMLDia);
            elementoHTMLDia = "";

        }

    }

    function pegarPrevisao5Dias(localCode) {

        $.ajax({
            url: "http://dataservice.accuweather.com/forecasts/v1/daily/5day/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br&metric=true",
            type: "GET",
            dataType: "json",
            success: function (data) {
                console.log("5 day forecast: ", data);

                $("#texto_max_min").html(String(data.DailyForecasts[0].Temperature.Minimum.Value) + "&deg; / " + String(data.DailyForecasts[0].Temperature.Maximum.Value) + "&deg;");

                preencherPrevisao5Dias(data.DailyForecasts);
            },
            error: function () {
                console.log("Erro");
                gerarErro("Erro ao obter a previsão de 5 dias");

            }
        });

    }



    //função para pegar o tempo atual
    function pegarTempoAtual(localCode) {

        $.ajax({
            url: "http://dataservice.accuweather.com/currentconditions/v1/" + localCode + "?apikey=" + accuweatherAPIKey + "&language=pt-br",
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                console.log("current conditions:", data);

                //temperatura está em uma lista
                weatherObject.temperatura = data[0].Temperature.Metric.Value;
                weatherObject.texto_clima = data[0].WeatherText;

                var iconNumber = data[0].WeatherIcon <= 9 ? "0" + String(data[0].WeatherIcon) : String(data[0].WeatherIcon);
                weatherObject.icone_clima = "https://developer.accuweather.com/sites/default/files/" + iconNumber + "-s.png";

                preencherClimaAgora(weatherObject.cidade, weatherObject.estado, weatherObject.pais, weatherObject.temperatura, weatherObject.texto_clima, weatherObject.icone_clima);
            },
            error: function () {
                console.log("Erro");
            }

        });


    }


    function pegarLocalUsuario(lat, long) {
        $.ajax({
            url: "http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=" + accuweatherAPIKey + "&q=" + lat + "%2C" + long + "&language=pt-br",
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                console.log("geoposition :", data);

                try {
                    //parentCity não aparece sempre, então trycatch é para se tiver algum erro
                    weatherObject.cidade = data.ParentCity.LocalizedName;
                } catch {
                    weatherObject.cidade = data.LocalizedName;
                }

                weatherObject.estado = data.AdministrativeArea.LocalizedName;
                weatherObject.pais = data.Country.LocalizedName;

                var localCode = data.Key;
                pegarTempoAtual(localCode);
                pegarPrevisao5Dias(localCode);
                pegarPrevisaoHoraAHora(localCode);
            },
            error: function () {
                console.log("Erro");
            }

        });

    }

    function pegarCoordenadasDaPesquisa(input) {
       
       input = encodeURI("input");
        $.ajax({
            url: "https://api.mapbox.com/geocoding/v5/mapbox.places/"+ input +".json?access_token="+ mapboxToken,
            type: 'GET',
            dataType: 'json',
            success: function (data) {
                console.log("mapbox :", data);

            },
            error: function () {
                console.log("Erro");
            }

        });

    }

    function pegarCoordenadasDoIP() {
        var lat_padrao = -22.981361; // essas variaveis é para o caso se der erro
        var long_padrao = -43.223176;

        $.ajax({
            url: "http://www.geoplugin.net/json.gp",
            type: 'GET',
            dataType: 'json',
            success: function (data) {

                if (data.geoplugin_latitude && data.geoplugin_longitude) {
                    pegarLocalUsuario(data.geoplugin_latitude, data.geoplugin_longitude);
                } else {
                    pegarLocalUsuario(lat_padrao, long_padrao);
                }

            },
            error: function () {
                console.log("Erro");
                pegarLocalUsuario(lat_padrao, long_padrao);
            }

        });
    }
    pegarCoordenadasDoIP();

}); //fechamento da função principal "$(function()"