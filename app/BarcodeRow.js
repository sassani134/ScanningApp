import React from 'react';
import {
    ImageBackground,
    Text,
    View,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import { useState } from 'react/cjs/react.development';

import { styles } from './styles';

export const BarcodeRow = ({ result = {} }) => {
    const { data, symbology } = result;

    const [count, setcount] = useState(result.itemCount);

    const updateValue = (x) => {
        console.log(x);
        console.log(typeof(x));
        setcount(x);
        result.itemCount = x
    }
    const minusButton = () => {
        console.log(result);
        if(result.itemCount <= 0){
            console.log('faut plus que je m affiche');
        } else {
            result.itemCount = result.itemCount - 1;
        }
        console.log('-1');
    }
    //
    const plusButton = () => {
        console.log(result);
    }
    return (
        <View style={styles.result}>
            <ImageBackground source={require('./images/barcode_black.png')} style={styles.resultImage} />

            <View style={styles.resultDataContainer}>
                <Text style={styles.resultSymbology}>{symbology}</Text>
                <Text style={styles.resultData}>{data}</Text>

                <View style={styles.resultStockContainer}>
                    <View style={styles.resultStockCircle}>
                        <TouchableOpacity onPress={minusButton}>
                            <Text style={styles.resultStockCircleText}>-</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput 
                        style={styles.input}
                        keyboardType='number-pad'
                        onChangeText={x => updateValue(x)}
                        value={result.itemCount.toString()}
                    />
                    <View style={styles.resultStockCircle}>
                    <TouchableOpacity onPress={plusButton}>
                        <Text style={styles.resultStockCircleText}>+</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    )
}