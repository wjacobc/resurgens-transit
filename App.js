import React, { Component } from 'react';
import { Text, View, Image, StatusBar, FlatList, ActivityIndicator, RefreshControl, SafeAreaView} from 'react-native';
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

/*class TrainData {
    static loaded = false;
    //static stationDict = this.generateStationDict();

    static getDataFromMarta() {
        var apiLink = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=" + MartaKey.getKey();

        return fetch(apiLink)
            .then(function(response) {
                return response.json();
            })
            .then(myJson => {
                return myJson;
            });
    }

    static async generateStationDict() {
        var dict = {};
        jsonData = await this.getDataFromMarta();

        for (var arrival of jsonData) {
            if (arrival.STATION in dict) {
                dict[arrival.STATION].push(arrival);
            } else {
                dict[arrival.STATION] = [arrival];
            }
        }
        this.loaded = true;
        console.warn(dict);
        return dict;
    }
}*/

class StationArrival extends Component {
    
    constructor(props) {
        super(props);
        console.warn(this.props.loading);
        //this.state = {loading: this.props.loading, martaResponse: this.props.arrivals};
        //this.getDataFromMarta = this.getDataFromMarta.bind(this);
        this.station = this.props.station.toUpperCase() + " STATION";
        //this.filterDataFromMarta();
        this.setState({upcomingTrains: {"DIRECTION": "Loading", "WAITING_TIME": ""}});
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
        var thisStationOnly = [];
        var destinationDict = {};
        for (var response of this.props.arrivals) {
            this.addToDestinationDict(response, destinationDict);

            if (this.matchingStations(response.STATION)) {
                thisStationOnly.push(response);
            }
        }
        //TODO: destination dict
        //console.warn(destinationDict);
        for (const [ key, value ] of Object.entries(destinationDict)) {
            //console.warn(key);
        }

        this.upcomingTrains = thisStationOnly;
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
        if (!this.props.loading) {
            this.filterDataFromMarta();
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

/*class StationView extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.stationModule}>
                <View style={styles.stationHeader}>
                    <Text style={styles.stationName}>{this.props.station} {"" + this.props.loading}</Text>
                </View>
                <StationArrival station = {this.props.station} loading = {this.props.loading} arrivals = {this.props.arrivals}/>
           </View>
        );
    }
}*/

class TrainStation {
    constructor(name) {
        this.name = name;
    }
}

export default class MartaApp extends Component {
    stationModule = ({item}) => {
        return (
            <View style={styles.stationModule}>
                <View style={styles.stationHeader}>
                    <Text style={styles.stationName}>{item.name} {"" + this.state.loading}</Text>
                </View>
                <StationArrival key = {this.state.response} station = {item.name} loading = {this.state.loading} arrivals = {this.state.response}/>
           </View>
        );
    }

    constructor(props) {
        super(props);
        this.state = {stations: [new TrainStation("Ashby"), new TrainStation("Midtown")], response: "",
                        loading: true, refreshing: false};
        this.filterDataFromMarta();
    }

    getDataFromMarta() {
        var apiLink = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=" + MartaKey.getKey();
        var test = fetch(apiLink).then(function(response) { return response.json();});
        return test
            .then(myJson => {
                this.setState({response: myJson}, function(){});
            });
    }

    async filterDataFromMarta() {
        await this.getDataFromMarta();
        //console.warn(this.state.response);
        //console.warn("Response");

        this.setState({loading: false}, function(){});
        this.setState({response: this.state.response}, function(){});
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
                
                    <FlatList style = {{width: "100%"}} data = {this.state.stations} renderItem = {this.stationModule} 
                        scrollEnabled = {true} refreshControl={
                            <RefreshControl
                             onRefresh = {this.filterDataFromMarta}
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
