import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ActionSheetMenu } from '../../../../src/components/common/ActionSheetMenu';

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
import { VendorsService } from '../../../../src/services/VendorsService';

export default function ManagementScreen() {

  const [proveedores, setProveedores] = useState<any>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [viewProveedor, setViewProveedor] = useState<any>({});
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<any>(null);
  
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  useFocusEffect(
    useCallback(() => {
      cargarProveedores();
    }, [])
  );

  const cargarProveedores = async () => {
    try {
      const data = await VendorsService.getAll();
      setProveedores(data as any);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      Alert.alert('Error', 'No se pudieron cargar los proveedores');
    }
  };

  const filteredProveedores = proveedores.filter((proveedor: any) =>
    proveedor.name.toLowerCase().includes(searchText.toLowerCase()) ||
    proveedor.email.toLowerCase().includes(searchText.toLowerCase())
  );

  const clearForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
    });
    setEditingProveedor(null);
  };

  const openAddModal = () => {
    clearForm();
    setModalVisible(true);
  };

  const openEditModal = (proveedor: any) => {
    setFormData({
      name: proveedor.name,
      email: proveedor.email,
      phone: proveedor.phone,
      address: proveedor.address,
    });
    setEditingProveedor(proveedor);
    setModalVisible(true);
  };

  const openViewModal = (proveedor: any) => {
    console.log('Proveedor seleccionado:', proveedor);
    setViewProveedor(proveedor);
    setViewModalVisible(true);
  };

  const saveProveedor = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    try {
      if (editingProveedor) {
        await VendorsService.update(editingProveedor.id, formData);
        Alert.alert('Éxito', 'Proveedor actualizado');
      } else {
        await VendorsService.create(formData);
        Alert.alert('Éxito', 'Proveedor creado');
      }

      setModalVisible(false);
      clearForm();
      await cargarProveedores(); // Recargar lista
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el proveedor');
      console.error('Error guardando proveedor:', error);
    }
  };

  const deleteProveedor = (proveedor: any) => {
    Alert.alert(
      'Confirmar',
      `¿Estás seguro de eliminar a ${proveedor.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await VendorsService.delete(proveedor.id);
              await cargarProveedores(); // Recargar lista
              Alert.alert('Éxito', 'Proveedor eliminado');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el proveedor');
              console.error('Error eliminando proveedor:', error);
            }
          }
        }
      ]
    );
  };

  const renderProveedorItem = ({ item }: { item: any }) => (
    <View style={styles.gridItem}>
      <View style={styles.gridContent}>
        <Text style={styles.proveedorName}>{item.name}</Text>
        <Text style={styles.proveedorInfo}>{item.email}</Text>
        <Text style={styles.proveedorInfo}>{item.phone}</Text>
        <Text style={styles.proveedorInfo}>{item.address}</Text>
      </View>
      <View style={styles.gridActions}>
        <ActionSheetMenu
          itemName={item.name}
          onView={() => openViewModal(item)}
          onEdit={() => openEditModal(item)}
          onDelete={() => deleteProveedor(item)}
        />
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
          <View style={styles.ButtonContainer}>
            <Icon name="plus" size={16} color="white" style={styles.IconButton}/>
            <Text style={styles.addButtonText}>Nuevo</Text>
          </View>
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

      {/* Modal para ver proveedor */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewModalVisible}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalNameVendor}>{viewProveedor.name}</Text>
              <Text style={styles.modalEmailVendor}><Text style={styles.modalLabel}>Email:</Text> {viewProveedor.email}</Text>
              <Text style={styles.modalPhoneVendor}><Text style={styles.modalLabel}>Teléfono:</Text> {viewProveedor.phone}</Text>
              <Text style={styles.modalAddressVendor}><Text style={styles.modalLabel}>Dirección:</Text> {viewProveedor.address}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setViewModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
                value={formData.name}
                onChangeText={(text) => setFormData((prev: any) => ({ ...prev, name: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => setFormData((prev: any) => ({ ...prev, email: text }))}
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Teléfono"
                value={formData.phone}
                onChangeText={(text) => setFormData((prev: any) => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={formData.address}
                onChangeText={(text) => setFormData((prev: any) => ({ ...prev, address: text }))}
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
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 25,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 28,
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
  modalNameVendor: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  modalEmailVendor: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
    marginBottom: 2,
  },
  modalPhoneVendor: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
    marginBottom: 2,
  },
  modalAddressVendor: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#666',
    marginBottom: 2,
  },
  modalLabel: {
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F44336',
  },
  closeButtonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
  },
  IconButton: {
    marginRight: 5,
  },
  ButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});