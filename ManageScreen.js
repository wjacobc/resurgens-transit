import allStations from './train_stations.json';

export default class ManageScreen extends Component {
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
        </SafeAreaView>
        );
    }
}