import { Dimensions } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

//import AsyncStorage from '@react-native-community/async-storage';

import { createSwitchNavigator, createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import LandingScreen from './screens/LandingScreen';
import CreateAccountScreen from './screens/auth/CreateAccountScreen';
import LoginScreen from './screens/auth/LoginScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import HomeScreen from './screens/main/HomeScreen';
import ProfileScreen from './screens/main/ProfileScreen';
import BookingScreen from './screens/main/BookingScreen';
import AboutScreen from './screens/main/AboutScreen';
import LocationScreen from './screens/main/LocationScreen';
import ContactUsScreen from './screens/main/ContactUsScreen';
import ReportScreen from './screens/main/ReportScreen';
import AddEditFoodScreen from './screens/main/AddEditFoodScreen';
import AddEditWaterScreen from './screens/main/AddEditWaterScreen';
import AddEditWeightInchScreen from './screens/main/AddEditWeightInchScreen';
import LocationDetailScreen from "./screens/main/LocationDetailScreen";
import TakePhotoScreen from "./screens/main/TakePhotoScreen";
import SendReportScreen from "./screens/main/SendReportScreen";


const entireScreenWidth = Dimensions.get('window').width;
EStyleSheet.build({ $rem: entireScreenWidth / 380 });

const AppStack = createStackNavigator({
    Home: HomeScreen,
    Profile: ProfileScreen,
    Booking: BookingScreen,
    About: AboutScreen,
    Locations: LocationScreen,
    LocationsDetail: LocationDetailScreen,
    Contact: ContactUsScreen,
    Reports: ReportScreen,
    SendReport: SendReportScreen,
    AddEditFood: AddEditFoodScreen,
    AddEditWater: AddEditWaterScreen,
    AddEditWeightInch: AddEditWeightInchScreen,
    TakePhoto: TakePhotoScreen,
});

export default createAppContainer(
    createSwitchNavigator({
        Landing: createStackNavigator({
            Landing: {
                screen: LandingScreen,
                navigationOptions: {
                    header: null,
                }
            },
            Booking: BookingScreen,
        }),
        CreateNew: createStackNavigator({
            CreateNew: {
                screen: CreateAccountScreen,
                navigationOptions: {
                    header: null
                }
            }
        }),
        Login: createStackNavigator({
            Login: {
                screen: LoginScreen,
                navigationOptions: {
                    header: null,
                }
            },
            ForgotPassword: {
                screen: ForgotPasswordScreen,
                navigationOptions: {
                    header: null
                }
            }
        }),
        AppMain: AppStack,
    }, {
        initialRouteName: 'Landing',
    }, ),
);