// screens/DonationScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RazorpayCheckout from 'react-native-razorpay';
import { useTheme } from '../contexts/ThemeContext'; // Add theme import

const { width: screenWidth } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;
const isMediumScreen = screenWidth >= 375 && screenWidth < 414;
const responsiveSize = (small, medium, large) => {
  if (isSmallScreen) return small;
  if (isMediumScreen) return medium;
  return large;
};

const DonationScreen = ({ navigation }) => {
  const { theme } = useTheme(); // Add theme hook

  const [selectedAmount, setSelectedAmount] = useState(null);
  const [recentDonations, setRecentDonations] = useState([
    { id: 1, name: 'Rahul Sharma', amount: 1000, date: 'Aug 12, 2025' },
    { id: 2, name: 'Sneha Patil', amount: 500, date: 'Aug 11, 2025' },
    { id: 3, name: 'Amit Verma', amount: 5000, date: 'Aug 10, 2025' },
  ]);

  const donationStats = [
    { id: 1, label: 'Scholarships Funded', value: '120+' },
    { id: 2, label: 'Events Organized', value: '50+' },
    { id: 3, label: 'Infrastructure Upgrades', value: '15+' },
  ];

  const donationAmounts = [500, 1000, 5000];

  const handleDonation = () => {
    if (!selectedAmount) {
      Alert.alert('Select Amount', 'Please choose a donation amount.');
      return;
    }

    var options = {
      description: 'Alumni Donation',
      image: 'kitlogo.png',
      currency: 'INR',
      key: 'rzp_test_1DP5mmOlF5G5ag',
      amount: selectedAmount * 100,
      name: 'Back2Campus',
      prefill: { email: 'test@example.com', contact: '9999999999', name: 'Test User' },
      theme: { color: '#4f46e5' },
    };

    RazorpayCheckout.open(options)
      .then((data) => {
        const newDonation = {
          id: Date.now(),
          name: 'Test User',
          amount: selectedAmount,
          date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        };
        setRecentDonations((prev) => [newDonation, ...prev]);
        Alert.alert('Success', `Payment ID: ${data.razorpay_payment_id}`);
      })
      .catch((error) => {
        Alert.alert('Error', `${error.code} | ${error.description}`);
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
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
              <Icon name="hand-heart" size={responsiveSize(28, 30, 32)} color="#FFFFFF" />
            </View>
            <Text style={styles.headerTitle}>Support Your Alma Mater</Text>
            <Text style={styles.headerSubtitle}>
              Every contribution helps us create a brighter future for our students.
            </Text>
          </View>
        </LinearGradient>

        {/* Form Section */}
        <View style={[styles.form, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor 
        }]}>
          {/* Why Donate */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Why Donate?</Text>
            </View>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              Your contributions help in funding scholarships, improving campus facilities,
              organizing alumni meets, and supporting student-driven initiatives.
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {donationStats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <Text style={[styles.statValue, { color: theme.primary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Select Donation Amount */}
          <View style={styles.inputGroup}>
            <View style={styles.labelContainer}>
              <Ionicons name="cash-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Choose Donation Amount</Text>
            </View>
            <View style={styles.amountContainer}>
              {donationAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountBtn,
                    { backgroundColor: theme.accentBg2 },
                    selectedAmount === amount && [styles.amountBtnSelected, { backgroundColor: theme.primary }],
                  ]}
                  onPress={() => setSelectedAmount(amount)}
                >
                  <Text
                    style={[
                      styles.amountText,
                      { color: theme.text },
                      selectedAmount === amount && [styles.amountTextSelected, { color: theme.textButton }],
                    ]}
                  >
                    ₹{amount}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.amountBtn,
                  { backgroundColor: theme.accentBg2 },
                  selectedAmount === 'custom' && [styles.amountBtnSelected, { backgroundColor: theme.primary }],
                ]}
                onPress={() => {
                  setSelectedAmount('custom');
                  Alert.alert('Custom Amount', 'Custom donation amount feature coming soon.');
                }}
              >
                <Text
                  style={[
                    styles.amountText,
                    { color: theme.text },
                    selectedAmount === 'custom' && [styles.amountTextSelected, { color: theme.textButton }],
                  ]}
                >
                  Custom
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Donate Button */}
          <TouchableOpacity style={[styles.submitButton]} onPress={handleDonation}>
            <LinearGradient
              colors={['#2E5BFF', '#1E40AF', '#1E293B']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}
            >
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Donate Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Recently Donated Section */}
          <View style={{ marginTop: responsiveSize(30, 35, 40) }}>
            <View style={styles.labelContainer}>
              <Ionicons name="people-outline" size={20} color={theme.primary} />
              <Text style={[styles.label, { color: theme.text }]}>Recently Donated</Text>
            </View>
            {recentDonations.map((donation) => (
              <View key={donation.id} style={[styles.recentCard, { 
                backgroundColor: theme.accentBg1,
                borderColor: theme.border 
              }]}>
                <View>
                  <Text style={[styles.recentName, { color: theme.text }]}>{donation.name}</Text>
                  <Text style={[styles.recentDate, { color: theme.textSecondary }]}>{donation.date}</Text>
                </View>
                <Text style={[styles.recentAmount, { color: theme.primary }]}>₹{donation.amount}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* Styles */
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
  },
  content: { 
    flex: 1 
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
    alignItems: 'center' 
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
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  inputGroup: { 
    marginBottom: responsiveSize(20, 22, 24) 
  },
  labelContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: responsiveSize(10, 11, 12) 
  },
  label: { 
    fontSize: responsiveSize(14, 15, 16), 
    fontWeight: '600', 
    marginLeft: responsiveSize(6, 7, 8) 
  },
  description: { 
    fontSize: responsiveSize(14, 15, 16), 
    lineHeight: responsiveSize(20, 21, 22) 
  },
  statsContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginVertical: responsiveSize(20, 22, 24) 
  },
  statCard: { 
    alignItems: 'center', 
    flex: 1 
  },
  statValue: { 
    fontSize: responsiveSize(20, 22, 24), 
    fontWeight: '800' 
  },
  statLabel: { 
    fontSize: responsiveSize(12, 13, 14), 
    textAlign: 'center', 
    marginTop: responsiveSize(4, 4, 5) 
  },
  amountContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 10 
  },
  amountBtn: { 
    paddingVertical: 12, 
    paddingHorizontal: 20, 
    borderRadius: 16 
  },
  amountBtnSelected: {
    // backgroundColor handled dynamically
  },
  amountText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  amountTextSelected: {
    // color handled dynamically
  },
  submitButton: {
    marginTop: responsiveSize(28, 30, 32),
    borderRadius: responsiveSize(14, 15, 16),
    shadowColor: '#2E5BFF',
    shadowOffset: { width: 0, height: 8 },
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
  /* Recently Donated Styles */
  recentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  recentName: { 
    fontSize: 14, 
    fontWeight: '600' 
  },
  recentDate: { 
    fontSize: 12, 
    marginTop: 2 
  },
  recentAmount: { 
    fontSize: 15, 
    fontWeight: '700' 
  },
});

export default DonationScreen;