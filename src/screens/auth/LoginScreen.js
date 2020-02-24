import React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {Platform, View, Image, Text, TouchableOpacity, Alert, SafeAreaView} from 'react-native';
import {Button, Input} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import AsyncStorage from '@react-native-community/async-storage';

import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import Snackbar from 'react-native-snackbar';
import firebase from 'react-native-firebase';

class LoginScreen extends React.Component {
    static navigationOptions = {
        title: 'Log In',
    };

    constructor(props) {
        super(props);

        this.state = {
            spinner: false,
            //////////////
            email: '',
            password: '',
            errorMessage1: '',
            errorMessage2: '',
        };

        this.emailInput = null;
        this.passwordInput = null;

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    componentDidMount() {
        (async () => {
            const email = await this.lastCredential();
            this.setState({email});
        })();
    }

    lastCredential = async() => {
        try {
            const lastCredential = await AsyncStorage.getItem('@lastCredential');
            return lastCredential ? lastCredential : '';
        } catch(e) {
            return '';
        }
    }

    saveLastCredential = async(email) => {
        try {
            await AsyncStorage.setItem('@lastCredential', email);
        } catch (e) {
            // saving error
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1,}}>
                <KeyboardAwareScrollView contentContainerStyle={styles.container} enableOnAndroid={true}
                        enableAutomaticScroll={true}>
                    <Image source={require('../../assets/images/authBackground.png')} style={styles.backgroundContainer}/>
                    <Spinner visible={this.state.spinner}
                             textContent={'Please wait...'}
                             overlayColor="rgba(0, 0, 0, 0.5)"
                             textStyle={{color: 'white'}} />
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/images/logo.png')} style={styles.logo}/>
                    </View>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Login to Experience</Text>
                        <Text style={styles.subtitle}>Natural beautification from the inside out.</Text>
                    </View>
                    <View style={styles.inputContainer}>
                        <Input ref={(input) => { this.emailInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="envelope" style={styles.iconSmallStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder="Email" autoCapitalize="none" keyboardType="email-address" returnKeyType="next"
                               onSubmitEditing={() => { this.passwordInput.focus(); }}
                               blurOnSubmit={false}
                               onChangeText={(email) => { this.setState({email}); }}
                               value={this.state.email}
                               errorMessage={this.state.errorMessage1} errorStyle={{paddingLeft: 20}} />
                        <View style={{width: '100%', alignItems: 'flex-end'}}>
                            <Input ref={(input) => { this.passwordInput = input; }}
                                   inputContainerStyle={styles.inputStyle}
                                   leftIcon={<Icon name="lock" style={styles.iconNormalStyle} />}
                                   inputStyle={styles.inputInnerStyle}
                                   secureTextEntry={true}
                                   placeholder="Password"
                                   onChangeText={(password) => { this.setState({password}); }}
                                   value={this.state.password}
                                   errorMessage={this.state.errorMessage2} errorStyle={{paddingLeft: 20}} />
                            <TouchableOpacity  onPress={this.onForgotPassword}>
                                <Text style={styles.forgotButton}>Forgot password?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.backButton} title="Back" onPress={this.onBack} />
                        <Button raised buttonStyle={styles.loginButton} title="Login" onPress={this.onLogin} />
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }

    onBack = () => {
        this.props.navigation.navigate('Landing');
    }

    onLogin = () => {
        const {email, password} = this.state;

        // Start validating...
        let isValidated = true;
        if (email.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage1: 'This field is required!'} );
        } else {
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            if (emailRegex.test(email) === false) {
                isValidated = false;
                this.setState({ errorMessage1: 'Invalid email address'} );
            } else {
                this.setState({ errorMessage1: ''} );
            }
        }
        if (password.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage2: 'This field is required!'} );
        } else {
            this.setState({ errorMessage2: ''} );
        }

        if (!isValidated) {return;}
        // End validating...

        this.setState({spinner: true});
        this.auth
            .signInWithEmailAndPassword(email, password)
            .then(async (userCredential) => {
                await this.saveLastCredential(email);
                if (userCredential.user.emailVerified) {
                    this.db.ref('users/' + userCredential.user.uid).update({
                        lastLoggedIn: new Date(),
                    })
                        .then(()=> {
                            this.setState({spinner: false}, () => {
                                this.props.navigation.navigate('AppMain');
                            });
                        })
                        .catch((error) => {
                            this.setState({spinner: false}, async () => {
                                await new Promise((resolve) => setTimeout(resolve, 100))
                                Snackbar.show({
                                    title: error.message,
                                    duration: Snackbar.LENGTH_LONG,
                                })
                            });
                        });
                } else {
                    Alert.alert(
                        'MedSpa',
                        'Your email has not been verified yet. Please verify to login',
                        [{
                            text: 'OK',
                            onPress: () => {
                                this.setState({spinner: false});
                            },
                        }],
                        {cancelable: false}
                    );
                }
            })
            .catch((error) => {
                this.setState({spinner: false}, async () => {
                    await new Promise((resolve) => setTimeout(resolve, 100))
                    Snackbar.show({
                        title: error.message,
                        duration: Snackbar.LENGTH_LONG,
                    })
                });
            });
    }

    onForgotPassword = () => {
        this.props.navigation.navigate('ForgotPassword');
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
    },
    logoContainer: {
        height: '180rem',
        padding: '10rem',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        aspectRatio: 10 / 8,
        height: '80%',
        resizeMode: 'contain',
    },
    titleContainer: {
        height: '15%',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingLeft: '10%',
        paddingRight: '10%',
    },
    title: {
        color: '#fafafa',
        fontFamily: 'MrDeHaviland-Regular',
        fontSize: '50rem',
        textAlign: 'center',
    },
    subtitle: {
        color: '#fafafa',
        fontSize: '16rem',
        textAlign: 'center',
    },
    inputContainer: {
        height: '200rem',
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
        color: '#66bd32',
    },
    forgotButton: {
        fontSize: '16rem',
        color: '#fafafa',
        paddingTop: '5rem',
        paddingRight: '20rem',
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
        padding: '10rem'
    },
    loginButton: {
        width: '160rem',
        height: '40rem',
        backgroundColor: '#66bd32',
        borderRadius: '25rem',
        padding: '10rem'
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

export default LoginScreen;
