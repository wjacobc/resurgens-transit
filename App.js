import React, { Component } from 'react';
import { StyleSheet, Text, View, Image, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { MartaKey } from './MartaKey.js';

const styles = StyleSheet.create({

    stationName: {
        color: "white",
        fontSize: 30,
        paddingTop: 5,
        paddingBottom: 5,
        textAlign: "center",
    },

    arrivalText: {
        color: "white",
        fontSize: 20,
    },
    
    arrivalTimeText: {
        color: "white",
        fontSize: 20,
        marginLeft: "auto",
        marginRight: 10,
    },

    viewHeading: {
        color: "white",
        fontWeight: "bold",
        fontSize: 35,
        paddingTop: 35,
        paddingLeft: 20,
    },
    
    contentBackground: {
        flex: 7,
        backgroundColor: "#222222",
        alignItems: "center",
    },
    
    stationModule: {
        height: 150,
        width: "90%",
        backgroundColor: "black",
        margin: 20,
        marginBottom: 0,

        borderRadius: 10,
        borderWidth: 1,
        borderColor: "white",
        color: "white",
    },
    
    stationHeader: {
        alignSelf: "baseline",
        width: "100%",
        borderBottomWidth: 2,
        borderBottomColor: "white"
    },
    
    circle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        marginTop: 2,
        marginRight: 10,
        marginLeft: 10,
    },
    
    airportIcon: {
        width: 20,
        height: 20,
        marginTop: 2,
        marginRight: 10,
        marginLeft: 10,
    },

    stationArrivals: {
        flexDirection: "row",
        marginTop: 5,
    },

    activityIndicator: {
        marginTop: 25
    }
});

class TrainArrival {
    constructor(line, destination, time) {
        this.line = line;
        this.destination = destination;
        this.time = time;
    }

    toString() {
        return "" + this.line + " " + this.destination + " " + this.time;
    }
}

class StationArrival extends Component {
    
    constructor(props) {
        super(props);
        this.state = {loading: true, martaResponse: "hello"};
        this.getDataFromMarta = this.getDataFromMarta.bind(this);
        this.filterDataFromMarta();
        this.setState({upcomingTrains: {"DIRECTION": "Loading", "WAITING_TIME": ""}});
    }

    getDataFromMarta() {
        var apiLink = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=" + MartaKey.getKey();
        return fetch(apiLink)
            .then(function(response) {
                return response.json();
            })
            .then(myJson => {
                this.setState({martaResponse: myJson}, function(){});
            });
    }

    matchingStations(station) {
        return station == this.props.station.toUpperCase() + " STATION";
    }

    addToDestinationDict(response, destinationDict) {
        if (response.DESTINATION in destinationDict && this.matchingStations(response.STATION)) {
            destinationDict[response.DESTINATION] += ", " + response.WAITING_TIME;
        } else if (response.STATION == this.props.station.toUpperCase() + " STATION") {
            destinationDict[response.DESTINATION] = response.WAITING_TIME;
        }
    }

    async filterDataFromMarta() {
        await this.getDataFromMarta();
        var thisStationOnly = [];
        var destinationDict = {};
        for (var response of this.state.martaResponse) {
            this.addToDestinationDict(response, destinationDict);

            if (this.matchingStations(response.STATION)) {
                thisStationOnly.push(response);
            }
        }
        console.warn(destinationDict);
        var dangList = [];
        for (const [ key, value ] of Object.entries(destinationDict)) {
            console.warn("jimbabwe");
            console.warn(key);
        }

        this.setState({upcomingTrains: thisStationOnly}, function(){});
        this.setState({loading: false}, function(){});
    }


    arrivalRow = ({item}) => {
        if (!(item === undefined)) {
            if (item["DESTINATION"] == "Airport") {
                // It's going to the airport, so we use that image instead of a color
                return (
                <View style={styles.stationArrivals}>
                    <Image style = {styles.airportIcon} source={require('./airport.png')} />
                    <Text style = {styles.arrivalText}>{item["DESTINATION"]}</Text>
                    <Text style = {styles.arrivalTimeText}>{item["WAITING_TIME"]}</Text>
                </View>
                );
            } else {
                return(
                <View style={styles.stationArrivals}>
                    <View style = {[styles.circle, {backgroundColor: item["LINE"].toLowerCase()}]}></View>
                    <Text style = {styles.arrivalText}>{item["DESTINATION"]}</Text>
                    <Text style = {styles.arrivalTimeText}>{item["WAITING_TIME"]}</Text>
                </View>
                );
            }
        }
    }

    render() {
        if (!this.state.loading) {
            return (
                <FlatList data = {this.state.upcomingTrains} renderItem = {this.arrivalRow} />
            );
        } else {
            return (
                <ActivityIndicator size = "large" color = "222222" style = {styles.activityIndicator} />
            );
        }
    }
}

class LineCircle extends Component {

    constructor(props) {
        super(props);
    }


    render() {
        if (this.props.line == "Airport") {
            return (
                <View>
                    <ImageBackground source={image} style={styles.image}></ImageBackground>
                </View>
            );
        } else {
            return (
                <View style = {[styles.circle, {backgroundColor: this.props.line.toLowerCase()}]}></View>
            );
        }
    }
}

class StationView extends Component {
    render() {
        return (
            <View style={styles.stationModule}>
                <View style={styles.stationHeader}>
                    <Text style={styles.stationName}>{this.props.station}</Text>
                </View>
                <StationArrival station = {this.props.station} />
           </View>
        );
    }
}

export default class MartaApp extends Component {
    stationModule = ({item}) => {
        return (
            <StationView station = {item} />
        );
    }

    stations = ["Sandy Springs", "Ashby", "Midtown"];

    render() {
        return (
            <View style={{flex: 1}}>
                <StatusBar barStyle="light-content" />
           	<View style={{flex: 1, backgroundColor: "black", color: "white"}}>
           	    <Text style={styles.viewHeading}>My Stations</Text>
           	</View>
           	<View style={styles.contentBackground}>
                
                    <FlatList style = {{width: "100%"}} data = {this.stations} renderItem = {this.stationModule} scrollEnabled = {this.stations.length > 3} />
           	</View>
            </View>
        );
    }
}
