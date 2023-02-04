import React, { Component } from 'react'
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native'
import { BookContext } from './helper/Context'


/* I, Khan Henderson, didn't write this, a teammate did. */

class userInfo extends Component {
   static contextType = BookContext;
   state = {
      email: '',
      password: '',
      first:'',
      last:'',
      dob:'',
      phone:'',
   }
   handleFirst = (text) => {
      let string = String(text)
      let letters = /^[A-Za-z]+$/

      if (text.match(letters)) {
         return this.setState({ first: text })
      }
      else {
         alert('Please input characters in the alphabet only');
         return 0;
      }

   }
   handleLast = (text) => {
      let string = String(text)
      let letters = /^[A-Za-z]+$/

      if (text.match(letters)) {
         return this.setState({ last: text })
      }
      else {
         alert('Please input characters in the alphabet only');
         return 0;
      }

   }
   handleDob = (text) => {
      let string = String(text);
      let numbers = /^[0-9/]+$/

      if (text.match(numbers)) {
         return this.setState({ dob: text })
      }
      else {
         alert('Please input 8 elxclusively numeric characters only');
         return 0;

      }
   }
   handlePhone = (text) => {
      let string = String(text);
      let numbers = /^[0-9]+$/

      if (text.match(numbers)) {
         return this.setState({ phone: text })
      }
      else {
         alert('Please input 10 elxclusively numeric characters only');
         return 0;
      }

   }
   handleEmail = (text) => {
      this.setState({email:text})
   }

   checkEmail = () => {
      var text = this.state.email
      if (text.includes("@") && text.includes(".")) {
         return true
      }
      else {
         return false;
      }
   }

   info = (first, last, dob, phone, email) => {
      alert('first: ' + first + '\n' + 'last: ' + last + '\n' + 'dob: ' + dob + '\n' + 'phone: ' + phone + '\n' + 'email: ' + email)
   }
   render() {

      return (
         <View style={styles.container}>
            <TextInput style={styles.input}
               underlineColorAndroid="transparent"
               placeholder=" First"
               placeholderTextColor="black"
               autoCapitalize="none"
               onChangeText={this.handleFirst} />

            <TextInput style={styles.input}
               underlineColorAndroid="transparent"
               placeholder=" Last"
               placeholderTextColor="black"
               autoCapitalize="none"
               onChangeText={this.handleLast} />

            <TextInput style={styles.input}
               underlineColorAndroid="transparent"
               placeholder=" DD/MM/YYYY"
               placeholderTextColor="black"
               autoCapitalize="none"
               onChangeText={this.handleDob} />

            <TextInput style={styles.input}
               underlineColorAndroid="transparent"
               placeholder=" phone"
               placeholderTextColor="black"
               autoCapitalize="none"
               onChangeText={this.handlePhone} />

            <TextInput style={styles.input}
               underlineColorAndroid="transparent"
               placeholder=" email"
               placeholderTextColor="black"
               autoCapitalize="none"
               onChangeText={this.handleEmail} />

            <TouchableOpacity
               style={styles.submitButton}
               onPress={
                  () => {
                     if (this.checkEmail()) {
                        this.context.mem.passenger = [{
                           first: this.state.first.toLowerCase(),
                           last: this.state.last.toLowerCase(),
                           dob: this.state.dob,
                           phone: this.state.phone,
                           email: this.state.email,
                        }]
                        this.context.setMem(this.context.mem)
                        this.props.navigation.navigate('checkoutScreen')
                     }
                     else alert('Please input an email that is followed by an email domain name, for example myemail@gmail.com');
                  }

               }>
               <Text style={styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>
         </View>
      )
   }
}
export default userInfo

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
   submitButtonText: {
      color: 'white'
   }
})

