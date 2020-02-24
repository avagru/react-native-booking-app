import React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {Platform, View, Image, Text, Alert, SafeAreaView} from 'react-native';
import {Button, Input} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import Icon from 'react-native-vector-icons/FontAwesome';
import Snackbar from 'react-native-snackbar';
import Spinner from 'react-native-loading-spinner-overlay';

import firebase from 'react-native-firebase';

class ForgotPasswordScreen extends React.Component {
    static navigationOptions = {
        title: 'Forgot Password?',
    };
    state = {
        spinner: false,
        email: '',
        errorMessage: '',
    };

    auth = firebase.auth();

    render() {
        const {goBack} = this.props.navigation;
        return (
            <SafeAreaView style={{flex: 1,}}>
                <KeyboardAwareScrollView contentContainerStyle={styles.container} enableOnAndroid={true}
                    enableAutomaticScroll={(Platform.OS === 'ios')}>
                        <Image source={require('../../assets/images/authBackground.png')} style={styles.backgroundContainer}/>
                    <Spinner
                        visible={this.state.spinner}
                        textContent={'Please wait...'}
                        overlayColor="rgba(0, 0, 0, 0.5)"
                        textStyle={{color: 'white'}}
                    />
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/images/logo.png')} style={styles.logo}/>
                    </View>
                    <View style={styles.inputContainer}>
                        <Text style={styles.subtitle}>Please enter your email address</Text>
                        <Input inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="envelope" style={styles.iconSmallStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder="Email" autoCapitalize="none" keyboardType="email-address"
                               onChangeText={(email) => { this.setState({email}); }}
                               value={this.state.email}
                               errorMessage={this.state.errorMessage} errorStyle={{paddingLeft: 20}} />
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.backButton} title="Back" onPress={() => goBack()} />
                        <Button raised buttonStyle={styles.loginButton} title="Send" onPress={this.onSend} />
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }

    onSend = async () => {
        const {email} = this.state;

        // Start validating...
        let isValidated = true;
        if (email.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage: 'This field is required!'} );
        } else {
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            if (emailRegex.test(email) === false) {
                isValidated = false;
                this.setState({ errorMessage: 'Invalid email address'} );
            } else {
                this.setState({ errorMessage: ''} );
            }
        }
        if (!isValidated) return;
        console.log('Validate OK!');

        this.setState({spinner: true});
        this.auth
            .sendPasswordResetEmail(email)
            .then(async () => {
                Alert.alert(
                    'MedSpa',
                    'Reset password email has been sent to your email address',
                    [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({spinner: false});
                            this.props.navigation.navigate('Landing');
                        }
                    }],
                    {cancelable: false}
                );
            })
            .catch((error) => {
                this.setState({spinner: false}, async () => {
                    await new Promise((resolve: any) => setTimeout(resolve, 100))
                    Snackbar.show({
                        title: error.message,
                        duration: Snackbar.LENGTH_LONG,
                    })
                });
            });
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1
    },
    logoContainer: {
        height: '200rem',
        padding: '10rem',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        aspectRatio: 10/8,
        height: '80%',
        resizeMode: 'contain'
    },
    subtitle: {
        color: '#fafafa',
        fontSize: '16rem',
        textAlign: 'center',
    },
    inputContainer: {
        height: '120rem',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingLeft: '10rem',
        paddingTop: '20rem',
        paddingRight: '10rem',
        paddingBottom: '20rem',
    },
    inputStyle: {
        height: '40rem',
        borderWidth: 1,
        borderColor: '#66bd32',
        borderRadius: '20rem',
        backgroundColor: '#fafafa'
    },
    inputInnerStyle: {
        fontSize: '16rem',
        paddingLeft: '15rem',
        paddingRight: '25rem',
    },
    inputLabelStyle: {
        paddingLeft: '20rem',
        paddingBottom: '5rem',
        color: 'dodgerblue',
    },
    iconSmallStyle: {
        fontSize: '15rem',
        color: '#66bd32',
    },
    iconNormalStyle: {
        fontSize: '20rem',
        color: 'dodgerblue',
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingLeft: '10rem',
        paddingRight: '10rem'
    },
    backButton: {
        width: '160rem',
        height: '40rem',
        backgroundColor: '#bf8f43',
        borderRadius: '25rem',
    },
    loginButton: {
        width: '160rem',
        height: '40rem',
        backgroundColor: '#66bd32',
        borderRadius: '25rem',
    },
    backgroundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
    }
});

export default ForgotPasswordScreen;