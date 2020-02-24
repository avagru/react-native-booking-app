import React from 'react';
import {ScrollView, Text, View, Image, SafeAreaView} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

export default class AboutScreen extends React.Component {
    static navigationOptions = {
        headerTitle: 'About MedSpa',
        headerBackTitle: '',
        headerRight: () => (
            <Image style={styles.navLogo}
                   source={require('../../assets/images/logo.png')} />
        ),
    };

    constructor(props) {
        super(props);
    }

    render() {
        const {goBack} = this.props.navigation;
        return (
            <SafeAreaView style={{flex: 1,}}>
                <ScrollView style={styles.container}>
                    <View style={styles.innerContainer}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.titleStyle}>About</Text>
                        </View>
                        <Text style={styles.textStyle}>Eve’s Body Organic MedSpa specializes in an all natural alternative to body sculpting, skin care and overall beautification. We also offer an array of all natural relaxation and rejuvenation products and services.  The founder Yahvi Stubbs is an alternative medicine practitioner , and Master esthetician with a Bachelors degree in Health Sciences. Our goal is to help each client achieve their goals whether it be to improve their health, tone up, lose weight or just relax after a long day. Our services are non invasive and we use only high quality organic products for every treatment to ensure our clients receive the best care possible.</Text>

                        <View style={[styles.titleContainer, {marginTop: 20,}]}>
                            <Text style={styles.titleStyle}>Our History</Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bulletTextStyle}>○</Text>
                            <Text style={styles.itemTextStyle}>In 2016 Eves Body opened its first location, occupying a 300 sq ft 2 room space located in Downtown Jacksonville, FL.</Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bulletTextStyle}>○</Text>
                            <Text style={styles.itemTextStyle}>In 2017 the 2nd location opened in Charlotte NC.</Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bulletTextStyle}>○</Text>
                            <Text style={styles.itemTextStyle}>Shortly after in 2018 we Expanded to our 3200 sq ft facility located on the Southside of Jacksonville.</Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bulletTextStyle}>○</Text>
                            <Text style={styles.itemTextStyle}>2019 we are excited about our Newest location in the Avenues Mall</Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bulletTextStyle}>○</Text>
                            <Text style={styles.itemTextStyle}>2019 Begin construction for The New Oakleaf Plantation location in Orange Park, FL</Text>
                        </View>
                        <View style={styles.listItemContainer}>
                            <Text style={styles.bulletTextStyle}>○</Text>
                            <Text style={styles.itemTextStyle}>2019 Signed our first franchise location in Orlando FL opening in 2020.</Text>
                        </View>

                        <View style={styles.imageContainer}>
                            <Image style={styles.image} source={{uri: 'https://evesbody.net/wp-content/uploads/2019/08/IMG_6914.jpg'}} />
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        )
    }
}

const styles = EStyleSheet.create({
    container: {
        flex: 1,
    },
    innerContainer: {
        padding: '30rem',
    },
    navLogo: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
        marginRight: 10,
    },
    titleContainer: {
        height: '60rem',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    titleStyle: {
        fontSize: '24rem',
        fontWeight: '500'
    },
    textStyle: {
        fontSize: '18rem',
        color: '#333',
        lineHeight: '24rem',
    },
    listItemContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    bulletTextStyle: {
        fontSize: '12rem',
        color: '#333',
        width: '20rem',
        paddingTop: '6rem'
    },
    itemTextStyle: {
        fontSize: '18rem',
        color: '#333',
        lineHeight: '24rem',
    },
    imageContainer: {
        width: "100%",
        aspectRatio: 10/8,
        resizeMode: 'contain',
        padding: '10rem',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '30rem',
        marginBottom: '30rem',
    },
    image: {
        width: "100%",
        aspectRatio: 10/8,
        resizeMode: 'contain'
    },
})