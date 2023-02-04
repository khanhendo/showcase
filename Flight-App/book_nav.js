import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { BookContext } from './helper/Context';


import Book from './Book.js';
import dep from './selectAirports.js';
import passInfo from './passInfo';
import flightList from './flightList';
import userInfo from './userInfo';
import checkoutScreen from './checkoutScreen';
import confirmationScreen from './confirmationScreen';

const Stack = createStackNavigator();

function book_nav(props) {

  const my_url = 'http://10.42.225.0:3001'

  async function fetchAirports() {
    const response = await fetch(my_url + '/airports')
    const responseJson = await response.json()
    const out = await responseJson 
    return out;
  }
  
  var blank_pass = {
    first: null,
    last: null,
    dob: null,
    phone: null,
    email: null,
  }

  const [mem, setMem] = useState({ // initializing a global memory! Access via mem, change via setMem().
    url: my_url, 
    dep:null, arr:null, 
    airports: fetchAirports(), 
    passenger: blank_pass,
  }); 

  return (
    <BookContext.Provider value={{mem, setMem}}> 
      <NavigationContainer independent={true}>
        <Stack.Navigator>
          <Stack.Screen name="Book" component={Book} initialParams={{}} />
          <Stack.Screen name="selectAirports" component={dep} />
          <Stack.Screen name="flightList" component={flightList} />
          <Stack.Screen name="passInfo" component={passInfo} />
          <Stack.Screen name="userInfo" component={userInfo} />
          <Stack.Screen name="checkoutScreen" component={checkoutScreen} />
          <Stack.Screen name="confirmationScreen" component={confirmationScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </BookContext.Provider>
  );
}

export default book_nav;