import React from 'react';
import {SafeAreaView, ScrollView, Text, View, Image, Dimensions, Alert} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import {Button, CheckBox, Icon} from 'react-native-elements';

import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Spinner from 'react-native-loading-spinner-overlay';
import DatePicker from 'react-native-datepicker';
import {Cell, Row, Table, TableWrapper} from 'react-native-table-component';
import firebase from 'react-native-firebase';
import {getDateString} from "../../utils/Utils";

export default class ReportScreen extends React.Component {
    static navigationOptions = {
        headerTitle: 'Reports',
        headerBackTitle: '',
        headerRight: () => (
            <Image style={styles.navLogo}
                   source={require('../../assets/images/logo.png')} />
        ),
    };

    constructor(props) {
        super(props);

        this.width = Dimensions.get('window').width - 30;

        this.state = {
            spinner: false,
            ///////////////
            fromDate: getDateString(),
            toDate: getDateString(),
            errorMessage1: '',
            errorMessage2: '',
            checkedFood: false,
            checkedWater: false,
            checkedWeight: false,
            checkedInch: false,
            ///////////////
            tableHead: [],
            widthArr: [],
            tableData: [],
        };

        this.email = '';
        this.subject = '';
        this.coach = null;

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    componentDidMount() {
        this.onRefreshTable();

        const user = this.auth.currentUser;
        if (user) {
            this.db.ref('users/' + user.uid).once('value', (snapshot) => {
                if (snapshot.val()) {
                    const {email, firstName, lastName, coach} = snapshot.val();
                    this.email = email;
                    this.subject = "Report for " + firstName + " " + lastName;
                    this.coach = coach;
                }
            });
        }
    }

    onSubmit = () => {
        this.setState({tableData : []});

        let {fromDate, toDate, checkedFood, checkedWater, checkedWeight, checkedInch} = this.state;

        if (checkedFood || checkedWater || checkedWeight || checkedInch) {
            if (fromDate == '') {
                fromDate = getDateString();
                this.setState({fromDate});
            }
            if (toDate == '') {
                toDate = getDateString();
                this.setState({toDate});
            }

            for (let date = fromDate; ; date = this.nextDate(date, 1)) {

                this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + date).on('value', (snapshot) => {
                    let food = "";
                    let water_total = 0;
                    let weight_cnt = 0, weight_total = 0;
                    let inch_cnt = 0, inch_total = 0;

                    snapshot.forEach((data) => {
                        if (data.val()) {
                            Object.values(data.val()).forEach((entity) => {
                                if (data.key == 'food' && checkedFood) {
                                    const {value} = entity;
                                    food += ", " + value;
                                } else if (data.key == 'water' && checkedWater) {
                                    const {value} = entity;
                                    water_total += value;
                                } else if (data.key == 'weight-inches') {
                                    if (checkedWeight) {
                                        const {weight} = entity;
                                        weight_total += weight;
                                        weight_cnt++;
                                    }
                                    if (checkedInch) {
                                        const {inches} = entity;
                                        inch_total += inches;
                                        inch_cnt++;
                                    }
                                }
                            });
                        }
                    });

                    if (food != "" || water_total != 0 || weight_total != 0 || inch_total != 0) {
                        let tableRow = [];
                        tableRow.push(date);

                        if (checkedFood) {
                            tableRow.push(food.substring(2));
                        }

                        if (checkedWater) {
                            tableRow.push(water_total);
                        }

                        if (checkedWeight) {
                            tableRow.push(weight_cnt == 0 ? 0 : weight_total/weight_cnt);
                        }

                        if (checkedInch) {
                            tableRow.push(inch_cnt == 0 ? 0 : inch_total/inch_cnt);
                        }

                        let {tableData} = this.state;
                        tableData.push(tableRow);
                        this.setState({tableData});
                    }
                });

                if (date == toDate) {
                    break;
                }
            }
        } else {
            Alert.alert(
                'MedSpa',
                'You chose no fields. Please choose some fields.',
                [{
                    text: 'OK',
                }],
                {cancelable: false}
            );
        }
    }

