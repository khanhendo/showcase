import React, { useState, useContext } from "react";
import { Button, View, Text, } from 'react-native';
import { BookContext } from './helper/Context';

function checkoutScreen(props) {
    const {mem, setMem} = useContext(BookContext);

    async function create_booking() {
        // TODO: add here check if details are put in correctly

        const random_code = Math.random().toString(20).substr(2, 6).toUpperCase()

        console.log("Search Started: ", mem.url)
        var params = {
          headers: {
            "Content-type": "application/x-www-form-urlencoded;charset=UTF-8" 
          },
          body: `data=${JSON.stringify({
              f_id:2, 
              ref:random_code, 
              num_of_pass:1,
              pass: mem.passenger,
            })}`,
          method:"POST",
        }
        console.log(params)

        const response = await fetch(mem.url + '/create_booking', params)
        const responseJson = await response
        const out = await responseJson 
        props.navigation.navigate({name:"confirmationScreen", params:{code:random_code}})



    }
    return (
        <View style={{justifyContent:"center", alignItems:'center'}}>
            <Text>Passenger Info</Text>
            <Text>{mem.passenger[0].first}, {mem.passenger[0].last}, {mem.passenger[0].email}</Text>
            <Text>Flight: {mem.f_id}, from {mem.dep} to {mem.arr} </Text> {/* TODO add flight carrier code */} 
            <Button title="Go" onPress={create_booking}/>
        </View>
    )
}

export default checkoutScreen;