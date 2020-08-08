import React, { Component } from 'react';
import { Text, View, Image, StatusBar, FlatList, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { MartaAppStylesheets } from './css.js';
import { MartaKey } from './MartaKey.js';

const styles = MartaAppStylesheets.getStyles();

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
        this.station = this.props.station.toUpperCase() + " STATION";
        this.setState({upcomingTrains: {"DIRECTION": "Loading", "WAITING_TIME": ""}});
    }

    matchingStations(station) {
        return station == this.props.station.toUpperCase() + " STATION";
    }

    addToDestinationDict(response, destinationDict) {
        if (response.destination in destinationDict) {
            destinationDict[response.destination] += ", " + response.time;
        } else {
            destinationDict[response.destination] = response.time;
        }
    }

    async generateArrivalsList() {
        var thisStationArrivals = [];
        var rawArrivals = this.props.arrivals[this.station];

        if (rawArrivals == undefined) {
            this.upcomingTrains = thisStationArrivals;
            return;
        }

        for (var response of rawArrivals) {
            if (this.matchingStations(response.STATION)) {
                var arrivalObject = new TrainArrival(response.LINE, response.DESTINATION, response.WAITING_TIME);
                thisStationArrivals.push(arrivalObject);
            }
        }

        this.upcomingTrains = thisStationArrivals;
        console.warn(thisStationArrivals);
    }

    arrivalRow = ({item}) => {
        if (!(item === undefined)) {
            if (item.destination == "Airport") {
                // It's going to the airport, so we use that image instead of a color
                return (
                <View style={styles.stationArrivals}>
                    <Image style = {styles.airportIcon} source={require('./airport.png')} />
                    <Text style = {styles.arrivalText}>{item.destination}</Text>
                    <Text style = {styles.arrivalTimeText}>{item.time}</Text>
                </View>
                );
            } else {
                return(
                <View style={styles.stationArrivals}>
                    <View style = {[styles.circle, {backgroundColor: item.line.toLowerCase()}]}></View>
                    <Text style = {styles.arrivalText}>{item.destination}</Text>
                    <Text style = {styles.arrivalTimeText}>{item.time}</Text>
                </View>
                );
            }
        }
    }

    render() {
        if (!this.props.loading) {
            this.generateArrivalsList();
            if (this.upcomingTrains.length == 0) {
                return <Text style = {styles.emptyListText}>No upcoming trains. Pull to refresh.</Text>
            }
            return (
                <FlatList data = {this.upcomingTrains} renderItem = {this.arrivalRow} />
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
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.stationModule}>
                <View style={styles.stationHeader}>
                    <Text style={styles.stationName}>{this.props.station}</Text>
                </View>
                <StationArrival station = {this.props.station} loading = {this.props.loading} arrivals = {this.props.arrivals}/>
           </View>
        );
    }
}

class TrainStation {
    constructor(name) {
        this.name = name;
    }
}

export default class MartaApp extends Component {
    stationModule = ({item}) => {
        return (
           <StationView station = {item.name} loading = {this.state.loading} arrivals = {this.state.response} />
        );
    }

    constructor(props) {
        super(props);
        this.state = {stations: [new TrainStation("Ashby"), new TrainStation("Midtown"), new TrainStation("Arts Center"), new TrainStation("College Park")], response: "",
                        loading: true, refreshing: false};
        this.filterDataFromMarta();
    }

    getDataFromMarta() {
        var apiLink = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=" + MartaKey.getKey();
        return fetch(apiLink).then(function(response) { return response.json();})
            .then(myJson => {
                this.setState({response: myJson}, function(){});
            });
    }

    async filterDataFromMarta() {
        await this.getDataFromMarta();
        arrivalsByStation = {};

        for (var arrival of this.state.response) {
            if (arrival.STATION in arrivalsByStation) {
                arrivalsByStation[arrival.STATION].push(arrival);
            } else {
                arrivalsByStation[arrival.STATION] = [arrival];
            }
        }

        console.warn(arrivalsByStation);
        this.setState({response: arrivalsByStation});
        this.setState({loading: false}, function(){});
    }


    render() {
        return (
            <SafeAreaView style = {{ flex: 1, backgroundColor: "black", marginBottom: -150}}>
            <StatusBar barStyle="light-content" />
           	<View style={{height: "8%", backgroundColor: "black", color: "white"}}>
           	    <Text style={styles.viewHeading}>My Stations</Text>
           	</View>
            <View style= {styles.orangeRect} />
            <View style= {styles.yellowRect} />
            <View style= {styles.blueRect} />
           	<View style={styles.contentBackground}>
                
                    <FlatList style = {{width: "100%", marginBottom: 130}} data = {this.state.stations} renderItem = {this.stationModule} 
                        scrollEnabled = {true} refreshControl = {
                            <RefreshControl
                             onRefresh = {() => this.handleRefresh()}
                             refreshing = {this.state.loading}
                            /> }
                    />
           	</View>
            </SafeAreaView>
        );
    }

    handleRefresh() {
        this.filterDataFromMarta();
    }
}
