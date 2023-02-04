import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ManageContext } from './helper/Context';


import searchBooking from './searchBooking';
import showBooking from './showBooking';

const Stack = createStackNavigator();

function manage_nav(props) {

  var blank_pass = {
    first: null,
    last: null,
    dob: null,
    phone: null,
    email: null,
  }

  const [manageMem, setManageMem] = useState({ // initializing global memory. [read, write]
    url: 'http://10.42.225.0:3001', 
    passenger: blank_pass,
    last: null,
    ref: null,
  }); 

  return (
    <ManageContext.Provider value={{manageMem, setManageMem}}> 
      <NavigationContainer independent={true}>
        <Stack.Navigator>
          <Stack.Screen name="searchBooking" component={searchBooking} />
          <Stack.Screen name="showBooking" component={showBooking} />
        </Stack.Navigator>
      </NavigationContainer>
    </ManageContext.Provider>
  );
}

export default manage_nav;