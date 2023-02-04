import React, { useContext, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { ManageContext } from './helper/Context';

/* showBooking.js - displays a user's booking. */

export default function showBooking(props) {
  const {manageMem, setManageMem} = useContext(ManageContext);
  const b = props.route.params.booking
  const [booking, setBooking] = useState(b);

  const pressHandler = (id) => {
    console.log(id);
    setflight((prevFlight) => {
      return prevFlight.filter(flight => flight.f_id  == id);
    });
  };

  return (
    <View style={styles.container}>
      <Text> Passengers: </Text>
      {b.map((i) => <Text style={{textTransform: 'capitalize', fontSize:30}}> {i.first + " " + i.last}</Text>)}
      <FlatList 
        numColumns={1}
        keyExtractor={(item) => item.f_id} 
        data={booking} 
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => {}}>
            <Text style={styles.item}>{"\n"}startTime: {item.dep_time} {"\n"} endTime: {item.arv_time} {"\n"}From: {item.dep_loc} To: {item.arv_loc} {"\n"} time: 5min {"\n"}flightno: OA{item.f_id} {"\n"}</Text>
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