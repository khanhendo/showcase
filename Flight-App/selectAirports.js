import React, { Component, useContext } from "react";
import { Button, View, FlatList, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity } from "react-native";
import { List, ListItem, SearchBar } from "react-native-elements";
import { BookContext } from "./helper/Context";



export default class dep extends Component {
  static contextType = BookContext;
  constructor(props) {
    super(props)

    this.state = {
      selectedId: "",
      search: "",
      data: [
        {
          a_code: null,
          name: null,
        }
      ],
    }
      ;
  }

  async componentDidMount() {  // upon fetching cities, display cities in list
    const a = await this.context.mem.airports
    this.setState({ data: a });
  }

  renderItem = ({ item }) => {
    const b = item.a_code === this.state.selectedId ? "black" : "white";
    const c = item.a_code === this.state.selectedId ? 'white' : 'black';

    return (
      <ListItem
        containerStyle={{ backgroundColor: b }}
        onPress={() => {
          if (this.props.route.params.set == 'dep') {     // if selecting departure airport
            if (this.context.mem.arr == item.a_code) {    // not allowing arrival airport to also be selected departure airport
              this.context.mem.arr = this.context.mem.dep
            }
            this.context.mem.dep = item.a_code;
          }

          else {
            if (this.context.mem.dep == item.a_code) {
              this.context.mem.dep = this.context.mem.arr
            }
            this.context.mem.arr = item.a_code;
          }

          this.context.setMem(this.context.mem);          // storing selection in global memory
          console.log(this.context.mem.dep, "and", this.context.mem.arr)
          this.props.navigation.navigate('Book')
        }}>
        <ListItem.Content>
          <ListItem.Title style={{ color: c }}>{item.a_code}</ListItem.Title>
          <ListItem.Subtitle style={{ color: c }}>{item.name}</ListItem.Subtitle>
        </ListItem.Content>
      </ListItem>
    );
  };

  updateSearch = (search) => {
    this.setState({ search });
  }

  render() {
    const f = this.state.search                   // filtering data based on user's search 
      ? this.state.data.filter(item =>
        item.a_code.toLowerCase().includes(this.state.search.toLowerCase()) ||
        item.name.toLowerCase().includes(this.state.search.toLowerCase()))
      : this.state.data;


    return (
      <SafeAreaView>
        <SearchBar
          placeholder="TypeHere..."
          onChangeText={(s) => this.setState({ search: s })}
          value={this.state.search}
        />
        <FlatList
          data={f}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.a_code}
          extraData={this.selectedId}
        />
      </SafeAreaView>
    );
  }
};
