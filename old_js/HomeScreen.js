import React, { Component } from 'react';
import { Text, View, Image, StatusBar, FlatList, RefreshControl,
        SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MartaKey } from './MartaKey.js';
import allStations from './train_stations.json';
import { StationView } from './StationView.js';
import { MartaAppStylesheets } from './css.js';
import { ColorLines } from './Utility.js';

const styles = MartaAppStylesheets.getStyles();

export class HomeScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {stations: [], response: "",
                        loading: true, refreshing: false};
        if (this.props.route.params == undefined) {
            this.props.route.params = {};
        }
    }

    componentDidMount() {
        this.getSavedStations();
        this.filterDataFromMarta();
    }

    async getSavedStations() {
        retrievedStations = await AsyncStorage.getItem("savedStations");
        if (retrievedStations == undefined) {
            retrievedStations = "";
            AsyncStorage.setItem("savedStations", "");
            this.props.route.params.savedStations = [];
        } else {
            stationList = retrievedStations.split(",");
            stationObjectList = [];
            for (station of stationList) {
                stationObjectList.push(allStations.find(toAdd => station == toAdd.name));
            }


            this.props.route.params.savedStations = [...stationObjectList];
        }
    }

    stationModule = ({item}) => {
        return (
           <StationView station = {item.name} loading = {this.state.loading} arrivals = {this.state.response} />
        );
    }

    emptyStationList = () => {
        return (
            <Text style = {styles.emptyStationListText}>No stations saved. Tap the gear to add some.</Text>
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
                <TouchableOpacity style = {styles.settingsIcon}
                    onPress = {() => this.props.navigation.navigate("Manage Stations",
                        {savedStations: this.props.route.params.savedStations})} >
                    <Image style = {styles.settingsIcon} source = {require('./img/settings.png')} />
                </TouchableOpacity>
            </View>

            <ColorLines />

           <View style = {styles.contentBackground}>
                <FlatList style = {{width: "100%", marginBottom: 130}}
                    data = {this.props.route.params.savedStations}
                    renderItem = {this.stationModule}
                    scrollEnabled = {true} refreshControl = {
                        <RefreshControl
                         onRefresh = {() => this.getData()}
                         refreshing = {this.state.refreshing}
                        /> }
                    contentContainerStyle = {{paddingBottom: 40}}
                    ListEmptyComponent = {this.emptyStationList}
                    keyExtractor = {(item) => item.name}
                />
           </View>
        </SafeAreaView>
        );
     }

    getData() {
        this.setState({refreshing: true});
        this.getSavedStations();
        this.filterDataFromMarta();
    }

 }
