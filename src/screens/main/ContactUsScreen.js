import React from 'react';
import {Text, View, Image, SafeAreaView, Platform, Alert} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {Button, Input} from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Snackbar from 'react-native-snackbar';

import firebase from 'react-native-firebase';
import RNSmtpMailer from 'react-native-smtp-mailer';

export default class ContactUsScreen extends React.Component {
    static navigationOptions = {
        headerTitle: 'Contact Us',
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
            //////////////
            name: '',
            email: '',
            message: '',
            errorMessage1: '',
            errorMessage2: '',
            errorMessage3: '',
        }

        this.contactus_email = null;

        this._nameInput = null;
        this._emailInput = null;
        this._messageInput = null;

        this.server = "";
        this.username = "";
        this.password = "";
        this.port = "";

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    componentDidMount() {
        const user = this.auth.currentUser;
        if (user) {
            this.db.ref('users/' + user.uid).once('value', (snapshot) => {
                if (snapshot.val()) {
                    const {email, firstName, lastName} = snapshot.val();

                    this.setState({name: firstName + " " + lastName});
                    this.setState({email});
                }
            });
        }

        this.db.ref('settings').on('value', (snapshot) => {
            if (snapshot.val()) {
                const {contactus_email, smtp} = snapshot.val();

                this.contactus_email = contactus_email;

                const {server, username, password, port} = smtp;

                console.log(smtp);

                this.server = server;
                this.username = username;
                this.password = password;
                this.port = port + '';
            }
        });
    }

