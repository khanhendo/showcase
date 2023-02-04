import React, { useState, useContext } from "react";
import { Button, View, Text, } from 'react-native';
import { BookContext } from './helper/Context';

/* if checkout is successsful, display this page */

function confirmationScreen(props) {
    const {mem, setMem} = useContext(BookContext);

    return (
        <View style={{justifyContent:'center', alignItems:'center'}}>
            <Text>Booking Complete</Text>
            <Text>Here is your reservation code: </Text>
            <Text style={{fontSize:30}}>{props.route.params.code} </Text>
            <Text>{mem.passenger[0].first}, {mem.passenger[0].last}, {mem.passenger[0].email}</Text>
            <Text>Flight: {mem.f_id}, from {mem.dep} to {mem.arr} </Text> {/* TODO add flight carrier code */} 
            <Button title="Finish" onPress={() => props.navigation.navigate('Book')}></Button>
        </View>
    )
}

export default confirmationScreen;