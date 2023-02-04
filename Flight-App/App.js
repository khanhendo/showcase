import React, { Component } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import book_nav from './book_nav.js';
import manage_nav from './manage_nav.js';

/* App.js: Root of App */

class MyTabs extends Component {
  render() {
    return (
      <Tab.Navigator>
        <Tab.Screen name="Book" component={book_nav} options={{headerShown:false}} />
        <Tab.Screen name="Manage" component={manage_nav} options={{headerShown:false}}/>
      </Tab.Navigator>
    )
  }

}

const Tab = createBottomTabNavigator();

export default class App extends Component {
  render() {
    return (
      <NavigationContainer>
        <MyTabs />
      </NavigationContainer>
    );
  }
}
