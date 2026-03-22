import BarcodeScannerModal from '@/components/BarcodeScannerModal';
import { Colors } from '@/constants/Colors';
import { useData } from '@/contexts/DataContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Item } from '@/types';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface EditItemModalProps {
  visible: boolean;
  item: Item | null;
  onClose: () => void;
}

const RECURRENCE_OPTIONS = ['weekly', 'monthly', 'yearly'] as const;

export default function EditItemModal({ visible, item, onClose }: EditItemModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePeriod, setRecurrencePeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerVisible, setIsScannerVisible] = useState(false);

  const { updateItem } = useData();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(item.price.toString());
      setCategory(item.description ?? '');
      setImageUri(item.image_url ?? null);
      setIsRecurring(item.is_recurring ?? false);
      setRecurrencePeriod(item.recurrence_period ?? 'monthly');
    }
  }, [item]);

  const takePicture = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleBarcodeScanned = (scannedName: string) => {
    setName(scannedName);
    setIsScannerVisible(false);
  };

  const handleSubmit = async () => {
    if (!item) return;

    if (!name.trim() || !price.trim()) {
      Alert.alert('Error', 'Please fill in name and price');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setIsLoading(true);
    try {
      await updateItem(item.id, {
        name: name.trim(),
        price: priceValue,
        description: category.trim() || undefined,
        image_url: imageUri || undefined,
        is_recurring: isRecurring,
        recurrence_period: isRecurring ? recurrencePeriod : undefined,
      });
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to update item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          style={[styles.container, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Edit Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeText, { color: colors.tint }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Image Section */}
            <View style={styles.imageSection}>
              {imageUri ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: imageUri }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImageUri(null)}
                  >
                    <Text style={styles.removeImageText}>×</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.imagePlaceholder, { borderColor: colors.border }]}>
                  <Text style={[styles.imagePlaceholderText, { color: colors.tabIconDefault }]}>
                    No Image
                  </Text>
                </View>
              )}

              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: colors.tint }]}
                  onPress={takePicture}
                >
                  <Text style={styles.imageButtonText}>Take Photo</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: colors.border }]}
                  onPress={pickImage}
                >
                  <Text style={[styles.imageButtonText, { color: colors.text }]}>Choose Photo</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Name + Scan Barcode */}
              <View style={styles.nameRow}>
                <TextInput
                  style={[styles.input, styles.nameInput, {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  }]}
                  placeholder="Item Name"
                  placeholderTextColor={colors.tabIconDefault}
                  value={name}
                  onChangeText={setName}
                />
                <TouchableOpacity
                  style={[styles.scanButton, { backgroundColor: colors.tint }]}
                  onPress={() => setIsScannerVisible(true)}
                >
                  <Text style={styles.scanButtonText}>📷 Scan</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={[styles.input, {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                }]}
                placeholder="Price"
                placeholderTextColor={colors.tabIconDefault}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />

              <TextInput
                style={[styles.input, {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                }]}
                placeholder="Category (optional)"
                placeholderTextColor={colors.tabIconDefault}
                value={category}
                onChangeText={setCategory}
              />

              {/* Recurring Toggle */}
              <View style={[styles.recurringRow, { borderColor: colors.border }]}>
                <View>
                  <Text style={[styles.recurringLabel, { color: colors.text }]}>Recurring Expense</Text>
                  <Text style={[styles.recurringSubLabel, { color: colors.tabIconDefault }]}>
                    Mark this as a regular expense
                  </Text>
                </View>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: colors.border, true: colors.tint }}
                  thumbColor="white"
                />
              </View>

              {isRecurring && (
                <View style={styles.periodPicker}>
                  {RECURRENCE_OPTIONS.map(option => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.periodOption,
                        recurrencePeriod === option
                          ? { backgroundColor: colors.tint }
                          : { backgroundColor: colors.border },
                      ]}
                      onPress={() => setRecurrencePeriod(option)}
                    >
                      <Text style={[
                        styles.periodOptionText,
                        { color: recurrencePeriod === option ? 'white' : colors.text },
                      ]}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.tint }]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <BarcodeScannerModal
        visible={isScannerVisible}
        onClose={() => setIsScannerVisible(false)}
        onScanned={handleBarcodeScanned}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '600' },
  closeButton: { padding: 5 },
  closeText: { fontSize: 16 },
  content: { flex: 1, padding: 20 },
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: { position: 'relative', marginBottom: 15 },
  image: { width: 200, height: 150, borderRadius: 10 },
  removeImageButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  imagePlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePlaceholderText: { fontSize: 16 },
  imageButtons: { flexDirection: 'row', gap: 10 },
  imageButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  imageButtonText: { color: 'white', fontSize: 14, fontWeight: '600' },
  form: { marginBottom: 24 },
  nameRow: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  nameInput: { flex: 1, marginBottom: 0 },
  scanButton: {
    height: 50,
    paddingHorizontal: 14,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: { color: 'white', fontSize: 13, fontWeight: '600' },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
  },
  recurringLabel: { fontSize: 16, fontWeight: '500' },
  recurringSubLabel: { fontSize: 12, marginTop: 2 },
  periodPicker: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  periodOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  periodOptionText: { fontSize: 14, fontWeight: '600' },
  actions: { paddingBottom: 40 },
  submitButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});
