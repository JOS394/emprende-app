// Función para tomar foto
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { OrdersService } from '../../../src/services/OrdersService';


export default function OrdersScreen() {
const [content, setContent] = useState('');
const [vendor, setVendor] = useState('');
const [total, setTotal] = useState('');
const [dateStart, setDateStart] = useState(new Date());
const [dateEnd, setDateEnd] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState<'start' | 'end' | null>(null);
const [inputMode, setInputMode] = useState<'text' | 'photo'>('text');
const [photoUri, setPhotoUri] = useState<string | null>(null);

// Configurar fechas por defecto (hoy + 7 días)
useEffect(() => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  setDateStart(today);
  setDateEnd(nextWeek);
}, []);

const formatDate = (date: Date) => {
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatDateRange = () => {
  if (dateStart.toDateString() === dateEnd.toDateString()) {
    return `Entregar el ${formatDate(dateStart)}`;
  }
  return `Entregar entre ${formatDate(dateStart)} - ${formatDate(dateEnd)}`;
};

const onDateChange = (event: any, selectedDate?: Date) => {
  if (selectedDate) {
    if (showDatePicker === 'start') {
      setDateStart(selectedDate);
      if (selectedDate > dateEnd) {
        const newEnd = new Date(selectedDate);
        newEnd.setDate(selectedDate.getDate() + 1);
        setDateEnd(newEnd);
      }
    } else if (showDatePicker === 'end') {
      if (selectedDate < dateStart) {
        Alert.alert('Error', 'La fecha de fin no puede ser anterior a la fecha de inicio');
      } else {
        setDateEnd(selectedDate);
      }
    }
  }
  setShowDatePicker(null);
};



const savePedido = async () => {
  if (inputMode === 'text' && !content.trim()) {
    Alert.alert('Error', 'Debes agregar contenido al pedido');
    return;
  }

  if (inputMode === 'photo' && !photoUri) {
    Alert.alert('Error', 'Debes tomar una foto del pedido');
    return;
  }

  if (!vendor.trim()) {
    Alert.alert('Error', 'Debes especificar un proveedor');
    return;
  }

  try {
    const newOrder = {
      date_order: new Date(), // Fecha automática de hoy
      date_start: dateStart,
      date_end: dateEnd,
      vendor: vendor.trim(),
      status: 'pending' as const,
      content: inputMode === 'text' ? content.trim() : `Pedido con imagen: ${photoUri}`,
      total: total ? parseFloat(total) : undefined
    };

    await OrdersService.create(newOrder);
    
    Alert.alert(
      'Éxito', 
      'Pedido guardado correctamente',
      [
        {
          text: 'Ver Historial',
          onPress: () => router.push('/orders/history')
        },
        {
          text: 'Nuevo Pedido',
          onPress: () => {
            setContent('');
            setVendor('');
            setTotal('');
            setPhotoUri(null);
            setInputMode('text');
            const today = new Date();
            const nextWeek = new Date();
            nextWeek.setDate(today.getDate() + 7);
            setDateStart(today);
            setDateEnd(nextWeek);
          }
        }
      ]
    );
  } catch (error) {
    Alert.alert('Error', 'No se pudo guardar el pedido');
    console.error('Error guardando pedido:', error);
  }
};

const takePhoto = async () => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Error', 'Se necesitan permisos de cámara');
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    setPhotoUri(result.assets[0].uri);
  }
};

// Función para seleccionar de galería
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });

  if (!result.canceled && result.assets[0]) {
    setPhotoUri(result.assets[0].uri);
  }
};

const removePhoto = () => {
  setPhotoUri(null);
};

