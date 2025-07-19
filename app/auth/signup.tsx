import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Zap,
  Mail,
  Lock,
  User,
  ArrowLeft,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { BoltCard } from '@/components/design-system/BoltCard';
import { LightningButton } from '@/components/design-system/LightningButton';
import { SmartInput } from '@/components/design-system/SmartInput';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Navigate to onboarding with signup data instead of creating account immediately
    router.push({
      pathname: '/onboarding',
      params: {
        signupData: JSON.stringify({
          name,
          email,
          password,
          isGoogleUser: false,
        }),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0F0F23', '#1A1A2E', '#0F0F23']}
        style={styles.background}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Back Arrow */}
            <LightningButton
              variant="ghost"
              size="small"
              onPress={() => router.back()}
              icon={<ArrowLeft size={24} color="#FFFFFF" />}
              style={styles.backButton}
            />

            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Zap size={32} color="#6B46C1" />
              </View>
              <Text style={styles.logoText}>BoltFit</Text>
            </View>

            <Text style={styles.headerTitle}>Join the Revolution</Text>
            <Text style={styles.headerSubtitle}>
              Create your account and start your fitness journey
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <BoltCard
              variant="glass"
              style={[styles.formCard, styles.formGradient]}
            >
              {/* Name Input */}
              <SmartInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                leftIcon={<User size={20} color="#6B46C1" />}
                style={styles.inputGroup}
              />

              {/* Email Input */}
              <SmartInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={20} color="#6B46C1" />}
                style={styles.inputGroup}
              />

              {/* Password Input */}
              <SmartInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                secureTextEntry={true}
                leftIcon={<Lock size={20} color="#6B46C1" />}
                style={styles.inputGroup}
              />

              {/* Confirm Password Input */}
              <SmartInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm your password"
                secureTextEntry={true}
                leftIcon={<Lock size={20} color="#6B46C1" />}
                style={styles.inputGroup}
              />

              {/* Terms */}
              <View style={styles.termsContainer}>
                <Text style={styles.termsText}>
                  By signing up, you agree to our{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </View>

              {/* Sign Up Button */}
              <LightningButton
                variant="primary"
                size="large"
                onPress={handleSignUp}
                disabled={loading}
                loading={loading}
                icon={!loading ? <Zap size={20} color="#FFFFFF" /> : undefined}
                style={styles.button}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </LightningButton>

              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <LightningButton
                  variant="ghost"
                  size="small"
                  onPress={() => router.push('/auth/login')}
                >
                  Sign In
                </LightningButton>
              </View>
            </BoltCard>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F23',
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6B46C1' + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  formCard: {
    marginBottom: 20,
  },
  formGradient: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A1A2E',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F23',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    paddingHorizontal: 16,
    height: 50,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordToggle: {
    padding: 4,
  },
  termsContainer: {
    marginBottom: 24,
  },
  termsText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#6B46C1',
    fontWeight: '600',
  },
  button: {
    marginBottom: 20,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginRight: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1A1A2E',
  },
  dividerText: {
    fontSize: 14,
    color: '#64748B',
    marginHorizontal: 16,
  },
  socialButton: {
    marginBottom: 20,
  },
  socialGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1A1A2E',
    alignItems: 'center',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 16,
    color: '#94A3B8',
  },
  signInLink: {
    fontSize: 16,
    color: '#6B46C1',
    fontWeight: '600',
  },
});
