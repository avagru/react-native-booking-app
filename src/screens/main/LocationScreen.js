import React from 'react';
import {SafeAreaView, Image, Dimensions} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import MapView, { Marker } from 'react-native-maps';
import firebase from "react-native-firebase";

export default class LocationScreen extends React.Component {
    static navigationOptions = {
        headerTitle: 'Locations',
        headerBackTitle: '',
        headerRight: () => (
            <Image style={styles.navLogo}
                   source={require('../../assets/images/logo.png')} />
        ),
    };

    constructor(props) {
        super(props);

        this.state = {
            markers: []
        };

        this.db = firebase.database();
    }

    componentDidMount() {
        this.db.ref('map/locations').on('value', (snapshot) => {
            let markers = [];
            snapshot.forEach((data) => {
                if (data.val()) {
                    const {lat, long, name, url} = data.val();

                    let newMarker = {
                        lat: lat,
                        long: long,
                        title: name,
                        url: url,
                    };

                    markers.push(newMarker);
                }
            });

            this.setState({markers});
        });
    }

    onDetail = (index) => {
        console.log(this.state.markers[index]);

        this.props.navigation.navigate("LocationsDetail", {title: this.state.markers[index].title, url: this.state.markers[index].url });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <MapView
                    style={{flex: 1,}}
                    initialRegion={{
                        latitude: 27.994402,
                        longitude: -81.760254,
                        latitudeDelta: 5,
                        longitudeDelta: 5,
                    }} >
                    {this.state.markers.map((marker, idx) => (
                        <Marker
                            key={idx}
                            coordinate={{
                                latitude: marker.lat,
                                longitude: marker.long,
                            }}
                            image={require('../../assets/images/marker.png')}
                            title={marker.title}
                            onCalloutPress={e => this.onDetail(idx)}
                        />
                    ))}
                </MapView>
            </SafeAreaView>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    navLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 10,
    },
})