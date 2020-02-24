import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image} from 'react-native';
import {Button, Input, CheckBox} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/FontAwesome';
import Spinner from 'react-native-loading-spinner-overlay';
import EStyleSheet from 'react-native-extended-stylesheet';

import firebase from 'react-native-firebase';
import Snackbar from 'react-native-snackbar';

export default class ProfileScreen extends React.Component {
    static navigationOptions = {
        headerTitle: 'Profile',
        headerBackTitle: '',
        headerRight: () => (
            <Image style={styles.navLogo}
                   source={require('../../assets/images/logo.png')} />
        ),
    };

    constructor(props) {
        super(props);

        this.state = {
            spinner: false,
            ///////////////
            firstName: '',
            lastName: '',
            phone: '',
            checkedChangePassword: false,
            password: '',
            confirmPassword: '',
            checkedCoachInfo: false,
            coachName: '',
            coachEmail: '',
            coachPhone: '',

            errorMessage1: '',
            errorMessage2: '',
            errorMessage3: '',
            errorMessage4: '',
            errorMessage5: '',
            errorMessage6: '',
            errorMessage7: '',
            errorMessage8: '',

            hasCoach: false,
        };

        this._firstNameInput = null;
        this._lastNameInput = null;
        this._phoneInput = null;
        this._passwordInput = null;
        this._confirmPasswordInput = null;

        this._coachNameInput = null;
        this._coachEmailInput = null;
        this._coachPhoneInput = null;

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    componentDidMount() {
        const user = this.auth.currentUser;
        if (user) {
            this.db.ref('users/' + user.uid).once('value', (snapshot) => {
                if (snapshot.val()) {
                    const {firstName, lastName, phone, coach} = snapshot.val();
                    this.setState({firstName});
                    this.setState({lastName});
                    this.setState({phone});

                    if (coach && coach.email != '') {
                        this.setState({hasCoach: true});
                        this.setState({checkedCoachInfo: true});
                        this.setState({coachName: coach.name});
                        this.setState({coachEmail: coach.email});
                        this.setState({coachPhone: (coach.phone)? coach.phone : ''});
                    }
                }
            });
        }
    }

    onChangePasswordCheckBox = () => {
        this.setState({checkedChangePassword: !this.state.checkedChangePassword});
        this.setState({errorMessage4: ''});
        this.setState({errorMessage5: ''});
    }

    onCoachInfoCheckBox = () => {
        this.setState({checkedCoachInfo: !this.state.checkedCoachInfo}, () => {
            if (!this.state.checkedCoachInfo) {
                this.setState({coachName: ''});
                this.setState({coachEmail: ''});
                this.setState({coachPhone: ''});
            }
        });
        this.setState({errorMessage6: ''});
        this.setState({errorMessage7: ''});
        this.setState({errorMessage8: ''});
    }

    onSave = () => {
        const {firstName, lastName, phone, password, confirmPassword, coachName, coachEmail, coachPhone} = this.state;

        // Start validating...
        let isValidated = true;
        if (firstName.trim() == '') {
            isValidated = false;
            this.setState({errorMessage1: 'This field is required!'});
        } else {
            this.setState({errorMessage1: ''});
        }
        if (lastName.trim() == '') {
            isValidated = false;
            this.setState({errorMessage2: 'This field is required!'});
        } else {
            this.setState({errorMessage2: ''});
        }

        if (phone.trim() != '') {
            let phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;
            if (phoneRegex.test(phone) === false) {
                isValidated = false;
                this.setState({errorMessage3: 'Invalid phone number'});
            } else {
                this.setState({errorMessage3: ''});
            }
        }

        if (this.state.checkedChangePassword) {
            if (password.trim() == '') {
                isValidated = false;
                this.setState({errorMessage4: 'This field is required!'});
            } else {
                if (password.trim().length < 6) {
                    isValidated = false;
                    this.setState({errorMessage4: 'Minimum length is 6'});
                } else {
                    this.setState({errorMessage4: ''});
                }
            }
            if (confirmPassword.trim() == '') {
                isValidated = false;
                this.setState({errorMessage6: 'This field is required!'});
            } else {
                if (password.trim() != '' && password.trim() != confirmPassword.trim()) {
                    isValidated = false;
                    this.setState({errorMessage5: 'The confirm password doesn\'t match'});
                } else {
                    this.setState({errorMessage5: ''});
                }
            }
        } else {
            this.setState({errorMessage4: ''});
            this.setState({errorMessage5: ''});
        }

        if (this.state.checkedCoachInfo) {

            if (coachName.trim() == '') {
                isValidated = false;
                this.setState({errorMessage6: 'This field is required!'});
            } else {
                this.setState({errorMessage6: ''});
            }
            if (coachEmail.trim() == '') {
                isValidated = false;
                this.setState({errorMessage7: 'This field is required!'});
            } else {
                let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
                if (emailRegex.test(coachEmail) === false) {
                    isValidated = false;
                    this.setState({errorMessage7: 'Invalid email address'});
                } else {
                    this.setState({errorMessage7: ''});
                }
            }
            if (coachPhone.trim() != '') {
                let phoneRegex = /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/;
                if (phoneRegex.test(coachPhone) === false) {
                    isValidated = false;
                    this.setState({errorMessage8: 'Invalid phone number'});
                } else {
                    this.setState({errorMessage8: ''});
                }
            }
        } else {
            this.setState({errorMessage6: ''});
            this.setState({errorMessage7: ''});
            this.setState({errorMessage8: ''});
        }

        if (!isValidated) return;
        // End validating...

        this.setState({spinner: true});

        const user = this.auth.currentUser;
        if (user) {
            let update = {displayName: firstName + ' ' + lastName, };
            if (phone.trim() != '') {
                update.phoneNumber = phone;
            }
            user.updateProfile(update).then(async () => {
                if (this.state.checkedChangePassword) {
                    await user.updatePassword(password)
                        .then()
                        .catch((error) => {
                            console.error(error.message);
                            Snackbar.show({
                                title: error.message,
                                duration: Snackbar.LENGTH_INDEFINITE,
                                action: {
                                    title: 'Close',
                                    color: 'green',
                                    onPress: () => { /* Do something. */ },
                                },
                            });
                        });
                }

                let update = {
                    firstName: firstName ,
                    lastName: lastName,
                    phone: phone,
                    updated: new Date(),
                };

                update.coach = {
                    name: coachName,
                    email: coachEmail,
                };

                if (coachPhone.trim() != '') {
                    update.coach.phone = coachPhone;
                }

                if (this.state.hasCoach) {
                    update.coach.updated = new Date();
                } else {
                    update.coach.created = new Date();
                }

                this.db.ref('users/' + user.uid).update(update).then(() => {
                    this.setState({spinner: false}, () => {
                        this.props.navigation.navigate('Home');
                    });
                });
            }).catch((error) => {
                this.setState({spinner: false});
                Snackbar.show({
                    title: error.message,
                    duration: Snackbar.LENGTH_LONG,
                })
            });
        }
    }

    render() {
        const {goBack} = this.props.navigation;
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView contentContainerStyle={styles.container} enableOnAndroid={true}
                                         resetScrollToCoords={{ x: 0, y: 0 }}
                                         scrollEnabled={true}>
                    <Spinner
                        visible={this.state.spinner}
                        textContent={'Please wait...'}
                        overlayColor='rgba(0, 0, 0, 0.5)'
                        textStyle={{color: 'white'}}
                    />
                    <View style={styles.logoContainer}>
                        <Image source={require('../../assets/images/logo.png')} style={styles.logo}/>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._firstNameInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name='user' style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder='First Name' returnKeyType='next'
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
                               leftIcon={<Icon name='user' style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder='Last Name' returnKeyType='next'
                               onSubmitEditing={() => { this._phoneInput.focus(); }}
                               blurOnSubmit={false}
                               onChangeText={(lastName) => { this.setState({lastName}); }}
                               value={this.state.lastName}
                               errorMessage={this.state.errorMessage2} errorStyle={{paddingLeft: 20}} />
                        <Text style={styles.required}>*</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <Input ref={(input) => { this._phoneInput = input; }}
                               inputContainerStyle={styles.inputStyle}
                               leftIcon={<Icon name='phone' style={styles.iconNormalStyle} />}
                               inputStyle={styles.inputInnerStyle}
                               placeholder='Phone' keyboardType='phone-pad' returnKeyType='next'
                               onChangeText={(phone) => { this.setState({phone}); }}
                               value={this.state.phone}
                               errorMessage={this.state.errorMessage3} errorStyle={{paddingLeft: 20}} />
                        <Text style={styles.required}>&nbsp;</Text>
                    </View>
                    <View style={styles.frameContainer}>
                        <View style={styles.checkBoxContainer}>
                            <CheckBox containerStyle={styles.checkBoxStyle} title='Change Password' checked={this.state.checkedChangePassword}
                                      onPress={this.onChangePasswordCheckBox}/>
                        </View>
                        <View style={styles.itemContainer}>
                            <Input ref={(input) => { this._passwordInput = input; }}
                                   inputContainerStyle={this.state.checkedChangePassword? styles.inputStyle : styles.disabledInputStyle}
                                   disabled={!this.state.checkedChangePassword}
                                   leftIcon={<Icon name='lock' style={this.state.checkedChangePassword? styles.iconNormalStyle : styles.disableIconNormalStyle} />}
                                   inputStyle={styles.inputInnerStyle} secureTextEntry={true}
                                   placeholder='Password' returnKeyType='next'
                                   onSubmitEditing={() => { this._confirmPasswordInput.focus(); }}
                                   blurOnSubmit={false}
                                   onChangeText={(password) => { this.setState({password}); }}
                                   value={this.state.password}
                                   errorMessage={this.state.errorMessage4} errorStyle={{paddingLeft: 20}} />
                            <Text style={[styles.required, this.state.checkedChangePassword? {opacity: 1.0} : {opacity: 0.0} ]}>*</Text>
                        </View>
                        <View style={styles.itemContainer}>
                            <Input ref={(input) => { this._confirmPasswordInput = input; }}
                                   inputContainerStyle={this.state.checkedChangePassword? styles.inputStyle : styles.disabledInputStyle}
                                   disabled={!this.state.checkedChangePassword}
                                   leftIcon={<Icon name='lock' style={this.state.checkedChangePassword? styles.iconNormalStyle : styles.disableIconNormalStyle} />}
                                   inputStyle={styles.inputInnerStyle} secureTextEntry={true}
                                   placeholder='Confirm Password'
                                   onChangeText={(confirmPassword) => { this.setState({confirmPassword}); }}
                                   value={this.state.confirmPassword}
                                   errorMessage={this.state.errorMessage5} errorStyle={{paddingLeft: 20}}/>
                            <Text style={[styles.required, this.state.checkedChangePassword? {opacity: 1.0} : {opacity: 0.0} ]}>*</Text>
                        </View>
                    </View>
                    <View style={[styles.frameContainer, { marginTop: 30 }]}>
                        <View style={styles.checkBoxContainer}>
                            <CheckBox containerStyle={styles.checkBoxStyle} title='Coach Information' checked={this.state.checkedCoachInfo}
                                      onPress={this.onCoachInfoCheckBox}/>
                        </View>
                        <View style={styles.itemContainer}>
                            <Input ref={(input) => { this._coachNameInput = input; }}
                                   inputContainerStyle={this.state.checkedCoachInfo? styles.inputStyle : styles.disabledInputStyle}
                                   disabled={!this.state.checkedCoachInfo}
                                   leftIcon={<Icon name='user' style={this.state.checkedCoachInfo? styles.iconNormalStyle : styles.disableIconNormalStyle} />}
                                   inputStyle={styles.inputInnerStyle}
                                   placeholder='Name' returnKeyType='next'
                                   onSubmitEditing={() => { this._coachEmailInput.focus(); }}
                                   blurOnSubmit={false}
                                   onChangeText={(coachName) => { this.setState({coachName});}}
                                   value={this.state.coachName}
                                   errorMessage={this.state.errorMessage6} errorStyle={{paddingLeft: 20}} />
                            <Text style={[styles.required, this.state.checkedCoachInfo? {opacity: 1.0} : {opacity: 0.0} ]}>*</Text>
                        </View>
                        <View style={styles.itemContainer}>
                            <Input ref={(input) => { this._coachEmailInput = input; }}
                                   inputContainerStyle={this.state.checkedCoachInfo? styles.inputStyle : styles.disabledInputStyle}
                                   disabled={!this.state.checkedCoachInfo}
                                   leftIcon={<Icon name='envelope' style={this.state.checkedCoachInfo? styles.iconNormalStyle : styles.disableIconNormalStyle} />}
                                   inputStyle={styles.inputInnerStyle}
                                   placeholder='Email' autoCapitalize='none' keyboardType='email-address' returnKeyType='next'
                                   onSubmitEditing={() => { this._coachPhoneInput.focus(); }}
                                   blurOnSubmit={false}
                                   onChangeText={(coachEmail) => { this.setState({coachEmail}); }}
                                   value={this.state.coachEmail}
                                   errorMessage={this.state.errorMessage7} errorStyle={{paddingLeft: 20}} />
                            <Text style={[styles.required, this.state.checkedCoachInfo? {opacity: 1.0} : {opacity: 0.0} ]}>*</Text>
                        </View>
                        <View style={styles.itemContainer}>
                            <Input ref={(input) => { this._coachPhoneInput = input; }}
                                   inputContainerStyle={this.state.checkedCoachInfo? styles.inputStyle : styles.disabledInputStyle}
                                   disabled={!this.state.checkedCoachInfo}
                                   leftIcon={<Icon name='phone' style={this.state.checkedCoachInfo? styles.iconNormalStyle : styles.disableIconNormalStyle} />}
                                   inputStyle={styles.inputInnerStyle}
                                   placeholder='Phone' keyboardType='phone-pad' returnKeyType='next'
                                   onChangeText={(coachPhone) => { this.setState({coachPhone}); }}
                                   value={this.state.coachPhone}
                                   errorMessage={this.state.errorMessage8} errorStyle={{paddingLeft: 20}} />
                            <Text style={styles.required}>&nbsp;</Text>
                        </View>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.backButton} title='Back' onPress={() => goBack()} />
                        <Button raised buttonStyle={styles.createButton} title='Save' onPress={this.onSave} />
                    </View>
                    <View style={styles.hintContainer}>
                        <Text style={styles.required}>*&nbsp;&nbsp;</Text>
                        <Text style={styles.requiredDesc}>Denotes a required field.</Text>
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flexGrow: 1,
    },
    navLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 10,
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
    itemContainer: {
        height: '70rem',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-around',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    required: {
        fontSize: '16rem',
        fontWeight: 'bold',
        color: 'red',
    },
    requiredDesc: {
        fontSize: '16rem',
    },
    inputStyle: {
        height: '40rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '20rem',
    },
    disabledInputStyle: {
        height: '40rem',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: '20rem',
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
        color: 'dodgerblue',
    },
    disableIconSmallStyle: {
        fontSize: '15rem',
        color: 'lightgray',
    },
    iconNormalStyle: {
        fontSize: '20rem',
        color: 'dodgerblue',
    },
    disableIconNormalStyle: {
        fontSize: '20rem',
        color: 'lightgray',
    },
    frameContainer: {
        borderWidth: 1,
        borderColor: 'silver',
        borderRadius: '20rem',
        marginLeft: '20rem',
        marginRight: '20rem',
    },
    checkBoxContainer: {
        height: '70rem',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    checkBoxStyle: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    sectionTextStyle: {
        margin: '25rem',
        fontSize: '20rem',
        fontWeight: 'bold',
    },
    buttonsContainer: {
        height: '80rem',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around'
    },
    backButton: {
        width: '130rem',
        height: '50rem',
        backgroundColor: 'lightseagreen',
        borderRadius: '25rem',
    },
    createButton: {
        width: '130rem',
        height: '50rem',
        backgroundColor: 'mediumvioletred',
        borderRadius: '25rem',
    },
    hintContainer: {
        height: '60rem',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
})