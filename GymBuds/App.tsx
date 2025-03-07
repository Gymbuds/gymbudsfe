import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function LoginMockup() {
  const [secureText, setSecureText] = useState(true);

  return (
    <LinearGradient colors={["#F2ECFF", "#E5D4FF"]} style={styles.container}>
      <Text style={styles.logo}>
        Gym<Text style={{ color: "#7E6BAF" }}>Buds</Text>
      </Text>

      <Text style={styles.welcome}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to continue your fitness journey</Text>

      <View style={styles.inputContainer}>
        <Icon name="envelope" size={20} color="#B5B0B0" />
        <TextInput style={styles.input} placeholder="Enter your email" placeholderTextColor="#B5B0B0" />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#B5B0B0" />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#B5B0B0"
          secureTextEntry={secureText}
        />
        <TouchableOpacity onPress={() => setSecureText(!secureText)}>
          <Icon name={secureText ? "eye-slash" : "eye"} size={20} color="#B5B0B0" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={styles.forgotPassword}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.loginButton}>
        <Icon name="arrow-right" size={20} color="white" />
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity>
        <Text style={styles.signupText}>
          Don’t have an account? <Text style={{ color: "#A385F1" }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 36,
    fontWeight: "700",
    color: "#A385F1",
  },
  welcome: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "#665555",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  input: {
    flex: 1,
    paddingLeft: 10,
    fontSize: 15,
    color: "#000",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    color: "#A385F1",
    fontSize: 14,
    marginBottom: 20,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A385F1",
    borderRadius: 25,
    width: "100%",
    height: 50,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loginText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 10,
  },
  signupText: {
    fontSize: 14,
    color: "#665555",
  },
});