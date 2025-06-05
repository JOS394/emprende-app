import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OrdersScreen() {
  const [fechaPedido, setFechaPedido] = useState(new Date().toISOString().split('T')[0]);
  const [fechaEntregaInicio, setFechaEntregaInicio] = useState('');
  const [fechaEntregaFin, setFechaEntregaFin] = useState('');
  const [contenido, setContenido] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Funciones del editor
  const toggleBold = () => setIsBold(!isBold);
  const toggleItalic = () => setIsItalic(!isItalic);
  
  const insertText = (text: string) => {
    setContenido(prev => prev + text);
  };

  const clearContent = () => {
    Alert.alert(
      'Limpiar contenido',
      '¿Estás seguro de borrar todo el contenido?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', onPress: () => setContenido('') }
      ]
    );
  };

  const savePedido = () => {
    if (!contenido.trim()) {
      Alert.alert('Error', 'Debes agregar contenido al pedido');
      return;
    }
    
    Alert.alert('Éxito', 'Pedido guardado correctamente');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header con fechas */}
        <View style={styles.dateSection}>
          <Text style={styles.sectionTitle}>Información del Pedido</Text>
          
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Fecha de Pedido:</Text>
              <TextInput
                style={styles.dateInput}
                value={fechaPedido}
                onChangeText={setFechaPedido}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Entrega desde:</Text>
              <TextInput
                style={styles.dateInput}
                value={fechaEntregaInicio}
                onChangeText={setFechaEntregaInicio}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>Entrega hasta:</Text>
              <TextInput
                style={styles.dateInput}
                value={fechaEntregaFin}
                onChangeText={setFechaEntregaFin}
                placeholder="YYYY-MM-DD"
              />
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
            value={contenido}
            onChangeText={setContenido}
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
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