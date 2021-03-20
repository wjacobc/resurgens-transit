import React, { Component } from 'react';
import { Text, View, Image, StatusBar, FlatList,
        SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MartaAppStylesheets } from './css.js';
import { ColorLines } from './Utility.js';
import { ManageScreen, ManageStationModule } from './ManageStation.js';
import allStations from './train_stations.json';

const styles = MartaAppStylesheets.getStyles();

export class AddScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {filterText: "", savedStations: this.props.route.params.savedStations};
        this.addButton = this.addButton.bind(this);
    }

    addButton(station) {
        newStationList = this.state.savedStations;
        station.key = (newStationList.length == 0) ? "0" : (parseInt(newStationList[newStationList.length - 1].key) + 1).toString();
        newStationList.push(station);
        this.setState({savedStations: newStationList, modified: true});
        stationNames = [];
        this.state.savedStations.forEach(element => {
            stationNames.push(element.name);
        });
        stationNamesString = stationNames.join(",");
        AsyncStorage.setItem("savedStations", stationNamesString);
    }

    stationModule = ({item: station}) => {
        return (
            <ManageStationModule station = {station} adding = {true}
                stationActionButton = {this.addButton} />
        );
    }

    render() {
        return (
            <SafeAreaView style = {{ flex: 1, backgroundColor: "black", marginBottom: -150}}>
                <StatusBar barStyle = "light-content" />
                <View style = {{height: "8%", backgroundColor: "black", color: "white"}}>
                    <Text style = {styles.viewHeading}>Add a Station</Text>
                    <TouchableOpacity style = {styles.settingsIcon}
                        onPress = {() => this.props.navigation.navigate("Manage Stations",
                            {savedStations: this.state.savedStations, modified: this.state.modified})} >
                        {this.state.modified ?
                        <Image style = {styles.settingsIcon} source = {require('./img/check.png')} />
                        :
                        <Image style = {styles.settingsIcon} source = {require('./img/x.png')} />
                        }
                    </TouchableOpacity>
                </View>

                <ColorLines />
                <TextInput style = {styles.searchBar} placeholder = "Search for a station"
                    onChangeText = {text => this.setState({filterText: text})}
                    placeholderTextColor = "#999999" />

                <FlatList style = {{ marginBottom: 120 }} data = {allStations.filter(station =>
                        station.name.toLowerCase().includes(this.state.filterText.toLowerCase())
                        && !this.state.savedStations.includes(station))}
                        renderItem = {this.stationModule}
                        keyExtractor = {(item) => item.name} />
            </SafeAreaView>
        );
    }
}
