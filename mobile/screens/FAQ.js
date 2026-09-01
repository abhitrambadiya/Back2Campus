import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const AlumniFAQScreen = ({ navigation }) => {
  const { theme } = useTheme(); // Add theme hook

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [alumniData, setAlumniData] = useState({
    alumniName: '',
    alumniCompany: '',
    alumniPosition: ''
  });

  // FAQ data
  const faqs = [
    {
      question: "How do I join the Back2Campus?",
      answer: "Joining is easy! All graduates automatically become members of our Back2Campus. To access exclusive benefits and stay connected, simply register on our alumni portal using your student ID or graduation year.",
      category: "Membership"
    },
    {
      question: "What networking opportunities are available?",
      answer: "We offer various networking opportunities including annual reunions, professional meetups, mentorship programs, and our online alumni directory. We also host regular industry-specific events and webinars throughout the year.",
      category: "Events"
    },
    {
      question: "How can I update my contact information?",
      answer: "Log in to the alumni portal and navigate to 'My Profile' to update your contact information, professional details, and communication preferences. Keeping your information current helps us keep you informed about relevant opportunities and events.",
      category: "Portal Access"
    },
    {
      question: "What benefits do alumni members receive?",
      answer: "Members enjoy access to career services, library resources, gym facilities, exclusive events, mentorship programs, and special discounts on continuing education courses. You'll also receive our quarterly newsletter and invitations to special campus events.",
      category: "Benefits"
    },
    {
      question: "How can I give back to the university?",
      answer: "There are many ways to give back! You can volunteer as a mentor, contribute to scholarship funds, participate in fundraising events, or join our alumni advisory board. Contact our alumni office to learn more about specific opportunities.",
      category: "Giving Back"
    },
    {
      question: "Can I access the university library as an alumnus?",
      answer: "Yes, alumni members have access to both physical and digital library resources. You can obtain your alumni library card from the main library with proof of graduation. Digital resources can be accessed through the alumni portal.",
      category: "Resources"
    },
    {
      question: "How do I get involved in mentoring current students?",
      answer: "Our mentorship program pairs alumni with current students based on career paths and interests. Sign up through the alumni portal's 'Mentorship' section, where you can create a profile and specify your areas of expertise.",
      category: "Mentorship"
    }
  ];

  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

  // Effects
  useEffect(() => {
    fetchFaqsWithDelay();
  }, []);

  // Functions
  const fetchFaqsWithDelay = async () => {
    const start = Date.now();
    
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (error) {
      console.error("Error fetching FAQs:", error);
    } finally {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, 1000 - elapsed);

      setTimeout(() => {
        setLoading(false);
      }, delay);
    }
  };

  const toggleItem = (index) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Category Modal with theme support
  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
        <View style={[styles.modalContent, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor 
        }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Select Category</Text>
            <TouchableOpacity 
              onPress={() => setShowCategoryModal(false)} 
              style={[styles.closeButton, { backgroundColor: theme.accentBg2 }]}
            >
              <Ionicons name="close" size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  { borderBottomColor: theme.border },
                  activeCategory === item && [styles.selectedOption, { backgroundColor: theme.accentBg1 }]
                ]}
                onPress={() => {
                  setActiveCategory(item);
                  setShowCategoryModal(false);
                }}
              >
                <Text style={[
                  styles.optionText, 
                  { color: theme.textSecondary },
                  activeCategory === item && [styles.selectedOptionText, { color: theme.primary }]
                ]}>
                  {item}
                </Text>
                {activeCategory === item && (
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
        {/* Enhanced Header with Gradient - matching internship screen exactly */}
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
              <Icon name="question-answer" size={responsiveSize(28, 30, 32)} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Back2Campus FAQ</Text>
            <Text style={styles.headerSubtitle}>
              Find answers to common questions about your alumni benefits and services
            </Text>
          </View>
        </LinearGradient>

        <View style={[styles.form, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor 
        }]}>
          {/* Search Bar - enhanced to match internship screen style */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="search" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Search FAQs</Text>
            </View>
            <View style={[styles.inputContainer, { shadowColor: theme.shadowColor }]}>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text 
                }]}
                placeholder="Search FAQs..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={theme.textTertiary}
              />
            </View>
          </View>

          {/* Category Filter - matching internship screen dropdown style */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="filter-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Filter by Category</Text>
            </View>
            <TouchableOpacity 
              style={[styles.dropdown, { 
                backgroundColor: theme.card,
                borderColor: theme.border,
                shadowColor: theme.shadowColor 
              }]} 
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={[styles.dropdownText, { color: theme.text }]}>{activeCategory}</Text>
              <View style={[styles.dropdownIcon, { backgroundColor: theme.accentBg2 }]}>
                <Ionicons name="chevron-down" size={20} color={theme.primary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* FAQ List */}
          <View style={styles.faqContainer}>
            {filteredFaqs.length === 0 ? (
              <View style={styles.noResultsContainer}>
                <Ionicons name="search-outline" size={48} color={theme.textTertiary} />
                <Text style={[styles.noResultsText, { color: theme.textTertiary }]}>
                  No FAQs found matching your search criteria.
                </Text>
              </View>
            ) : (
              filteredFaqs.map((faq, index) => (
                <View key={index} style={[styles.faqItem, { 
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  shadowColor: theme.shadowColor 
                }]}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleItem(index)}
                  >
                    <Text style={[styles.faqQuestion, { color: theme.text }]}>{faq.question}</Text>
                    <View style={[styles.chevronContainer, { backgroundColor: theme.accentBg2 }]}>
                      <Ionicons 
                        name={openItems.includes(index) ? "chevron-up" : "chevron-down"} 
                        size={20} 
                        color={theme.primary} 
                      />
                    </View>
                  </TouchableOpacity>
                  
                  {openItems.includes(index) && (
                    <View style={[styles.faqAnswer, { backgroundColor: theme.accentBg2 }]}>
                      <Text style={[styles.faqAnswerText, { color: theme.textSecondary }]}>
                        {faq.answer}
                      </Text>
                      <View style={[styles.categoryTag, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.categoryTagText, { color: theme.textButton }]}>
                          {faq.category}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Category Modal */}
      {renderCategoryModal()}
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
  // Enhanced header styles matching internship screen exactly
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
  // Enhanced form styles matching internship screen exactly
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
  // Input group styles matching internship screen
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
  // Enhanced dropdown styles matching internship screen
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
  // FAQ specific styles with enhanced design
  faqContainer: {
    marginTop: responsiveSize(10, 11, 12),
  },
  faqItem: {
    borderRadius: responsiveSize(14, 15, 16),
    marginBottom: responsiveSize(12, 13, 14),
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: responsiveSize(16, 17, 18),
  },
  faqQuestion: {
    fontSize: responsiveSize(14, 15, 16),
    fontWeight: '600',
    flex: 1,
    marginRight: responsiveSize(10, 11, 12),
  },
  chevronContainer: {
    borderRadius: responsiveSize(6, 7, 8),
    padding: responsiveSize(4, 5, 6),
  },
  faqAnswer: {
    paddingHorizontal: responsiveSize(16, 17, 18),
    paddingBottom: responsiveSize(16, 17, 18),
    borderBottomLeftRadius: responsiveSize(14, 15, 16),
    borderBottomRightRadius: responsiveSize(14, 15, 16),
  },
  faqAnswerText: {
    fontSize: responsiveSize(13, 14, 15),
    lineHeight: responsiveSize(20, 21, 22),
    marginBottom: responsiveSize(12, 13, 14),
  },
  categoryTag: {
    paddingHorizontal: responsiveSize(10, 11, 12),
    paddingVertical: responsiveSize(4, 5, 6),
    borderRadius: responsiveSize(12, 13, 14),
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    fontSize: responsiveSize(11, 12, 13),
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: responsiveSize(40, 45, 50),
  },
  noResultsText: {
    fontSize: responsiveSize(14, 15, 16),
    marginTop: responsiveSize(12, 13, 14),
    textAlign: 'center',
  },
  // Enhanced modal styles matching internship screen exactly
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
    // backgroundColor handled dynamically
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

export default AlumniFAQScreen;