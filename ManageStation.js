import React, { useState, useCallback, Component } from 'react';
import { Text, View, Image, StatusBar, FlatList,
        SafeAreaView, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MartaAppStylesheets } from './css.js';
import { ColorLines } from './Utility.js';

const styles = MartaAppStylesheets.getStyles();

export class ManageScreen extends Component {
    constructor(props) {
        super(props);
        this.deleteButton = this.deleteButton.bind(this);
        this.updateStationOrder = this.updateStationOrder.bind(this);
        this.state = {savedStations: this.props.route.params.savedStations, modified: false};
    }

    updateStationStorage(stationList) {
        stationNames = [];
        stationList.forEach(element => {
            stationNames.push(element.name);
        });
        stationNamesString = stationNames.join(",");
        AsyncStorage.setItem("savedStations", stationNamesString);
    }

    deleteButton(station) {
        newStationList = this.state.savedStations.filter(newStation => newStation.name != station.name);
        this.setState({savedStations: newStationList, modified: true});
        this.updateStationStorage(newStationList);
    }

    updateStationOrder(stationList) {
        this.setState({savedStations: stationList, modified: true});
        this.updateStationStorage(stationList);
    }

    render() {
        return (
        <SafeAreaView style = {{ flex: 1, backgroundColor: "black", marginBottom: -150}}>
            <StatusBar barStyle = "light-content" />
            <View style = {{height: "8%", backgroundColor: "black", color: "white"}}>
                <Text style = {styles.viewHeading}>Manage List</Text>
                <TouchableOpacity style = {styles.settingsIcon}
                    onPress = {() =>
                        this.props.navigation.navigate("Home",
                            {savedStations: this.state.savedStations})
                    } >

                    {/* If the list has been modified, change the image to a checkmark
                        rather than an X to close */}
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
                adding = {false} stationActionButton = {this.deleteButton}
                updateStationAction = {this.updateStationOrder} />

        </SafeAreaView>
        );
    }
}

export function ManageStationList(props) {
    addButton = () => {
        if (props.includeAddButton) {
            return (
                <TouchableOpacity style = {styles.addButton}
                    onPress = {() =>
                        props.navigation.navigate("Add Station",
                        {savedStations: props.stationsToShow})
                    }>
                    <Text style = {styles.addButtonText}>+</Text>
                </TouchableOpacity>
            );
        }

        return null;
    }

    const [data, setData] = useState(props.stationsToShow);

    const draggableModule = useCallback(
        ({ item: station, index, drag, isActive }) => {
            return (
                <TouchableWithoutFeedback delayLongPress = {200} onLongPress = {drag}>
                    <View>
                        <ManageStationModule station = {station} adding = {props.adding}
                            stationActionButton = {props.stationActionButton}
                            isActive = {isActive} />
                    </View>
                </TouchableWithoutFeedback>
            );
        });

    const footerText = () => {
        return (
            <Text style = {styles.emptyListText}>Tap and hold to reorder stations.</Text>
        );
    };


    return (
        <DraggableFlatList style = {{marginBottom: 110}} data = {props.stationsToShow}
            renderItem = {draggableModule} ListHeaderComponent = {addButton}
            ListFooterComponent = {footerText}
            contentContainerStyle = {{paddingBottom: 60}}
            keyExtractor = {(item) => item.name}
            onDragEnd = {({data}) => props.updateStationAction(data)}/>
    );
}

export function ManageStationModule(props) {

    const trainLineCircle = ({item}) => {
        return (
            <View style = {[styles.horizontalCircle, {backgroundColor: item.toLowerCase()}]}></View>
        );
    }

    const trainListHeader = () => {
        return (
            <Image style = {styles.horizontalCircle} source = {require("./img/train.png")} />
        );
    }

    const busList = ({item}) => {
        return (
            <View style = {styles.busListBackground} >
                <Text style = {styles.busListText}>{item}</Text>
            </View>
        );
    }

    const busListEmpty = () => {
        return (
            <View style = {styles.busListBackground} >
                <Text style = {styles.busListText}>None</Text>
            </View>
        );
    }

    const busListHeader = () => {
        return (
            <Image style = {styles.horizontalCircle} source = {require("./img/bus.png")} />
        );
    }

    const moduleStyle = () => {
        if (props.isActive) {
            return [styles.stationModule, {backgroundColor: "#333333"}];
        } else {
            return styles.stationModule;
        }
    }

    return (
        <View style = {moduleStyle()}>
            <View style = {styles.manageStationHeading}>

                <Text style = {styles.manageStationName}>{props.station.name}</Text>
                <TouchableOpacity style = {styles.deleteButton}
                    onPress = {() => props.stationActionButton(props.station)}>

                    {props.adding ?
                        <Text style = {styles.manageStationName}>+</Text>
                        :
                        <Text style = {styles.manageStationName}>×</Text>
                    }

                </TouchableOpacity>

            </View>

            <FlatList data = {props.station.lines} renderItem = {trainLineCircle} horizontal = {true}
                    ListHeaderComponent = {trainListHeader} keyExtractor = {(item) => item}  />
            <FlatList data = {props.station.bus_served} renderItem = {busList}
                horizontal = {true} ListHeaderComponent = {busListHeader}
                ListEmptyComponent = {busListEmpty} keyExtractor = {(item) => item} />
        </View>
    );
}
