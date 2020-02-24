import React from 'react';
import { Text, View, Image, SafeAreaView, TouchableOpacity, Alert, Platform } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Button, Input } from 'react-native-elements';
import Spinner from 'react-native-loading-spinner-overlay';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import RNHTMLtoPDF from 'react-native-html-to-pdf';
import RNSmtpMailer from 'react-native-smtp-mailer';
import firebase from "react-native-firebase";

export default class SendReportScreen extends React.Component {
    static navigationOptions = {
        headerTitle: 'Send Report to Coach',
        headerBackTitle: '',
        headerRight: () => (<Image style={styles.navLogo} source={require('../../assets/images/logo.png')} />),
    };

    constructor(props) {
        super(props);

        this.state = {
            spinner: false,
            //////////////
            subject: '',
            comment: '',
            errorMessage1: '',
            errorMessage2: '',
        }

        this.server = "";
        this.username = "";
        this.password = "";
        this.port = "";
        this.sender_email = "";

        this._subjectInput = null;
        this._commentInput = null;

        this.db = firebase.database();
    }

    componentDidMount() {
        const { email, subject } = this.props.navigation.state.params;
        this.setState({ subject });

        this.db.ref('settings/smtp').on('value', (snapshot) => {
            if (snapshot.val()) {
                const { server, username, password, port, sender_email } = snapshot.val();
                this.server = server;
                this.username = username;
                this.password = password;
                this.port = port + '';
                //this.sender_email = sender_email;
            }
        });
    }

    onSubmit = async () => {
        const { subject, comment } = this.state;

        // Start validating...
        let isValidated = true;
        if (subject.trim() == '') {
            isValidated = false;
            this.setState({ errorMessage1: 'This field is required!' });
        } else {
            this.setState({ errorMessage1: '' });
        }

        /*
        if (comment.trim() == '') {
            isValidated = false;
            this.setState({errorMessage2: 'This field is required!'});
        } else {
            this.setState({errorMessage2: ''});
        }
        */

        if (!isValidated) return;
        // End validating...

        const { email, coachEmail, tableHead, tableData } = this.props.navigation.state.params;

        this.setState({ spinner: true });

        let HTML = "<h3>" + subject + "</h3><br/>";
        HTML += "<table cellspacing=\'0\' style=\'border: 1px solid lightgrey;\'>";
        HTML += "<thead><tr>";
        tableHead.forEach((head) => {
            HTML += "<th style=\'border: 1px solid lightgrey;\'>" + head + "</th>";
        });
        HTML += "</tr></thead>";

        HTML += "<tbody>";
        tableData.forEach((row) => {
            HTML += "<tr>";
            row.forEach((cell) => {
                HTML += "<td style=\'border: 1px solid lightgrey;\'>" + cell + "</td>";
            });
            HTML += "</tr>";
        });
        HTML += "</tbody>";
        HTML += "</table>";

        let options = {
            html: HTML,
        };

        let file = await RNHTMLtoPDF.convert(options);

        let from = Platform.OS === 'ios' ? "\"Received Report from MedSpa\" <" + email + ">" : email;
        RNSmtpMailer.sendMail({
            mailhost: this.server,
            port: this.port,
            ssl: true,
            username: this.username,
            password: this.password,
            from: from,
            recipients: coachEmail,
            subject: subject,
            htmlBody: "<h3>From : " + email + "</h3>" + (comment.trim() == '' ? "" : "<p>Comment : " + comment + "</p>"),
            attachmentPaths: [file.filePath],
            attachmentNames: ["report.pdf"],
            attachmentTypes: ["pdf"],
        })
            .then((success) => {
                console.log(success);

                Alert.alert(
                    'MedSpa',
                    'The report file was sent to coach successfully.', [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({ spinner: false }, () => {
                                this.props.navigation.goBack();
                            });
                        }
                    }], { cancelable: false }
                );
            })
            .catch((error) => {
                console.log(error);

                Alert.alert(
                    'MedSpa',
                    'Failed to send report file to coach.', [{
                        text: 'OK',
                        onPress: () => {
                            this.setState({ spinner: false });
                        }
                    }], { cancelable: false }
                );
            });
    }

    render() {
        const { goBack } = this.props.navigation;
        return (<SafeAreaView style={{ flex: 1, }}>
                    <KeyboardAwareScrollView contentContainerStyle={styles.container}
                        enableOnAndroid={true}
                        resetScrollToCoords={{ x: 0, y: 0 }}
                        scrollEnabled={true}>
                        <Spinner visible={this.state.spinner}
                            textContent={'Sending to Coach...'}
                            overlayColor='rgba(0, 0, 0, 0.5)'
                            textStyle={{ color: 'white' }}
                        />
                        <View style={{ marginTop: 10 }}>
                            <View style={styles.itemContainer} >
                                <Text style={{ paddingLeft: 20 }}> Subject </Text> 
                                <Input ref={(input) => { this._subjectInput = input; }}
                                    inputContainerStyle={styles.inputStyle}
                                    inputStyle={styles.inputInnerStyle}
                                    placeholder=''
                                    returnKeyType='next'
                                    onSubmitEditing={() => { this._commentInput.focus(); }}
                                    blurOnSubmit={false}
                                    onChangeText={(subject) => { this.setState({ subject }); }}
                                    value={this.state.subject}
                                    errorMessage={this.state.errorMessage1}
                                    errorStyle={{ paddingLeft: 20 }}
                                /> 
                            </View>
                            <View style={styles.itemContainer} >
                                <Text style={{ paddingLeft: 20 }}> Comment </Text> 
                                <Input ref={(input) => { this._commentInput = input; }}
                                    inputContainerStyle={styles.multilineInputStyle}
                                    inputStyle={styles.multilineInnerStyle}
                                    multiline={true}
                                    numberOfLines={6}
                                    placeholder=''
                                    onChangeText={(comment) => { this.setState({ comment }); }}
                                    value={this.state.comment}
                                    errorMessage={this.state.errorMessage2}
                                    errorStyle={{ paddingLeft: 20 }}
                                /> </View>
                            </View> 
                            <View style={styles.buttonsContainer}>
                                <Button raised buttonStyle={styles.cancelButton}
                                    title='Cancel'
                                    onPress={() => goBack()}
                                /> 
                                <Button raised buttonStyle={styles.submitButton}
                                    title='Send'
                                    onPress={this.onSubmit}
                                /> 
                            </View>
                            </KeyboardAwareScrollView>
                        </SafeAreaView >
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
    photoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: "30%",
        marginTop: '30rem',
        marginLeft: '30rem',
        marginRight: '30rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '10rem',
    },
    photo: {
        aspectRatio: 10 / 8,
        height: "100%",
    },
    itemContainer: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        marginTop: '15rem',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    inputStyle: {
        height: '40rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '10rem',
        marginTop: '5rem',
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
        marginTop: '5rem',
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
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: '20rem',
    },
    submitButton: {
        width: '130rem',
        height: '50rem',
        backgroundColor: 'mediumvioletred',
        borderRadius: '25rem',
    },
    cancelButton: {
        width: '130rem',
        height: '50rem',
        backgroundColor: 'lightseagreen',
        borderRadius: '25rem',
    },
})