return (
  <ScrollView style={styles.container}>
    <View style={styles.content}>
      {/* Información básica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nuevo Pedido</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Proveedor *</Text>
          <TextInput
            style={styles.input}
            value={vendor}
            onChangeText={setVendor}
            placeholder="Nombre del proveedor"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total (opcional)</Text>
          <TextInput
            style={styles.input}
            value={total}
            onChangeText={setTotal}
            placeholder="0.00"
            keyboardType="numeric"
          />
        </View>

        {/* Rango de fechas */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fecha de entrega</Text>
          <View style={styles.dateRangeContainer}>
            <Text style={styles.dateRangeText}>{formatDateRange()}</Text>
            <View style={styles.dateButtons}>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker('start')}
              >
                <Ionicons name="calendar-outline" size={16} color="#007AFF" />
                <Text style={styles.dateButtonText}>Desde</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker('end')}
              >
                <Ionicons name="calendar-outline" size={16} color="#007AFF" />
                <Text style={styles.dateButtonText}>Hasta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Detalles del pedido */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detalles del Pedido</Text>
        
        <View style={styles.switchContainer}>
          <TouchableOpacity 
            style={[styles.switchButton, inputMode === 'text' && styles.switchButtonActive]}
            onPress={() => setInputMode('text')}
          >
            <Ionicons name="document-text-outline" size={16} color={inputMode === 'text' ? 'white' : '#666'} />
            <Text style={[styles.switchText, inputMode === 'text' && styles.switchTextActive]}>
              Texto
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.switchButton, inputMode === 'photo' && styles.switchButtonActive]}
            onPress={() => setInputMode('photo')}
          >
            <Ionicons name="camera-outline" size={16} color={inputMode === 'photo' ? 'white' : '#666'} />
            <Text style={[styles.switchText, inputMode === 'photo' && styles.switchTextActive]}>
              Foto
            </Text>
          </TouchableOpacity>
        </View>

        {inputMode === 'text' ? (
          <TextInput
            style={styles.contentInput}
            multiline
            placeholder="Describe tu pedido aquí...

Ejemplos:
• 10 cajas de papel A4
• 5 cartuchos de tinta negra
• 2 resmas de papel fotográfico

Tip: Usa el micrófono del teclado para dictar tu pedido"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        ) : (
          <View style={styles.photoContainer}>
            {photoUri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: photoUri }} style={styles.previewImage} />
                <View style={styles.photoActions}>
                  <TouchableOpacity style={styles.retakeButton} onPress={takePhoto}>
                    <Ionicons name="camera-outline" size={20} color="#007AFF" />
                    <Text style={styles.retakeText}>Tomar otra</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeButton} onPress={removePhoto}>
                    <Ionicons name="trash-outline" size={20} color="#F44336" />
                    <Text style={styles.removeText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={48} color="#ccc" />
                <Text style={styles.photoPlaceholderText}>Toma una foto de tu pedido</Text>
                <View style={styles.photoButtons}>
                  <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.photoButtonText}>Tomar Foto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
                    <Ionicons name="images" size={20} color="#007AFF" />
                    <Text style={styles.galleryButtonText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Botón de guardar */}
      <TouchableOpacity style={styles.saveButton} onPress={savePedido}>
        <Ionicons name="save-outline" size={24} color="white" />
        <Text style={styles.saveText}>Guardar Pedido</Text>
      </TouchableOpacity>
    </View>

    {/* Date Picker */}
    {showDatePicker && (
      <DateTimePicker
        value={showDatePicker === 'start' ? dateStart : dateEnd}
        mode="date"
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        onChange={onDateChange}
        minimumDate={showDatePicker === 'end' ? dateStart : new Date()}
      />
    )}
  </ScrollView>
);
}

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: '#f5f5f5',
},
content: {
  padding: 20,
},
section: {
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 20,
  marginBottom: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
sectionTitle: {
  fontSize: 20,
  fontWeight: 'bold',
  color: '#333',
  marginBottom: 20,
},
inputGroup: {
  marginBottom: 15,
},
label: {
  fontSize: 16,
  color: '#333',
  marginBottom: 8,
  fontWeight: '500',
},
input: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 15,
  fontSize: 16,
  backgroundColor: '#fafafa',
},
dateRangeContainer: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 15,
  backgroundColor: '#fafafa',
},
dateRangeText: {
  fontSize: 16,
  color: '#333',
  marginBottom: 10,
},
dateButtons: {
  flexDirection: 'row',
  gap: 10,
},
dateButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#f0f8ff',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 8,
  gap: 5,
},
dateButtonText: {
  color: '#007AFF',
  fontSize: 14,
  fontWeight: '500',
},
switchContainer: {
  flexDirection: 'row',
  backgroundColor: '#f0f0f0',
  borderRadius: 8,
  padding: 2,
  marginBottom: 20,
  alignSelf: 'center',
},
switchButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 6,
  gap: 6,
},
switchButtonActive: {
  backgroundColor: '#007AFF',
},
switchText: {
  fontSize: 14,
  color: '#666',
  fontWeight: '500',
},
switchTextActive: {
  color: 'white',
},
contentInput: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 10,
  padding: 20,
  minHeight: 200,
  fontSize: 16,
  lineHeight: 24,
  backgroundColor: '#fafafa',
},
photoContainer: {
  minHeight: 200,
},
photoPlaceholder: {
  borderWidth: 2,
  borderColor: '#ddd',
  borderStyle: 'dashed',
  borderRadius: 10,
  padding: 30,
  alignItems: 'center',
  backgroundColor: '#fafafa',
  minHeight: 200,
  justifyContent: 'center',
},
photoPlaceholderText: {
  fontSize: 16,
  color: '#666',
  marginTop: 10,
  marginBottom: 20,
  textAlign: 'center',
},
photoButtons: {
  flexDirection: 'row',
  gap: 15,
},
photoButton: {
  flexDirection: 'row',
  backgroundColor: '#007AFF',
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  gap: 8,
},
photoButtonText: {
  color: 'white',
  fontSize: 14,
  fontWeight: '500',
},
galleryButton: {
  flexDirection: 'row',
  backgroundColor: '#f0f8ff',
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  gap: 8,
  borderWidth: 1,
  borderColor: '#007AFF',
},
galleryButtonText: {
  color: '#007AFF',
  fontSize: 14,
  fontWeight: '500',
},
photoPreview: {
  borderRadius: 10,
  overflow: 'hidden',
},
previewImage: {
  width: '100%',
  height: 250,
  borderRadius: 10,
},
photoActions: {
  flexDirection: 'row',
  justifyContent: 'center',
  gap: 15,
  marginTop: 15,
},
retakeButton: {
  flexDirection: 'row',
  backgroundColor: '#f0f8ff',
  paddingHorizontal: 15,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
  gap: 6,
  borderWidth: 1,
  borderColor: '#007AFF',
},
retakeText: {
  color: '#007AFF',
  fontSize: 14,
  fontWeight: '500',
},
removeButton: {
  flexDirection: 'row',
  backgroundColor: '#ffebee',
  paddingHorizontal: 15,
  paddingVertical: 10,
  borderRadius: 8,
  alignItems: 'center',
  gap: 6,
  borderWidth: 1,
  borderColor: '#F44336',
},
removeText: {
  color: '#F44336',
  fontSize: 14,
  fontWeight: '500',
},
saveButton: {
  flexDirection: 'row',
  backgroundColor: '#4CAF50',
  padding: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 3,
},
saveText: {
  color: 'white',
  fontSize: 18,
  fontWeight: 'bold',
},
});