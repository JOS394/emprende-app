import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActionSheetMenu } from '../../../src/components/common/ActionSheetMenu';
import { useRequireAuth } from '../../../src/contexts/AuthContext';
import { CustomersService } from '../../../src/services/CustomersService';
import { Validators } from '../../../src/utils/validators';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
  updatedAt: Date;
  orderHistory?: any[];
}

export default function ClientesScreen() {
  const { user, loading: authLoading } = useRequireAuth();
  const [clientes, setClientes] = useState<Customer[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [editingClient, setEditingClient] = useState<Customer | null>(null);
  const [filterType, setFilterType] = useState<string>('todos');
  const [loading, setLoading] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (user) {
      loadCustomers();
    }
  }, [user]);

  const loadCustomers = async () => {
    setLoading(true);
    const result = await CustomersService.getCustomers();
    if (result.success) {
      setClientes(result.customers || []);
    } else {
      Alert.alert('Error', 'No se pudieron cargar los clientes');
    }
    setLoading(false);
  };

  const getCustomerType = (customer: Customer) => {
    if (customer.totalOrders === 0) return 'new';
    if (customer.totalSpent > 100000) return 'vip';
    return 'regular';
  };

  const clientTypes = ['todos', 'new', 'regular', 'vip'];

  const getClientTypeText = (type: string) => {
    const typeMap = {
      new: 'Nuevo',
      regular: 'Regular',
      vip: 'VIP',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getClientTypeColor = (type: string) => {
    const colorMap = {
      new: '#4CAF50',
      regular: '#2196F3',
      vip: '#FF9800',
    };
    return colorMap[type as keyof typeof colorMap] || '#666';
  };

  const filteredClients = clientes.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchText.toLowerCase()) ||
                         client.phone.includes(searchText) ||
                         (client.email && client.email.toLowerCase().includes(searchText.toLowerCase()));
    const customerType = getCustomerType(client);
    const matchesType = filterType === 'todos' || customerType === filterType;
    return matchesSearch && matchesType;
  });

  const clearForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    });
    setEditingClient(null);
  };

  const openAddModal = () => {
    clearForm();
    setModalVisible(true);
  };

  const openEditModal = (client: Customer) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      address: client.address || '',
      notes: client.notes || '',
    });
    setEditingClient(client);
    setModalVisible(true);
  };

  const handleViewClient = async (client: Customer) => {
    const result = await CustomersService.getCustomerById(Number(client.id));
    if (result.success) {
      setSelectedClient(result.customer || null);
      setDetailModalVisible(true);
    } else {
      Alert.alert('Error', 'No se pudieron cargar los detalles del cliente');
    }
  };

  const handleDeleteClient = (client: Customer) => {
    Alert.alert(
      'Eliminar Cliente',
      `¿Estás seguro de eliminar a "${client.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const result = await CustomersService.deleteCustomer(Number(client.id));
            if (result.success) {
              Alert.alert('Éxito', 'Cliente eliminado');
              loadCustomers();
            } else {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  const saveClient = async () => {
    // Validar usando las utilidades centralizadas
    const validation = Validators.customer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
    });

    if (!validation.isValid) {
      Alert.alert('Error', validation.error);
      return;
    }

    let result;
    if (editingClient) {
      result = await CustomersService.updateCustomer(Number(editingClient.id), formData);
    } else {
      result = await CustomersService.createCustomer(formData);
    }

    if (result.success) {
      Alert.alert('Éxito', editingClient ? 'Cliente actualizado' : 'Cliente creado');
      loadCustomers();
      setModalVisible(false);
      clearForm();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const makePhoneCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const sendWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = `Hola ${name}, ¿cómo estás?`;
    Linking.openURL(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`);
  };

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const formatPrice = (price: number | undefined) => {
    if (!price || isNaN(price)) return '$0';
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Fecha no disponible';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysSinceLastPurchase = (updatedAt?: Date) => {
    if (!updatedAt) return null;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - updatedAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (authLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#9C27B0" />
      </View>
    );
  }

  const renderClientItem = ({ item }: { item: Customer }) => {
    const daysSinceLastPurchase = getDaysSinceLastPurchase(item.updatedAt);
    const customerType = getCustomerType(item);
    
    return (
      <View style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.clientNameRow}>
              <Text style={styles.clientName}>{item.name}</Text>
              <View style={[styles.typeBadge, { backgroundColor: getClientTypeColor(customerType) }]}>
                <Text style={styles.typeText}>{getClientTypeText(customerType)}</Text>
              </View>
            </View>
            <Text style={styles.clientPhone}>{item.phone}</Text>
            {item.email && (
              <Text style={styles.clientEmail}>{item.email}</Text>
            )}
          </View>

          <ActionSheetMenu
            onView={() => handleViewClient(item)}
            onEdit={() => openEditModal(item)}
            onDelete={() => handleDeleteClient(item)}
            itemName={item.name}
          />
        </View>

        <View style={styles.clientStats}>
          <View style={styles.statItem}>
            <Ionicons name="cash-outline" size={16} color="#4CAF50" />
            <Text style={styles.statText}>Total: {formatPrice(item.totalSpent)}</Text>
          </View>
          
          <View style={styles.statItem}>
            <Ionicons name="bag-outline" size={16} color="#666" />
            <Text style={styles.statText}>Órdenes: {item.totalOrders}</Text>
          </View>
          
          {daysSinceLastPurchase && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                Última actividad: hace {daysSinceLastPurchase} días
              </Text>
            </View>
          )}
        </View>

        <View style={styles.clientActions}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => makePhoneCall(item.phone)}
          >
            <Ionicons name="call" size={16} color="#2196F3" />
            <Text style={styles.actionText}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => sendWhatsApp(item.phone, item.name)}
          >
            <Ionicons name="logo-whatsapp" size={16} color="#25D366" />
            <Text style={styles.actionText}>WhatsApp</Text>
          </TouchableOpacity>

          {item.email && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={() => sendEmail(item.email!)}
            >
              <Ionicons name="mail" size={16} color="#FF9800" />
              <Text style={styles.actionText}>Email</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filtros y búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar clientes..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilters}>
          {clientTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeButton,
                filterType === type && styles.activeTypeButton
              ]}
              onPress={() => setFilterType(type)}
            >
              <Text style={[
                styles.typeButtonText,
                filterType === type && styles.activeTypeButtonText
              ]}>
                {type === 'todos' ? 'Todos' : getClientTypeText(type)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de clientes */}
      <FlatList
        data={filteredClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderClientItem}
        style={styles.clientsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay clientes disponibles</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
              <Text style={styles.emptyButtonText}>Agregar primer cliente</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal para agregar/editar cliente */}
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
                {editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre completo *"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Teléfono *"
                value={formData.phone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Email (opcional)"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Dirección (opcional)"
                value={formData.address}
                onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notas (opcional)"
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveClient}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {selectedClient && (
                <>
                  <View style={styles.detailHeader}>
                    <Text style={styles.modalTitle}>{selectedClient.name}</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setDetailModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Información de Contacto</Text>
                    <Text style={styles.detailText}>Teléfono: {selectedClient.phone}</Text>
                    {selectedClient.email && (
                      <Text style={styles.detailText}>Email: {selectedClient.email}</Text>
                    )}
                    {selectedClient.address && (
                      <Text style={styles.detailText}>Dirección: {selectedClient.address}</Text>
                    )}
                    <Text style={styles.detailText}>
                      Cliente desde: {formatDate(selectedClient.createdAt)}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Estadísticas</Text>
                    <Text style={styles.detailText}>
                      Total de compras: {formatPrice(selectedClient.totalSpent)}
                    </Text>
                    <Text style={styles.detailText}>
                      Tipo de cliente: {getClientTypeText(getCustomerType(selectedClient))}
                    </Text>
                    <Text style={styles.detailText}>
                      Órdenes realizadas: {selectedClient.totalOrders}
                    </Text>
                  </View>

                  {selectedClient.orderHistory && selectedClient.orderHistory.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Historial de Órdenes</Text>
                      {selectedClient.orderHistory.map((order, index) => (
                        <View key={index} style={styles.purchaseItem}>
                          <View style={styles.purchaseHeader}>
                            <Text style={styles.purchaseDate}>
                              {order.orderNumber}
                            </Text>
                            <Text style={styles.purchaseTotal}>
                              {formatPrice(order.total)}
                            </Text>
                          </View>
                          <Text style={styles.purchaseProducts}>
                            {formatDate(order.date)} - {order.status}
                          </Text>
                          {order.products.length > 0 && (
                            <Text style={styles.purchaseProducts}>
                              {order.products.join(', ')}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {selectedClient.notes && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Notas</Text>
                      <Text style={styles.notesText}>{selectedClient.notes}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    backgroundColor: '#9C27B0',
    padding: 12,
    borderRadius: 8,
  },
  typeFilters: {
    flexDirection: 'row',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeTypeButton: {
    backgroundColor: '#9C27B0',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeTypeButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  clientsList: {
    flex: 1,
    padding: 15,
  },
  clientCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  clientInfo: {
    flex: 1,
  },
  clientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  clientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 10,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  clientPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 14,
    color: '#666',
  },
  clientStats: {
    marginBottom: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  clientActions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#9C27B0',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#9C27B0',
  },
  cancelButtonText: {
    textAlign: 'center',
    color: '#666',
    fontWeight: 'bold',
  },
  saveButtonText: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 5,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  purchaseItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  purchaseDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  purchaseTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  purchaseProducts: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    lineHeight: 20,
  },
});