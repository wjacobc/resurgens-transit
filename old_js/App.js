import React, { Component } from 'react';
import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from './HomeScreen.js';
import { ManageStationList, ManageScreen } from './ManageStation.js';
import { AddScreen } from './AddScreen.js';

const Stack = createStackNavigator();

export default class MartaApp extends Component {

    render() {
        return (
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home" headerMode = "none" >
                    <Stack.Screen name = "Home" component = {HomeScreen} options = {{gestureEnabled: false}} />
                    <Stack.Screen name = "Manage Stations" component = {ManageScreen}
                        options = {{gestureEnabled: false}} />
                    <Stack.Screen name = "Add Station" component = {AddScreen}
                        options = {{gestureEnabled: false}} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

}
