import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config";
import LoadingComponent from "./Loading";
import { useTheme } from '../contexts/ThemeContext'; // Adjust the path as needed

const AlumniMeetSection = ({ navigation }) => {
  const { theme } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState({});
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [userProfileLoading, setUserProfileLoading] = useState(true);

  // Function to fetch current user profile
  const fetchUserProfile = async () => {
    try {
      setUserProfileLoading(true);
      const token = await AsyncStorage.getItem('alumniToken');
      
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        if (navigation) {
          navigation.navigate('Login');
        }
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/alumni/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (result.success) {
        const userData = result.data.user;
        setCurrentUserEmail(userData.email);
        
        // Update AsyncStorage with fresh data
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        return userData.email;
      } else {
        if (response.status === 401) {
          Alert.alert("Session Expired", "Please login again");
          if (navigation) {
            navigation.navigate('Login');
          }
        } else {
          Alert.alert("Error", result.message || "Failed to fetch profile data");
        }
        return null;
      }
    } catch (error) {
      console.error('Fetch profile error:', error);
      Alert.alert("Error", "Network error. Please check your connection.");
      return null;
    } finally {
      setUserProfileLoading(false);
    }
  };

  // Function to get the auth token
  const getAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('alumniToken');
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  };

  // Function to format date and time
  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB');
    return `${formattedDate} at ${timeString}`;
  };

  // Function to fetch events from backend
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'Please login to view events');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/alumni/events`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Failed to fetch events. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle event registration
  const handleRegister = async (eventId) => {
    try {
      setRegistering(prev => ({ ...prev, [eventId]: true }));
      const token = await getAuthToken();
      
      if (!token) {
        Alert.alert('Error', 'Please login to register for events');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/alumni/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', data.message || 'Registered Successfully!');
        // Update the local events state with the updated event data
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId ? data.event : event
          )
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to register for event');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      Alert.alert('Error', 'Failed to register. Please check your connection.');
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }));
    }
  };

  // Function to check if current user is registered for an event based on email
  const isUserRegistered = (event) => {
    if (!currentUserEmail || !event.registeredAlumni) {
      return false;
    }
    
    return event.registeredAlumni.some(
      registration => registration.email === currentUserEmail
    );
  };

  // Load user profile and events when component mounts
  useEffect(() => {
    const initializeData = async () => {
      // First fetch user profile to get email
      await fetchUserProfile();
      
      // Then fetch events
      const timer = setTimeout(() => {
        fetchEvents();
      }, 1000);
      
      return () => clearTimeout(timer);
    };

    initializeData();
  }, []);

  // Show loading if either user profile or events are loading
  if (loading || userProfileLoading) {
    return (
      <LoadingComponent
        message={userProfileLoading ? "Loading user profile..." : "Loading Alumni Meet..."}
        color={theme.primary}
        backgroundColor={theme.background}
      />
    );
  }

  // Show error if user email couldn't be fetched
  if (!currentUserEmail) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.destructive} />
        <Text style={[styles.errorText, { color: theme.destructive }]}>Unable to load user profile</Text>
        <TouchableOpacity 
          style={[styles.refreshBtn, { backgroundColor: theme.primary }]} 
          onPress={fetchUserProfile}
        >
          <Text style={[styles.refreshBtnText, { color: theme.textButton }]}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.eventsContainer}>
          {events.length === 0 ? (
            <View style={styles.noEventsContainer}>
              <Ionicons name="calendar-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.noEventsText, { color: theme.textSecondary }]}>No upcoming events</Text>
              <TouchableOpacity 
                style={[styles.refreshBtn, { backgroundColor: theme.primary }]} 
                onPress={fetchEvents}
              >
                <Text style={[styles.refreshBtnText, { color: theme.textButton }]}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            events.map((event) => {
              const isRegistered = isUserRegistered(event);
              const isRegistrationInProgress = registering[event.id];
              const isFull = event.registeredCount >= event.maxCapacity;
              
              return (
                <View key={event.id} style={[styles.card, { 
                  backgroundColor: theme.card, 
                  borderColor: theme.border,
                  shadowColor: theme.shadowColor 
                }]}>
                  <Text style={[styles.cardTitle, { color: theme.text }]}>{event.eventName}</Text>

                  <View style={styles.detailsRow}>
                    <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {formatDateTime(event.date, event.time)}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Ionicons name="location-outline" size={20} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {event.venue}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Ionicons name="people-outline" size={20} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      Organized by {event.organizer}
                    </Text>
                  </View>

                  <View style={styles.detailsRow}>
                    <Ionicons name="person-outline" size={20} color={theme.primary} />
                    <Text style={[styles.detailText, { color: theme.textSecondary }]}>
                      {event.registeredCount}/{event.maxCapacity} registered
                    </Text>
                  </View>

                  <Text style={[styles.description, { color: theme.textSecondary }]}>
                    {event.description}
                  </Text>

                  {/* Show user's registration status */}
                  {isRegistered && (
                    <View style={[styles.statusContainer, { 
                      backgroundColor: theme.accentBg1,
                      borderColor: theme.border 
                    }]}>
                      <Text style={[styles.statusText, { color: theme.primary }]}>
                        ✓ You are registered for this event
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.registerBtn,
                      { backgroundColor: theme.primary },
                      (isRegistered || isFull) && [styles.disabledBtn, { backgroundColor: theme.textDisabled }],
                      isRegistered && { backgroundColor: '#22c55e' },
                    ]}
                    onPress={() => !isRegistered && !isFull && !isRegistrationInProgress && handleRegister(event.id)}
                    disabled={isRegistered || isFull || isRegistrationInProgress}
                    activeOpacity={0.8}
                  >
                    {isRegistrationInProgress ? (
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    ) : (
                      <Ionicons
                        name={
                          isRegistered
                            ? "checkmark-circle-outline"
                            : isFull
                            ? "close-circle-outline"
                            : "person-add-outline"
                        }
                        size={24}
                        color="#fff"
                        style={{ marginRight: 8 }}
                      />
                    )}
                    <Text style={[styles.registerBtnText, { color: theme.textButton }]}>
                      {isRegistrationInProgress 
                        ? "Registering..." 
                        : isRegistered 
                        ? "Registered" 
                        : isFull 
                        ? "Event Full" 
                        : "Register"
                      }
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
  },
  eventsContainer: {
    marginBottom: 100,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 8,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  description: {
    marginTop: 16,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  statusContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  registerBtn: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    // backgroundColor handled dynamically
  },
  registerBtnText: {
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: -0.2,
  },
  noEventsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noEventsText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  refreshBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  refreshBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
});

export default AlumniMeetSection;