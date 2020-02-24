import React from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import EStyleSheet from "react-native-extended-stylesheet";

import { Icon } from 'react-native-elements';
import firebase from 'react-native-firebase';

import HomeScreen from "./HomeScreen";

export default class DrawerMenuPanel extends React.Component {
    static propTypes = {
        closeDrawer: PropTypes.func.isRequired
    };

    state = {
        userName: '',
        userEmail: '',
    }

    componentDidMount() {
        const user = firebase.auth().currentUser;
        if (user) {
            firebase.database().ref('users/' + user.uid).on('value', (snapshot) => {
                if (snapshot.val()) {
                    const {firstName, lastName, email} = snapshot.val();
                    this.setState({userName: firstName + ' ' + lastName});
                    this.setState({userEmail: email});
                }
            });
        }
    }

    render() {
        let {closeDrawer} = this.props;
        return (
            <ScrollView style={styles.container}>
                <View style={styles.logoContainer}>
                    <Image source={require('../../assets/images/logo.png')} style={styles.logo}/>
                </View>
                <View style={styles.nameContainer}>
                    <Text style={styles.nameText}>{this.state.userName}</Text>
                </View>
                <View style={styles.emailContainer}>
                    <Text style={styles.emailText}>{this.state.userEmail}</Text>
                </View>

                <View style={styles.menuContainer}>
                    <View style={styles.menuItemContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={()=>closeDrawer(HomeScreen.DrawerMenuItem.Profile)}>
                            <Icon name='person' color='#66bd32' />
                            <Text style={styles.menuText}>Profile</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.menuItemContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={()=>closeDrawer(HomeScreen.DrawerMenuItem.Booking)}>
                            <Icon name='book' color='#66bd32' />
                            <Text style={styles.menuText}>Booking</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.menuItemContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={()=>closeDrawer(HomeScreen.DrawerMenuItem.About)}>
                            <Icon name='info-circle' type='font-awesome' color='#66bd32' />
                            <Text style={styles.menuText}>About MedSpa</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.menuItemContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={()=>closeDrawer(HomeScreen.DrawerMenuItem.Locations)}>
                            <Icon name='map-marker' type='font-awesome' size={30} color='#66bd32' />
                            <Text style={styles.menuText}>Locations</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.menuItemContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={()=>closeDrawer(HomeScreen.DrawerMenuItem.ContactUs)}>
                            <Icon name='paper-plane' type='font-awesome' size={21} color='#66bd32' />
                            <Text style={styles.menuText}>Contact Us</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.menuItemContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={()=>closeDrawer(HomeScreen.DrawerMenuItem.Reports)}>
                            <Icon name='print' type='font-awesome' color='#66bd32' />
                            <Text style={styles.menuText}>Reports</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.menuItemContainer}>
                        <TouchableOpacity style={styles.menuItem} onPress={()=>closeDrawer(HomeScreen.DrawerMenuItem.Logout)}>
                            <Icon name='sign-out' type='font-awesome' color='#66bd32' />
                            <Text style={styles.menuText}>Logout</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        borderTopColor: 'lightgray',
        borderTopWidth: 1,
        borderRightColor: 'darkgray',
        borderRightWidth: 1,
        backgroundColor: 'whitesmoke',
    },
    logoContainer: {
        height: '120rem',
        alignItems: 'center',
        justifyContent: 'center'
    },
    logo: {
        height: '80%',
        aspectRatio: 10/8,
        resizeMode: 'contain'
    },
    nameContainer: {
        height: '30rem',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    nameText: {
        fontSize: '20rem',
        color: 'darkgreen',
    },
    emailContainer: {
        height: '30rem',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    emailText: {
        fontSize: '12rem',
    },
    menuContainer: {
        flex: 1,
        borderTopWidth: 1,
        borderColor: 'lightgray',
        marginTop: '30rem',
    },
    menuItemContainer: {
        height: '50rem',
        alignItems: 'flex-start',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderColor: 'lightgray',
    },
    menuItem: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    menuText: {
        position:'absolute',
        left: 50,
        color: 'green',
    },
});