import React, {useLayoutEffect, useState, useEffect} from 'react';
import {
  Text,
  View,
  ScrollView,
  Animated,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ImageBackground,
  Easing,
  Button,
} from 'react-native';

import {sha256} from 'react-native-sha256';

import {SymbologyDescription} from 'scandit-react-native-datacapture-barcode';

import {BarcodeRow} from './BarcodeRow';

import {styles} from './styles';

export const BarcodeListView = ({
  show = false,
  results = {},
  style = {},
  ...propsSansStyle
}) => {
  // Keep a state of consolidated barcode results.
  const [consolidatedResults, setConsolidatedResults] = useState({});

  //Keep a state of barecodeGroupToken initialy is a hash of Date.now gen
  //ReferenceError: Can't find variable: genRanHex
  const [barecodeGroupToken, setBarecodeGroupToken] = useState(
    "sha256(Date.now),"
  );

  // Fake barecode test for the fetch
  const [dummyData, setDummyData] = useState({
    barecodeGroupToken1: {
      '0190198454270': {data: '0190198454270', symbology: 'ean13Upca'},
      '1PMQ8L2ZD/A': {data: '1PMQ8L2ZD/A', symbology: 'code128'},
      354830093329284: {data: '354830093329284', symbology: 'code128'},
      SF2LWQ2A7JCM2: {data: 'SF2LWQ2A7JCM2', symbology: 'code128'},
    },
    barecodeGroupToken2: {
      1190198454271: {data: '1190198454271', symbology: 'van13Upca'},
      '1PMQ8L2ZD/AZ': {data: '1PMQ8L2ZD/AZ', symbology: 'code128'},
      854830093329285: {data: '854830093329285', symbology: 'code128'},
      NF2LWQ2A7JCMZ: {data: 'NF2LWQ2A7JCMZ', symbology: 'code128'},
    },
  });

  const [testData, setTestData] = useState();

  //clear barcode if barecodeGroupToken is change
  useEffect(() => {
    console.log(barecodeGroupToken);
  }, [barecodeGroupToken]);

  // Update the results when new scans are received via props.
  useEffect(() => {
    const updatedResults = Object.assign({}, consolidatedResults);

    Object.entries(results).map(([key, value]) => {
      if (!updatedResults[key]) {
        updatedResults[key] = {
          ...value,
          symbology: SymbologyDescription(value.symbology)?.readableName,
          itemCount: 1,
        };
      } else {
        updatedResults[key].itemCount += 1;
      }
    });

    setConsolidatedResults(updatedResults);
  }, [results]);

  // Animated value for height.
  const [animatedHeight, setAnimatedHeight] = useState(new Animated.Value(0));

  // Interpolation for height from animatedHeight=0 to animatedHeight=screen_height.
  const interpolatedHeight = animatedHeight.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  // useLayoutEffect ensures this is run right after we obtain the animatedHeight value.
  useLayoutEffect(() => {
    if (show) {
      // If the show property is true, this means we want to show the card, so run the animateIn() function.
      animateIn();
    } else {
      // Else, we want to close it.
      animateOut();
    }
  }, [show]);

  const animateIn = () => {
    Animated.timing(animatedHeight, {
      toValue: 100, // the height value we're going towards
      useNativeDriver: false,
      duration: 250,
      easing: Easing.linear,
    }).start();
  };

  const animateOut = () => {
    let valueToReach = 0;

    if (Object.keys(consolidatedResults).length > 0) {
      valueToReach = 0.3;
    }

    Animated.timing(animatedHeight, {
      toValue: valueToReach, // the height value we're going towards
      useNativeDriver: false,
      duration: 250,
      easing: Easing.linear,
    }).start();
  };

  const title = (numberOfItems) => {
    if (numberOfItems === 0) {
      return <Text style={styles.title}> Add items to your list</Text>;
    } else {
      return <Text style={styles.title}> {numberOfItems} items</Text>;
    }
  };

  const clearButton = (numberOfItems) => {
    if (numberOfItems !== 0) {
      return (
        <TouchableOpacity
          activeOpacity={0.67}
          style={styles.clearButton}
          onPress={() => console.log(consolidatedResults)}>
          <Text>Clear</Text>
        </TouchableOpacity>
      );
    }
    return;
  };

  // Change barecodeGroupToken
  const changeBarecodeGroupToken = () => {
    setBarecodeGroupToken(sha256(Date.now));
  };

  const setBarecodeGroupTokenButton = (numberOfItems) => {
    if (numberOfItems !== 0) {
      return (
        <TouchableOpacity
          activeOpacity={0.67}
          style={styles.clearButton}
          onPress={(e) => onClearPress(e)}>
          <Text> barecodeGroupToken </Text>
        </TouchableOpacity>
      );
    }
    return;
  };

  //
  // const fetchData = () => {
  //   console.log('fetching ...');
  //   return fetch('http://127.0.0.1:3000/admin/mdmb_scans', {
  //     method: 'POST',
  //     format: 'json',
  //     headers: {
  //       Accept: 'application/json',
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify( consolidatedResults),
  //   }),
  //   error: function(xhr,status) { 
  //     console.log(status);
  //   });
  // };

  const fetchData = () => {
    return fetch("http://192.168.0.139:3000/admin/mdmb_scans" , {
     method: 'POST',
     format: 'json',
        headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: consolidatedResults })
   }).then((response) => {
      console.log(response)
      clear();
   })


 }

  const header = (numberOfItems) => (
    <TouchableWithoutFeedback onPress={(e) => onCardPress(e)}>
      <View style={styles.headerContainer}>
        <View style={styles.title}>{title(numberOfItems)}</View>
        <View style={styles.clearButton}>{clearButton(numberOfItems)}</View>
      </View>
    </TouchableWithoutFeedback>
  );

  const addBarcodesButton = () => (
    <TouchableOpacity
      activeOpacity={0.67}
      style={styles.addBarcodesButton}
      onPress={propsSansStyle.onCaptureResults}>
      <ImageBackground
        source={require('./images/fab_add_to_list.png')}
        style={styles.addBarcodesButtonImage}
      />
    </TouchableOpacity>
  );

  const addFetchButton = () => (
    <TouchableOpacity
      activeOpacity={0.67}
      style={styles.addFetchButton}
      onPress={() => fetchData()}>
      <ImageBackground
        source={require('./images/fab_fetch_to_rails.png')}
        style={styles.addBarcodesButtonImage}
      />
    </TouchableOpacity>
  );

  const fetchDataButton = () => (
    <Button title="fetcher" onPress={() => this.fetchData()}></Button>
  );

  const onClearPress = (e) => {
    setConsolidatedResults({});
    propsSansStyle.onClearPress();
  };

  const clear = () => {
    console.log("clear")
    setConsolidatedResults({});
    propsSansStyle.onClearPress();
  };
  const onCardPress = (e) => {
    e.stopPropagation();
    propsSansStyle.onCardPress(e);
  };

  return (
    <View style={{...styles.containerStyle, ...style}}>
      <View style={styles.overlayStyle}>
        <Animated.View style={[styles.cardStyle, {height: interpolatedHeight}]}>
          {header(Object.values(consolidatedResults).length)}
          <ScrollView style={styles.resultsContainer}>
            {Object.values(consolidatedResults).map((entry) => (
              <BarcodeRow key={entry.data} result={entry} />
            ))}
          </ScrollView>
        </Animated.View>
      </View>
      {addBarcodesButton()}
      {addFetchButton()}
    </View>
  );
};
