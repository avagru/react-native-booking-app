import React from 'react';
import {SafeAreaView, Image} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { WebView } from 'react-native-webview';
import Spinner from 'react-native-loading-spinner-overlay';


export default class LocationDetailScreen extends React.Component {
    static navigationOptions = (navBar) => {
        const {navigation} = navBar;
        const headerTitle = navigation.getParam('title', '');
        return {
            headerTitle: headerTitle,
            headerBackTitle: '',
            headerRight: () => (
                <Image style={styles.navLogo}
                       source={require('../../assets/images/logo.png')} />
            ),
        };
    };

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            url: '',
        };
    }

    componentDidMount() {
        const params = this.props.navigation.state.params;
        this.props.navigation.setParams({ headerTitle: params.title });

        console.log(params.title)

        this.setState({url: params.url});
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
                         source={{ uri: this.state.url }}
                         onLoad={() => (this.hideSpinner())}
                />
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