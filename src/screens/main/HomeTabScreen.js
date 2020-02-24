import React from 'react';
import {SafeAreaView, ScrollView, Text, TouchableOpacity, View, Image, Dimensions, Alert} from 'react-native';
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Icon } from 'react-native-elements';
import Snackbar from "react-native-snackbar";
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { Table, TableWrapper, Row, Cell } from 'react-native-table-component';

import Moment from 'moment';
import firebase from "react-native-firebase";
import {getDateString} from "../../utils/Utils";



export default class HomeTabScreen extends React.Component {
    static contextTypes = {
        drawer: PropTypes.object.isRequired,
        onTakePhoto: PropTypes.func.isRequired,
        onAddNew: PropTypes.func.isRequired,
        onEdit: PropTypes.func.isRequired,
    };

    // TabItem Enum
    static TabItem = {
        Food: 0,
        Water: 1,
        Weight_Inch: 2,
    };

    constructor(props) {
        super(props);

        Moment.locale('en');

        const width = Dimensions.get('window').width - 30;

        this._foodTableHead = ['Name', 'Description', 'Time', 'Action'];
        this._foodWidthArr = [width/4, width/4, width/4, width/4 - 1];
        this._foodTableData = [];
        this._foodTableDataKey = [];

        this._waterTableHead = ['Size', 'Comment', 'Time', 'Action'];
        this._waterWidthArr = [width/4, width/4, width/4, width/4 - 1];
        this._waterTableData = [];
        this._waterTableDataKey = [];

        this._weightTableHead = ['Weight', 'Inch', 'Comment', 'Time', 'Action'];
        this._weightWidthArr = [width/5, width/5, width/5, width/5, width/5 - 1];
        this._weightTableData = [];
        this._weightTableDataKey = [];

        this.state = {
            currentDate: '',
            isToday: false,
            ///////////////
            selectedIndex: HomeTabScreen.TabItem.Food,
            ///////////////
            tableHead: this._foodTableHead,
            widthArr: this._foodWidthArr,
            tableData: [],
            tableDataKey: [],
        }

        this.auth = firebase.auth();
        this.db = firebase.database();
    }

    componentDidMount() {
        const currentDate = getDateString();
        console.log(currentDate);

        this.setState({currentDate}, () => this.changeDate(0));
    }

    changeDate = (delta) => {
        const curDate = new Date(this.state.currentDate.replace(/-/g, '/'));
        const newDate = new Date();
        newDate.setTime(curDate.getTime() + (24 * 60 * 60 * 1000) * delta);

        const isToday = newDate.toDateString() == new Date().toDateString();
        const currentDate = getDateString(newDate);

        this.setState({isToday});
        this.setState({currentDate}, () => this.queryFirebaseDB());
    }

    queryFirebaseDB = () => {
        this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + this.state.currentDate + '/food').on('value', (snapshot) => {
            this._foodTableData = [];
            this._foodTableDataKey = [];
            snapshot.forEach((data) => {
                if (data.val()) {
                    this._foodTableDataKey.push(data.key);

                    const {value, comment, time} = data.val();
                    let newFood = [];
                    newFood.push(value);
                    newFood.push(comment);
                    newFood.push(time);
                    newFood.push('');

                    this._foodTableData.push(newFood);
                }
            });

            if (this.state.selectedIndex == HomeTabScreen.TabItem.Food) {
                this.setState({tableDataKey: this._foodTableDataKey});
                this.setState({tableData: this._foodTableData});
            }
        });

