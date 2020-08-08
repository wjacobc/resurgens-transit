import { StyleSheet, Dimensions } from 'react-native';
const {width, height} = Dimensions.get("window");

export class MartaAppStylesheets {
    static getStyles() {
        return StyleSheet.create({
            stationName: {
                color: "white",
                fontSize: 30,
                paddingTop: 5,
                paddingBottom: 5,
                textAlign: "center",
            },

            arrivalText: {
                color: "white",
                fontSize: 20,
            },

            emptyListText: {
                paddingTop: 5,
                color: "white",
                fontSize: 18,
                fontStyle: "italic",
                textAlign: "center"
            },
            
            arrivalTimeText: {
                color: "white",
                fontSize: 20,
                marginLeft: "auto",
                marginRight: 10,
            },

            viewHeading: {
                color: "white",
                fontWeight: "bold",
                fontSize: 35,
                paddingTop: "4%",
                justifyContent: 'flex-end',
                paddingLeft: 20,
            },
            
            contentBackground: {
                flex: 7,
                backgroundColor: "#222222",
                alignItems: "center",
            },
            
            stationModule: {
                width: "90%",
                backgroundColor: "black",
                margin: 20,
                marginBottom: 0,
                paddingBottom: 10,

                borderRadius: 10,
                borderWidth: 1,
                borderColor: "white",
                color: "white",
            },
            
            stationHeader: {
                alignSelf: "baseline",
                width: "100%",
                borderBottomWidth: 2,
                borderBottomColor: "white"
            },
            
            circle: {
                width: 20,
                height: 20,
                borderRadius: 10,
                marginTop: 2,
                marginRight: 10,
                marginLeft: 10,
            },
            
            airportIcon: {
                width: 20,
                height: 20,
                marginTop: 2,
                marginRight: 10,
                marginLeft: 10,
            },

            settingsIcon: {
                width: 30,
                height: 30,
                marginTop: -18,
                marginRight: 30,
                marginLeft: "auto"
            },

            stationArrivals: {
                flexDirection: "row",
                marginTop: 5,
            },

            activityIndicator: {
                marginTop: 25
            },

            yellowRect: {
                width: "100%",
                height: 5,
                backgroundColor: "#fdb118"
            },

            orangeRect: {
                width: "100%",
                height: 5,
                backgroundColor: "#f37421"
            },

            blueRect: {
                width: "110%",
                height: 5,
                backgroundColor: "#0292cf"
            }
        });
    }
}