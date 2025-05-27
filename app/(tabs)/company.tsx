import { StyleSheet, Text, View } from 'react-native';

export default function CompanyScreen() {
  return (
    <View style={styles.containerMain}>
      <Text style={styles.title}>CompanyScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
containerMain: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
},
title:{
  fontSize: 24,
  fontWeight: 'bold',
  color: '#333',
}
});