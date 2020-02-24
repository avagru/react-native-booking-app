import React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {View, Image, Dimensions, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import {Button} from "react-native-elements";
import Icon from "react-native-vector-icons/FontAwesome";
import Spinner from "react-native-loading-spinner-overlay";

import SplashScreen from "react-native-splash-screen";
import {getStatusBarHeight} from "react-native-status-bar-height";

// Disabled fullscreen by dev (See the line 440 of ImageCarousel.js)
import ImageCarousel from 'react-native-image-carousel';

import firebase from 'react-native-firebase';
import i18n from '../locales/i18n';

class LandingScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            image_urls: [
                'https://evesbody.net/wp-content/uploads/2019/08/header-banner.jpg',
                'https://evesbody.net/wp-content/uploads/2019/08/11CFBE91-A987-4A18-A499-6B571FF78BF9-.jpg',
                'https://evesbody.net/wp-content/uploads/2019/08/DBAAEC13-DB9B-442B-8DE3-32E3AC7B3490-.jpg',
                'https://evesbody.net/wp-content/uploads/2019/08/730CA59B-4C20-4885-AE5C-4D8F13790610.jpg',
                'https://evesbody.net/wp-content/uploads/2019/08/FCFC0F6E-2C00-4013-8240-D93097199B65.jpg',
                'https://evesbody.net/wp-content/uploads/2019/08/IMG_1115.jpg',
                'https://evesbody.net/wp-content/uploads/2019/08/2810C5B4-6A32-48BE-824B-6E3B5158D465-.jpg'
            ]
        };
    }
    componentDidMount() {
        setTimeout(() => {
            SplashScreen.hide();

            firebase.auth()
                .onAuthStateChanged(user => {
                    this.setState({loading: false});

                    if ((user && user.emailVerified)) {
                        this.props.navigation.navigate('AppMain');
                    }
                });
        }, 500);
    }

    render() {
        if (this.state.loading) {
            return (
                <View style={[styles.container, {alignItems: 'center',justifyContent: 'center'}]}>
                    <Spinner
                        visible={true}
                        overlayColor='rgba(0, 0, 0, 0.5)'
                        textStyle={{color: 'white'}} />
                </View>
            );
        } else {
            return (
                <SafeAreaView style={{flex: 1,}}>
                    <View style={styles.container}>
                        <View style={styles.logoContainer}>
                            <Image source={require('../assets/images/logo.png')} style={styles.logo}/>
                        </View>
                        <View style={styles.carouselContainer}>
                            <ImageCarousel style={{alignItems: "center", justifyContent: "center"}}>
                                {this.state.image_urls.map(url => (
                                    <View style={{flex: 1, alignItems: "center", justifyContent: "center"}} key={url}>
                                        <Image
                                            style={styles.image}
                                            source={{uri: url}}
                                            resizeMode="cover"/>
                                    </View>
                                ))}
                            </ImageCarousel>
                            <View style={styles.overlayContainer}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.title}>{i18n.t('landing.title')}</Text>
                                </View>
                                <View style={styles.subTitleContainer}>
                                    <Text style={styles.subtitle}>{i18n.t('landing.subtitle')}</Text>
                                </View>
                                <View style={styles.bookNowContainer}>
                                    <Button icon={<Icon name="angle-double-right" size={20} color="white"/>} iconRight
                                            raised
                                            buttonStyle={styles.bookNowButton}
                                            textStyle={{textAlign: 'center',}} title={i18n.t('landing.bookNow') + "  "}
                                            onPress={this.onBookNow}/>
                                </View>
                            </View>
                        </View>
                        <View style={styles.createAccountContainer}>
                            <Button raised buttonStyle={styles.createAccountButton} title={i18n.t('landing.createNew')}
                                    onPress={this.onCreateNew}/>
                        </View>
                        <View style={styles.loginContainer}>
                            <Text>{i18n.t('landing.haveAccount')}</Text>
                                <TouchableOpacity onPress={this.onLogin}><Text style={styles.loginButton}>{i18n.t('landing.logIn')}</Text></TouchableOpacity>
                        </View>
                    </View>
                </SafeAreaView>
            );
        }
    }

    onBookNow = () => {
        this.props.navigation.navigate('Booking');
    }

    onCreateNew = () => {
        this.props.navigation.navigate('CreateNew');
    };


    onLogin = () => {
        this.props.navigation.navigate('Login');
    };
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        paddingTop: getStatusBarHeight(),
        backgroundColor: 'transparent',
    },
    logoContainer: {
        width: "100%",
        height: '135rem',
        alignItems: 'center',
        paddingBottom: '10rem',
        justifyContent: 'center'
    },
    logo: {
        aspectRatio: 10/8,
        height: "90%",
        resizeMode: 'contain'
    },
    carouselContainer: {
        height: "50%",
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'azure',
        borderTopColor: 'lightgray',
        borderTopWidth: 1,
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
    },
    image: {
        width: Dimensions.get('window').width,
        height: "95%",
        marginRight: "5rem",
    },
    overlayContainer: {
        position: 'absolute',
        flexDirection: 'column',
        height: "95%",
    },
    titleContainer: {
        height: "40%",
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingLeft: '10%',
        paddingRight: '10%',
    },
    title: {
        color: 'white',
        fontFamily: 'MrDeHaviland-Regular',
        fontSize: '50rem',
        textAlign: 'center',
    },
    subTitleContainer: {
        height: "20%",
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '10%',
        paddingRight: '10%',
    },
    subtitle: {
        color: 'white',
        fontSize: '16rem',
        textAlign: 'center',
    },
    bookNowContainer: {
        height: "40%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    bookNowButton: {
        width: '150rem',
        height: '40rem',
        backgroundColor: '#66bd32',
        borderRadius: '0rem',
    },
    createAccountContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createAccountButton: {
        width: '200rem',
        height: '50rem',
        backgroundColor: '#bf8f43',
        borderRadius: '5rem',
    },
    loginContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButton: {
        color: 'green',
        fontSize: 16,
        marginLeft: 10,
    },
});

export default LandingScreen;