    onSubmit = () => {
        const {name, email, message} = this.state;

        // Start validating...
        let isValidated = true;
        if (name.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage1: 'This field is required!'} );
        } else {
            this.setState({ errorMessage1: ''} );
        }
        if (email.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage3: 'This field is required!'} );
        } else {
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
            if (emailRegex.test(email) === false) {
                isValidated = false;
                this.setState({ errorMessage2: 'Invalid email address'} );
            } else {
                this.setState({ errorMessage2: ''} );
            }
        }
        if (message.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage3: 'This field is required!'} );
        } else {
            this.setState({ errorMessage3: ''} );
        }

        if (!isValidated) return;
        // End validating...

        this.setState({ spinner: true});
        const newMessage = {
            user: this.auth.currentUser.uid,
            name: name,
            email: email,
            message: message,
            created: new Date()
        };

        this.db.ref('contactus').push(newMessage).then((data) => {
            console.log('ADD MESSAGE - SUCCESS' , data);

            if (this.contactus_email && this.contactus_email.trim() != '') {
                let from = Platform.OS === 'ios' ? "\"Received Message from MedSpa\" <" + email + ">" : email;
                RNSmtpMailer.sendMail({
                    mailhost: this.server,
                    port: this.port,
                    ssl: true,
                    username: this.username,
                    password: this.password,
                    from: from,
                    recipients: this.contactus_email,
                    subject: "Message by " + name,
                    htmlBody: "<p>" + message + "</p>",
                    attachmentPaths: [],
                    attachmentNames: [],
                    attachmentTypes: [],
                })
                    .then((success) => {
                        console.log(success);

                        Alert.alert(
                            'MedSpa',
                            'The message was sent successfully.',
                            [{
                                text: 'OK',
                                onPress: () => {
                                    this.setState({spinner: false}, ()=> {
                                        this.props.navigation.navigate('Home');
                                    });
                                }
                            }],
                            {cancelable: false}
                        );
                    })
                    .catch((error) => {
                        console.log(error);

                        Alert.alert(
                            'MedSpa',
                            'Failed to send message.',
                            [{
                                text: 'OK',
                                onPress: () => {
                                    this.setState({spinner: false});
                                }
                            }],
                            {cancelable: false}
                        );
                    });
            } else {
                this.setState({spinner: false}, ()=> {
                    this.props.navigation.navigate('Home');
                });
            }

        }).catch((error) => {
            console.log('ADD MESSAGE - ERROR' , error);
            this.setState({spinner: false});
            Snackbar.show({
                title: error.message,
                duration: Snackbar.LENGTH_LONG,
            });
        });
    }

    render() {
        const {goBack} = this.props.navigation;
        return (
            <SafeAreaView>
                <KeyboardAwareScrollView contentContainerStyle={styles.container} enableOnAndroid={true}
                                         resetScrollToCoords={{ x: 0, y: 0 }}
                                         scrollEnabled={true}>
                    <Spinner
                        visible={this.state.spinner}
                        textContent={'Please wait...'}
                        overlayColor='rgba(0, 0, 0, 0.5)'
                        textStyle={{color: 'white'}}
                    />

                    <View style={styles.boxContainer}>
                        <Text style={[styles.textStyle, {fontWeight: 'bold',}]}>Eves Body Organic Med Spa</Text>
                        <Text style={styles.textStyle}>10300 Southside Blvd Ste 101</Text>
                        <Text style={styles.textStyle}>Jacksonville, FL 32256</Text>
                        <Text style={styles.textStyle}>904-309-9937</Text>
                    </View>

                    <View style={styles.boxContainer}>
                        <Text style={styles.textStyle}>Corporate</Text>
                        <Text style={styles.textStyle}>50 N. Laura Street</Text>
                        <Text style={styles.textStyle}>Jacksonville FL 32202</Text>
                        <Text style={styles.textStyle}>Toll Free (877) 709-Eves</Text>
                        <Text style={styles.textStyle}>Fax 904-309-9956</Text>
                        <Text style={styles.textStyle}>Info@evesbody.org</Text>
                    </View>

                    <View style={{marginTop: 10}}>
                        <View style={[styles.itemContainer]}>
                            <Input ref={(input) => { this._nameInput = input; }}
                                   inputContainerStyle={styles.inputStyle}
                                   inputStyle={styles.inputInnerStyle}
                                   placeholder='Full Name' returnKeyType='next'
                                   onSubmitEditing={() => { this._emailInput.focus(); }}
                                   blurOnSubmit={false}
                                   onChangeText={(fullName) => { this.setState({name: fullName});}}
                                   value={this.state.name}
                                   errorMessage={this.state.errorMessage1} errorStyle={{paddingLeft: 20}} />
                        </View>
                        <View style={styles.itemContainer}>
                            <Input ref={(input) => { this._emailInput = input; }}
                                   inputContainerStyle={styles.inputStyle}
                                   inputStyle={styles.inputInnerStyle}
                                   placeholder='Email' autoCapitalize='none' keyboardType='email-address' returnKeyType='next'
                                   onSubmitEditing={() => { this._messageInput.focus(); }}
                                   blurOnSubmit={false}
                                   onChangeText={(email) => { this.setState({email}); }}
                                   value={this.state.email}
                                   errorMessage={this.state.errorMessage2} errorStyle={{paddingLeft: 20}} />
                        </View>
                        <View style={styles.itemContainer}>
                            <Input ref={(input) => { this._messageInput = input; }}
                                   inputContainerStyle={styles.multilineInputStyle}
                                   inputStyle={styles.multilineInnerStyle} multiline={true} numberOfLines={6}
                                   placeholder='Message'
                                   onChangeText={(message) => { this.setState({message}); }}
                                   value={this.state.message}
                                   errorMessage={this.state.errorMessage3} errorStyle={{paddingLeft: 20}} />
                        </View>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.submitButton} title='Submit' onPress={this.onSubmit} />
                    </View>
                </KeyboardAwareScrollView>
            </SafeAreaView>
        )
    }
}

const styles = EStyleSheet.create({
    navLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 10,
    },
    container: {
        flexGrow: 1
    },
    boxContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: '30rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    textStyle: {
        fontSize: '18rem',
        color: '#333',
        textAlign: 'center',
        lineHeight: '30rem',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    inputStyle: {
        height: '40rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '10rem',
        marginTop: '15rem',
    },
    inputInnerStyle: {
        fontSize: '16rem',
        paddingLeft: '15rem',
        paddingRight: '25rem',
    },
    multilineInputStyle: {
        height: '120rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '10rem',
        marginTop: '15rem',
    },
    multilineInnerStyle: {
        height: '120rem',
        textAlignVertical: 'top',
        fontSize: '16rem',
        paddingLeft: '15rem',
        paddingRight: '25rem',
    },
    buttonsContainer: {
        height: '80rem',
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        marginBottom: '20rem',
    },
    submitButton: {
        width: '130rem',
        height: '50rem',
        backgroundColor: 'mediumvioletred',
        borderRadius: '25rem',
    },
})