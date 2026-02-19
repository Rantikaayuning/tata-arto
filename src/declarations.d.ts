/// <reference types="nativewind/types" />

// Helper for asset imports
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.css';

// Augment React Native definitions for NativeWind className support
import 'react-native';
declare module 'react-native' {
    interface ViewProps { className?: string; }
    interface TextProps { className?: string; }
    interface TouchableOpacityProps { className?: string; }
    interface ScrollViewProps { className?: string; }
    interface TextInputProps { className?: string; }
    interface ImageProps { className?: string; }
    interface ImageBackgroundProps { className?: string; }
    interface FlatListProps<ItemT> { className?: string; }
    interface SectionListProps<ItemT> { className?: string; }
    interface ModalProps { className?: string; }
    interface PressableProps { className?: string; }
    interface StatusBarProps { className?: string; }
}

import 'react-native-safe-area-context';
declare module 'react-native-safe-area-context' {
    interface NativeSafeAreaViewProps {
        className?: string;
    }
}