        this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + this.state.currentDate + '/water').on('value', (snapshot) => {
            this._waterTableData = [];
            this._waterTableDataKey = [];
            snapshot.forEach((data) => {
                if (data.val()) {
                    this._waterTableDataKey.push(data.key);

                    const {value, comment, time} = data.val();
                    let newWater = [];
                    newWater.push(value);
                    newWater.push(comment);
                    newWater.push(time);
                    newWater.push('');

                    this._waterTableData.push(newWater);
                }
            });

            if (this.state.selectedIndex == HomeTabScreen.TabItem.Water) {
                this.setState({tableDataKey: this._waterTableDataKey});
                this.setState({tableData: this._waterTableData});
            }
        });

        this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + this.state.currentDate + '/weight-inches').on('value', (snapshot) => {
            this._weightTableData = [];
            this._weightTableDataKey = [];
            snapshot.forEach((data) => {
                if (data.val()) {
                    this._weightTableDataKey.push(data.key);

                    const {weight, inches, comment, time} = data.val();
                    let newWI = [];
                    newWI.push(weight);
                    newWI.push(inches);
                    newWI.push(comment);
                    newWI.push(time);
                    newWI.push('');

                    this._weightTableData.push(newWI);
                }
            });

            if (this.state.selectedIndex == HomeTabScreen.TabItem.Weight_Inch) {
                this.setState({tableDataKey: this._weightTableDataKey});
                this.setState({tableData: this._weightTableData});
            }
        });
    }

    handleSingleIndexSelect = (index) => {
        this.setState(prevState => ({ ...prevState, selectedIndex: index }))

        if (index == HomeTabScreen.TabItem.Food) {
            this.setState({tableHead: this._foodTableHead});
            this.setState({widthArr: this._foodWidthArr});
            this.setState({tableDataKey: this._foodTableDataKey});
            this.setState({tableData: this._foodTableData});
        } else if (index == HomeTabScreen.TabItem.Water) {
            this.setState({tableHead: this._waterTableHead});
            this.setState({widthArr: this._waterWidthArr});
            this.setState({tableDataKey: this._waterTableDataKey});
            this.setState({tableData: this._waterTableData});
        } else {
            this.setState({tableHead: this._weightTableHead});
            this.setState({widthArr: this._weightWidthArr});
            this.setState({tableDataKey: this._weightTableDataKey});
            this.setState({tableData: this._weightTableData});
        }

        this.queryFirebaseDB();
    }

    editRowData = (row) => {
        const dataKey = this.state.tableDataKey[row];

        let {onEdit} = this.props;
        onEdit(this.state.currentDate, this.state.selectedIndex, dataKey);
    }

    deleteRowData = (row) => {
        const dataKey = this.state.tableDataKey[row];

        Alert.alert(
            'MedSpa',
            'Do you want to delete this data?',
            [{
                text: 'Cancel',
                style: 'cancel',
                onPress: () => {
                    console.log('Delete cancel');
                }
            },{
                text: 'OK',
                onPress: () => {
                    this.setState({spinner: true}, () => {
                        let ref = this.db.ref('intakes/' + this.auth.currentUser.uid + '/' + this.state.currentDate);
                        if (this.state.selectedIndex == HomeTabScreen.TabItem.Food) {
                            ref = ref.child('food');
                        } else if (this.state.selectedIndex == HomeTabScreen.TabItem.Water) {
                            ref = ref.child('water');
                        } else {
                            ref = ref.child('weight-inches');
                        }
                        ref = ref.child(dataKey);

                        ref.remove().then(() => {
                            console.log('DELETE ITEM - SUCCESS');
                            this.setState({spinner: false});
                        }).catch((error) => {
                            console.log('DELETE ITEM - ERROR' , error);
                            this.setState({spinner: false});
                            Snackbar.show({
                                title: error.message,
                                duration: Snackbar.LENGTH_LONG,
                            });
                        });
                    });
                }
            },],
            {cancelable: false}
        );
    }

    render() {
        const actionCell = (data, index) => (
            <View style={styles.actionCell}>
                <TouchableOpacity onPress={() => this.editRowData(index)}>
                    <Icon name='edit' style={{}} color='green' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => this.deleteRowData(index)}>
                    <Icon name='times' type='font-awesome' style={{}} color='orangered' />
                </TouchableOpacity>
            </View>
        );

        let {onTakePhoto, onAddNew} = this.props;
        return (
            <SafeAreaView style={styles.container} >
                <Image source={require('../../assets/images/background.png')} style={styles.backgroundContainer} ></Image>
                <View style={styles.navBarContainer}>
                    <TouchableOpacity style={[styles.navBarItemContainer, {marginLeft: 10}]} onPress={this.context.drawer.open}>
                        <Image style={styles.drawerButton} source={require('../../assets/images/menu.png')} />
                    </TouchableOpacity>
                    <Text style={styles.navigationTitle}>Home</Text>
                    <TouchableOpacity style={[styles.navBarItemContainer, {marginRight: 10,}]}>
                        <Image source={require('../../assets/images/logo.png')} style={styles.logo}/>
                    </TouchableOpacity>
                </View>
                <View style={styles.selectDateContainer}>
                    <View style={styles.selectDatePanel}>
                        <View style={styles.selectDateArrowContainer}>
                            <TouchableOpacity onPress={() => this.changeDate(-1)}>
                                <Icon name='chevron-left' iconStyle={styles.selectDateArrowStyle} color='#fafafa' />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.selectDateTextContainer}>
                            { this.state.isToday && <Text style={{color: 'white',}}>{'  ' + 'Today' + '  '}</Text>}
                            <Text style={{fontWeight: 'bold', color: 'white',}}>{this.state.currentDate + "  "}</Text>
                        </View>
                        <View style={styles.selectDateArrowContainer}>
                            <TouchableOpacity onPress={() => this.changeDate(1)}>
                                <Icon name='chevron-right' iconStyle={styles.selectDateArrowStyle} color='#fafafa' />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
                <View style={styles.segmentedControlTabContainer}>
                    <SegmentedControlTab values={["Food", "Water", "Weight/Inch"]}
                        selectedIndex={this.state.selectedIndex}
                        tabStyle={styles.tabStyle} tabTextStyle={styles.tabTextStyle}
                        activeTabStyle={styles.activeTabStyle} activeTabTextStyle={styles.activeTabTextStyle}
                        onTabPress={this.handleSingleIndexSelect} />
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
                                                        <Cell key={cellIndex} data={cellIndex === (rowData.length - 1) ? actionCell(cellData, index) : cellData} textStyle={styles.tableText} width={this.state.widthArr[cellIndex]} />
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
                <TouchableOpacity style={styles.takePhotoButton} onPress={() => {onTakePhoto()}}>
                    <Icon raised name='add-a-photo' style={{}} color='white' backgroundColor='#66bd32'/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addNewButton} onPress={() => {onAddNew(this.state.currentDate, this.state.selectedIndex)}}>
                    <Icon raised name='note-add' style={{}} color='white' backgroundColor='#bf8f43'/>
                </TouchableOpacity>
            </SafeAreaView>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: 'white',
    },
    navBarContainer: {
        height: '60rem',
        borderBottomColor: 'lightgray',
        borderBottomWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    navBarItemContainer: {
        width: '60rem',
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    drawerButton: {
        width: '25rem',
        height: '25rem',
        resizeMode: 'contain',
    },
    navigationTitle: {
        fontSize: '20rem',
        fontWeight: 'bold',
        color: '#fafafa',
    },
    logo: {
        width: '60rem',
        height: '60rem',
        resizeMode: 'contain',
        marginRight: '10rem',
    },
    selectDateContainer: {
        height: '70rem',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: '10%',
        paddingRight: '10%',
    },
    selectDatePanel: {
        width: '220rem',
        height: '40rem',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#bf8f43',
        borderRadius: '20rem',
        overflow: 'hidden',
    },
    selectDateArrowContainer: {
        width: '40rem',
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectDateArrowStyle: {
        fontSize: '40rem',
    },
    selectDateTextContainer: {
        width: '140rem',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentedControlTabContainer: {
        height: '50rem',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },
    tabStyle: {
        height: '40rem',
        borderColor: '#66bd32',
    },
    activeTabStyle: {
        backgroundColor: '#66bd32',
    },
    tabTextStyle: {
        color: 'darkgreen',
    },
    activeTabTextStyle: {
        color: 'white',
        fontWeight: 'bold',
    },
    tableContainer: {
        flex: 1,
        padding: 15,
        paddingTop: '15rem',
    },
    tableHeader: {
        height: '50rem',
        backgroundColor: '#66bd32'
    },
    tableWrapper: {
        marginTop: -1,
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#eeeeee',
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
    takePhotoButton: {
        position: 'absolute',
        bottom: '20rem',
        left: '20rem',
        alignItems:'center',
        justifyContent:'center',
    },
    addNewButton: {
        position: 'absolute',
        bottom: '20rem',
        right: '20rem',
        alignItems:'center',
        justifyContent:'center',
    },
    backgroundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        position: 'absolute',
        opacity: 0.8
    }
})