import React, { Component } from 'react';
import { Text, View, Image, FlatList, ActivityIndicator } from 'react-native';
import { MartaAppStylesheets } from './css.js';
import TrainArrival from './TrainArrival.js';

const styles = MartaAppStylesheets.getStyles();

class StationArrival extends Component {

    constructor(props) {
        super(props);
        this.station = this.props.station.toUpperCase() + " STATION";
        this.state = {upcomingTrains: {"DIRECTION": "Loading", "WAITING_TIME": ""}};
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
                <FlatList data = {this.upcomingTrains} renderItem = {this.arrivalRow} keyExtractor = {(item) => item.toString()} />
            );
        } else {
            return (
                <ActivityIndicator size = "large" color = "222222" style = {styles.activityIndicator} />
            );
        }
    }
}

export class StationView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style = {styles.stationModule}>
                <View style = {styles.stationHeader}>
                    <Text style = {styles.stationName}>{this.props.station}</Text>
                </View>
                <StationArrival station = {this.props.station} loading = {this.props.loading} arrivals = {this.props.arrivals}/>
           </View>
        );
    }
}


class TrainStation {
    constructor(name, lines, bus_served) {
        this.name = name;
        this.lines = lines;
        this.bus_served = bus_served;
    }
}
