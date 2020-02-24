import React from 'react';
import { SafeAreaView, Image} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import Spinner from 'react-native-loading-spinner-overlay';
import {WebView} from 'react-native-webview';

import firebase from 'react-native-firebase';

export default class BookingScreen extends React.Component {
    static navigationOptions = {
        headerTitle: 'Booking',
        headerBackTitle: '',
        headerRight: () => (
            <Image style={styles.navLogo}
                   source={require('../../assets/images/logo.png')} />
        ),
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: false,
            booking_uri: '',
        };

        this.db = firebase.database();
    }

    componentDidMount() {
        this.db.ref('settings').on('value', (snapshot) => {
            if (snapshot.val()) {
                const {booking_uri} = snapshot.val();

                this.setState({loading: true});
                this.setState({booking_uri});
            }
        });
    }

    hideSpinner() {
        this.setState({ loading: false });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <Spinner visible={this.state.loading}
                         overlayColor={{color: 'white'}}
                         color={'cadetblue'} />
                <WebView style={{ flex: 1, }}
                         source={{ uri: this.state.booking_uri }}
                         onLoad={() => (this.hideSpinner())}
                />
            </SafeAreaView>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        borderTopColor: 'lightgray',
        borderTopWidth: 1,
        backgroundColor: 'white',
    },
    navLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 10,
    },
})