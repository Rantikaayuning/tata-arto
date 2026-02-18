import React, { useRef } from 'react';
import { View, PanResponder, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const withSwipe = (WrappedComponent, prevRoute, nextRoute) => {
    return (props) => {
        const navigation = useNavigation();

        const panResponder = useRef(
            PanResponder.create({
                onMoveShouldSetPanResponder: (evt, gestureState) => {
                    // Capture horizontal swipes only
                    // Threshold: dx > 20 (avoid minimal touches) and dx > dy (horizontal)
                    const { dx, dy } = gestureState;
                    return Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 20;
                },
                onPanResponderRelease: (evt, gestureState) => {
                    const { dx } = gestureState;
                    const SWIPE_THRESHOLD = 50;

                    if (dx > SWIPE_THRESHOLD && prevRoute) {
                        // Swipe Right -> Go to Prev
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        navigation.navigate(prevRoute);
                    } else if (dx < -SWIPE_THRESHOLD && nextRoute) {
                        // Swipe Left -> Go to Next
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                        navigation.navigate(nextRoute);
                    }
                },
            })
        ).current;

        return (
            <View style={{ flex: 1 }} {...panResponder.panHandlers}>
                <WrappedComponent {...props} />
            </View>
        );
    };
};

export default withSwipe;
