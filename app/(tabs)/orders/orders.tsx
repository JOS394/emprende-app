import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
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
  const [dateOrder, setDateOrder] = useState(new Date());
  const [dateStart, setDateStart] = useState(new Date());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [content, setContent] = useState('');
  const [vendor, setVendor] = useState('');
  const [total, setTotal] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  
  // Estados para controlar los pickers
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);

  // Funciones del editor
  const toggleBold = () => setIsBold(!isBold);
  const toggleItalic = () => setIsItalic(!isItalic);
  
  const insertText = (text: string) => {
    setContent(prev => prev + text);
  };

  // Función para manejar cambios de fecha
  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(null);
    
    if (showDatePicker === 'pedido') {
      setDateOrder(currentDate);
    } else if (showDatePicker === 'inicio') {
      setDateStart(currentDate);
    } else if (showDatePicker === 'fin') {
      setDateEnd(currentDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const clearContent = () => {
    Alert.alert(
      'Limpiar contenido',
      '¿Estás seguro de borrar todo el contenido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', onPress: () => setContent('') }
      ]
    );
  };

  const savePedido = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Debes agregar contenido al pedido');
      return;
    }

    if (!vendor.trim()) {
      Alert.alert('Error', 'Debes especificar un proveedor');
      return;
    }

    try {
      const newOrder = {
        date_order: dateOrder,
        date_start: dateStart,
        date_end: dateEnd,
        vendor: vendor.trim(),
        status: 'pending' as const,
        content: content.trim(),
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
              setDateOrder(new Date());
              setDateStart(new Date());
              setDateEnd(new Date());
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el pedido');
      console.error('Error guardando pedido:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header con fechas */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Información del Pedido</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Proveedor *:</Text>
              <TextInput
                style={styles.input}
                value={vendor}
                onChangeText={setVendor}
                placeholder="Nombre del proveedor"
              />
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Total (opcional):</Text>
              <TextInput
                style={styles.input}
                value={total}
                onChangeText={setTotal}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Fecha de Pedido:</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker('pedido')}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatDate(dateOrder)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Entrega desde:</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker('inicio')}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatDate(dateStart)}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Entrega hasta:</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker('fin')}
              >
                <Ionicons name="calendar-outline" size={20} color="#666" />
                <Text style={styles.dateText}>{formatDate(dateEnd)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Editor WYSIWYG */}
        <View style={styles.editorSection}>
          <Text style={styles.sectionTitle}>Detalles del Pedido</Text>
          
          {/* Barra de herramientas */}
          <View style={styles.toolbar}>
            <TouchableOpacity 
              style={[styles.toolButton, isBold && styles.activeButton]} 
              onPress={toggleBold}
            >
              <Text style={[styles.toolText, isBold && styles.activeText]}>B</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.toolButton, isItalic && styles.activeButton]} 
              onPress={toggleItalic}
            >
              <Text style={[styles.toolText, isItalic && styles.activeText]}>I</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity 
              style={styles.toolButton} 
              onPress={() => insertText('\n• ')}
            >
              <Ionicons name="list" size={16} color="#666" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.toolButton} 
              onPress={() => insertText('\n1. ')}
            >
              <Ionicons name="list-outline" size={16} color="#666" />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity style={styles.toolButton} onPress={clearContent}>
              <Ionicons name="trash-outline" size={16} color="#f44336" />
            </TouchableOpacity>
          </View>

          {/* Área de texto */}
          <TextInput
            style={[
              styles.editor,
              isBold && styles.boldText,
              isItalic && styles.italicText
            ]}
            multiline
            placeholder="Escribe los detalles de tu pedido aquí...
            
Puedes incluir:
• Lista de productos
• Cantidades necesarias  
• Especificaciones especiales
• Notas para el proveedor"
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />

          {/* Plantillas rápidas */}
          <View style={styles.templatesSection}>
            <Text style={styles.templatesTitle}>Plantillas rápidas:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity 
                style={styles.templateButton}
                onPress={() => insertText('\n\nProducto: \nCantidad: \nEspecificaciones: \n')}
              >
                <Text style={styles.templateText}>+ Producto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.templateButton}
                onPress={() => insertText('\n\nNOTA IMPORTANTE: \n')}
              >
                <Text style={styles.templateText}>+ Nota</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.templateButton}
                onPress={() => insertText('\n\nCondiciones de entrega: \n')}
              >
                <Text style={styles.templateText}>+ Condiciones</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.previewButton}>
            <Ionicons name="eye-outline" size={20} color="#666" />
            <Text style={styles.previewText}>Vista previa</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.saveButton} onPress={savePedido}>
            <Ionicons name="save-outline" size={20} color="white" />
            <Text style={styles.saveText}>Guardar Pedido</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            showDatePicker === 'pedido' ? dateOrder :
            showDatePicker === 'inicio' ? dateStart : dateEnd
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
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
    padding: 15,
  },
  dateSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'white',
    gap: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  editorSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  toolButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 32,
    alignItems: 'center',
    marginRight: 5,
  },
  activeButton: {
    backgroundColor: '#007AFF',
  },
  toolText: {
    fontWeight: 'bold',
    color: '#666',
  },
  activeText: {
    color: 'white',
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 10,
  },
  editor: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    minHeight: 200,
    fontSize: 16,
    lineHeight: 24,
  },
  boldText: {
    fontWeight: 'bold',
  },
  italicText: {
    fontStyle: 'italic',
  },
  templatesSection: {
    marginTop: 15,
  },
  templatesTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  templateButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  templateText: {
    color: '#007AFF',
    fontSize: 12,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 10,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  previewText: {
    color: '#666',
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    color: 'white',
    fontWeight: 'bold',
  },
});