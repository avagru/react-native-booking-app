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

export default class AddEditWaterScreen extends React.Component {
    static navigationOptions = (navBar) => {
        const {navigation} = navBar;
        const headerTitle = navigation.getParam('option', 'Add') + " Water";
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
            sizeOptions: [],
            unit: '',

            value: '',
            comment: '',
            date: '',
            time: getTimeString(),

            errorMessage1: '',
            errorMessage2: '',
            errorMessage3: '',
            errorMessage4: '',
        };

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    componentDidMount() {
        const params = this.props.navigation.state.params;
        this.props.navigation.setParams({ headerTitle: params.option + ' Water' });

        this.db.ref('amounts/water').once('value', (snapshot) => {
            if (snapshot.val()) {
                const {options, minValue, noOfSteps, stepSize, unit} = snapshot.val();

                let sizeOptions = [];
                if (options) {
                    options.forEach((value) => {
                        if (value) {
                            sizeOptions.push({value});
                        }
                    });
                } else {
                    for (let w = 0; w <= noOfSteps; w++) {
                        let value = minValue + w * stepSize;
                        sizeOptions.push({value});
                    }
                }
                this.setState({sizeOptions});
                this.setState({unit});
            }
        });

        if (params.option == 'Edit') {
            const itemKey = params.itemKey;
            this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + params.dateStamp + '/water/' + itemKey).once('value', (snapshot) => {
                if (snapshot.val()) {
                    const {value, comment, date, time} = snapshot.val();
                    this.setState({value});
                    this.setState({comment});
                    this.setState({date});
                    this.setState({time});
                }
            });
        }
    }

    onSave = () => {
        const {value, comment, date, time} = this.state;

        console.log(this.state);
        console.log(value);

        // Start validating...
        let isValidated = true;
        if (value == '') {
            isValidated = false;
            this.setState({errorMessage1: 'This field is required!'});
        } else {
            this.setState({errorMessage1: ''});
        }
        /*
        if (comment.trim() == '') {
            isValidated = false;
            this.setState({errorMessage2: 'This field is required!'});
        } else {
            this.setState({errorMessage2: ''});
        }
        if (date.trim() == '') {
            isValidated = false;
            this.setState({errorMessage3: 'This field is required!'});
        } else {
            this.setState({errorMessage3: ''});
        }
        */
        if (time.trim() == '') {
            isValidated = false;
            this.setState({errorMessage4: 'This field is required!'});
        } else {
            this.setState({errorMessage4: ''});
        }

        if (!isValidated) return;
        // End validating...

        this.setState({ spinner: true});
        const params = this.props.navigation.state.params;
        if (params.option == 'Add') {
            const newWater = {
                value: value,
                comment: comment,
                //date: date,
                time: time,
                created: new Date()
            };

            this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + params.dateStamp + '/water').push(newWater).then((data) => {
                console.log('ADD WATER - SUCCESS' , data);
                this.setState({spinner: false}, ()=> {
                    this.props.navigation.navigate('Home');
                });
            }).catch((error) => {
                console.log('ADD WATER - ERROR' , error);
                this.setState({spinner: false});
                Snackbar.show({
                    title: error.message,
                    duration: Snackbar.LENGTH_LONG,
                });
            });
        } else {
            const editWater = {
                value: value,
                comment: comment,
                //date: date,
                time: time,
                updated: new Date()
            };

            this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + params.dateStamp + '/water/' + params.itemKey).update(editWater).then((data) => {
                console.log('EDIT WATER - SUCCESS' , data);
                this.setState({spinner: false}, ()=> {
                    this.props.navigation.navigate('Home');
                });
            }).catch((error) => {
                console.log('EDIT WATER - ERROR' , error);
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
                        <Text style={styles.labelStyle}>Size</Text>
                        <View style={styles.dropdownContainer}>
                        <Dropdown inputContainerStyle={styles.dropdownStyle} inputStyle={styles.dropdownTextStyle}
                                  pickerStyle={styles.dropdownItemContainer}
                                  selectedItemColor='mediumvioletred'
                                  dropdownOffset={{top: 0, bottom: 0}} rippleInsets={{top: 0, bottom: 0}}
                                  onChangeText={(value, index, data) => { this.setState({value}); }}
                                  data={this.state.sizeOptions} value={this.state.value} />
                            <Text style={[styles.labelStyle, {paddingLeft: 5}]}>{this.state.unit}</Text>
                        </View>
                        <Text style={[styles.errorStyle, {marginTop: -3}]}>{this.state.errorMessage1}</Text>
                    </View>
                    <View style={[styles.itemContainer, styles.bigHeight]}>
                        <Text style={styles.labelStyle}>Comments</Text>
                        <Input inputContainerStyle={styles.commentInputStyle} inputStyle={styles.commentInnerStyle}
                               onChangeText={(comment) => { this.setState({comment}); }}
                               value={this.state.comment} multiline={true}
                               errorMessage={this.state.errorMessage2} errorStyle={{paddingLeft: 20}} />
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
                        <Text style={styles.errorStyle}>{this.state.errorMessage3}</Text>
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
                        <Text style={styles.errorStyle}>{this.state.errorMessage4}</Text>
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