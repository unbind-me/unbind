import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  ScrollView,
  Modal,
  Alert
} from 'react-native';
import { useQuestList } from './QuestListContext';
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { run, responseStr } from "./Wrapper";

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;

// Define appropriate types for the quest items
interface QuestItem {
  [key: string]: string | undefined | number;
  quest?: string;
  progress?: number;
}

const QuestCardDeck = () => {
  const { questList, setQuestList } = useQuestList();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedQuest, setSelectedQuest] = useState<{quest: QuestItem, index: number} | null>(null);
  const position = useRef(new Animated.ValueXY()).current;
  const [showActionText, setShowActionText] = useState('');
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const [glowColor, setGlowColor] = useState('transparent');
  const [isDragging, setIsDragging] = useState(false);
  
  // Map to track progress of each quest
  const [questProgress, setQuestProgress] = useState<Map<number, number>>(new Map());

  // Function to update the progress of a quest
  const updateQuestProgress = (index: number, progress: number) => {
    setQuestProgress(new Map(questProgress.set(index, progress)));
  };

  // Function to remove a quest (mark as complete)
  const completeQuest = (index: number) => {
    const newList = [...questList];
    newList.splice(index, 1);
    setQuestList(newList);
    
    // Remove progress tracking for this quest
    const newProgress = new Map(questProgress);
    newProgress.delete(index);
    setQuestProgress(newProgress);
    
    // Close the modal if this was the selected quest
    if (selectedQuest && selectedQuest.index === index) {
      setSelectedQuest(null);
    }
  };

  // Function to shuffle the quest list
  const shuffleQuests = () => {
    const newList = [...questList];
    for (let i = newList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newList[i], newList[j]] = [newList[j], newList[i]];
    }
    setQuestList(newList);
    setSelectedQuest(null);
  };

  // Function to reset a card to its original position
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 5
    }).start();
    setShowActionText('');
  };

  // Functions to animate swiping in different directions
  const swipeRight = () => {
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete('right'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const swipeLeft = () => {
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete('left'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const swipeUp = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: -SCREEN_HEIGHT - 100 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete('up'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const swipeDown = () => {
    Animated.timing(position, {
      toValue: { x: 0, y: SCREEN_HEIGHT + 100 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete('down'));
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Handle what happens after a swipe is completed
  const onSwipeComplete = async (direction: string) => {
    // Safe check before continuing
    console.log("onSwipeComplete - current index:", currentIndex, "questList length:", questList.length);
    
    // Only do a strict validation for index < 0, not for index >= questList.length
    // since we'll handle that specific case properly in each direction handler
    if (currentIndex < 0) {
      console.error("Invalid currentIndex (negative):", currentIndex);
      return;
    }

    // Make sure we have a valid quest
    if (!questList[currentIndex]) {
      console.error("No quest found at index:", currentIndex);
      return;
    }

    const currentQuest = questList[currentIndex];
    let updatedQuestList = [...questList];
    let newIndex = currentIndex;
    
    // Process based on swipe direction
    if (direction === 'right') {
      console.log('Accepting Quest:', currentQuest);
      // Open the full screen quest view
      setSelectedQuest({quest: currentQuest, index: currentIndex});
    } else if (direction === 'left') {
      console.log('Quest declined:', currentQuest);
      updatedQuestList.splice(currentIndex, 1);
      setQuestList(updatedQuestList);
      
      // Don't increment index when removing items, as the next item will now be at the current index
      // Only adjust index if we've removed the last item and need to go back
      if (currentIndex >= updatedQuestList.length && currentIndex > 0) {
        newIndex = updatedQuestList.length - 1;
      } else if (updatedQuestList.length === 0) {
        // Handle case where we've removed the last quest
        newIndex = 0;
      }
    } else if (direction === 'up') {
      console.log('Quest for later:', currentQuest);
      
      // Special handling for when there's only one card
      if (questList.length > 1) {
        // Move current quest to the end of the list
        updatedQuestList.splice(currentIndex, 1);
        updatedQuestList.push(currentQuest);
        setQuestList(updatedQuestList);
        
        // Stay at current index unless it's now out of bounds
        if (currentIndex >= updatedQuestList.length) {
          newIndex = 0;
        }
      } else {
        // If there's only one card, just keep it where it is
        console.log('Only one card in deck, keeping it in place');
        
        // Force a re-render by creating a new reference
        setQuestList([...questList]);
      }
    } else if (direction === 'down') {
      console.log('Quest to regenerate:', currentQuest);
      try {
        setIsRegenerating(true);
        const questKey = Object.keys(currentQuest)[0];
        const questValue = Object.values(currentQuest)[0] || '';
        const similarQuestPrompt = `Please create a similar alternative to this quest: "${questValue}". Make it different enough to be interesting but with the same general goal or theme. Respond with only the new quest text.`;
        
        console.log('Sending regeneration prompt:', similarQuestPrompt);
        
        // Call AI to regenerate
        await run(similarQuestPrompt);
        
        console.log('Got response from AI:', responseStr);
        
        // Process the response to get the new quest text
        if (responseStr && responseStr.trim()) {
          try {
            let newQuestText;
            
            // Try to parse JSON first
            try {
              const responseJson = JSON.parse(responseStr);
              if (Array.isArray(responseJson) && responseJson.length > 0 && responseJson[0].quest) {
                newQuestText = responseJson[0].quest;
                console.log('Successfully parsed JSON response for regenerated quest:', newQuestText);
              } else {
                // If JSON parsed but didn't have the expected structure, use the raw text
                newQuestText = responseStr.trim();
                console.log('Parsed JSON but using raw text for regenerated quest:', newQuestText);
              }
            } catch (parseError) {
              // If response is not JSON, just use it directly as text
              newQuestText = responseStr.trim();
              console.log('Using raw text for regenerated quest:', newQuestText);
            }
            
            // Update the current quest with the new text
            const updatedQuest = { [questKey]: newQuestText };
            console.log('Updating quest at index', currentIndex, 'with:', updatedQuest);
            
            updatedQuestList[currentIndex] = updatedQuest;
            console.log('New quest list after regeneration:', updatedQuestList);
            
            setQuestList([...updatedQuestList]); // Use spread to ensure a new array reference
          } catch (error) {
            console.error('Error processing regenerated quest:', error);
            Alert.alert('Regeneration Error', 'Failed to process the regenerated quest. Please try again.');
          }
        } else {
          console.error('Empty response from AI');
          Alert.alert('Regeneration Error', 'Received an empty response. Please try again.');
        }
        
        setIsRegenerating(false);
      } catch (error) {
        console.error('Error regenerating quest:', error);
        setIsRegenerating(false);
        Alert.alert('Regeneration Error', 'Failed to regenerate quest. Please try again.');
      }
    }
    
    // Set the new index
    console.log("Setting new index to:", newIndex);
    setCurrentIndex(newIndex);
    
    // Reset position
    position.setValue({ x: 0, y: 0 });
  };

  // Function to regenerate a quest
  const regenerateQuest = async (index: number) => {
    if (isRegenerating) return;
    
    try {
      setIsRegenerating(true);
      const currentQuest = questList[index];
      const questKey = Object.keys(currentQuest)[0];
      const questValue = Object.values(currentQuest)[0] || '';
      const similarQuestPrompt = `Please create a similar alternative to this quest: "${questValue}". Make it different enough to be interesting but with the same general goal or theme. Respond with only the new quest text.`;
      
      console.log('Sending regeneration prompt from modal:', similarQuestPrompt);
      
      // Call AI to regenerate
      await run(similarQuestPrompt);
      
      console.log('Got response from AI in modal:', responseStr);
      
      // Process the response to get the new quest text
      let updatedQuestList = [...questList];
      
      if (responseStr && responseStr.trim()) {
        try {
          let newQuestText;
          
          // Try to parse JSON first
          try {
            const responseJson = JSON.parse(responseStr);
            if (Array.isArray(responseJson) && responseJson.length > 0 && responseJson[0].quest) {
              newQuestText = responseJson[0].quest;
              console.log('Successfully parsed JSON response for regenerated quest in modal:', newQuestText);
            } else {
              // If JSON parsed but didn't have the expected structure, use the raw text
              newQuestText = responseStr.trim();
              console.log('Parsed JSON but using raw text for regenerated quest in modal:', newQuestText);
            }
          } catch (parseError) {
            // If response is not JSON, just use it directly as text
            newQuestText = responseStr.trim();
            console.log('Using raw text for regenerated quest in modal:', newQuestText);
          }
          
          // Update the current quest with the new text
          const updatedQuest = { [questKey]: newQuestText };
          console.log('Updating quest at index', index, 'with:', updatedQuest);
          
          updatedQuestList[index] = updatedQuest;
          console.log('New quest list after regeneration from modal:', updatedQuestList);
          
          setQuestList([...updatedQuestList]); // Use spread to ensure a new array reference
        } catch (error) {
          console.error('Error processing regenerated quest from modal:', error);
          Alert.alert('Regeneration Error', 'Failed to process the regenerated quest. Please try again.');
        }
      } else {
        console.error('Empty response from AI in modal');
        Alert.alert('Regeneration Error', 'Received an empty response. Please try again.');
      }
      
      setIsRegenerating(false);
      
      // Close the modal if this was the selected quest
      if (selectedQuest && selectedQuest.index === index) {
        setSelectedQuest(null);
      }
    } catch (error) {
      console.error('Error regenerating quest from modal:', error);
      setIsRegenerating(false);
      Alert.alert('Regeneration Error', 'Failed to regenerate quest. Please try again.');
    }
  };

  // Helper function to safely get quest description as a string
  const getQuestDescription = (item: QuestItem): string => {
    const value = Object.values(item)[0];
    return typeof value === 'string' ? value : 'No description available';
  };

  // Function to pulsate the glow when swiping
  const animateGlow = (show: boolean) => {
    if (show) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 2.5, // Dramatically increased brightness
            duration: 700,
            useNativeDriver: false,
          }),
          Animated.timing(glowOpacity, {
            toValue: 1.2, // Higher minimum brightness
            duration: 700,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      Animated.timing(glowOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
      glowOpacity.setValue(0);
    }
  };

  // Set up the PanResponder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log("Pan responder grant - starting drag");
        setIsDragging(true);
      },
      onPanResponderMove: (event, gesture) => {
        console.log(`Pan responder move: dx=${gesture.dx}, dy=${gesture.dy}`);
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // Show glow based on swipe direction but don't show text
        if (gesture.dx > SWIPE_THRESHOLD) {
          setGlowColor('#00FF47'); // Neon green for Accept
          animateGlow(true);
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          setGlowColor('#FF0D3D'); // Neon red/pink for Decline
          animateGlow(true);
        } else if (gesture.dy < -SWIPE_THRESHOLD) {
          setGlowColor('#00DDFF'); // Neon cyan/blue for Later
          animateGlow(true);
        } else if (gesture.dy > SWIPE_THRESHOLD) {
          setGlowColor('#FFFC00'); // Neon yellow for Regenerate
          animateGlow(true);
        } else {
          animateGlow(false);
        }
      },
      onPanResponderRelease: (event, gesture) => {
        console.log("Pan responder release - ending drag");
        setIsDragging(false);
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
          animateGlow(false);
        }
      },
      onPanResponderTerminate: () => {
        console.log("Pan responder terminate");
        setIsDragging(false);
        resetPosition();
        animateGlow(false);
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

    // Only use translation from the position, not the layout
    return {
      transform: [
        { translateX: position.x },      // Allow horizontal movement
        { translateY: position.y },      // Allow vertical movement
        { rotate }                      // Allow rotation
      ],
      opacity
    };
  };

  // Render progress buttons for a quest
  const renderProgressButtons = (index: number) => {
    const progressOptions = [25, 50, 75, 100];
    const currentProgress = questProgress.get(index) || 0;
    
    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Progress: {currentProgress}%</Text>
        <View style={styles.progressButtons}>
          {progressOptions.map((progress) => (
            <TouchableOpacity
              key={`progress-${progress}`}
              style={[
                styles.progressButton,
                currentProgress >= progress && styles.progressButtonActive
              ]}
              onPress={() => updateQuestProgress(index, progress)}
            >
              <Text style={styles.progressButtonText}>{progress}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Render a single quest card
  const renderCard = (item: QuestItem, index: number) => {
    // Skip invalid indices
    if (index < 0 || index >= questList.length) {
      console.log(`Skipping invalid card at index ${index}`);
      return null;
    }
    
    // Special case for regenerating cards
    if (isRegenerating && index === currentIndex) {
      console.log(`Showing loading card for regeneration at index ${index}`);
      return (
        <View style={styles.cardContainer} key={`loading-${index}`}>
          <View style={[styles.card, styles.loadingCard]}>
            <Text style={styles.questTitle}>Regenerating Quest...</Text>
            <ActivityIndicator size="large" color="#fff" style={styles.loader} />
            <Text style={styles.loadingText}>AI is creating a similar quest</Text>
          </View>
        </View>
      );
    }
    
    // Calculate how far this card is from the current index
    const cardOffset = index - currentIndex;
    
    // Calculate offset for stacked appearance
    const yOffset = cardOffset * 15; // More noticeable offset
    const zIndex = 999 - cardOffset; // Give higher cards higher z-index
    const scale = 1 - (cardOffset * 0.07); // Scale down background cards more
    
    if (index === currentIndex) {
      console.log(`Rendering current card at index ${index}: ${JSON.stringify(item)}`);
      return (
        <Animated.View
          key={`card-${index}`}
          style={[
            styles.cardContainer, 
            getCardStyle(),
            { zIndex: 1000 }, // Current card always on top
            isDragging && styles.draggingCard
          ]}
          {...panResponder.panHandlers}
        >
          {/* Multi-layered glow effect for more dramatic neon appearance */}
          <Animated.View 
            style={[
              styles.cardGlowOuter,
              { 
                backgroundColor: glowColor,
                opacity: Animated.multiply(glowOpacity, 0.4),
              }
            ]} 
          />
          <Animated.View 
            style={[
              styles.cardGlow,
              { 
                backgroundColor: glowColor,
                opacity: glowOpacity,
                shadowColor: glowColor,
                shadowRadius: Animated.multiply(glowOpacity, 30),
                elevation: Animated.multiply(glowOpacity, 35)
              }
            ]} 
          />
          
          <View style={styles.card}>
            <Text style={styles.questTitle}>Quest {index + 1}</Text>
            <Text style={styles.questDescription}>
              {getQuestDescription(item)}
            </Text>
            
            <View style={styles.swipeInstructions}>
              <View style={styles.swipeInstructionItem}>
                <Ionicons name="arrow-back" size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.swipeText}>Decline</Text>
              </View>
              <View style={styles.swipeInstructionItem}>
                <Ionicons name="arrow-up" size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.swipeText}>Later</Text>
              </View>
              <View style={styles.swipeInstructionItem}>
                <Ionicons name="arrow-down" size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.swipeText}>Refresh</Text>
              </View>
              <View style={styles.swipeInstructionItem}>
                <Ionicons name="arrow-forward" size={16} color="rgba(255, 255, 255, 0.5)" />
                <Text style={styles.swipeText}>Accept</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      );
    } else {
      // Background cards
      console.log(`Rendering background card at index ${index}`);
      return (
        <View
          key={`card-${index}`}
          style={[
            styles.cardContainer,
            {
              zIndex,
              transform: [
                { translateY: yOffset },
                { scale }
              ]
            }
          ]}
        >
          <View style={[styles.card, styles.backgroundCard]}>
            <Text style={styles.questTitle}>Quest {index + 1}</Text>
            <Text style={[styles.questDescription, styles.backgroundText]}>
              {getQuestDescription(item)}
            </Text>
          </View>
        </View>
      );
    }
  };

  const [modalVisible, setModalVisible] = useState(false);
  const modalY = useRef(new Animated.Value(0)).current;
  
  // Add a panResponder for the modal
  const modalPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (event, gesture) => {
        // Only allow downward dragging
        if (gesture.dy > 0) {
          modalY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (event, gesture) => {
        if (gesture.dy > SCREEN_HEIGHT * 0.2) {
          // Dismiss the modal if dragged down more than 20% of screen height
          Animated.timing(modalY, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: false,
          }).start(() => {
            setSelectedQuest(null);
            modalY.setValue(0);
          });
        } else {
          // Snap back to original position
          Animated.spring(modalY, {
            toValue: 0,
            useNativeDriver: false,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  // Render the full-screen quest view as a modal
  const renderQuestModal = () => {
    if (!selectedQuest) return null;
    
    const { quest, index } = selectedQuest;
    const progress = questProgress.get(index) || 0;
    const isComplete = progress === 100;
    
    return (
      <Modal
        visible={!!selectedQuest}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedQuest(null)}
      >
        <Animated.View 
          style={[
            styles.modalContainer,
            { transform: [{ translateY: modalY }] }
          ]}
        >
          <View style={styles.dragBar}>
            <View style={styles.dragIndicator} />
          </View>
          
          <View style={styles.modalHeader} {...modalPanResponder.panHandlers}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setSelectedQuest(null)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quest {index + 1}</Text>
            <TouchableOpacity 
              style={styles.shuffleButtonSmall}
              onPress={shuffleQuests}
            >
              <Ionicons name="shuffle" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <View style={[
              styles.questCardLarge, 
              isComplete && styles.completedCard
            ]}>
              <Text style={styles.questDescriptionLarge}>
                {getQuestDescription(quest)}
              </Text>
            </View>
            
            {renderProgressButtons(index)}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.regenerateButton]}
                onPress={() => regenerateQuest(index)}
                disabled={isRegenerating}
              >
                <Ionicons name="refresh-outline" size={24} color="#ffbb33" />
                <Text style={styles.modalButtonText}>Regenerate</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.completeButton]}
                onPress={() => {
                  completeQuest(index);
                  setSelectedQuest(null);
                }}
              >
                <Ionicons name="checkmark-circle-outline" size={24} color="#3dad35" />
                <Text style={styles.modalButtonText}>
                  {isComplete ? 'Complete Quest' : 'Remove Quest'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Modal>
    );
  };

  // Render a message when there are no quests
  const renderNoMoreCards = () => (
    <View style={styles.noMoreCardsContainer}>
      <Text style={styles.noMoreCardsText}>Your quest list is empty</Text>
      <Text style={styles.noMoreCardsSubText}>Add items to your list and we'll generate quests for you</Text>
      
      {/* Indicator pointing to the collapsible button at the top */}
      <View style={styles.pointerContainer}>
        <Ionicons name="arrow-up" size={30} color="#fff" style={styles.pointerIcon} />
        <Text style={styles.pointerText}>Tap the button on top to add items.</Text>
      </View>
    </View>
  );

  // Make sure currentIndex is valid whenever questList changes
  useEffect(() => {
    console.log("questList changed, length:", questList.length, "currentIndex:", currentIndex);
    
    if (questList.length === 0) {
      console.log("Setting currentIndex to 0 (empty list)");
      setCurrentIndex(0);
    } else if (currentIndex >= questList.length) {
      console.log(`currentIndex (${currentIndex}) is out of bounds, adjusting to ${questList.length - 1}`);
      setCurrentIndex(questList.length - 1);
    } else {
      console.log(`currentIndex (${currentIndex}) is valid for questList length ${questList.length}`);
    }
  }, [questList]);

  // Check if there are any quests to display - simplified logic
  const hasQuests = questList.length > 0;
  console.log("Rendering quest deck, hasQuests:", hasQuests, "questList:", JSON.stringify(questList));

  return (
    <View style={styles.container}>
      {renderQuestModal()}
      
      {isRegenerating && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Generating new quest...</Text>
        </View>
      )}
      
      <View style={styles.cardsContainer}>
        {hasQuests ? (
          // Render current card and background cards
          <>
            {/* Render background cards first (lower z-index) */}
            {questList.map((item, index) => {
              // Only render background cards, not the current one
              if (index !== currentIndex && index >= currentIndex && index < currentIndex + 3) {
                return renderCard(item, index);
              }
              return null;
            })}
            
            {/* Render the current card on top */}
            {renderCard(questList[currentIndex], currentIndex)}
          </>
        ) : (
          renderNoMoreCards()
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#272727',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',     // Center vertically
    alignItems: 'center',         // Center horizontally
    position: 'relative',
  },
  cardContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 20,
    // Center in the middle of the screen
    left: (SCREEN_WIDTH - SCREEN_WIDTH * 0.85) / 2,
    top: (SCREEN_HEIGHT - SCREEN_WIDTH * 1.2) / 2,
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
  },
  backgroundCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    opacity: 0.8,
  },
  backgroundText: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  questTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
    textAlign: 'center',
  },
  questDescription: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionTextContainer: {
    position: 'absolute',
    top: 20,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    marginBottom: 40,
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
    padding: 30,
    backgroundColor: 'transparent',
    borderRadius: 20,
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 400,
  },
  noCardsIcon: {
    marginBottom: 20,
    opacity: 0.7,
  },
  noMoreCardsText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  noMoreCardsSubText: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  pointerContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 15,
    borderRadius: 15,
    width: '100%',
  },
  pointerIcon: {
    marginBottom: 10,
    color: '#3dad35',
  },
  pointerText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingCard: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginVertical: 15,
  },
  loadingText: {
    fontSize: 16,
    color: '#b0b0b0',
    textAlign: 'center',
    marginTop: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#272727',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#1e1e1e',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  shuffleButtonSmall: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  questCardLarge: {
    backgroundColor: '#0b0b0b',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    minHeight: 200,
    justifyContent: 'center',
  },
  completedCard: {
    backgroundColor: 'rgba(61, 173, 53, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(61, 173, 53, 0.4)',
  },
  questDescriptionLarge: {
    fontSize: 22,
    color: '#ffffff',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 32,
  },
  progressContainer: {
    marginVertical: 20,
    backgroundColor: '#0b0b0b',
    borderRadius: 15,
    padding: 20,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 18,
    marginBottom: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
  progressButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  progressButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  progressButtonActive: {
    backgroundColor: 'rgba(61, 173, 53, 0.3)',
  },
  progressButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtons: {
    marginTop: 20,
    gap: 15,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  regenerateButton: {
    backgroundColor: 'rgba(255, 187, 51, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 187, 51, 0.4)',
  },
  completeButton: {
    backgroundColor: 'rgba(61, 173, 53, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(61, 173, 53, 0.4)',
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 10,
  },
  dragBar: {
    width: '100%',
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e1e1e',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardGlowOuter: {
    position: 'absolute',
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 40,
    zIndex: -2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 40,
  },
  cardGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 30,
    zIndex: -1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 25,
    elevation: 30,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swipeInstructions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  swipeInstructionItem: {
    alignItems: 'center',
  },
  swipeText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    marginTop: 4,
  },
  draggingCard: {
    position: 'absolute',
    zIndex: 1000,
  },
});

export default QuestCardDeck;

