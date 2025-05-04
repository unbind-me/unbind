import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  PanResponderGestureState,
  GestureResponderEvent,
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Helper to ensure type compatibility 
const ensureQuestTypeCompatibility = (quest: QuestItem): any => {
  // Force the type to match what the array expects
  return quest;
};

// Storage keys
const STORAGE_KEYS = {
  QUESTS: 'unbind_quests',
  QUEST_PROGRESS: 'unbind_quest_progress',
  CURRENT_INDEX: 'unbind_current_index',
  FOCUSED_QUEST: 'unbind_focused_quest'
};

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Map to track progress of each quest
  const [questProgress, setQuestProgress] = useState<Map<number, number>>(new Map());

  // Load stored data on component mount
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        setIsLoading(true);
        
        // Load quests
        const storedQuests = await AsyncStorage.getItem(STORAGE_KEYS.QUESTS);
        if (storedQuests) {
          const parsedQuests = JSON.parse(storedQuests);
          console.log('Loaded quests from storage:', parsedQuests);
          setQuestList(parsedQuests);
        } else {
          // No demo quests - just set an empty list
          console.log('No quests found in storage, starting with empty list');
          setQuestList([]);
        }
        
        // Load progress
        const storedProgress = await AsyncStorage.getItem(STORAGE_KEYS.QUEST_PROGRESS);
        if (storedProgress) {
          const parsedProgress = JSON.parse(storedProgress);
          // Convert the array back to a Map with proper types
          const progressMap = new Map<number, number>();
          parsedProgress.forEach((entry: [string, number]) => {
            progressMap.set(Number(entry[0]), entry[1]);
          });
          console.log('Loaded progress from storage:', parsedProgress);
          setQuestProgress(progressMap);
        }
        
        // Load current index
        const storedIndex = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_INDEX);
        if (storedIndex) {
          const parsedIndex = JSON.parse(storedIndex);
          console.log('Loaded current index from storage:', parsedIndex);
          setCurrentIndex(parsedIndex);
        }
        
        // Check if we have a focused quest
        const focusedQuest = await AsyncStorage.getItem(STORAGE_KEYS.FOCUSED_QUEST);
        if (focusedQuest) {
          const parsedFocusedQuest = JSON.parse(focusedQuest);
          console.log('Found focused quest in storage:', parsedFocusedQuest);
          
          // Ask user if they want to resume the focused quest
          Alert.alert(
            "Resume Focused Quest?",
            "You were working on a quest. Would you like to continue?",
            [
              {
                text: "No, Start Fresh",
                onPress: () => {
                  console.log('User chose to start fresh');
                  AsyncStorage.removeItem(STORAGE_KEYS.FOCUSED_QUEST);
                }
              },
              {
                text: "Yes, Continue",
                onPress: () => {
                  console.log('Resuming focused quest');
                  setSelectedQuest(parsedFocusedQuest);
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStoredData();
  }, []);
  
  // Save quests to AsyncStorage whenever they change
  useEffect(() => {
    const saveQuests = async () => {
      try {
        console.log('Saving quests to storage:', questList);
        await AsyncStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(questList));
      } catch (error) {
        console.error('Error saving quests to AsyncStorage:', error);
      }
    };
    
    if (!isLoading) {
      saveQuests();
    }
  }, [questList, isLoading]);
  
  // Save current index to AsyncStorage
  useEffect(() => {
    const saveIndex = async () => {
      try {
        console.log('Saving current index to storage:', currentIndex);
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_INDEX, JSON.stringify(currentIndex));
      } catch (error) {
        console.error('Error saving current index to AsyncStorage:', error);
      }
    };
    
    if (!isLoading) {
      saveIndex();
    }
  }, [currentIndex, isLoading]);
  
  // Save progress to AsyncStorage
  useEffect(() => {
    const saveProgress = async () => {
      try {
        const progressArray = Array.from(questProgress.entries());
        console.log('Saving progress to storage:', progressArray);
        await AsyncStorage.setItem(STORAGE_KEYS.QUEST_PROGRESS, JSON.stringify(progressArray));
      } catch (error) {
        console.error('Error saving progress to AsyncStorage:', error);
      }
    };
    
    if (!isLoading) {
      saveProgress();
    }
  }, [questProgress, isLoading]);

  // Function to update the progress of a quest
  const updateQuestProgress = (index: number, progress: number) => {
    console.log(`Updating progress for quest ${index} to ${progress}%`);
    // Create a new map to ensure re-render
    const newProgress = new Map(questProgress);
    newProgress.set(index, progress);
    setQuestProgress(newProgress);
    
    // Provide haptic feedback when progress changes
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Auto-mark as complete if 100%
    if (progress === 100) {
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  // Function to remove a quest (mark as complete)
  const completeQuest = (index: number) => {
    if (index < 0 || index >= questList.length) {
      console.error('Invalid index for completing quest:', index);
      return;
    }
    
    const newList = [...questList];
    newList.splice(index, 1);
    setQuestList(newList);
    
    // Remove progress tracking for this quest
    const newProgress = new Map(questProgress);
    newProgress.delete(index);
    setQuestProgress(newProgress);
    
    // Also clear the focused quest storage
    AsyncStorage.removeItem(STORAGE_KEYS.FOCUSED_QUEST)
      .then(() => console.log('Removed focused quest from storage after completion'))
      .catch(error => console.error('Error removing focused quest from storage:', error));
    
    // Close the modal if this was the selected quest
    if (selectedQuest && selectedQuest.index === index) {
      setSelectedQuest(null);
    }
    
    // Give success haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  // Create a function to handle accepting quests (used by both button and swipe)
  const handleAcceptQuest = (index: number) => {
    console.log('Handling quest acceptance for index:', index);
    
    // Make sure the index is valid
    if (index < 0 || index >= questList.length) {
      console.error('Invalid index for accepting quest:', index);
      return;
    }
    
    // Get the quest and create a copy
    const item = questList[index];
    const questCopy = JSON.parse(JSON.stringify(item));
    console.log('Accepting quest:', JSON.stringify(questCopy));
    
    // Save to AsyncStorage
    AsyncStorage.setItem(STORAGE_KEYS.FOCUSED_QUEST, JSON.stringify({
      quest: questCopy,
      index: index
    }));
    
    // Set the selected quest to open the modal
    setSelectedQuest({
      quest: questCopy,
      index: index
    });
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Handler for declining quests (used by both button and swipe)
  const handleDeclineQuest = (index: number) => {
    console.log('Handling quest decline for index:', index);
    
    // Make sure the index is valid
    if (index < 0 || index >= questList.length) {
      console.error('Invalid index for declining quest:', index);
      return;
    }
    
    // Remove the current quest from the list
    const updatedQuestList = [...questList];
    updatedQuestList.splice(index, 1);
    
    // Adjust index if needed
    let newIndex = index;
    if (index >= updatedQuestList.length && index > 0) {
      newIndex = updatedQuestList.length - 1;
    } else if (updatedQuestList.length === 0) {
      newIndex = 0;
    }
    
    // Update the quest list and index
    setQuestList(updatedQuestList);
    setCurrentIndex(newIndex);
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handler for "Later" action (used by both button and swipe)
  const handleLaterQuest = (index: number) => {
    console.log('Handling quest for later, index:', index);
    
    // Make sure the index is valid
    if (index < 0 || index >= questList.length) {
      console.error('Invalid index for later quest:', index);
      return;
    }
    
    // Only reshuffle if there's more than one card
    if (questList.length > 1) {
      const currentQuest = questList[index];
      const updatedQuestList = [...questList];
      updatedQuestList.splice(index, 1);
      
      // Insert at random position (not the current position)
      const randomIndex = Math.floor(Math.random() * updatedQuestList.length);
      updatedQuestList.splice(randomIndex, 0, ensureQuestTypeCompatibility(currentQuest));
      
      // Update the quest list
      setQuestList(updatedQuestList);
    }
    
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Functions to animate swiping in different directions
  const swipeRight = () => {
    console.log('Initiating swipe right animation');
    Animated.timing(position, {
      toValue: { x: SCREEN_WIDTH + 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      console.log('Swipe right animation complete');
      // Call the same handler as the accept button
      handleAcceptQuest(currentIndex);
      
      // Reset position
      position.setValue({ x: 0, y: 0 });
    });
  };

  // Update the swipe functions to use the shared handlers
  const swipeLeft = () => {
    console.log('Initiating swipe left animation');
    Animated.timing(position, {
      toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      console.log('Swipe left animation complete');
      // Call the same handler as the decline button
      handleDeclineQuest(currentIndex);
      
      // Reset position
      position.setValue({ x: 0, y: 0 });
    });
  };

  // Add the missing swipe up function for "later" action
  const swipeUp = () => {
    console.log('Initiating swipe up animation');
    Animated.timing(position, {
      toValue: { x: 0, y: -SCREEN_HEIGHT - 100 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      console.log('Swipe up animation complete');
      // Call the same handler as the later button
      handleLaterQuest(currentIndex);
      
      // Reset position
      position.setValue({ x: 0, y: 0 });
    });
  };

  // Add the missing swipe down function for "regenerate" action
  const swipeDown = () => {
    console.log('Initiating swipe down animation');
    Animated.timing(position, {
      toValue: { x: 0, y: SCREEN_HEIGHT + 100 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => {
      console.log('Swipe down animation complete');
      // Call the regenerate function
      regenerateCurrentQuest();
      
      // Reset position
      position.setValue({ x: 0, y: 0 });
    });
  };

  // Update the button handlers in renderCard to use the shared functions
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
    
    console.log(`Rendering card at index ${index}: ${JSON.stringify(item)}`);
    return (
      <View
        key={`card-${index}`}
        style={styles.cardContainer}
      >
        <Animated.View 
          style={[
            styles.card,
            getCardStyle(),
            isDragging && styles.draggingCard
          ]}
          {...panResponder.panHandlers}
        >
          {/* Multi-layered glow effect for swiping */}
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
          
          {/* Card content */}
          <Text style={styles.questTitle}>Quest {index + 1}</Text>
          <Text style={styles.questDescription}>
            {getQuestDescription(item)}
          </Text>
          
          {/* All buttons stacked vertically in the specified order */}
          <View style={styles.allButtonsContainer}>
            <TouchableOpacity 
              style={[styles.buttonEqual, styles.acceptButton]}
              onPress={() => {
                console.log('Accept button pressed for index', index);
                handleAcceptQuest(index);
              }}
            >
              <Ionicons name="checkmark-outline" size={24} color="#00FF47" />
              <Text style={styles.buttonText}>Accept</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buttonEqual, styles.declineButton]}
              onPress={() => {
                console.log('Decline button pressed for index', index);
                handleDeclineQuest(index);
              }}
            >
              <Ionicons name="close-outline" size={24} color="#FF0D3D" />
              <Text style={styles.buttonText}>Decline</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buttonEqual, styles.laterButton]}
              onPress={() => {
                console.log('Later button pressed for index', index);
                handleLaterQuest(index);
              }}
            >
              <Ionicons name="time-outline" size={24} color="#00DDFF" />
              <Text style={styles.buttonText}>Later</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.buttonEqual, styles.refreshButton]}
              onPress={() => {
                console.log('Regenerate button pressed for index', index);
                regenerateCurrentQuest();
              }}
            >
              <Ionicons name="refresh-outline" size={24} color="#FFFC00" />
              <Text style={styles.buttonText}>Refresh</Text>
            </TouchableOpacity>
          </View>
          
          {/* Hint text for swipe gestures */}
          <Text style={styles.swipeHint}>
            You can also swipe to interact with this quest
          </Text>
        </Animated.View>
      </View>
    );
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
    if (!selectedQuest) {
      console.log('No selected quest, not showing modal');
      return null;
    }
    
    const { quest, index } = selectedQuest;
    console.log('Rendering modal for quest:', JSON.stringify(quest), 'at index', index);
    
    const progress = questProgress.get(index) || 0;
    const isComplete = progress === 100;
    
    // Make sure we have a valid quest description to display
    const questDescription = getQuestDescription(quest);
    console.log('Quest description for modal:', questDescription);
    
    return (
      <Modal
        visible={true}
        animationType="slide"
        transparent={false}
        onRequestClose={() => {
          console.log('Modal close requested');
          setSelectedQuest(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => {
                console.log('Close button pressed');
                setSelectedQuest(null);
              }}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Current Quest</Text>
            <View style={{width: 40}} />
          </View>
          
          <View style={styles.modalContent}>
            <View style={[
              styles.questCardLarge, 
              isComplete && styles.completedCard
            ]}>
              <Text style={styles.questDescriptionLarge}>
                {questDescription}
              </Text>
            </View>
            
            {/* Progress buttons */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Progress: {progress}%</Text>
              <View style={styles.progressButtons}>
                {[25, 50, 75, 100].map((progressValue) => (
                  <TouchableOpacity
                    key={`progress-${progressValue}`}
                    style={[
                      styles.progressButton,
                      progress >= progressValue && styles.progressButtonActive
                    ]}
                    onPress={() => updateQuestProgress(index, progressValue)}
                  >
                    <Text style={styles.progressButtonText}>{progressValue}%</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.modalButtons}>
              {/* Complete button (only shown when progress is 100%) */}
              {progress === 100 && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.completeButton]}
                  onPress={() => {
                    console.log('Complete button pressed');
                    completeQuest(index);
                  }}
                >
                  <Ionicons name="checkmark-circle-outline" size={24} color="#3dad35" />
                  <Text style={styles.modalButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              )}
              
              {/* Later button (always visible) */}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalLaterButton]}
                onPress={() => {
                  console.log('Later button pressed in modal');
                  // Move quest back to deck randomly
                  if (index >= 0 && index < questList.length) {
                    const updatedQuestList = [...questList];
                    updatedQuestList.splice(index, 1);
                    
                    // Make sure we have a valid list to insert into
                    if (updatedQuestList.length > 0) {
                      const randomIndex = Math.floor(Math.random() * updatedQuestList.length);
                      // Type-safe insertion
                      updatedQuestList.splice(randomIndex, 0, ensureQuestTypeCompatibility(quest));
                    } else {
                      // If the list is empty after removing, just add it back
                      updatedQuestList.push(ensureQuestTypeCompatibility(quest));
                    }
                    
                    setQuestList(updatedQuestList);
                    
                    // Clear the focused quest from storage
                    AsyncStorage.removeItem(STORAGE_KEYS.FOCUSED_QUEST);
                  } else {
                    console.error("Invalid index when trying to reshuffle:", index);
                  }
                  
                  setSelectedQuest(null);
                }}
              >
                <Ionicons name="time-outline" size={24} color="#00DDFF" />
                <Text style={styles.modalButtonText}>Do Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
        <Text style={styles.pointerText}>Tap the ▼ button on top to add items.</Text>
      </View>
    </View>
  );

  // Make sure currentIndex is valid whenever questList changes
  useEffect(() => {
    console.log("questList changed, length:", questList.length, "currentIndex:", currentIndex);
    
    if (questList.length === 0) {
      console.log("Setting currentIndex to 0 (empty list)");
      setCurrentIndex(0);
      // If list is empty, close the modal if open
      if (selectedQuest) {
        console.log("Closing quest modal because list is now empty");
        setSelectedQuest(null);
      }
    } else if (currentIndex >= questList.length) {
      console.log(`currentIndex (${currentIndex}) is out of bounds, adjusting to ${questList.length - 1}`);
      setCurrentIndex(questList.length - 1);
    } else {
      console.log(`currentIndex (${currentIndex}) is valid for questList length ${questList.length}`);
    }
  }, [questList]);

  // Add an effect to console.log when selectedQuest changes
  useEffect(() => {
    if (selectedQuest) {
      console.log("Selected quest changed:", JSON.stringify(selectedQuest.quest), "at index", selectedQuest.index);
    } else {
      console.log("Selected quest cleared");
    }
  }, [selectedQuest]);

  // Add debug logging for quests and progress
  useEffect(() => {
    console.log("Quest progress map updated:", Array.from(questProgress.entries()));
  }, [questProgress]);

  // Check if there are any quests to display - simplified logic
  const hasQuests = questList.length > 0;
  console.log("Rendering quest deck, hasQuests:", hasQuests, "questList:", JSON.stringify(questList));

  // Render loading state
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.loadingText}>Loading your quests...</Text>
    </View>
  );

  // Add a function to clear storage (useful for debugging)
  const clearStorage = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.QUESTS,
        STORAGE_KEYS.QUEST_PROGRESS,
        STORAGE_KEYS.CURRENT_INDEX
      ]);
      console.log('Storage cleared');
      Alert.alert('Storage Cleared', 'All quests and progress have been reset.');
      // Reload the app or reset state
      setQuestList([]);
      setQuestProgress(new Map());
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  // Add a separate function for regenerating quests to simplify the main swipe handler
  const regenerateCurrentQuest = async () => {
    if (currentIndex < 0 || currentIndex >= questList.length) {
      console.error("Invalid current index for regeneration");
      return;
    }
    
    const currentQuest = questList[currentIndex];
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
          // Use the raw text directly for simplicity
          const newQuestText = responseStr.trim();
          
          // Update the current quest with the new text
          const updatedQuest = { [questKey]: newQuestText };
          console.log('Updating quest at index', currentIndex, 'with:', updatedQuest);
          
          // Update the quest list
          const updatedQuestList = [...questList];
          updatedQuestList[currentIndex] = updatedQuest;
          setQuestList(updatedQuestList);
        } catch (error) {
          console.error('Error processing regenerated quest:', error);
          Alert.alert('Regeneration Error', 'Failed to process the regenerated quest. Please try again.');
        }
      } else {
        console.error('Empty response from AI');
        Alert.alert('Regeneration Error', 'Received an empty response. Please try again.');
      }
    } catch (error) {
      console.error('Error regenerating quest:', error);
      Alert.alert('Regeneration Error', 'Failed to regenerate quest. Please try again.');
    } finally {
      setIsRegenerating(false);
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

  // Set up the PanResponder with proper type definitions
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        console.log("Pan responder grant - starting drag");
        setIsDragging(true);
      },
      onPanResponderMove: (event: GestureResponderEvent, gesture: PanResponderGestureState) => {
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
      onPanResponderRelease: (event: GestureResponderEvent, gesture: PanResponderGestureState) => {
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

  // Render current card and background cards
  const renderCards = () => {
    if (!hasQuests) {
      return renderNoMoreCards();
    }

    // Only render the current card
    if (currentIndex >= 0 && currentIndex < questList.length) {
      return renderCard(questList[currentIndex], currentIndex);
    }
    return null;
  };

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
        {isLoading ? renderLoading() : renderCards()}
      </View>
      
      {/* Debug button - long press to clear storage */}
      <TouchableOpacity
        style={styles.debugButton}
        onLongPress={() => {
          console.log('Debug button long pressed');
          Alert.alert(
            'Debug Options',
            'What would you like to do?',
            [
              {
                text: 'Clear All Storage',
                onPress: async () => {
                  await clearStorage();
                  Alert.alert('Storage Cleared', 'Restarting app...');
                  // Force reload by setting loading state
                  setIsLoading(true);
                  setTimeout(() => {
                    setQuestList([]);
                    setQuestProgress(new Map());
                    setCurrentIndex(0);
                    setSelectedQuest(null);
                    setIsLoading(false);
                  }, 500);
                }
              },
              {
                text: 'Reset Focused Quest',
                onPress: async () => {
                  await AsyncStorage.removeItem(STORAGE_KEYS.FOCUSED_QUEST);
                  setSelectedQuest(null);
                  Alert.alert('Focused Quest Reset', 'Any focused quest has been cleared.');
                }
              },
              {
                text: 'Cancel',
                style: 'cancel'
              }
            ]
          );
        }}
      >
        <Text style={styles.debugButtonText}>🔧</Text>
      </TouchableOpacity>
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
    position: 'relative',  // Changed from absolute to relative for single card view
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 1.5, // Increase height for taller cards
    borderRadius: 20,
    alignSelf: 'center',  // Center the card
    marginVertical: 20,
  },
  card: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0b0b0b',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Increased shadow
    shadowOpacity: 0.4,                   // Made shadow more visible
    shadowRadius: 8,                      // Larger shadow radius
    elevation: 10,                         // Increased elevation
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
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
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
  modalLaterButton: {
    backgroundColor: 'rgba(0, 221, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 221, 255, 0.4)',
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
    zIndex: 1000,
  },
  regenerateButton: {
    backgroundColor: 'rgba(255, 252, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 0, 0.4)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'column',
    minWidth: 100,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  secondaryButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    marginLeft: 5,
  },
  debugButton: {
    position: 'absolute',
    bottom: 70, 
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  debugButtonText: {
    fontSize: 20,
  },
  swipeHint: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    marginTop: 10,
  },
  allButtonsContainer: {
    flexDirection: 'column', // Changed to column to stack buttons vertically
    justifyContent: 'flex-end',
    marginTop: 'auto', // Push to the bottom of the card
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  buttonEqual: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row', // Changed to row for horizontal icon and text
    justifyContent: 'center', // Center the icon and text
    width: '100%', // Full width
    marginBottom: 8, // Space between buttons
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16, // Slightly larger font
    fontWeight: '500',
    marginLeft: 8, // Add some space between icon and text
    textAlign: 'center',
  },
  acceptButton: {
    backgroundColor: 'rgba(0, 255, 71, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 71, 0.4)',
  },
  declineButton: {
    backgroundColor: 'rgba(255, 13, 61, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 13, 61, 0.4)',
  },
  laterButton: {
    backgroundColor: 'rgba(0, 221, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 221, 255, 0.4)',
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 252, 0, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 0, 0.4)',
  },
});

export default QuestCardDeck;

