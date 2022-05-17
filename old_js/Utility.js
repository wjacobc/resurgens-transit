import React, { Component } from 'react';
import { View } from 'react-native';
import { MartaAppStylesheets } from './css.js';

const styles = MartaAppStylesheets.getStyles();

export class ColorLines extends Component {
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
