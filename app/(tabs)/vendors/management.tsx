import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ManagementScreen() {
  // Estados para manejar los datos
  const [proveedores, setProveedores] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<any>(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
  });

  // Datos de ejemplo para demostrar la funcionalidad
  useEffect(() => {
    // Simular datos iniciales
    setProveedores([
      { id: 1, nombre: 'Proveedor A', email: 'proveedora@email.com', telefono: '123-456-7890', direccion: 'Calle 1, Ciudad' },
      { id: 2, nombre: 'Proveedor B', email: 'proveedorb@email.com', telefono: '098-765-4321', direccion: 'Calle 2, Ciudad' },
    ]);
  }, []);

  // Filtrar proveedores según el texto de búsqueda
  const filteredProveedores = proveedores.filter((proveedor: any) =>
    proveedor.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
    proveedor.email.toLowerCase().includes(searchText.toLowerCase())
  );

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
    });
    setEditingProveedor(null);
  };

  // Abrir modal para nuevo proveedor
  const openAddModal = () => {
    clearForm();
    setModalVisible(true);
  };

  // Abrir modal para editar proveedor
  const openEditModal = (proveedor: any) => {
    setFormData(proveedor);
    setEditingProveedor(proveedor);
    setModalVisible(true);
  };

  // Guardar proveedor (crear o actualizar)
  const saveProveedor = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (editingProveedor) {
      // Actualizar proveedor existente
      setProveedores((prev: any) =>
        prev.map((p: any) => p.id === editingProveedor.id ? { ...formData, id: editingProveedor.id } : p)
      );
      Alert.alert('Éxito', 'Proveedor actualizado');
    } else {
      // Crear nuevo proveedor
      const newProveedor = {
        ...formData,
        id: Date.now(), // ID temporal
      };
      setProveedores((prev: any) => [...prev, newProveedor]);
      Alert.alert('Éxito', 'Proveedor creado');
    }

    setModalVisible(false);
    clearForm();
  };

  // Eliminar proveedor
  const deleteProveedor = (id: any) => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de eliminar este proveedor?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setProveedores((prev: any) => prev.filter((p: any) => p.id !== id));
            Alert.alert('Éxito', 'Proveedor eliminado');
          }
        }
      ]
    );
  };

  // Renderizar cada item del datagrid
  const renderProveedorItem = ({ item }: { item: any }) => (
    <View style={styles.gridItem}>
      <View style={styles.gridContent}>
        <Text style={styles.proveedorName}>{item.nombre}</Text>
        <Text style={styles.proveedorInfo}>{item.email}</Text>
        <Text style={styles.proveedorInfo}>{item.telefono}</Text>
        <Text style={styles.proveedorInfo}>{item.direccion}</Text>
      </View>
      <View style={styles.gridActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.actionButtonText}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deleteProveedor(item.id)}
        >
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.containerMain}>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar proveedor..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* Datagrid */}
      <FlatList
        data={filteredProveedores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProveedorItem}
        style={styles.dataGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay proveedores disponibles</Text>
          </View>
        }
      />

      {/* Modal para agregar/editar */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {editingProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre *"
                value={formData.nombre}
                onChangeText={(text) => setFormData(prev => ({ ...prev, nombre: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.telefono}
                onChangeText={(text) => setFormData(prev => ({ ...prev, telefono: text }))}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={formData.direccion}
                onChangeText={(text) => setFormData(prev => ({ ...prev, direccion: text }))}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={saveProveedor}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  containerMain: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dataGrid: {
    flex: 1,
    paddingHorizontal: 15,
  },
  gridItem: {
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gridContent: {
    flex: 1,
  },
  proveedorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  proveedorInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  gridActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    minWidth: 70,
  },
  editButton: {
    backgroundColor: '#FF9800',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
});