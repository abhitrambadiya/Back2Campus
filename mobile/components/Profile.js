import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config";
import LoadingComponent from "./Loading";
import { useTheme } from "../contexts/ThemeContext";

const themeOptions = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

// Avatar generation functions (keep existing)
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .slice(0, 2);
};

const generateAvatarUrl = (name) => {
  const avatarColors = ["ef4444"];
  const initials = getInitials(name);
  let hash = 0;
  if (name) {
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
  }
  const colorIndex = Math.abs(hash) % avatarColors.length;
  const background = avatarColors[colorIndex];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=${background}&color=fff&size=240&font-size=0.4&bold=true`;
};

const TextInputField = React.memo(
  ({
    placeholder,
    value,
    onChangeText,
    keyboardType,
    multiline,
    numberOfLines,
    theme,
  }) => (
    <View
      style={
        multiline
          ? themedStyles(theme).textAreaContainer
          : themedStyles(theme).inputContainer
      }
    >
      <TextInput
        style={
          multiline ? themedStyles(theme).textArea : themedStyles(theme).input
        }
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? "top" : "center"}
        placeholderTextColor={theme.textTertiary}
      />
    </View>
  )
);

const InputGroup = React.memo(({ icon, label, children, theme }) => (
  <View style={themedStyles(theme).inputGroup}>
    <View style={themedStyles(theme).labelContainer}>
      <Ionicons name={icon} size={18} color={theme.primary} />
      <Text style={themedStyles(theme).label}>{label}</Text>
    </View>
    {children}
  </View>
));

const ProfileSection = () => {
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [selectedImageBase64, setSelectedImageBase64] = useState(null);
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [skills, setSkills] = useState("");
  const [linkedInURL, setLinkedInURL] = useState("");
  const [jobPosition, setJobPosition] = useState("");
  const [companyName, setCompanyName] = useState("");
  const { theme, themeMode, setThemeMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUserProfile();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("alumniToken");
      if (!token) {
        Alert.alert("Error", "No authentication token found");
        navigation.navigate("Login");
        return;
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
        setUserName(
          userData.name || userData.firstName + " " + userData.lastName || ""
        );
        setEmail(userData.email || "");
        setPhoneNumber(userData.phoneNumber || "");
        setSkills(userData.skills || "");
        setLinkedInURL(userData.linkedInURL || "");
        setJobPosition(userData.jobPosition || "");
        setCompanyName(userData.companyName || "");

        if (userData.profileImage) {
          setProfileImage(userData.profileImage);
        } else {
          const avatarUrl = generateAvatarUrl(
            userData.fullName ||
              userData.firstName + " " + userData.lastName ||
              "User"
          );
          setProfileImage(avatarUrl);
        }
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
      } else {
        if (response.status === 401) {
          Alert.alert("Session Expired", "Please login again");
          navigation.navigate("Login");
        } else {
          Alert.alert(
            "Error",
            result.message || "Failed to fetch profile data"
          );
        }
      }
    } catch (error) {
      console.error("Fetch profile error:", error);
      Alert.alert("Error", "Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Updated handleImagePicker with correct base64 handling
const handleImagePicker = async () => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7, // Reduced quality for smaller file size
      base64: true, // Enable base64
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];

      // Check file size (if available)
      if (selectedAsset.fileSize && selectedAsset.fileSize > 5 * 1024 * 1024) {
        Alert.alert(
          "File too large",
          "Please select an image smaller than 5MB."
        );
        return;
      }

      // Validate base64 data exists
      if (!selectedAsset.base64) {
        Alert.alert("Error", "Failed to process image. Please try again.");
        return;
      }

      // FIXED: Determine the correct MIME type
      let mimeType = "image/jpeg"; // default
      if (selectedAsset.uri) {
        const extension = selectedAsset.uri.split('.').pop()?.toLowerCase();
        if (extension === 'png') {
          mimeType = "image/png";
        } else if (extension === 'jpg' || extension === 'jpeg') {
          mimeType = "image/jpeg";
        } else if (extension === 'webp') {
          mimeType = "image/webp";
        }
      }

      // FIXED: Create proper base64 string with correct MIME type
      const base64Image = `data:${mimeType};base64,${selectedAsset.base64}`;

      // Set preview image (local URI) and base64 for upload
      setProfileImage(selectedAsset.uri);
      setSelectedImageBase64(base64Image);
    }
  } catch (error) {
    console.error("Image picker error:", error);
    Alert.alert("Error", "Failed to select image. Please try again.");
  }
};

  const handleEmailChange = useCallback((text) => setEmail(text), []);
  const handlePhoneChange = useCallback((text) => setPhoneNumber(text), []);
  const handleSkillsChange = useCallback((text) => setSkills(text), []);
  const handleLinkedInChange = useCallback((text) => setLinkedInURL(text), []);
  const handleJobPositionChange = useCallback(
    (text) => setJobPosition(text),
    []
  );
  const handleCompanyChange = useCallback((text) => setCompanyName(text), []);

 // FIXED: Updated handleSave with better error handling and logging
const handleSave = async () => {
  try {
    setUpdating(true);
    const token = await AsyncStorage.getItem("alumniToken");

    if (!token) {
      Alert.alert("Error", "Authentication token not found. Please login again.");
      navigation.navigate("Login");
      return;
    }

    const requestData = {
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      skills: skills.trim(),
      linkedInURL: linkedInURL.trim(),
      jobPosition: jobPosition.trim(),
      companyName: companyName.trim(),
    };

    // Add base64 image if selected
    if (selectedImageBase64) {
      
      // Validate base64 format
      if (!selectedImageBase64.startsWith('data:image/')) {
        Alert.alert("Error", "Invalid image format. Please try selecting the image again.");
        return;
      }
      
      requestData.profileImage = selectedImageBase64;
    }

    const response = await fetch(`${API_BASE_URL}/alumni/update`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestData),
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      Alert.alert("Error", "Invalid response from server. Please try again.");
      return;
    }

    if (result.success) {
      Alert.alert("Success", "Profile updated successfully!");

      // Update profile image if returned from server
      if (result.data?.user?.profileImage) {
        setProfileImage(result.data.user.profileImage);
      }

      // Clear the selected image base64 after successful upload
      setSelectedImageBase64(null);
      
      // Update local storage
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify(result.data.user)
      );
    } else {
      console.error("Server returned error:", result);
      Alert.alert(
        "Error", 
        result.message || "Failed to update profile. Please try again."
      );
    }
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
      Alert.alert("Error", "Network error. Please check your internet connection.");
    } else {
      Alert.alert("Error", `Failed to update profile: ${error.message}`);
    }
  } finally {
    setUpdating(false);
  }
};

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("alumniToken");
            await AsyncStorage.removeItem("userData");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const isGeneratedAvatar =
    profileImage && profileImage.includes("ui-avatars.com");
  const isNewImage = selectedImageBase64 !== null;

  if (loading) {
    return (
      <LoadingComponent
        message="Loading Profile..."
        color={theme.primary}
        backgroundColor={theme.background}
      />
    );
  }

  return (
    <View style={themedStyles(theme).container}>
      {/* Profile Picture Section */}
      <View style={themedStyles(theme).fixedProfileSection}>
        <View style={themedStyles(theme).profileCard}>
          <View style={themedStyles(theme).profilePictureSection}>
            <TouchableOpacity
              style={themedStyles(theme).profilePictureContainer}
              onPress={handleImagePicker}
            >
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={themedStyles(theme).profileImage}
                />
              ) : (
                <View style={themedStyles(theme).profilePlaceholder}>
                  <Ionicons
                    name="person"
                    size={60}
                    color={theme.textDisabled}
                  />
                </View>
              )}
              <View style={themedStyles(theme).editIconContainer}>
                <Ionicons name="camera" size={16} color={theme.textButton} />
              </View>
            </TouchableOpacity>
            <Text style={themedStyles(theme).profilePictureText}>
              {isNewImage
                ? "New image selected • Tap save to upload"
                : isGeneratedAvatar
                ? "Generated avatar • Tap to upload photo"
                : "Tap to change profile picture"}
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={themedStyles(theme).scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={themedStyles(theme).content}>
            <View style={themedStyles(theme).formContainer}>
              {/* Theme Toggle Group */}
              <InputGroup icon="contrast-outline" label="Theme" theme={theme}>
                <View style={themedStyles(theme).themeToggleContainer}>
                  {themeOptions.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        themedStyles(theme).themeToggleButton,
                        {
                          backgroundColor:
                            themeMode === opt.value
                              ? theme.primary
                              : theme.background,
                          borderColor:
                            themeMode === opt.value
                              ? theme.primary
                              : theme.border,
                        },
                      ]}
                      onPress={() => setThemeMode(opt.value)}
                    >
                      <Text
                        style={[
                          themedStyles(theme).themeToggleText,
                          {
                            color:
                              themeMode === opt.value
                                ? theme.textButton
                                : theme.textSecondary,
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </InputGroup>

              <InputGroup icon="mail-outline" label="Email" theme={theme}>
                <TextInputField
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  theme={theme}
                />
              </InputGroup>
              <InputGroup
                icon="call-outline"
                label="Phone Number"
                theme={theme}
              >
                <TextInputField
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  theme={theme}
                />
              </InputGroup>
              <InputGroup icon="sparkles-outline" label="Skills" theme={theme}>
                <TextInputField
                  placeholder="e.g., React, Node.js, JavaScript"
                  value={skills}
                  onChangeText={handleSkillsChange}
                  multiline={true}
                  numberOfLines={4}
                  theme={theme}
                />
              </InputGroup>
              <InputGroup
                icon="logo-linkedin"
                label="LinkedIn URL"
                theme={theme}
              >
                <TextInputField
                  placeholder="https://www.linkedin.com/in/yourprofile"
                  value={linkedInURL}
                  onChangeText={handleLinkedInChange}
                  keyboardType="url"
                  theme={theme}
                />
              </InputGroup>
              <InputGroup
                icon="briefcase-outline"
                label="Job Position"
                theme={theme}
              >
                <TextInputField
                  placeholder="Your current job position"
                  value={jobPosition}
                  onChangeText={handleJobPositionChange}
                  theme={theme}
                />
              </InputGroup>
              <InputGroup
                icon="business-outline"
                label="Company Name"
                theme={theme}
              >
                <TextInputField
                  placeholder="Your current company"
                  value={companyName}
                  onChangeText={handleCompanyChange}
                  theme={theme}
                />
              </InputGroup>

              {/* Submit Button with loading state */}
              <TouchableOpacity
                style={[
                  themedStyles(theme).submitButton,
                  updating && themedStyles(theme).disabledButton,
                ]}
                onPress={handleSave}
                disabled={updating}
              >
                <LinearGradient
                  colors={
                    updating
                      ? [
                          theme.textDisabled,
                          theme.textDisabled,
                          theme.textDisabled,
                        ]
                      : [theme.primary, theme.primary, theme.primary]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={themedStyles(theme).submitButtonGradient}
                >
                  {updating ? (
                    <ActivityIndicator size="small" color={theme.textButton} />
                  ) : (
                    <Ionicons
                      name="save-outline"
                      size={20}
                      color={theme.textButton}
                    />
                  )}
                  <Text style={themedStyles(theme).submitButtonText}>
                    {updating ? "Updating..." : "Update Profile"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Logout Button */}
              <TouchableOpacity
                style={themedStyles(theme).logoutButton}
                onPress={handleLogout}
              >
                <View style={themedStyles(theme).logoutButtonContent}>
                  <Ionicons
                    name="log-out-outline"
                    size={20}
                    color={theme.destructive}
                  />
                  <Text style={themedStyles(theme).logoutButtonText}>
                    Logout
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

function themedStyles(theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    fixedProfileSection: {
      backgroundColor: theme.background,
      paddingTop: 16,
      zIndex: 1000,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingBottom: 24,
    },
    profileCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      margin: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadowColor,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 4,
    },
    formContainer: {
      marginBottom: 100,
      gap: 16,
      paddingHorizontal: 16,
      marginTop: 16,
    },
    profilePictureSection: {
      alignItems: "center",
    },
    profilePictureContainer: {
      position: "relative",
      marginBottom: 12,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.accentBg3,
    },
    profilePlaceholder: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: theme.accentBg3,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: theme.borderMuted,
    },
    editIconContainer: {
      position: "absolute",
      bottom: 4,
      right: 4,
      backgroundColor: theme.primary,
      borderRadius: 16,
      padding: 8,
      borderWidth: 3,
      borderColor: theme.card,
    },
    profilePictureText: {
      fontSize: 14,
      color: theme.textTertiary,
      textAlign: "center",
      fontWeight: "500",
    },
    inputGroup: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadowColor,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 4,
    },
    labelContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginLeft: 8,
      letterSpacing: -0.2,
    },
    inputContainer: {
      shadowColor: theme.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    input: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: theme.text,
      fontWeight: "500",
    },
    textAreaContainer: {
      shadowColor: theme.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    textArea: {
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 15,
      color: theme.text,
      fontWeight: "500",
      minHeight: 80,
    },
    themeToggleContainer: {
      flexDirection: "row",
      gap: 8,
    },
    themeToggleButton: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    themeToggleText: {
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    submitButton: {
      marginTop: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadowColor,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 8,
      elevation: 4,
    },
    disabledButton: {
      opacity: 0.7,
    },
    submitButtonGradient: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      borderRadius: 16,
    },
    submitButtonText: {
      color: theme.textButton,
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
      letterSpacing: -0.2,
    },
    logoutButton: {
      marginTop: 8,
      marginBottom: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    logoutButtonContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    logoutButtonText: {
      color: theme.destructive,
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
      letterSpacing: -0.2,
    },
  });
}

export default ProfileSection;
