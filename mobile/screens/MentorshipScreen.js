import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config";
import { useTheme } from '../contexts/ThemeContext'; // Add theme import

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions (keep existing code)
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;

const responsiveSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const MentorshipScreen = ({ navigation }) => {
  const { theme } = useTheme(); // Add theme hook
  
  // --- STATE MANAGEMENT: Updated for Mentorship Fields ---
  const [formData, setFormData] = useState({
    title: '',
    department: 'Select Department',
    mode: 'Select mode',
    date: '',
    studyYear: 'All',
    limit: '',
    targetAudience: 'Undergraduate Students',
    description: '',
  });

  // Add alumni data state
  const [alumniData, setAlumniData] = useState({
    alumniName: '',
    alumniCompany: '',
    alumniPosition: ''
  });

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // State for an optional banner image
  const [mentorshipBanner, setMentorshipBanner] = useState(null);

  // State for controlling the visibility of each dropdown modal
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showStudyYearModal, setShowStudyYearModal] = useState(false);
  const [showTargetAudienceModal, setShowTargetAudienceModal] = useState(false);

  // --- DROPDOWN OPTIONS: Standard options for mentorship fields ---
  const departmentOptions = [
    'AIML'
  ];

  const modeOptions = ['Online', 'Offline'];

  const studyYearOptions = [
    'FY',
    'SY',
    'TY',
    'B. Tech',
    'All'
  ];

  const targetAudienceOptions = [
    'Undergraduate Students',
    'Postgraduate Students',
    'Specific Skill Seekers',
    'Aspiring Entrepreneurs',
    'Anyone Interested',
  ];

  // Add useEffect to fetch alumni profile on component mount
  useEffect(() => {
    fetchAlumniProfile();
  }, []);

  // Function to fetch alumni profile
  const fetchAlumniProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('alumniToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        navigation.navigate('Login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/alumni/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      
      // Update alumni data based on your backend response structure
      setAlumniData({
        alumniName: data.name || data.fullName || '',
        alumniCompany: data.companyName || data.currentCompany || '',
        alumniPosition: data.jobPosition || data.currentPosition || ''
      });
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      Alert.alert('Error', 'Failed to fetch profile data. Please try again.');
    }
  };

  // Generic handler, no changes needed
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Re-purposed for a mentorship banner, core logic is the same
  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need permission to access your photos.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
    });
    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      if (selectedAsset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('File too large', 'Please select an image smaller than 10MB.');
        return;
      }
      setMentorshipBanner(selectedAsset.uri);
    }
  };

  // Updated handleSubmit to call the backend API
  const handleSubmit = async () => {
    // Validation
    if (!formData.title.trim() || formData.department === 'Select Department' || !formData.description.trim()) {
      Alert.alert('Error', 'Please fill in Title, Department, and Description.');
      return;
    }

    if (formData.mode === 'Select mode') {
      Alert.alert('Error', 'Please select a mode for the mentorship.');
      return;
    }

    if (!formData.date.trim()) {
      Alert.alert('Error', 'Please select a date for the mentorship.');
      return;
    }

    if (!formData.limit.trim() || isNaN(formData.limit) || parseInt(formData.limit) <= 0) {
      Alert.alert('Error', 'Please enter a valid maximum number of applicants.');
      return;
    }

    try {
      setIsLoading(true);

      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('alumniToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        navigation.navigate('Login');
        return;
      }

      // Prepare the request payload according to your backend structure
      const requestPayload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        mode: formData.mode,
        targetAudience: formData.targetAudience,
        date: formData.date.trim(),
        department: formData.department,
        studyYear: formData.studyYear,
        limit: parseInt(formData.limit, 10),
        fullName: alumniData.alumniName,
        companyName: alumniData.alumniCompany,
        jobPosition: alumniData.alumniPosition
      };

      // Make API call to create mentorship
      const response = await fetch(`${API_BASE_URL}/alumni/mentorships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create mentorship');
      }
      
      Alert.alert(
        'Success', 
        'Mentorship opportunity posted successfully! It will be visible after admin approval.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                title: '',
                department: 'Select Department',
                mode: 'Select mode',
                date: '',
                studyYear: 'All',
                limit: '',
                targetAudience: 'Undergraduate Students',
                description: '',
              });
              setMentorshipBanner(null);
              // Navigate back or to another screen
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error creating mentorship:', error);
      Alert.alert(
        'Error', 
        error.message || 'Failed to create mentorship opportunity. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reusable modal component with theme
  const renderDropdownModal = (visible, setVisible, options, selectedValue, onSelect, title) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setVisible(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.modalContent, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor 
        }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
            <TouchableOpacity 
              onPress={() => setVisible(false)} 
              style={[styles.closeButton, { backgroundColor: theme.accentBg2 }]}
            >
              <Ionicons name="close" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  { borderBottomColor: theme.border },
                  selectedValue === item && [styles.selectedOption, { backgroundColor: theme.accentBg1 }]
                ]}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={[
                  styles.optionText, 
                  { color: theme.textSecondary },
                  selectedValue === item && [styles.selectedOptionText, { color: theme.primary }]
                ]}>
                  {item}
                </Text>
                {selectedValue === item && (
                  <View style={[styles.checkmarkContainer, { backgroundColor: theme.primary }]}>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* --- HEADER: Text and Icon updated for Mentorship --- */}
        <LinearGradient
          colors={['#2E5BFF', '#1E40AF', '#1E293B']}
          start={{ x: 0, y: 0 }}  
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={responsiveSize(24, 26, 28)} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="school-outline" size={responsiveSize(28, 30, 32)} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Post a Mentorship</Text>
            <Text style={styles.headerSubtitle}>
              Share your knowledge and guide the next generation
            </Text>
          </View>
        </LinearGradient>

        <View style={[styles.form, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor 
        }]}>
          {/* Alumni Info Display */}
          {alumniData.alumniName && (
            <View style={[styles.alumniInfoContainer, { 
              backgroundColor: theme.accentBg1,
              borderLeftColor: theme.primary 
            }]}>
              <Text style={[styles.alumniInfoTitle, { color: theme.textSecondary }]}>Posted by:</Text>
              <Text style={[styles.alumniInfoText, { color: theme.text }]}>
                {alumniData.alumniName} - {alumniData.alumniPosition} at {alumniData.alumniCompany}
              </Text>
            </View>
          )}

          {/* --- FORM FIELDS: Updated for Mentorship --- */}

          {/* Mentorship Title */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="create-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Mentorship Title *</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Enter Mentorship title"
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Department */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="library-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Department *</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dropdown, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor 
              }]} 
              onPress={() => setShowDepartmentModal(true)}
            >
              <Text style={[
                styles.dropdownText, 
                { color: theme.text },
                formData.department === 'Select Department' && { color: theme.textTertiary }
              ]}>
                {formData.department}
              </Text>
              <View style={[styles.dropdownIcon, { backgroundColor: theme.accentBg2 }]}>
                <Ionicons name="chevron-down" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Mentorship Mode */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="location-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Mode *</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dropdown, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor 
              }]} 
              onPress={() => setShowModeModal(true)}
            >
              <Text style={[
                styles.dropdownText, 
                { color: theme.text },
                formData.mode === 'Select mode' && { color: theme.textTertiary }
              ]}>
                {formData.mode}
              </Text>
              <View style={[styles.dropdownIcon, { backgroundColor: theme.accentBg2 }]}>
                <Ionicons name="chevron-down" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Date & Time */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Date *</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="dd/mm/yyyy"
                value={formData.date}
                onChangeText={(text) => handleInputChange('date', text)}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Target Study Year */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="school-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Target Study Year</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dropdown, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor 
              }]} 
              onPress={() => setShowStudyYearModal(true)}
            >
              <Text style={[styles.dropdownText, { color: theme.text }]}>{formData.studyYear}</Text>
              <View style={[styles.dropdownIcon, { backgroundColor: theme.accentBg2 }]}>
                <Ionicons name="chevron-down" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Max Applicants */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="people-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Maximum Number of Applicants *</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Enter maximum number of applicants"
                value={formData.limit}
                onChangeText={(text) => handleInputChange('limit', text)}
                keyboardType="numeric"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Target Audience */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="ribbon-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Target Audience</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dropdown, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor 
              }]} 
              onPress={() => setShowTargetAudienceModal(true)}
            >
              <Text style={[styles.dropdownText, { color: theme.text }]}>{formData.targetAudience}</Text>
              <View style={[styles.dropdownIcon, { backgroundColor: theme.accentBg2 }]}>
                <Ionicons name="chevron-down" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>
          
          {/* Description */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="document-text-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Mentorship Description *</Text>
            </View>
            <View style={[styles.textAreaContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Enter detailed Mentorship description and the topics to be covered."
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                multiline
                numberOfLines={responsiveSize(4, 5, 6)}
                textAlignVertical="top"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            <LinearGradient
              colors={isLoading ? ['#9CA3AF', '#6B7280'] : ['#2E5BFF', '#1E40AF', '#1E293B']}
              start={{ x: 0, y: 0 }}  
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <Ionicons 
                name={isLoading ? "hourglass-outline" : "checkmark-circle-outline"} 
                size={20} 
                color="#FFFFFF" 
              />
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Posting...' : 'Post Mentorship'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODALS: Updated for new dropdowns --- */}
      {renderDropdownModal(showDepartmentModal, setShowDepartmentModal, departmentOptions, formData.department, (value) => handleInputChange('department', value), 'Select Department')}
      {renderDropdownModal(showModeModal, setShowModeModal, modeOptions, formData.mode, (value) => handleInputChange('mode', value), 'Select Mentorship Mode')}
      {renderDropdownModal(showStudyYearModal, setShowStudyYearModal, studyYearOptions, formData.studyYear, (value) => handleInputChange('studyYear', value), 'Select Target Study Year')}
      {renderDropdownModal(showTargetAudienceModal, setShowTargetAudienceModal, targetAudienceOptions, formData.targetAudience, (value) => handleInputChange('targetAudience', value), 'Select Target Audience')}
    </View>
  );
};

// --- STYLES: Updated to remove hardcoded colors ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: responsiveSize(60, 65, 70),
    paddingHorizontal: responsiveSize(20, 22, 24),
    paddingBottom: responsiveSize(28, 30, 32),
  },
  backButton: {
    position: 'absolute',
    top: responsiveSize(50, 55, 60),
    left: responsiveSize(14, 15, 16),
    zIndex: 1,
    padding: responsiveSize(6, 7, 8),
  },
  headerContent: {
    alignItems: 'center',
  },
  headerIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: responsiveSize(18, 19, 20),
    padding: responsiveSize(14, 15, 16),
    marginBottom: responsiveSize(14, 15, 16),
  },
  headerTitle: {
    fontSize: responsiveSize(26, 29, 32),
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: responsiveSize(6, 7, 8),
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: responsiveSize(14, 15, 16),
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: responsiveSize(20, 21, 22),
    textAlign: 'center',
    paddingHorizontal: responsiveSize(10, 15, 20),
  },
  form: {
    padding: responsiveSize(20, 22, 24),
    paddingBottom: responsiveSize(60, 65, 70),
    marginTop: responsiveSize(-18, -19, -20),
    borderTopLeftRadius: responsiveSize(20, 22, 24),
    borderTopRightRadius: responsiveSize(20, 22, 24),
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Alumni info styles
  alumniInfoContainer: {
    borderRadius: responsiveSize(12, 13, 14),
    padding: responsiveSize(16, 17, 18),
    marginBottom: responsiveSize(20, 22, 24),
    borderLeftWidth: 4,
  },
  alumniInfoTitle: {
    fontSize: responsiveSize(12, 13, 14),
    fontWeight: '600',
    marginBottom: responsiveSize(4, 5, 6),
  },
  alumniInfoText: {
    fontSize: responsiveSize(14, 15, 16),
    fontWeight: '600',
  },

  // Disabled button style
  submitButtonDisabled: {
    opacity: 0.7,
  },

  inputGroup: {
    marginBottom: responsiveSize(20, 22, 24),
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: responsiveSize(10, 11, 12),
  },
  label: {
    fontSize: responsiveSize(14, 15, 16),
    fontWeight: '600',
    marginLeft: responsiveSize(6, 7, 8),
  },
  inputContainer: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  input: {
    borderWidth: 2,
    borderRadius: responsiveSize(14, 15, 16),
    paddingHorizontal: responsiveSize(18, 19, 20),
    paddingVertical: responsiveSize(14, 15, 16),
    fontSize: responsiveSize(14, 15, 16),
    minHeight: responsiveSize(50, 52, 54),
  },
  textAreaContainer: {
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  textArea: {
    borderWidth: 2,
    borderRadius: responsiveSize(14, 15, 16),
    paddingHorizontal: responsiveSize(18, 19, 20),
    paddingVertical: responsiveSize(14, 15, 16),
    fontSize: responsiveSize(14, 15, 16),
    minHeight: responsiveSize(100, 110, 120),
  },
  dropdown: {
    borderWidth: 2,
    borderRadius: responsiveSize(14, 15, 16),
    paddingHorizontal: responsiveSize(18, 19, 20),
    paddingVertical: responsiveSize(14, 15, 16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: responsiveSize(50, 52, 54),
  },
  dropdownText: {
    fontSize: responsiveSize(14, 15, 16),
    fontWeight: '500',
  },
  dropdownIcon: {
    borderRadius: responsiveSize(6, 7, 8),
    padding: responsiveSize(3, 3, 4),
  },
  submitButton: {
    marginTop: responsiveSize(28, 30, 32),
    borderRadius: responsiveSize(14, 15, 16),
    shadowColor: '#2E5BFF',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsiveSize(16, 17, 18),
    borderRadius: responsiveSize(14, 15, 16),
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: responsiveSize(16, 17, 18),
    fontWeight: '700',
    marginLeft: responsiveSize(6, 7, 8),
  },
  
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    borderTopLeftRadius: responsiveSize(20, 22, 24),
    borderTopRightRadius: responsiveSize(20, 22, 24),
    borderBottomLeftRadius: responsiveSize(20, 22, 24),
    borderBottomRightRadius: responsiveSize(20, 22, 24),
    maxHeight: '70%',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveSize(20, 22, 24),
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: responsiveSize(18, 19, 20),
    fontWeight: '700',
  },
  closeButton: {
    borderRadius: responsiveSize(10, 11, 12),
    padding: responsiveSize(6, 7, 8),
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: responsiveSize(16, 17, 18),
    paddingHorizontal: responsiveSize(20, 22, 24),
    borderBottomWidth: 0,
  },
  selectedOption: {
    borderBottomLeftRadius: responsiveSize(20, 22, 24),
    borderBottomRightRadius: responsiveSize(20, 22, 24),
  },
  optionText: {
    fontSize: responsiveSize(14, 15, 16),
    fontWeight: '500',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  checkmarkContainer: {
    borderRadius: responsiveSize(10, 11, 12),
    padding: responsiveSize(3, 3, 4),
  },
});

export default MentorshipScreen;