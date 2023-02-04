import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { BookContext } from './helper/Context';

/* flightList.js - show results of flight search */

export default function flightList(props) {
  const {mem, setMem} = useContext(BookContext);
  const f = props.route.params.flights
  const [flight, setflight] = useState(f);
  var no_flights = "";
  if (f.length == 0) {no_flights = "Sorry, no flights for selected locations. Please choose other locations."}

  const pressHandler = (id) => {
    console.log(id);
    setflight((prevFlight) => {
      return prevFlight.filter(flight => flight.f_id  == id);
    });
  };

  return (
    <View style={styles.container}>
      <Text>{no_flights}</Text>
      <FlatList 
        numColumns={1}
        keyExtractor={(item) => item.f_id} 
        data={flight} 
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {
            mem.f_id = item.f_id;
            setMem(mem);
            props.navigation.navigate('userInfo') 
          }}>
            <Text style={styles.item}>{"\n"}startTime: {item.dep_time} {"\n"} endTime: 9:05am {"\n"}startLoc: {item.dep_loc} endLoc: {item.arv_loc} {"\n"} time: 5min {"\n"}flightno: OA{item.f_id} {"\n"}price: $10</Text>
          </TouchableOpacity>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0,
    paddingHorizontal: 0,
    backgroundColor: 'lightgrey',
  },
  item: {
    flex: 1,
    marginHorizontal: 0,
    marginTop: 5,
    padding: 30,
    backgroundColor: 'white',
    fontSize: 24,
  },
});