    nextDate = (date: string, delta : number) => {
        const curDate = new Date(date.replace(/-/g, '/'));
        const newDate = new Date();
        newDate.setTime(curDate.getTime() + (24 * 60 * 60 * 1000) * delta);

        return getDateString(newDate);
    }

    onRefreshTable = () => {
        const {checkedFood, checkedWater, checkedWeight, checkedInch} = this.state;

        if (checkedFood || checkedWater || checkedWeight || checkedInch) {
            let tableHead = [];
            tableHead.push('Date');

            if (checkedFood) {
                tableHead.push('Food');
            }

            if (checkedWater) {
                tableHead.push('Water (total)');
            }

            if (checkedWeight) {
                tableHead.push('Weight (average)');
            }

            if (checkedInch) {
                tableHead.push('Inch (average)');
            }

            const w = this.width / tableHead.length;
            let widthArr = [];
            for (let i = 0; i < tableHead.length; i++) {
                widthArr.push(w);
            }
            widthArr[tableHead.length - 1] = w - 1;

            this.setState({tableHead});
            this.setState({widthArr});

        } else {
            this.setState({tableHead: ['']});
            this.setState({widthArr: [this.width - 1]});
        }

        this.setState({tableData : []});
    }

    onSendToCoach = () => {
        if (this.state.tableData.length > 0) {
            if (this.coach && this.coach.email != '') {
                let {fromDate, toDate} = this.state;
                let params = {
                    email: this.email,
                    subject: this.subject + " " + fromDate + " ~ " +  toDate,
                    coachEmail: this.coach.email,

                    tableHead: this.state.tableHead,
                    tableData: this.state.tableData,
                };

                this.props.navigation.navigate("SendReport", params);
            } else {
                Alert.alert(
                    'MedSpa',
                    'You haven\'t coach information. Please enter it on Profile page.',
                    [{
                        text: 'OK',
                        onPress: () => {
                            this.props.navigation.navigate('Profile');
                        }
                    }],
                    {cancelable: false}
                );
            }
        }
    }

    render() {
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

                    <View style={styles.dateContainer}>
                        <View style={styles.itemContainer}>
                            <Text style={styles.labelStyle}>From Date</Text>
                            <DatePicker style={styles.dateTimeStyle} showIcon={false}
                                        mode="date" placeholder="Select Date" format="MM-DD-YYYY"
                                        date={this.state.fromDate}
                                        confirmBtnText="OK" cancelBtnText="Cancel"
                                        customStyles={{
                                            dateInput: {borderWidth: 0,},
                                            dateText: styles.dateTimeInputStyle,
                                            placeholderText: styles.dateTimeInputStyle,
                                            btnTextConfirm: {color: 'mediumvioletred'},
                                            btnTextCancel: {color: 'lightseagreen'},
                                        }}
                                        onDateChange={(date) => {this.setState({fromDate: date})}} />
                            <Text style={styles.errorStyle}>{this.state.errorMessage1}</Text>
                        </View>

                        <View style={styles.itemContainer}>
                            <Text style={styles.labelStyle}>To Date</Text>
                            <DatePicker style={styles.dateTimeStyle} showIcon={false}
                                        mode="date" placeholder="Select Date" format="MM-DD-YYYY"
                                        date={this.state.toDate}
                                        confirmBtnText="OK" cancelBtnText="Cancel"
                                        customStyles={{
                                            dateInput: {borderWidth: 0,},
                                            dateText: styles.dateTimeInputStyle,
                                            placeholderText: styles.dateTimeInputStyle,
                                            btnTextConfirm: {color: 'mediumvioletred'},
                                            btnTextCancel: {color: 'lightseagreen'},
                                        }}
                                        onDateChange={(date) => {this.setState({toDate: date})}} />
                            <Text style={styles.errorStyle}>{this.state.errorMessage2}</Text>
                        </View>
                    </View>

                    <View style={styles.checkBoxContainer}>
                        <CheckBox containerStyle={styles.checkBoxStyle} title='Food' checked={this.state.checkedFood}
                                  onPress={()=> this.setState({checkedFood: !this.state.checkedFood}, () => this.onRefreshTable())}/>
                        <CheckBox containerStyle={styles.checkBoxStyle} title='Water' checked={this.state.checkedWater}
                                  onPress={()=> this.setState({checkedWater: !this.state.checkedWater}, () => this.onRefreshTable())}/>
                        <CheckBox containerStyle={styles.checkBoxStyle} title='Weight' checked={this.state.checkedWeight}
                                  onPress={()=> this.setState({checkedWeight: !this.state.checkedWeight}, () => this.onRefreshTable())}/>
                        <CheckBox containerStyle={styles.checkBoxStyle} title='Inch' checked={this.state.checkedInch}
                                  onPress={()=> this.setState({checkedInch: !this.state.checkedInch}, () => this.onRefreshTable())}/>
                    </View>

                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.backButton} title='Submit' onPress={this.onSubmit} />
                    </View>

