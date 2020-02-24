import React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {View, Image, Text, Alert, SafeAreaView} from 'react-native';
import {Button, Input} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import Snackbar from 'react-native-snackbar';

import firebase from 'react-native-firebase';

class CreateAccountScreen extends React.Component {
    static navigationOptions = {
        title: 'Create Account',
    };

    state = {
        spinner: false,
        //////////////
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        errorMessage1: '',
        errorMessage2: '',
        errorMessage3: '',
        errorMessage4: '',
        errorMessage5: '',
        errorMessage6: '',
    };

    constructor(props) {
        super(props);

        this._firstNameInput = null;
        this._lastNameInput = null;
        this._emailInput = null;
        this._phoneInput = null;
        this._passwordInput = null;
        this._confirmPasswordInput = null;

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <KeyboardAwareScrollView contentContainerStyle={styles.container} enableOnAndroid={true}
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        scrollEnabled={true}>
                    <Image source={require('../../assets/images/authBackground.png')} style={styles.backgroundContainer}/>
                    <Spinner
                        visible={this.state.spinner}
                        textContent={'Please wait...'}
                        overlayColor="rgba(0, 0, 0, 0.5)"
                        textStyle={{color: "white"}}
                    />
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/images/logo.png')} style={styles.logo}/>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._firstNameInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="user" style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder="First Name" returnKeyType="next"
                               onSubmitEditing={() => { this._lastNameInput.focus(); }}
                               blurOnSubmit={false}
                               onChangeText={(firstName) => { this.setState({firstName});}}
                               value={this.state.firstName}
                               errorMessage={this.state.errorMessage1} errorStyle={{paddingLeft: 20}} />
                        <Text style={styles.required}>*</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._lastNameInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="user" style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder="Last Name" returnKeyType="next"
                               onSubmitEditing={() => { this._emailInput.focus(); }}
                               blurOnSubmit={false}
                               onChangeText={(lastName) => { this.setState({lastName}); }}
                               value={this.state.lastName}
                               errorMessage={this.state.errorMessage2} errorStyle={{paddingLeft: 20}} />
                        <Text style={styles.required}>*</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._emailInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="envelope" style={styles.iconSmallStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder="Email" autoCapitalize="none" keyboardType="email-address" returnKeyType="next"
                               onSubmitEditing={() => { this._phoneInput.focus(); }}
                               blurOnSubmit={false}
                               onChangeText={(email) => { this.setState({email}); }}
                               value={this.state.email}
                               errorMessage={this.state.errorMessage3} errorStyle={{paddingLeft: 20}} />
                        <Text style={styles.required}>*</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._phoneInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="phone" style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder="Phone" keyboardType="phone-pad" returnKeyType="next"
                               onSubmitEditing={() => { this._passwordInput.focus(); }}
                               blurOnSubmit={false}
                               onChangeText={(phone) => { this.setState({phone}); }}
                               value={this.state.phone}
                               errorMessage={this.state.errorMessage4} errorStyle={{paddingLeft: 20}} />
                        <Text style={styles.required}>&nbsp;</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._passwordInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="lock" style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle} secureTextEntry={true}
                               placeholder="Password" returnKeyType="next"
                               onSubmitEditing={() => { this._confirmPasswordInput.focus(); }}
                               blurOnSubmit={false}
                               onChangeText={(password) => { this.setState({password}); }}
                               value={this.state.password}
                               errorMessage={this.state.errorMessage5} errorStyle={{paddingLeft: 20}} />
                        <Text style={styles.required}>*</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._confirmPasswordInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name="lock" style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle} secureTextEntry={true}
                               placeholder="Confirm Password"
                               onChangeText={(confirmPassword) => { this.setState({confirmPassword}); }}
                               value={this.state.confirmPassword}
                               errorMessage={this.state.errorMessage6} errorStyle={{paddingLeft: 20}}/>
                        <Text style={styles.required}>*</Text>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.backButton} title="Back" onPress={this.onBack} />
                        <Button raised buttonStyle={styles.createButton} title="Create" onPress={this.onCreateNew.bind(this)} />
                    </View>
                    <View style={styles.hintContainer}>
                        <Text style={styles.required}>*&nbsp;&nbsp;</Text>
                        <Text style={styles.requiredDesc}>Denotes a required field.</Text>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }

    onBack = () => {
        this.props.navigation.navigate('Landing');
    }

    onCreateNew = () => {
        const {firstName, lastName, email, phone, password, confirmPassword} = this.state;

        // Start validating...
        let isValidated = true;
        if (firstName.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage1: 'This field is required!'} );
        } else {
            this.setState({ errorMessage1: ''} );
        }
        if (lastName.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage2: 'This field is required!'} );
        } else {
            this.setState({ errorMessage2: ''} );
        }
        if (email.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage3: 'This field is required!'} );
        } else {
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            if (emailRegex.test(email) === false) {
                isValidated = false;
                this.setState({ errorMessage3: 'Invalid email address'} );
            } else {
                this.setState({ errorMessage3: ''} );
            }
        }
        if (phone.trim() != '') {
            let phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;
            if (phoneRegex.test(phone) === false) {
                isValidated = false;
                this.setState({errorMessage4: 'Invalid phone number'});
            } else {
                this.setState({errorMessage4: ''});
            }
        }
        if (password.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage5: 'This field is required!'} );
        } else {
            if (password.trim().length < 6) {
                isValidated = false;
                this.setState({ errorMessage5: 'Minimum length is 6'} );
            } else {
                this.setState({ errorMessage5: ''} );
            }
        }
        if (confirmPassword.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage6: 'This field is required!'} );
        } else {
            if (password.trim() != '' && password.trim() != confirmPassword.trim()) {
                isValidated = false;
                this.setState({ errorMessage6: 'The confirm password doesn\'t match'} );
            } else {
                this.setState({ errorMessage6: ''} );
            }
        }

        if (!isValidated) {return;}
        // End validating...

        this.setState({ spinner: true});
        this.auth
            .createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                let user = userCredential.user;
                if (user){
                    user.updateProfile({
                        displayName: firstName + ' ' + lastName,
                        phoneNumber: phone,
                    })
                        .then(()=> {
                            user.sendEmailVerification()
                                .then(()=> {
                                    this.db.ref('users/' + user.uid).set({
                                        firstName: firstName,
                                        lastName: lastName,
                                        email: email,
                                        phone: phone,
                                        created: new Date(),
                                    })
                                        .then(()=> {
                                            Alert.alert(
                                                'MedSpa',
                                                'The verification email has been sent to your email address. Please verify to login.',
                                                [{
                                                    text: 'OK',
                                                    onPress: () => {
                                                        this.setState({spinner: false}, ()=> {
                                                            this.props.navigation.navigate('Landing');
                                                        });
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
            })
            .catch((error) => {
                this.setState({spinner: false}, async () => {
                    await new Promise((resolve: any) => setTimeout(resolve, 100))
                    Snackbar.show({
                        title: error.message,
                        duration: Snackbar.LENGTH_LONG,
                    })
                });
            })
    }
}

const styles = EStyleSheet.create({
    container: {
        flexGrow: 1,
    },
    logoContainer: {
        height: '160rem',
        padding: '10rem',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        aspectRatio: 10 / 8,
        height: '80%',
        resizeMode: 'contain',
    },
    itemContainer: {
        height: '58rem',
        //flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    required: {
        fontSize: '16rem',
        fontWeight: 'bold',
        color: '#dc3545',
    },
    requiredDesc: {
        fontSize: '16rem',
        color: '#fafafa'
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
    buttonsContainer: {
        height: '40rem',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingLeft: '20rem',
        paddingRight: '20rem'
    },
    backButton: {
        width: '150rem',
        height: '40rem',
        backgroundColor: '#bf8f43',
        borderRadius: '25rem',
    },
    createButton: {
        width: '150rem',
        height: '40rem',
        backgroundColor: '#66bd32',
        borderRadius: '25rem',
    },
    hintContainer: {
        marginTop: '10rem',
        height: '40rem',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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

export default CreateAccountScreen;
