import React, { Component } from 'react';
import { Text, View, Image, StatusBar, FlatList, ActivityIndicator, 
        RefreshControl, SafeAreaView, TouchableOpacity, Button } from 'react-native';
import { MartaAppStylesheets } from './css.js';
import { MartaKey } from './MartaKey.js';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import allStations from './train_stations.json';
import AsyncStorage from '@react-native-community/async-storage';

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

class StationView extends Component {
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

class ColorLines extends Component {
    render() {
        return (
            <View>
                <View style = {styles.orangeRect} />
                <View style = {styles.yellowRect} />
                <View style = {styles.blueRect} />
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

const Stack = createStackNavigator();

class HomeScreen extends Component { 

    constructor(props) {
        super(props);
        this.state = {stations: [new TrainStation("Ashby"), new TrainStation("Midtown"), new TrainStation("Arts Center"), new TrainStation("College Park")], response: "",
                        loading: true, refreshing: false};
        this.filterDataFromMarta();
    }

    stationModule = ({item}) => {
        return (
           <StationView station = {item.name} loading = {this.state.loading} arrivals = {this.state.response} />
        );
    }


    getDataFromMarta() {
        var apiLink = "http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=" + MartaKey.getKey();
        return fetch(apiLink)
            .then(function(response) { return response.json();})
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

        this.setState({response: arrivalsByStation});
        this.setState({loading: false, refreshing: false}, function(){});
    } 

    render() {
        return (
        <SafeAreaView style = {{ flex: 1, backgroundColor: "black", marginBottom: -150}}>
            <StatusBar barStyle = "light-content" />
            <View style = {{height: "8%", backgroundColor: "black", color: "white"}}>
                <Text style = {styles.viewHeading}>My Stations</Text>
                <TouchableOpacity style = {styles.settingsIcon} onPress = {() => this.props.navigation.navigate("Manage Stations")}>
                    <Image style = {styles.settingsIcon} source = {require('./settings.png')} />
                </TouchableOpacity>
            </View>

            <ColorLines />
        
           <View style = {styles.contentBackground}>
                <FlatList style = {{width: "100%", marginBottom: 130}} data = {this.state.stations} renderItem = {this.stationModule} 
                    scrollEnabled = {true} refreshControl = {
                        <RefreshControl
                         onRefresh = {() => this.handleRefresh()}
                         refreshing = {this.state.refreshing}
                        /> }
                    contentContainerStyle = {{paddingBottom: 40}}
                />
           </View>
        </SafeAreaView>
        );
     }

    handleRefresh() {
        this.setState({refreshing: true});
        this.filterDataFromMarta();
    }

 }

class ManageScreen extends Component {
    trainLineCircle = ({item}) => {
        return (
            <View style = {[styles.horizontalCircle, {backgroundColor: item.toLowerCase()}]}></View>
        );
    }

    trainListHeader = () => {
        return (
            <Image style = {styles.horizontalCircle} source = {require("./train.png")} />
        );
    }

    busList = ({item}) => {
        return (
            <View style = {styles.busListBackground} >
                <Text style = {styles.busListText}>{item}</Text>
            </View>
        );
    }

    busListHeader = () => {
        return (
            <Image style = {styles.horizontalCircle} source = {require("./bus.png")} />
        );
    }

    manageStationModule = ({item}) => {
        return (
            <View style = {styles.stationModule}>
                <View style = {styles.manageStationHeading}>
                    <Text style = {styles.manageStationName}>{item.name}</Text>
                    <TouchableOpacity style = {styles.deleteButton} onPress = {() => console.warn("delete button")}>
                        <Text style = {styles.manageStationName}>×</Text>
                    </TouchableOpacity>
                </View>
                <FlatList data = {item.lines} renderItem = {this.trainLineCircle} horizontal = {true} 
                    ListHeaderComponent = {this.trainListHeader} />
                <FlatList data = {item.bus_served} renderItem = {this.busList} 
                    horizontal = {true} ListHeaderComponent = {this.busListHeader} />
            </View>
        );
    }

    addButton = () => {
        return (
            <TouchableOpacity style = {styles.addButton} onPress = {() => console.warn("add button")}>
                <Text style = {styles.addButtonText}>+</Text>
            </TouchableOpacity>
        )
    }

    componentDidMount() {

    }

    render() {
        return (
        <SafeAreaView style = {{ flex: 1, backgroundColor: "black", marginBottom: -150}}>
        <StatusBar barStyle = "light-content" />
           <View style = {{height: "8%", backgroundColor: "black", color: "white"}}>
               <Text style = {styles.viewHeading}>Manage Stations</Text>
           </View>

        <ColorLines />
        <FlatList style = {{marginBottom: 110}} data = {allStations} renderItem = {this.manageStationModule} 
            ListHeaderComponent = {this.addButton} contentContainerStyle = {{paddingBottom: 40}} />
                <Button title = "Back" onPress = {() => this.props.navigation.goBack()} />
        </SafeAreaView>
        );
    }
}

export default class MartaApp extends Component {

    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home" headerMode = "none">
                    <Stack.Screen name = "Home" component = {HomeScreen} />
                    <Stack.Screen name = "Manage Stations" component = {ManageScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

}
