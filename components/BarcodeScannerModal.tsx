import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface BarcodeScannerModalProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (name: string) => void;
}

export default function BarcodeScannerModal({ visible, onClose, onScanned }: BarcodeScannerModalProps) {
  const [scanned, setScanned] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || isLookingUp) return;
    setScanned(true);
    setIsLookingUp(true);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${data}?fields=product_name,brands`
      );
      const json = await response.json();

      if (json.status === 1 && json.product?.product_name) {
        const name = json.product.product_name;
        onScanned(name);
      } else {
        Alert.alert(
          'Product Not Found',
          'Could not find this product in the database. You can enter the name manually.',
          [{ text: 'OK', onPress: () => { setScanned(false); setIsLookingUp(false); } }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Lookup Failed',
        'Could not look up the product. Please try again or enter manually.',
        [{ text: 'OK', onPress: () => { setScanned(false); setIsLookingUp(false); } }]
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  if (!visible) return null;

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            Camera permission is required to scan barcodes.
          </Text>
          <TouchableOpacity
            style={[styles.permissionButton, { backgroundColor: colors.tint }]}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <Text style={[styles.cancelText, { color: colors.tint }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <CameraView
          style={StyleSheet.absoluteFillObject}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'qr', 'code128', 'code39'],
          }}
        />

        {/* Overlay */}
        <View style={styles.overlay}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          {isLookingUp ? (
            <View style={styles.lookupOverlay}>
              <ActivityIndicator size="large" color="white" />
              <Text style={styles.lookupText}>Looking up product...</Text>
            </View>
          ) : (
            <Text style={styles.hint}>Point camera at a barcode</Text>
          )}
        </View>
      </View>
    </Modal>
  );
}

const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionText: { fontSize: 16, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  cancelButton: { padding: 10 },
  cancelText: { fontSize: 16 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: { color: 'white', fontSize: 18 },
  scanFrame: {
    width: 240,
    height: 160,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: 'white',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
  },
  hint: {
    position: 'absolute',
    bottom: '30%',
    color: 'rgba(255,255,255,0.8)',
    fontSize: 15,
    textAlign: 'center',
  },
  lookupOverlay: {
    position: 'absolute',
    bottom: '30%',
    alignItems: 'center',
    gap: 12,
  },
  lookupText: { color: 'white', fontSize: 15 },
});
