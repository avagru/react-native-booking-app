import React from 'react';
import { SafeAreaView, Text, View, Image} from 'react-native';
import {Button, Input} from 'react-native-elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import EStyleSheet from 'react-native-extended-stylesheet';
import DatePicker from 'react-native-datepicker';
import { Dropdown } from 'react-native-material-dropdown';

import firebase from "react-native-firebase";
import Snackbar from "react-native-snackbar";
import {getTimeString} from "../../utils/Utils";

export default class AddEditWeightInchScreen extends React.Component {
    static navigationOptions = (navBar) => {
        const {navigation} = navBar;
        const headerTitle = navigation.getParam('option', 'Add') + " Weight/Inch";
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
            spinner: false,
            ///////////////
            weightOptions: [],
            weightUnit: '',
            inchOptions: [],
            inchUnit: '',

            weight: '',
            inches: '',
            comment: '',
            date: '',
            time: getTimeString(),

            errorMessage1: '',
            errorMessage2: '',
            errorMessage3: '',
            errorMessage4: '',
            errorMessage5: '',
        };

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    componentDidMount() {
        const params = this.props.navigation.state.params;
        this.props.navigation.setParams({ headerTitle: params.option + ' Weight/Inch' });

        this.db.ref('amounts/weight').once('value', (snapshot) => {
            if (snapshot.val()) {
                const {options, minValue, noOfSteps, stepSize, unit} = snapshot.val();
                let weightOptions = [];

                if (options) {
                    options.forEach((value) => {
                        if (value) {
                            weightOptions.push({value});
                        }
                    });
                } else {
                    for (let w = 0; w <= noOfSteps; w++) {
                        let value = minValue + w * stepSize;
                        weightOptions.push({value});
                    }
                }

                console.log(weightOptions);

                this.setState({weightOptions});
                this.setState({weightUnit: unit});
            }
        });

        this.db.ref('amounts/inch').once('value', (snapshot) => {
            if (snapshot.val()) {
                const {options, minValue, noOfSteps, stepSize, unit} = snapshot.val();
                let inchOptions = [];

                if (options) {
                    options.forEach((value) => {
                        if (value) {
                            inchOptions.push({value});
                        }
                    });
                } else {
                    for (let i = 0; i <= noOfSteps; i++) {
                        let value = minValue + i * stepSize;
                        inchOptions.push({value});
                    }
                }

                this.setState({inchOptions});
                this.setState({inchUnit: unit});
            }
        });

        if (params.option == 'Edit') {
            const itemKey = params.itemKey;
            this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + params.dateStamp + '/weight-inches/' + itemKey).once('value', (snapshot) => {
                if (snapshot.val()) {
                    const {weight, inches, comment, date, time} = snapshot.val();
                    this.setState({weight});
                    this.setState({inches});
                    this.setState({comment});
                    this.setState({date});
                    this.setState({time});
                }
            });
        }
    }

    onSave = () => {
        const {weight, inches, comment, date, time} = this.state;

        // Start validating...
        let isValidated = true;
        if (weight == '') {
            isValidated = false;
            this.setState({errorMessage1: 'This field is required!'});
        } else {
            this.setState({errorMessage1: ''});
        }
        if (inches == '') {
            isValidated = false;
            this.setState({errorMessage2: 'This field is required!'});
        } else {
            this.setState({errorMessage2: ''});
        }

        /*
        if (comment.trim() == '') {
            isValidated = false;
            this.setState({errorMessage3: 'This field is required!'});
        } else {
            this.setState({errorMessage3: ''});
        }
        if (date.trim() == '') {
            isValidated = false;
            this.setState({errorMessage4: 'This field is required!'});
        } else {
            this.setState({errorMessage4: ''});
        }
        */

        if (time.trim() == '') {
            isValidated = false;
            this.setState({errorMessage5: 'This field is required!'});
        } else {
            this.setState({errorMessage5: ''});
        }

        if (!isValidated) return;
        // End validating...

        this.setState({ spinner: true});
        const params = this.props.navigation.state.params;
        if (params.option == 'Add') {
            const newWI = {
                weight: weight,
                inches: inches,
                comment: comment,
                //date: date,
                time: time,
                created: new Date()
            };

            this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + params.dateStamp + '/weight-inches').push(newWI).then((data) => {
                console.log('ADD WEIGHT INCHES - SUCCESS' , data);
                this.setState({spinner: false}, ()=> {
                    this.props.navigation.navigate('Home');
                });
            }).catch((error) => {
                console.log('ADD WEIGHT INCHES - ERROR' , error);
                this.setState({spinner: false});
                Snackbar.show({
                    title: error.message,
                    duration: Snackbar.LENGTH_LONG,
                });
            });
        } else {
            const editWI = {
                weight: weight,
                inches: inches,
                comment: comment,
                //date: date,
                time: time,
                updated: new Date()
            };

            this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + params.dateStamp + '/weight-inches/' + params.itemKey).update(editWI).then((data) => {
                console.log('EDIT WEIGHT INCHES - SUCCESS' , data);
                this.setState({spinner: false}, ()=> {
                    this.props.navigation.navigate('Home');
                });
            }).catch((error) => {
                console.log('EDIT WEIGHT INCHES - ERROR' , error);
                this.setState({spinner: false});
                Snackbar.show({
                    title: error.message,
                    duration: Snackbar.LENGTH_LONG,
                });
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

                    <View style={[styles.itemContainer, styles.topRow, styles.normalHeight]}>
                        <Text style={styles.labelStyle}>Weight</Text>
                        <View style={styles.dropdownContainer}>
                        <Dropdown inputContainerStyle={styles.dropdownStyle} inputStyle={styles.dropdownTextStyle}
                                  pickerStyle={styles.dropdownItemContainer}
                                  selectedItemColor='mediumvioletred'
                                  dropdownOffset={{top: 0, bottom: 0}} rippleInsets={{top: 0, bottom: 0}}
                                  onChangeText={(value, index, data) => { this.setState({weight: value}); }}
                                  data={this.state.weightOptions} value={this.state.weight} />
                            <Text style={[styles.labelStyle, {paddingLeft: 5}]}>{this.state.weightUnit}</Text>
                        </View>
                        <Text style={[styles.errorStyle, {marginTop: -3}]}>{this.state.errorMessage1}</Text>
                    </View>
                    <View style={styles.itemContainer}>
                        <Text style={styles.labelStyle}>Inch</Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown inputContainerStyle={styles.dropdownStyle} inputStyle={styles.dropdownTextStyle}
                                      pickerStyle={styles.dropdownItemContainer}
                                      selectedItemColor='mediumvioletred'
                                      dropdownOffset={{top: 0, bottom: 0}} rippleInsets={{top: 0, bottom: 0}}
                                      onChangeText={(value, index, data) => { this.setState({inches: value}); }}
                                      data={this.state.inchOptions} value={this.state.inches} />
                            <Text style={[styles.labelStyle, {paddingLeft: 5}]}>{this.state.inchUnit}</Text>
                        </View>
                        <Text style={[styles.errorStyle, {marginTop: -3}]}>{this.state.errorMessage2}</Text>
                    </View>
                    <View style={[styles.itemContainer, styles.bigHeight]}>
                        <Text style={styles.labelStyle}>Comments</Text>
                        <Input inputContainerStyle={styles.commentInputStyle} inputStyle={styles.commentInnerStyle}
                               onChangeText={(comment) => { this.setState({comment}); }}
                               value={this.state.comment} multiline={true}
                               errorMessage={this.state.errorMessage3} errorStyle={{paddingLeft: 20}} />
                    </View>
                    {/*
                    <View style={[styles.itemContainer, styles.normalHeight]}>
                        <Text style={styles.labelStyle}>Date</Text>
                        <DatePicker style={styles.dateTimeStyle} showIcon={false}
                                    mode="date" placeholder="Select Date" format="MM-DD-YYYY"
                                    date={this.state.date}
                                    confirmBtnText="OK" cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: {borderWidth: 0,},
                                        dateText: styles.dateTimeInputStyle,
                                        placeholderText: styles.dateTimeInputStyle,
                                        btnTextConfirm: {color: 'mediumvioletred'},
                                        btnTextCancel: {color: 'lightseagreen'},
                                    }}
                                    onDateChange={(date) => {this.setState({date: date})}} />
                        <Text style={styles.errorStyle}>{this.state.errorMessage4}</Text>
                    </View>
                    */}
                    <View style={[styles.itemContainer, styles.normalHeight]}>
                        <Text style={styles.labelStyle}>Time</Text>
                        <DatePicker style={styles.dateTimeStyle} showIcon={false}
                                    mode="time" placeholder="Select Time" format="hh:mm A"
                                    date={this.state.time}
                                    confirmBtnText="OK" cancelBtnText="Cancel"
                                    customStyles={{
                                        dateInput: {borderWidth: 0,},
                                        dateText: styles.dateTimeInputStyle,
                                        placeholderText: styles.dateTimeInputStyle,
                                        btnTextConfirm: {color: 'mediumvioletred'},
                                        btnTextCancel: {color: 'lightseagreen'},
                                    }}
                                    onDateChange={(time) => {this.setState({time: time})}} />
                        <Text style={styles.errorStyle}>{this.state.errorMessage5}</Text>
                    </View>

                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.backButton} title='Cancel' onPress={() => goBack()} />
                        <Button raised buttonStyle={styles.createButton} title='OK' onPress={this.onSave} />
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
    topRow: {
        marginTop: '30rem',
    },
    itemContainer: {
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    normalHeight: {
        height: '90rem',
    },
    bigHeight: {
        height: '150rem',
    },
    labelStyle: {
        fontSize: '18rem',
        fontWeight: '500',
        paddingLeft: '20rem',
        paddingBottom: '5rem',
        color: 'dodgerblue',
    },
    dropdownContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dropdownStyle: {
        width: '220rem',
        height: '40rem',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderBottomColor: 'dodgerblue',
        borderBottomWidth: 1,
        borderRadius: '10rem',
        marginLeft: '10rem',
        marginRight: '10rem',
        paddingLeft: '10rem',
        paddingRight: '10rem',
    },
    dropdownItemContainer: {
        width: '320rem',
        marginLeft: '20rem',
        marginRight: '20rem',
    },
    dropdownTextStyle: {
        fontSize: '16rem',
    },
    normalInputStyle: {
        height: '40rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '10rem',
    },
    inputInnerStyle: {
        fontSize: '16rem',
        paddingLeft: '15rem',
        paddingRight: '15rem',
    },
    commentInputStyle: {
        height: '100rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '10rem',
    },
    commentInnerStyle: {
        height: '100rem',
        textAlignVertical: 'top',
        fontSize: '16rem',
        paddingLeft: '15rem',
        paddingRight: '15rem',
    },
    dateTimeStyle: {
        width: '320rem',
        height: '40rem',
        borderWidth: 1,
        borderColor: 'dodgerblue',
        borderRadius: '10rem',
        marginLeft: '10rem',
        marginRight: '10rem',
    },
    dateTimeInputStyle: {
        fontSize: '16rem',
    },
    errorStyle: {
        fontSize: 12,
        margin: 5,
        marginLeft: 35,
        color: '#ff190c',
    },
    buttonsContainer: {
        height: '80rem',
        flexDirection: 'row',
        alignItems: 'flex-start',
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