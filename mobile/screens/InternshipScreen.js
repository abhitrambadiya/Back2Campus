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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../config";
import { useTheme } from '../contexts/ThemeContext'; // Add theme import

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Responsive dimensions
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const isLargeScreen = screenWidth >= 414;

const responsiveSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const InternshipScreen = ({ navigation }) => {
  const { theme } = useTheme(); // Add theme hook

  const [formData, setFormData] = useState({
    title: '',
    company: '', // Changed from companyName to company
    mode: 'Online', // Updated default value
    duration: '1-3 months', // Updated default value
    stipend: '',
    limit: '',
    description: '',
    prerequisites: '',
    requiredSkills: '',
    deadline: '',
  });

  const [alumniData, setAlumniData] = useState({
    alumniName: '',
    alumniCompany: '',
    alumniPosition: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showModeModal, setShowModeModal] = useState(false);
  const [showDurationModal, setShowDurationModal] = useState(false);

  const modeOptions = [
    'Online',
    'Offline',
  ];

  const durationOptions = [
    '1-3 months',
    '3-6 months',
    '6-12 months',
    '1 year',
  ];

  // Fetch alumni profile data on component mount
  useEffect(() => {
    fetchAlumniProfile();
  }, []);

  const fetchAlumniProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('alumniToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        navigation.navigate('Login'); // Navigate to login screen
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

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const requiredFields = ['title', 'company', 'description'];
    
    for (let field of requiredFields) {
      if (!formData[field].trim()) {
        Alert.alert('Error', `Please fill in the ${field} field`);
        return false;
      }
    }

    if (formData.limit && (isNaN(formData.limit) || parseInt(formData.limit) < 1)) {
      Alert.alert('Error', 'Please enter a valid number for openings limit');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const token = await AsyncStorage.getItem('alumniToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        navigation.navigate('Login');
        return;
      }

      // Prepare data to match backend expectations
      const submissionData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        mode: formData.mode,
        duration: formData.duration,
        stipend: formData.stipend.trim(),
        limit: formData.limit ? parseInt(formData.limit) : 1,
        description: formData.description.trim(),
        prerequisites: formData.prerequisites.trim(),
        requiredSkills: formData.requiredSkills.split(',').map(skill => skill.trim()).filter(skill => skill),
        deadline: formData.deadline.trim(),
        // Alumni data will be automatically populated by backend from token
        alumniName: alumniData.alumniName,
        alumniCompany: alumniData.alumniCompany,
        alumniPosition: alumniData.alumniPosition
      };

      const response = await fetch(`${API_BASE_URL}/alumni/internships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(submissionData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create internship');
      }

      Alert.alert(
        'Success', 
        'Internship posted successfully! It will be reviewed by administrators.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form after successful submission
              setFormData({
                title: '',
                company: '',
                mode: 'Online',
                duration: '1-3 months',
                stipend: '',
                limit: '',
                description: '',
                prerequisites: '',
                requiredSkills: '',
                deadline: '',
              });
              navigation.goBack(); // Navigate back to previous screen
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error creating internship:', error);
      Alert.alert('Error', error.message || 'Failed to post internship. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={['#2E5BFF', '#1E40AF', '#1E293B']}
          start={{ x: 0, y: 0 }}  
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={responsiveSize(24, 26, 28)} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Ionicons name="briefcase" size={responsiveSize(28, 30, 32)} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Post an Internship</Text>
            <Text style={styles.headerSubtitle}>
              Create amazing opportunities for the future talents
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
              <Text style={[styles.alumniInfoTitle, { color: theme.primary }]}>Posted by:</Text>
              <Text style={[styles.alumniInfoText, { color: theme.text }]}>
                {alumniData.alumniName} - {alumniData.alumniPosition} at {alumniData.alumniCompany}
              </Text>
            </View>
          )}

          {/* Internship Title */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="create-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Internship Title *</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Enter internship title"
                value={formData.title}
                onChangeText={(text) => handleInputChange('title', text)}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Company Name */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="business-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Company Name *</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Enter company name"
                value={formData.company}
                onChangeText={(text) => handleInputChange('company', text)}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Mode */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="location-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Mode</Text>
            </View>
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor 
              }]}
              onPress={() => setShowModeModal(true)}
            >
              <Text style={[styles.dropdownText, { color: theme.text }]}>{formData.mode}</Text>
              <View style={[styles.dropdownIcon, { backgroundColor: theme.accentBg2 }]}>
                <Ionicons name="chevron-down" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Time Duration */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="time-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Time Duration</Text>
            </View>
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor 
              }]}
              onPress={() => setShowDurationModal(true)}
            >
              <Text style={[styles.dropdownText, { color: theme.text }]}>{formData.duration}</Text>
              <View style={[styles.dropdownIcon, { backgroundColor: theme.accentBg2 }]}>
                <Ionicons name="chevron-down" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Stipend */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="card-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Stipend</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Enter stipend amount (e.g., ₹10,000/month or Unpaid)"
                value={formData.stipend}
                onChangeText={(text) => handleInputChange('stipend', text)}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Number of Openings */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="people-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Number of Openings</Text>
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

          {/* Description & Responsibilities */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="document-text-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
            </View>
            <View style={[styles.textAreaContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Enter detailed internship description and responsibilities (minimum 50 words)"
                value={formData.description}
                onChangeText={(text) => handleInputChange('description', text)}
                multiline
                numberOfLines={responsiveSize(4, 5, 6)}
                textAlignVertical="top"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Prerequisites */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="school-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Prerequisites</Text>
            </View>
            <View style={[styles.textAreaContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="E.g. Basics in Figma and UI design or wireframing knowledge"
                value={formData.prerequisites}
                onChangeText={(text) => handleInputChange('prerequisites', text)}
                multiline
                numberOfLines={responsiveSize(3, 4, 5)}
                textAlignVertical="top"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Required Skills*/}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="code-slash-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Skills Required</Text>
            </View>
            <View style={[styles.textAreaContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="E.g. Python, C, R, Java, MERN (comma separated)"
                value={formData.requiredSkills}
                onChangeText={(text) => handleInputChange('requiredSkills', text)}
                multiline
                numberOfLines={responsiveSize(3, 4, 5)}
                textAlignVertical="top"
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Application Deadline */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="calendar-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Application Deadline</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="dd/mm/yyyy"
                value={formData.deadline}
                onChangeText={(text) => handleInputChange('deadline', text)}
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
                {isLoading ? 'Posting...' : 'Post Internship'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Enhanced Modals */}
      {renderDropdownModal(
        showModeModal,
        setShowModeModal,
        modeOptions,
        formData.mode,
        (value) => handleInputChange('mode', value),
        'Select Work Mode'
      )}

      {renderDropdownModal(
        showDurationModal,
        setShowDurationModal,
        durationOptions,
        formData.duration,
        (value) => handleInputChange('duration', value),
        'Select Duration'
      )}
    </View>
  );
};

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
    marginBottom: responsiveSize(4, 4, 5),
  },
  alumniInfoText: {
    fontSize: responsiveSize(14, 15, 16),
    fontWeight: '500',
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
  submitButtonDisabled: {
    shadowOpacity: 0.1,
    elevation: 4,
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
    padding: 10,
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

export default InternshipScreen;