const Discord = require('discord.js');
const client = new Discord.Client();
const { prefix, token } = require('./config.json');
const fetch = require('node-fetch');
const { send } = require('process');
const { stringify } = require('querystring');
var tempF
var tempC
let channel = "";
let withoutPrefix = "";
let args = ""
let authorID = ""
var d = 0
let currentMessage = ""

client.once('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (message.content === `${prefix}help`) {
        message.channel.send({
            embed: {
                color: 3447003,
                title: "Help:",
                fields: [
                    { name: "Command", value: "!help\n!weather <zipcode>         \n!forecast <zipcode>", inline: true },
                    { name: "description", value: "displays commands\ndisplays current weather\ndisplays 5 day forecast", inline: true }
                ]
            }
        });
    }
});

client.on('message', message => {
    authorID = message.authorID;
    if (message.content.startsWith(prefix + "weather") && authorID != "734621174541320202") {
        channel = message.channel.id;
        args = message.content.slice(prefix.length + 7).trim().split(' ');

        if (args[0].length === 5) {
            getWeather(channel, args);
        }
        else {
            client.channels.cache.get(channel).send("Please use a valid 5 digit zip code!")

        }
    }
    if (message.content.startsWith(prefix + "forecast") && authorID != "734621174541320202") {
        channel = message.channel.id;
        args = message.content.slice(prefix.length + 8).trim().split(' ');
        if (args[0].length === 5) {
            getForecast(channel, args);
        }
    }
    if (message.content.startsWith(prefix + "5day") && authorID != "734621174541320202") {
        channel = message.channel.id;
        author = message.author.id
        args = message.content.slice(prefix.length + 4).trim().split(' ');
        if (args[0].length === 5) {
            getDaily(channel, args, author);
        }
    }
});

function getWeather(data) {

    var zipCode = args[0]
    console.log(args[0])

    fetch(`http://api.openweathermap.org/data/2.5/weather?zip=${zipCode},US&appid=002cc3ba839c181a79f9d6443cd15640`)
        .then(function (response) { return response.json() })
        .then(function (data) {
            console.log(data)
            if (data.cod === "400" || data.cod === "404") {
                client.channels.cache.get(channel).send("You have entered an invalid zipcode or the api has failed!")
            }
            else {
                tempF = Math.round(data.main.temp * 9 / 5 - 459.67);
                tempC = Math.round(data.main.temp - 273.15);
                client.channels.cache.get(channel).send("Hello, it is currently " + tempF + " °F (" + tempC + "°C) in " + data.name + ".");

            }

        })
}

function getForecast(data) {
    var zipCode = args[0]
    console.log(args[0])

    fetch(`http://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},US&appid=002cc3ba839c181a79f9d6443cd15640`)
        .then(function (response) { return response.json() })
        .then(function (data) {

            tempF = Math.round(data.list[0].main.temp * 9 / 5 - 459.67);
            tempC = Math.round(data.list[0].main.temp - 273.15);

            var today = [Math.round(data.list[0].main.temp * 9 / 5 - 459.67)];
            var temps = [Math.round(data.list[0].main.temp * 9 / 5 - 459.67)];
            var dates = [data.list[0].dt_txt]

            for (i = 8; i < 40; i = i + 8) {
                var nextDay = Math.round(data.list[i].main.temp * 9 / 5 - 459.67);
                temps.push(nextDay);
                dates.push(data.list[i].dt_txt)
                tempF = Math.round(data.list[i].main.temp * 9 / 5 - 459.67);
                tempC = Math.round(data.list[i].main.temp - 273.15);
            }
            client.channels.cache.get(channel).send({
                embed: {
                    color: 3449993,
                    title: "5 Day Forecast:",
                    thumbnail: {
                        url: 'https://i.imgur.com/HX79Nk6.png',
                    },
                    fields: [
                        { name: "Date", value: dates[0] + "\n" + dates[1] + "\n" + dates[2] + "\n" + dates[3] + "\n" + dates[4], inline: true },
                        { name: "Temperature", value: temps[0] + "\n" + temps[1] + "\n" + temps[2] + "\n" + temps[3] + "\n" + temps[4], inline: true }
                    ]
                }
            })
        })
}

function getDaily(data) {
    var zipCode = args[0]
    console.log(args[0])

    fetch(`http://api.openweathermap.org/data/2.5/forecast?zip=${zipCode},US&appid=002cc3ba839c181a79f9d6443cd15640`)
        .then(function (response) { return response.json() })
        .then(function (data) {
            i = 0;
            console.log(data);

            tempF = Math.round(data.list[0].main.temp * 9 / 5 - 459.67);
            tempC = Math.round(data.list[0].main.temp - 273.15);

            var today = [Math.round(data.list[0].main.temp * 9 / 5 - 459.67)];
            var temps = [Math.round(data.list[0].main.temp * 9 / 5 - 459.67)];
            var dates = [data.list[0].dt_txt]

            for (i = 8; i < 40; i = i + 8) {

                var nextDay = Math.round(data.list[i].main.temp * 9 / 5 - 459.67);
                temps.push(nextDay);
                dates.push(data.list[i].dt_txt)
            }
            var fiveDay = client.channels.cache.get(channel).send({

                embed: {
                    color: 3449993,
                    title: "5 Day Forecast:",
                    thumbnail: {
                        url: 'https://i.imgur.com/HX79Nk6.png',
                    },
                    fields: [
                        { name: "Date", value: dates[0], inline: true },
                        { name: "Temperature", value: temps[0], inline: true }
                    ]
                }
            }).then(sentEmbed => {
                sentEmbed.react("⬅️"),
                    sentEmbed.react("➡️")
                const filterLeft = (reaction, user) => reaction.emoji.name === '⬅️' && user.id != 734621174541320202;
                const filterRight = (reaction, user) => reaction.emoji.name === '➡️' && user.id != 734621174541320202;
                const collectorLeft = sentEmbed.createReactionCollector(filterLeft, { time: 15000 });
                const collectorRight = sentEmbed.createReactionCollector(filterRight, { time: 15000 });
                collectorRight.on('collect', r => {
                    d++,
                        dCheckHigh(d)

                    sentEmbed.edit({
                        embed: {
                            color: 3449993,
                            title: "5 Day Forecast",
                            thumbnail: {
                                url: 'https://i.imgur.com/HX79Nk6.png',
                            },
                            fields: [
                                { name: "Date", value: dates[d], inline: true },
                                { name: "Temperature", value: temps[d], inline: true }
                            ]
                        }
                    })

                })

                collectorLeft.on('collect', r => {
                    d = d - 1,
                        dCheckLow(d),

                        sentEmbed.edit({
                            embed: {
                                color: 3449993,
                                title: "Next Day",
                                thumbnail: {
                                    url: 'https://i.imgur.com/HX79Nk6.png',
                                },
                                fields: [
                                    { name: "Date", value: dates[d], inline: true },
                                    { name: "Temperature", value: temps[d], inline: true }
                                ]
                            }
                        })

                });
            })
        })
}
function dCheckLow(d) {
    if (d < 0) {
        d = 4
        return d;
    }
}
function dCheckHigh(d) {
    if (d > 4) {
        d = 0
        return d;
    }
}
function removeReact() {


}


client.login(token);
