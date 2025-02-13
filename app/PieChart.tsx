import React, { Component } from 'react';
import { StyleSheet, ScrollView, Text, View } from 'react-native';
import PieChart from 'react-native-pie-chart';

export default class Stats extends Component {
  render() {
    const wh = 200;

    const series = [
      {value: 430, color: '#920000'},
      {value: 200, color: '#008500'},
      {value: 300, color: '#000087'},
    ]

    return (
      <View style={styles.Pie}>
        <PieChart widthAndHeight={wh} series={series} cover={0.9} padAngle={0.05} style={styles.Pie}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  Pie: {
    
  }
});