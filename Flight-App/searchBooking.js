import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { ManageContext } from "./helper/Context";

/* searchBooking.js searches for a booking given user's booking refererence code and last name. It is the landing page when tapping the manage tab. */

class searchBooking extends Component {
   static contextType = ManageContext
   state = {
      last: '',
      referencecode: ''
   }

   handleLast = (text) => {
       this.setState({ last: text })
   }
   handleCode = (text) => {
       this.setState({ referencecode: text})
   }
   
   info = async () => {

      var params = {
         headers: {
           "Content-type": "application/x-www-form-urlencoded;charset=UTF-8" 
         },
         body: `data=${JSON.stringify({last:this.context.manageMem.last, ref:this.context.manageMem.ref})}`,
         method:"POST",
       }
   
       // newer style fetch sequence 
       const response = await fetch(this.context.manageMem.url + '/booking_search', params)
       const responseJson = await response.json()
       const out = await responseJson
       console.log(out)
       if (out.length == 0) {alert("Booking doesn't exist.")}
       else this.props.navigation.navigate({name:'showBooking', params:{booking:out}}) // only after loading search, navigate to page. Add a loading wheel?
     }
   render() {
      return (
         <View style = {styles.container}>
            <TextInput style = {styles.input}
               underlineColorAndroid = "transparent"
               placeholder = " Last Name"
               placeholderTextColor = "black"
               autoCapitalize = "none"
               onChangeText = {this.handleLast}/>
            
            <TextInput style = {styles.input}
               underlineColorAndroid = "transparent"
               placeholder = " Reference Code (six num/letter code)"
               placeholderTextColor = "black"
               autoCapitalize = "none"
               onChangeText = {this.handleCode}/>
            
            <TouchableOpacity
               style = {styles.submitButton}
               onPress = {
                  () => {
                     this.context.manageMem.last = this.state.last
                     this.context.manageMem.ref = this.state.referencecode
                     this.context.setManageMem(this.context.manageMem)
                     this.info()
                  }
               }>
               <Text style = {styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>
         </View>
      )
   }
}
export default searchBooking

const styles = StyleSheet.create({
   container: {
      paddingTop: 23
   },
   input: {
      margin: 15,
      height: 40,
      borderColor: 'black',
      borderWidth: 1
   },
   submitButton: {
      backgroundColor: 'black',
      padding: 10,
      margin: 15,
      height: 40,
   },
   submitButtonText:{
      color: 'white'
   }
})