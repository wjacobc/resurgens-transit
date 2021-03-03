import React, { Component } from 'react';
import { Text, View, Image, StatusBar, FlatList,
        SafeAreaView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MartaAppStylesheets } from './css.js';
import { ColorLines } from './Utility.js';

const styles = MartaAppStylesheets.getStyles();

export class ManageScreen extends Component {
    constructor(props) {
        super(props);
        this.deleteButton = this.deleteButton.bind(this);
        this.state = {savedStations: this.props.route.params.savedStations, modified: false};
    }

    deleteButton(station) {
        newStationList = this.state.savedStations.filter(newStation => newStation.name != station.name);
        this.setState({savedStations: newStationList, modified: true});
        stationNames = [];
        newStationList.forEach(element => {
            stationNames.push(element.name);
        });
        stationNamesString = stationNames.join(",");
        AsyncStorage.setItem("savedStations", stationNamesString);
    }

    render() {
        return (
        <SafeAreaView style = {{ flex: 1, backgroundColor: "black", marginBottom: -150}}>
            <StatusBar barStyle = "light-content" />
            <View style = {{height: "8%", backgroundColor: "black", color: "white"}}>
                <Text style = {styles.viewHeading}>Manage List</Text>
                <TouchableOpacity style = {styles.settingsIcon}
                    onPress = {() => this.props.navigation.navigate("Home", {savedStations: this.state.savedStations})} >
                    {this.state.modified || this.props.route.params.modified ?
                    <Image style = {styles.settingsIcon} source = {require('./img/check.png')} />
                    :
                    <Image style = {styles.settingsIcon} source = {require('./img/x.png')} />
                    }
                </TouchableOpacity>
            </View>

            <ColorLines />
            <ManageStationList includeAddButton = {true} navigation = {this.props.navigation}
                stationsToShow = {this.state.savedStations}
                adding = {false} stationActionButton = {this.deleteButton} />

        </SafeAreaView>
        );
    }
}

export class ManageStationList extends Component {
    constructor(props) {
        super(props);
        this.props.stationActionButton = this.props.stationActionButton.bind(this);
    }

    trainLineCircle = ({item}) => {
        return (
            <View style = {[styles.horizontalCircle, {backgroundColor: item.toLowerCase()}]}></View>
        );
    }

    trainListHeader = () => {
        return (
            <Image style = {styles.horizontalCircle} source = {require("./img/train.png")} />
        );
    }

    busList = ({item}) => {
        return (
            <View style = {styles.busListBackground} >
                <Text style = {styles.busListText}>{item}</Text>
            </View>
        );
    }

    busListEmpty = ({item}) => {
        return (
            <View style = {styles.busListBackground} >
                <Text style = {styles.busListText}>None</Text>
            </View>
        );
    }

    busListHeader = () => {
        return (
            <Image style = {styles.horizontalCircle} source = {require("./img/bus.png")} />
        );
    }

    manageStationModule = ({item}) => {
        return (
            <View style = {styles.stationModule}>
                <View style = {styles.manageStationHeading}>

                    <Text style = {styles.manageStationName}>{item.name}</Text>
                    <TouchableOpacity style = {styles.deleteButton}
                        onPress = {() => this.props.stationActionButton(item)}>

                        {this.props.adding ?
                            <Text style = {styles.manageStationName}>+</Text>
                            :
                            <Text style = {styles.manageStationName}>×</Text>
                        }

                    </TouchableOpacity>

                </View>
                <FlatList data = {item.lines} renderItem = {this.trainLineCircle} horizontal = {true}
                    ListHeaderComponent = {this.trainListHeader} keyExtractor = {(item) => item.toString()}/>
                <FlatList data = {item.bus_served} renderItem = {this.busList}
                    horizontal = {true} ListHeaderComponent = {this.busListHeader}
                    ListEmptyComponent = {this.busListEmpty} keyExtractor = {(item) => item.toString()} />
            </View>
        );
    }

    addButton = () => {
        if (this.props.includeAddButton) {
            return (
                <TouchableOpacity style = {styles.addButton}
                    onPress = {() =>
                        this.props.navigation.navigate("Add Station",
                        {savedStations: this.props.stationsToShow})
                    }>
                    <Text style = {styles.addButtonText}>+</Text>
                </TouchableOpacity>
            );
        }

        return null;
    }

    render() {
        return (
            <FlatList style = {{marginBottom: 110}} data = {this.props.stationsToShow}
                renderItem = {this.manageStationModule}
                ListHeaderComponent = {this.addButton} contentContainerStyle = {{paddingBottom: 60}}
                keyExtractor = {(item) => item.name} />
        );
    }
}

