import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAlumniProfile } from "../services/api";
import { API_BASE_URL } from "../config";
import LoadingComponent from "./Loading";
import { useTheme } from "../contexts/ThemeContext"; // Adjust the path as needed

const { width } = Dimensions.get("window");

// Token management functions
const getStoredToken = async () => {
  try {
    const token = await AsyncStorage.getItem("alumniToken");
    return token;
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
};

// Function to fetch current user profile (similar to fetchUserProfile from alumni meet)
const fetchCurrentUserProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("alumniToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${API_BASE_URL}/alumni/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (result.success) {
      const userData = result.data.user;
      await AsyncStorage.setItem("userData", JSON.stringify(userData));
      return userData;
    } else {
      throw new Error(result.message || "Failed to fetch profile data");
    }
  } catch (error) {
    console.error("Fetch profile error:", error);
    throw error;
  }
};

// API functions for events
const fetchPendingEvents = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/alumni/events/apply`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }

    const events = await response.json();
    return events;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

const applyForEvent = async (token, eventId, description) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/alumni/events/${eventId}/apply`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ description }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to apply for event");
    }

    return data;
  } catch (error) {
    console.error("Error applying for event:", error);
    throw error;
  }
};

const getInitials = (name) => {
  if (!name) return "";
  const names = name.trim().split(" ");
  if (names.length === 1) return names[0][0].toUpperCase();
  return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
};

const ProfileSkeleton = ({ theme }) => (
  <View
    style={[
      styles.profileBox,
      {
        backgroundColor: theme.card,
        borderColor: theme.border,
      },
    ]}
  >
    <View style={[styles.profileGradient, { backgroundColor: theme.card }]}>
      <View style={[styles.initialsBox, { backgroundColor: theme.border }]}>
        {/* Empty skeleton circle */}
      </View>
      <View style={styles.profileInfo}>
        <View
          style={[
            styles.skeletonText,
            {
              width: 150,
              height: 20,
              backgroundColor: theme.border,
            },
          ]}
        />
        <View
          style={[
            styles.skeletonText,
            {
              width: 120,
              height: 16,
              marginTop: 6,
              backgroundColor: theme.border,
            },
          ]}
        />
        <View
          style={[
            styles.skeletonText,
            {
              width: 100,
              height: 14,
              marginTop: 4,
              backgroundColor: theme.border,
            },
          ]}
        />
      </View>
    </View>
  </View>
);

// Leadership team (real images from kitcoek.in)
const leadershipTeam = [
  {
    name: "Dr. Uma P. Gurav",
    role: "HoD CSE(AI/ML)",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTj_1qkIE_9AMS30Srj6r7D6P-hUE6z09rn5g&s",
  },
  {
    name: "Dr. Mohan Vanarotti",
    role: "Director",
    image: "https://www.kitcoek.in/images/alumni/Team1/Mohan%20Vanarotti.jpg",
  },
  {
    name: "Mr. Sajid Hudli",
    role: "Chairman",
    image:
      "https://www.kitcoek.in/images/About/BoardOfDirectors/latest/02Shri%20Sajid%20Hudli%20500%20X%20490%20px.jpg",
  },
  {
    name: "Mr. Sunil Kulkarni",
    role: "Vice Chairman",
    image:
      "https://www.kitcoek.in/images/About/BoardOfDirectors/latest/01Shri%20Sunil%20Kulkarni%20500%20X%20490%20px.jpg",
  },
];

// sample news items
const newsData = [
  {
    id: 1,
    title: "AICTE Idea Lab",
    description:
      "Our newly established AICTE-approved Idea Lab provides students with cutting-edge facilities to prototype and test their innovative concepts.",
    img: require("../assets/AICTEELAB.png"),
  },
  {
    id: 2,
    title: "New Digital Library",
    description:
      "Access thousands of e-books, journals, and research papers through our upgraded digital library platform available 24/7.",
    img: require("../assets/ClassRoom.png"),
  },
  {
    id: 3,
    title: "Apple Mac LAB, KITCoEK",
    description:
      "The New Mac Lab equiped with iMacs with Apple's M1 chip at CSE(AI/ML) Department.",
    img: require("../assets/MACLAB.png"),
  },
];