                    <View style={styles.tableContainer}>
                        <ScrollView>
                            <ScrollView style={styles.tableWrapper} horizontal={true}>
                                <View>
                                    <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                                        <Row data={this.state.tableHead} widthArr={this.state.widthArr} style={styles.tableHeader} textStyle={[styles.tableText, {color: 'white', fontWeight: '600'}]}/>
                                    </Table>
                                    { this.state.tableData.length == 0 ?
                                        <View style={styles.noDataWaringContainer}>
                                            <Icon name='not-interested' iconStyle={styles.selectDateArrowStyle} color='tomato' />
                                            <Text style={styles.noDataWaringStyle}>There is no data.</Text>
                                        </View>
                                        :
                                        <Table borderStyle={{borderWidth: 1, borderColor: '#C1C0B9'}}>
                                            {
                                                this.state.tableData.map((rowData, index) => (
                                                    <TableWrapper key={index} style={[styles.tableRow, index%2 && {backgroundColor: '#F7F6E7'}]}>
                                                        {
                                                            rowData.map((cellData, cellIndex) => (
                                                                <Cell key={cellIndex} data={cellData} textStyle={styles.tableText} width={this.state.widthArr[cellIndex]} />
                                                            ))
                                                        }
                                                    </TableWrapper>
                                                ))
                                            }
                                        </Table>
                                    }
                                </View>
                            </ScrollView>
                        </ScrollView>
                    </View>

                    <View style={styles.buttonsContainer}>
                        <Button raised buttonStyle={styles.createButton} title='Send to Coach' onPress={this.onSendToCoach} />
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
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20rem',
    },
    itemContainer: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    labelStyle: {
        fontSize: '16rem',
        fontWeight: '500',
        paddingLeft: '20rem',
        paddingBottom: '5rem',
        color: 'dodgerblue',
    },
    dateTimeStyle: {
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
    checkBoxContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingLeft: '20rem',
        paddingRight: '20rem',
    },
    checkBoxStyle: {
        padding: 0,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
    },
    tableContainer: {
        padding: 15
    },
    tableHeader: {
        height: '50rem',
        backgroundColor: 'dodgerblue'
    },
    tableWrapper: {
        marginTop: -1,
        flex: 1,
        flexDirection: 'row'
    },
    tableRow: {
        height: '40rem',
        flexDirection: 'row',
        backgroundColor: 'ghostwhite'
    },
    tableText: {
        textAlign: 'center'
    },
    actionCell: {
        flexDirection: 'row',
        alignItems:'center',
        justifyContent:'space-around',
    },
    noDataWaringContainer: {
        height: '150rem',
        borderWidth: 1,
        borderColor: '#C1C0B9',
        alignItems:'center',
        justifyContent:'center',
    },
    noDataWaringStyle: {
        fontSize: '16rem',
        marginTop: '10rem',
        color: 'tomato',
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
        width: '220rem',
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