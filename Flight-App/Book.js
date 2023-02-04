import React, { useState, useContext } from 'react';
import { Button, View, Text, StyleSheet} from 'react-native';
import { List, ListItem, SearchBar, Icon } from "react-native-elements";
import selectAirports from './selectAirports';
import { BookContext } from './helper/Context';

/* Book.js - the landing page when pressing the book tab. A user can initiate a booking here. */

function Book(props) {
  // create connection to global memory 
  const {mem, setMem} = useContext(BookContext);

  // after pressing "Select Departure" or "Select Arrival"
  const airports_press = (se) => {
    props.navigation.navigate({name:'selectAirports', params:{set:se}})
  };


  // after pressing GO (to search for flights)
  async function fetchFlights() {
    if (!(mem.dep && mem.arr)) { // make sure user selected dep and arrival airports
      return null // TODO: give user relavent error message
    }; 
    var params = {
      headers: {
        "Content-type": "application/x-www-form-urlencoded;charset=UTF-8" 
      },
      body: `data=${JSON.stringify({dep_loc:mem.dep, arv_loc:mem.arr})}`,
      method:"POST",
    }

    // newer style fetch sequence 
    const response = await fetch(mem.url + '/flight_search', params)
    const responseJson = await response.json()
    const out = await responseJson 
    props.navigation.navigate({name:'flightList', params:{flights:out}}) // only after loading search, navigate to page. TODO: Add a loading wheel?
  }

      return (
        <View style={{padding:20}}>
          <Text> Book a flight here! </Text>

          <View style={{flexDirection:'row', justifyContent:'center'}}>
          <Button title={mem.dep || "Select Departure"} 
          onPress={() => airports_press('dep')}
          />
          <Icon name="arrow-right" />
          <Button title={mem.arr|| "Select Arrival"}
          onPress={() => airports_press('arr')}
          />
          </View>
          <Button title='Go!' onPress={fetchFlights}/> 
        </View>
        
        
      )
    }
export default Book;