const DashboardSection = ({ onNavigate }) => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsModalVisible, setNewsModalVisible] = useState(false);

  // User profile state
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Events state
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [applicationDescription, setApplicationDescription] = useState("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      initializeData();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [user?.photoUri]);

  const initializeData = async () => {
    // First load user profile to get email
    await loadUserProfile();
    // Then load events
    await loadEvents();
  };

  const loadUserProfile = async () => {
    try {
      setProfileLoading(true);
      const token = await getStoredToken();

      if (!token) {
        Alert.alert(
          "Error",
          "Authentication token not found. Please login again."
        );
        return;
      }

      // Use the new fetchCurrentUserProfile function to get current user's email
      const currentUserData = await fetchCurrentUserProfile();
      setCurrentUserEmail(currentUserData.email);

      // Also fetch the profile data for display (using existing function)
      const profileData = await fetchAlumniProfile(token);

      // Map backend response to your frontend structure
      const mappedUser = {
        name: profileData.fullName,
        department: profileData.department,
        // Add proper image URL handling with fallback
        photoUri: profileData.profileImage
          ? profileData.profileImage.startsWith("http")
            ? profileData.profileImage
            : `${API_BASE_URL}${profileData.profileImage}`
          : null,
        email: profileData.email,
        jobPosition: profileData.jobPosition,
        passOutYear: profileData.passOutYear,
        companyName: profileData.companyName,
      };

      setUser(mappedUser);
    } catch (error) {
      Alert.alert("Error", "Failed to load profile data");
      console.error("Profile loading error:", error);

      // Fallback user data in case of error
      setUser({
        name: "User",
        department: "Department",
        photoUri: null, // Changed from "" to null for consistency
        email: "",
        jobPosition: "",
        passOutYear: "",
        companyName: "",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      setEventsLoading(true);
      const token = await getStoredToken();

      if (!token) {
        return;
      }

      const eventsData = await fetchPendingEvents(token);

      // Transform backend events to match your frontend structure
      const transformedEvents = eventsData.map((event) => ({
        id: event._id,
        title: event.name,
        date: new Date(event.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        icon: "event", // Default icon
        description: event.description,
        venue: event.venue,
        originalDate: event.date,
        applicants: event.applicants || [], // Array of applicants with their emails
        maxCapacity: event.maxCapacity,
        applicantCount: event.applicants?.length || 0,
      }));

      setEvents(transformedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
      Alert.alert("Error", "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  };

  // Function to check if current user has already applied for an event
  const hasUserApplied = (event) => {
    if (!currentUserEmail || !event.applicants) {
      return false;
    }

    return event.applicants.some(
      (applicant) => applicant.email === currentUserEmail
    );
  };

  // Function to check if event is full
  const isEventFull = (event) => {
    return event.applicantCount >= event.maxCapacity;
  };

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setApplicationDescription("");
    setModalVisible(true);
  };

  const handleNewsPress = (news) => {
    setSelectedNews(news);
    setNewsModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setSelectedEvent(null);
    setApplicationDescription("");
  };

  const handleNewsCancel = () => {
    setNewsModalVisible(false);
    setSelectedNews(null);
  };

  const handleRegister = async () => {
    if (!applicationDescription.trim()) {
      Alert.alert(
        "Required",
        "Please provide a description for your application."
      );
      return;
    }

    setApplying(true);

    try {
      const token = await getStoredToken();

      if (!token) {
        Alert.alert(
          "Error",
          "Authentication token not found. Please login again."
        );
        return;
      }

      const result = await applyForEvent(
        token,
        selectedEvent.id,
        applicationDescription.trim()
      );

      Alert.alert(
        "Success",
        "Your application has been submitted successfully!",
        [
          {
            text: "OK",
            onPress: () => {
              setModalVisible(false);
              setSelectedEvent(null);
              setApplicationDescription("");
              // Refresh events to update application status
              loadEvents();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const handleNavigation = (route) => {
    navigation.navigate(route);
  };

  // Loading state for profile
  if (profileLoading) {
    return (
      <LoadingComponent
        message="Loading Dashboard..."
        color={theme.primary}
        backgroundColor={theme.background}
      />
    );
  }

  // Error state if user is null
  if (!user) {
    return (
      <View
        style={[
          styles.container,
          styles.errorContainer,
          { backgroundColor: theme.background },
        ]}
      >
        <Icon name="error-outline" size={48} color={theme.destructive} />
        <Text style={[styles.errorText, { color: theme.destructive }]}>
          Failed to load profile
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={loadUserProfile}
        >
          <Text style={[styles.retryButtonText, { color: theme.textButton }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Logo Section */}
        <View
          style={[
            styles.logoSection,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Image
            source={require("../assets/kitlogo.png")} // Replace with your actual logo path
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, { color: theme.primary }]}>
            KIT Back2Campus
          </Text>
          <Text style={[styles.logoSubtext, { color: theme.textSecondary }]}>
            Reconnect • Contribute • Celebrate
          </Text>
        </View>

        {/* Profile Section */}
        {profileLoading ? (
          <ProfileSkeleton theme={theme} />
        ) : (
          <View
            style={[
              styles.profileBox,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[styles.profileGradient, { backgroundColor: theme.card }]}
            >
              {user.photoUri && !imageError ? (
                <Image
                  source={{ uri: user.photoUri }}
                  style={styles.profileImage}
                  onError={() => setImageError(true)} // This will fallback to initials on error
                />
              ) : (
                <View
                  style={[
                    styles.initialsBox,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text style={[styles.initials, { color: theme.textButton }]}>
                    {getInitials(user.name)}
                  </Text>
                </View>
              )}
              <View style={styles.profileInfo}>
                <Text
                  style={[styles.profileName, { color: theme.textSecondary }]}
                >
                  {user.name}
                </Text>
                <Text
                  style={[
                    styles.profileDepartment,
                    { color: theme.textSecondary },
                  ]}
                >
                  Department of {user.department}
                </Text>
                {user.jobPosition && (
                  <Text
                    style={[styles.profileJob, { color: theme.textSecondary }]}
                  >
                    {user.jobPosition}
                  </Text>
                )}
                {user.companyName && (
                  <Text
                    style={[
                      styles.profileCompany,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {user.companyName}
                  </Text>
                )}
                {user.passOutYear && (
                  <Text style={[styles.profileYear, { color: theme.primary }]}>
                    Class of {user.passOutYear}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Quick Action Cards */}
        <View style={styles.cardsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Quick Actions
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsContainer}
          >
            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleNavigation("Internship")}
            >
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: theme.accentBg1 },
                ]}
              >
                <Icon name="work" size={28} color={theme.primary} />
              </View>
              <Text style={[styles.cardText, { color: theme.primary }]}>
                Internship
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleNavigation("Mentorship")}
            >
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: theme.accentBg1 },
                ]}
              >
                <Icon name="psychology" size={28} color={theme.primary} />
              </View>
              <Text style={[styles.cardText, { color: theme.primary }]}>
                Mentorship
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.card,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
              onPress={() => handleNavigation("FAQ")}
            >
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: theme.accentBg1 },
                ]}
              >
                <Icon name="question-answer" size={28} color={theme.primary} />
              </View>
              <Text style={[styles.cardText, { color: theme.primary }]}>
                FAQ's
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.whatsNewSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            What's New in KIT
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.whatsNewContainer}
          >
            {newsData.map((news) => (
              <TouchableOpacity
                key={news.id}
                style={[
                  styles.newsCard,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() => handleNewsPress(news)}
              >
                <Image
                  source={news.img}
                  style={styles.newsImage}
                  resizeMode="cover"
                />

                <View style={styles.newsContent}>
                  <Text
                    style={[styles.newsTitle, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {news.title}
                  </Text>
                  <Text
                    style={[
                      styles.newsDescription,
                      { color: theme.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {news.description}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Events */}
        <View style={styles.eventsSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Upcoming Events
          </Text>

          {eventsLoading ? (
            <View style={styles.eventsLoadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text
                style={[styles.loadingText, { color: theme.textSecondary }]}
              >
                Loading events...
              </Text>
            </View>
          ) : events.length > 0 ? (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.eventsContainer}
              >
                {events.map((event) => {
                  const userApplied = hasUserApplied(event);
                  const eventFull = isEventFull(event);

                  return (
                    <TouchableOpacity
                      key={event.id}
                      style={[
                        styles.eventCard,
                        {
                          backgroundColor: theme.card,
                          borderColor: theme.border,
                        },
                        userApplied && {
                          borderColor: "#22c55e",
                          backgroundColor: theme.accentBg1,
                        },
                        eventFull &&
                          !userApplied && {
                            borderColor: theme.destructive,
                            backgroundColor: theme.accentBg1,
                          },
                      ]}
                      onPress={() => handleEventPress(event)}
                    >
                      <View
                        style={[
                          styles.eventImage,
                          { backgroundColor: theme.accentBg1 },
                        ]}
                      >
                        <Icon
                          name={
                            userApplied
                              ? "check-circle"
                              : eventFull
                              ? "event-busy"
                              : event.icon
                          }
                          size={40}
                          color={
                            userApplied
                              ? "#22c55e"
                              : eventFull
                              ? theme.destructive
                              : theme.primary
                          }
                        />
                      </View>
                      <Text
                        style={[styles.eventTitle, { color: theme.text }]}
                        numberOfLines={2}
                      >
                        {event.title}
                      </Text>
                      <Text
                        style={[
                          styles.eventDate,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {event.date}
                      </Text>
                      {event.venue && (
                        <Text
                          style={[styles.eventVenue, { color: theme.primary }]}
                          numberOfLines={1}
                        >
                          {event.venue}
                        </Text>
                      )}

                      {/* Application status indicator */}
                      {userApplied && (
                        <View style={styles.statusBadge}>
                          <Text style={styles.statusText}>Applied</Text>
                        </View>
                      )}

                      {eventFull && !userApplied && (
                        <View style={[styles.statusBadge, styles.fullBadge]}>
                          <Text
                            style={[styles.statusText, styles.fullStatusText]}
                          >
                            Full
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </>
          ) : (
            <View style={styles.noEventsContainer}>
              <Icon name="event-busy" size={48} color={theme.textTertiary} />
              <Text
                style={[styles.noEventsText, { color: theme.textSecondary }]}
              >
                No events available at the moment
              </Text>
            </View>
          )}
        </View>

        {/* About / CTA */}
        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Reconnect • Contribute • Celebrate
        </Text>
        <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
          Whether you're mentoring juniors, attending reunions, or supporting
          innovation — you're a vital part of the KIT legacy. Let's build the
          future, together.
        </Text>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Leadership Team */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Leadership Team
        </Text>
        <View style={styles.teamContainer}>
          {leadershipTeam.map((member, idx) => (
            <View
              key={idx}
              style={[
                styles.memberCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}
            >
              <Image
                source={{ uri: member.image }}
                style={styles.memberImage}
              />
              <Text style={[styles.memberName, { color: theme.text }]}>
                {member.name}
              </Text>
              <Text style={[styles.memberRole, { color: theme.textSecondary }]}>
                {member.role}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        {/* Donate CTA */}
        <View
          style={[
            styles.donateCard,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            Help us empower students, fund scholarships, and host impactful
            alumni events by donating to KITAA.
          </Text>
          <TouchableOpacity
            style={[styles.donateButton, { backgroundColor: theme.primary }]}
            onPress={() => handleNavigation("DonationScreen")}
          >
            <Text
              style={[styles.donateButtonText, { color: theme.textButton }]}
            >
              Donate Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Event Application Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View
          style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[styles.modalHeader, { borderBottomColor: theme.border }]}
            >
              <Text style={[styles.modalTitle, { color: theme.primary }]}>
                {selectedEvent?.title}
              </Text>
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalBody}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.modalDate, { color: theme.primary }]}>
                {selectedEvent?.date}
              </Text>
              {selectedEvent?.venue && (
                <Text
                  style={[styles.modalVenue, { color: theme.textSecondary }]}
                >
                  Venue: {selectedEvent.venue}
                </Text>
              )}
              <Text
                style={[
                  styles.modalDescription,
                  { color: theme.textSecondary },
                ]}
              >
                Description: {selectedEvent?.description}
              </Text>

              {/* Show application status */}
              {selectedEvent && hasUserApplied(selectedEvent) && (
                <View
                  style={[
                    styles.appliedStatusContainer,
                    {
                      backgroundColor: theme.accentBg1,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <Icon name="check-circle" size={24} color="#22c55e" />
                  <Text
                    style={[styles.appliedStatusText, { color: theme.primary }]}
                  >
                    You have already applied for this event
                  </Text>
                </View>
              )}

              {selectedEvent &&
                isEventFull(selectedEvent) &&
                !hasUserApplied(selectedEvent) && (
                  <View
                    style={[
                      styles.fullStatusContainer,
                      {
                        backgroundColor: theme.accentBg1,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <Icon
                      name="event-busy"
                      size={24}
                      color={theme.destructive}
                    />
                    <Text
                      style={[
                        styles.fullStatusText,
                        { color: theme.destructive },
                      ]}
                    >
                      This event has reached maximum capacity
                    </Text>
                  </View>
                )}

              {/* Show application form only if user hasn't applied and event isn't full */}
              {selectedEvent &&
                !hasUserApplied(selectedEvent) &&
                !isEventFull(selectedEvent) && (
                  <>
                    <Text
                      style={[styles.applicationLabel, { color: theme.text }]}
                    >
                      Why do you want to attend this event?
                    </Text>
                    <TextInput
                      style={[
                        styles.applicationInput,
                        {
                          borderColor: theme.border,
                          backgroundColor: theme.accentBg2,
                          color: theme.text,
                        },
                      ]}
                      multiline
                      numberOfLines={4}
                      placeholder="Please provide a brief description of why you'd like to attend this event..."
                      value={applicationDescription}
                      onChangeText={setApplicationDescription}
                      textAlignVertical="top"
                      placeholderTextColor={theme.textTertiary}
                    />
                  </>
                )}
            </ScrollView>

            <View
              style={[styles.modalButtons, { borderTopColor: theme.border }]}
            >
              {selectedEvent &&
              !hasUserApplied(selectedEvent) &&
              !isEventFull(selectedEvent) ? (
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    { backgroundColor: theme.primary },
                    applying && [
                      styles.registerButtonDisabled,
                      { backgroundColor: theme.textDisabled },
                    ],
                  ]}
                  onPress={handleRegister}
                  disabled={applying}
                >
                  {applying ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text
                      style={[
                        styles.registerButtonText,
                        { color: theme.textButton },
                      ]}
                    >
                      Apply for Event
                    </Text>
                  )}
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    styles.registerButtonDisabled,
                    {
                      backgroundColor: theme.textDisabled,
                    },
                  ]}
                  disabled={true}
                >
                  <Text
                    style={[
                      styles.registerButtonText,
                      { color: theme.textButton },
                    ]}
                  >
                    {selectedEvent && hasUserApplied(selectedEvent)
                      ? "Already Applied"
                      : "Event Full"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* News Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={newsModalVisible}
        onRequestClose={handleNewsCancel}
      >
        <View
          style={[
            styles.newsModal_overlay,
            { backgroundColor: theme.modalOverlay },
          ]}
        >
          <View
            style={[
              styles.newsModal_container,
              {
                backgroundColor: theme.card,
                shadowColor: theme.shadowColor,
              },
            ]}
          >
            <View style={styles.newsModal_imageWrapper}>
              <Image
                source={selectedNews?.img}
                style={styles.newsModal_image}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={handleNewsCancel}
                style={styles.newsModal_closeButton}
              >
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.newsModal_body}>
              {selectedNews?.category && (
                <View
                  style={[
                    styles.newsModal_categoryBadge,
                    { backgroundColor: theme.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.newsModal_categoryText,
                      { color: theme.textButton },
                    ]}
                  >
                    {selectedNews.category}
                  </Text>
                </View>
              )}
              {selectedNews?.date && (
                <Text
                  style={[
                    styles.newsModal_date,
                    { color: theme.textSecondary },
                  ]}
                >
                  {selectedNews.date}
                </Text>
              )}

              <Text style={[styles.newsModal_title, { color: theme.text }]}>
                {selectedNews?.title}
              </Text>
              <Text
                style={[
                  styles.newsModal_description,
                  { color: theme.textSecondary },
                ]}
              >
                {selectedNews?.description}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Keep all existing styles but remove hardcoded colors
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
  },

  // Loading and error states
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },

  // Profile box
  profileBox: {
    margin: 16,
    marginTop: 8, // Add this line to reduce top margin
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  profileGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#ddd",
  },
  initialsBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 24,
    fontWeight: "700",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
  },
  profileDepartment: {
    marginTop: 6,
    fontSize: 15,
  },
  profileJob: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: "500",
  },
  profileCompany: {
    fontSize: 14,
    marginTop: 2,
  },
  profileYear: {
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },

  // logo
  logoSection: {
    margin: 16,
    marginBottom: 8, // Reduced bottom margin to bring profile closer
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },
  logoImage: {
    width: 180,
    height: 80,
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  logoSubtext: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },

  // Cards
  cardsSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  card: {
    width: 130,
    padding: 20,
    borderRadius: 18,
    marginHorizontal: 4,
    alignItems: "center",
    borderWidth: 1,
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  cardText: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.2,
  },

  // What's New
  newsImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  whatsNewSection: {
    marginTop: 16,
    marginBottom: 16,
  },
  whatsNewContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  newsCard: {
    width: 300,
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
  },
  newsContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  newsDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },

  // Events
  eventsSection: {
    marginTop: 16,
    paddingLeft: 16,
    paddingRight: 16,
    marginBottom: 16,
  },
  eventsContainer: {
    gap: 16,
    paddingHorizontal: 4,
  },
  eventCard: {
    width: 170,
    marginHorizontal: 4,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    position: "relative",
  },
  eventImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: -0.2,
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  eventVenue: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  // Status badge styles
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  fullBadge: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
  fullStatusText: {
    color: "#fff",
  },

  // Events loading and empty states
  eventsLoadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noEventsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noEventsText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },

  // Leadership team
  teamContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 16,
  },
  memberCard: {
    width: width / 2.4,
    borderRadius: 18,
    padding: 16,
    margin: 8,
    alignItems: "center",
    borderWidth: 1,
  },
  memberImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  memberRole: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    fontWeight: "500",
  },

  // Donate
  donateCard: {
    margin: 16,
    padding: 20,
    marginBottom: 100,
    borderRadius: 20,
    borderWidth: 1,
  },
  donateButton: {
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 16,
  },
  donateButtonText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 17,
    letterSpacing: -0.2,
  },

  // Separators & generic text
  separator: {
    height: 1,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginLeft: 16,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  bodyText: {
    fontSize: 16,
    paddingHorizontal: 16,
    lineHeight: 26,
    fontWeight: "400",
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalDate: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalVenue: {
    fontSize: 14,
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  // Status container styles
  appliedStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  appliedStatusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  fullStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  fullStatusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  applicationLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  applicationInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
  },
  registerButton: {
    flex: 1,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonDisabled: {
    // backgroundColor handled dynamically
  },
  registerButtonText: {
    fontWeight: "700",
    fontSize: 16,
  },

  // News modal
  newsModal_overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  newsModal_container: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 16,
    overflow: "hidden",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  newsModal_imageWrapper: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  newsModal_image: {
    width: "100%",
    height: "100%",
  },
  newsModal_closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    padding: 6,
  },
  newsModal_body: {
    padding: 16,
  },
  newsModal_categoryBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  newsModal_categoryText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  newsModal_date: {
    fontSize: 12,
    marginBottom: 8,
  },
  newsModal_title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  newsModal_description: {
    fontSize: 15,
    lineHeight: 22,
  },
  skeletonText: {
    borderRadius: 4,
    height: 16,
  },
});

export default DashboardSection;
