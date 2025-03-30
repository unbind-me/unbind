import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native';
import { useQuestList } from './QuestListContext';
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;

// Define appropriate types for the quest items
interface QuestItem {
  [key: string]: string;
}

const QuestCardDeck = () => {
  const { questList, setQuestList } = useQuestList();
  const [currentIndex, setCurrentIndex] = useState(0);
  const position = useRef(new Animated.ValueXY()).current;
  const [showActionText, setShowActionText] = useState('');
  
  // Function to reset a card to its original position
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true,
      friction: 5
    }).start();
    setShowActionText('');
  };

  // Functions to animate swiping in different directions
  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true
    }).start(() => onSwipeComplete('right'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true
    }).start(() => onSwipeComplete('left'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const swipeUp = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: -SCREEN_HEIGHT - 100 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true
    }).start(() => onSwipeComplete('up'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const swipeDown = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: SCREEN_HEIGHT + 100 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true
    }).start(() => onSwipeComplete('down'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Handle what happens after a swipe is completed
  const onSwipeComplete = (direction: string) => {
    // Create a copy of the quest list without the swiped quest
    const updatedQuestList = [...questList];
    
    // Process based on swipe direction
    if (direction === 'right') {
      console.log('Quest accepted:', questList[currentIndex]);
      // Here you would handle accepting the quest
    } else if (direction === 'left') {
      console.log('Quest declined:', questList[currentIndex]);
      // Here you would handle declining the quest
    } else if (direction === 'up') {
      console.log('Quest for later:', questList[currentIndex]);
      // Here you would handle saving the quest for later
    } else if (direction === 'down') {
      console.log('Quest to regenerate:', questList[currentIndex]);
      // Here you would handle regenerating the quest
    }
    
    // Remove the current quest from the list
    updatedQuestList.splice(currentIndex, 1);
    setQuestList(updatedQuestList);
    
    // Reset position for the next card
    position.setValue({ x: 0, y: 0 });
    
    // If we've removed the last item, keep the index at 0
    if (currentIndex >= updatedQuestList.length) {
      setCurrentIndex(0);
    }
  };

  // Set up the PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // Show action text based on swipe direction
        if (gesture.dx > SWIPE_THRESHOLD) {
          setShowActionText('Accept');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          setShowActionText('Decline');
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          setShowActionText('Do Later');
        } else if (gesture.dy > SWIPE_THRESHOLD) {
          setShowActionText('Regenerate');
        } else {
          setShowActionText('');
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeRight();
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeLeft();
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          swipeUp();
        } else if (gesture.dy > SWIPE_THRESHOLD) {
          swipeDown();
        } else {
          resetPosition();
        }
      }
    })
  ).current;

  // Helper functions to render the card rotation and opacity
  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
      outputRange: ['-30deg', '0deg', '30deg']
    });

    const opacity = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH * 0.5, 0, SCREEN_WIDTH * 0.5],
      outputRange: [0.5, 1, 0.5]
    });

    return {
      ...position.getLayout(),
      transform: [{ rotate }],
      opacity
    };
  };

  // Helper function to safely get quest description as a string
  const getQuestDescription = (item: QuestItem): string => {
    const value = Object.values(item)[0];
    return typeof value === 'string' ? value : 'No description available';
  };

  // Render a single quest card
  const renderCard = (item: QuestItem, index: number) => {
    if (index !== currentIndex) return null;
    
    return (
      <Animated.View
        key={index}
        style={[styles.cardContainer, getCardStyle()]}
        {...panResponder.panHandlers}
      >
        <View style={styles.card}>
          <Text style={styles.questTitle}>Quest {index + 1}</Text>
          <Text style={styles.questDescription}>
            {getQuestDescription(item)}
          </Text>
          {showActionText ? (
            <View style={styles.actionTextContainer}>
              <Text style={styles.actionText}>{showActionText}</Text>
            </View>
          ) : null}
        </View>
      </Animated.View>
    );
  };

  // Render buttons for manual swiping
  const renderButtons = () => (
    <View style={styles.buttonsContainer}>
      <TouchableOpacity style={styles.button} onPress={swipeLeft}>
        <Ionicons name="close-circle" size={50} color="#ff4343" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={swipeDown}>
        <Ionicons name="refresh-circle" size={50} color="#ffbb33" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={swipeUp}>
        <Ionicons name="time-outline" size={50} color="#5c5cff" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={swipeRight}>
        <Ionicons name="checkmark-circle" size={50} color="#3dad35" />
      </TouchableOpacity>
    </View>
  );

  // Render a message when there are no quests
  const renderNoMoreCards = () => (
    <View style={styles.noMoreCardsContainer}>
      <Text style={styles.noMoreCardsText}>No more quests!</Text>
      <Text style={styles.noMoreCardsSubText}>Add items to your list and generate more quests.</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quest Deck</Text>
      <View style={styles.cardsContainer}>
        {questList.length > 0 
          ? questList.map((item, index) => renderCard(item, index))
          : renderNoMoreCards()
        }
      </View>
      {questList.length > 0 && renderButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: 20,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0b0b0b',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  questDescription: {
    fontSize: 18,
    color: '#b0b0b0',
    textAlign: 'center',
  },
  actionTextContainer: {
    position: 'absolute',
    top: 30,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
  },
  actionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
  },
  button: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  noMoreCardsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noMoreCardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  noMoreCardsSubText: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
  },
});

export default QuestCardDeck;

