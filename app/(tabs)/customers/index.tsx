import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
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

interface Purchase {
  id: number;
  date: Date;
  total: number;
  products: string[];
}

interface Client {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  totalPurchases: number;
  lastPurchase?: Date;
  purchaseHistory: Purchase[];
  isActive: boolean;
  createdAt: Date;
  customerType: 'regular' | 'vip' | 'new';
}

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Client[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [filterType, setFilterType] = useState<string>('todos');

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  // Datos de ejemplo
  useEffect(() => {
    setClientes([
      {
        id: 1,
        name: 'María González',
        phone: '+503 7123-4567',
        email: 'maria.gonzalez@email.com',
        address: 'Col. Escalón, San Salvador',
        notes: 'Cliente preferencial, siempre paga a tiempo',
        totalPurchases: 125000,
        lastPurchase: new Date('2024-01-15'),
        customerType: 'vip',
        isActive: true,
        createdAt: new Date('2023-06-10'),
        purchaseHistory: [
          {
            id: 1,
            date: new Date('2024-01-15'),
            total: 68000,
            products: ['Camiseta Básica x2', 'Mug Personalizado x1']
          },
          {
            id: 2,
            date: new Date('2024-01-10'),
            total: 57000,
            products: ['Llavero Acrílico x3', 'Stickers Pack x2']
          }
        ]
      },
      {
        id: 2,
        name: 'Carlos Martínez',
        phone: '+503 6987-6543',
        email: 'carlos.martinez@email.com',
        address: 'Col. Miramonte, Santa Tecla',
        totalPurchases: 45000,
        lastPurchase: new Date('2024-01-12'),
        customerType: 'regular',
        isActive: true,
        createdAt: new Date('2023-11-20'),
        purchaseHistory: [
          {
            id: 3,
            date: new Date('2024-01-12'),
            total: 25000,
            products: ['Llavero Acrílico x5']
          }
        ]
      },
      {
        id: 3,
        name: 'Ana López',
        phone: '+503 7555-1234',
        email: 'ana.lopez@email.com',
        totalPurchases: 15000,
        lastPurchase: new Date('2024-01-16'),
        customerType: 'new',
        isActive: true,
        createdAt: new Date('2024-01-16'),
        purchaseHistory: [
          {
            id: 4,
            date: new Date('2024-01-16'),
            total: 15000,
            products: ['Mug Personalizado x1']
          }
        ]
      },
    ]);
  }, []);

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
    const matchesType = filterType === 'todos' || client.customerType === filterType;
    return matchesSearch && matchesType && client.isActive;
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

  const openEditModal = (client: Client) => {
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

  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setDetailModalVisible(true);
  };

  const handleDeleteClient = (client: Client) => {
    Alert.alert(
      'Eliminar Cliente',
      `¿Estás seguro de eliminar a "${client.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setClientes(prev => prev.map(c => 
              c.id === client.id ? { ...c, isActive: false } : c
            ));
            Alert.alert('Éxito', 'Cliente eliminado');
          }
        }
      ]
    );
  };

  const saveClient = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return;
    }

    if (!formData.phone.trim()) {
      Alert.alert('Error', 'El teléfono del cliente es requerido');
      return;
    }

    if (editingClient) {
      // Actualizar cliente existente
      setClientes(prev =>
        prev.map(c => c.id === editingClient.id ? {
          ...c,
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          notes: formData.notes,
        } : c)
      );
      Alert.alert('Éxito', 'Cliente actualizado');
    } else {
      // Crear nuevo cliente
      const newClient: Client = {
        id: Date.now(),
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        notes: formData.notes,
        totalPurchases: 0,
        customerType: 'new',
        isActive: true,
        createdAt: new Date(),
        purchaseHistory: [],
      };
      setClientes(prev => [...prev, newClient]);
      Alert.alert('Éxito', 'Cliente creado');
    }

    setModalVisible(false);
    clearForm();
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

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDaysSinceLastPurchase = (lastPurchase?: Date) => {
    if (!lastPurchase) return null;
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastPurchase.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderClientItem = ({ item }: { item: Client }) => {
    const daysSinceLastPurchase = getDaysSinceLastPurchase(item.lastPurchase);
    
    return (
      <View style={styles.clientCard}>
        <View style={styles.clientHeader}>
          <View style={styles.clientInfo}>
            <View style={styles.clientNameRow}>
              <Text style={styles.clientName}>{item.name}</Text>
              <View style={[styles.typeBadge, { backgroundColor: getClientTypeColor(item.customerType) }]}>
                <Text style={styles.typeText}>{getClientTypeText(item.customerType)}</Text>
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
            <Text style={styles.statText}>Total: {formatPrice(item.totalPurchases)}</Text>
          </View>
          
          {item.lastPurchase && (
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.statText}>
                Última compra: hace {daysSinceLastPurchase} días
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
                      Total de compras: {formatPrice(selectedClient.totalPurchases)}
                    </Text>
                    <Text style={styles.detailText}>
                      Tipo de cliente: {getClientTypeText(selectedClient.customerType)}
                    </Text>
                    <Text style={styles.detailText}>
                      Órdenes realizadas: {selectedClient.purchaseHistory.length}
                    </Text>
                    {selectedClient.lastPurchase && (
                      <Text style={styles.detailText}>
                        Última compra: {formatDate(selectedClient.lastPurchase)}
                      </Text>
                    )}
                  </View>

                  {selectedClient.purchaseHistory.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Historial de Compras</Text>
                      {selectedClient.purchaseHistory.map((purchase, index) => (
                        <View key={index} style={styles.purchaseItem}>
                          <View style={styles.purchaseHeader}>
                            <Text style={styles.purchaseDate}>
                              {formatDate(purchase.date)}
                            </Text>
                            <Text style={styles.purchaseTotal}>
                              {formatPrice(purchase.total)}
                            </Text>
                          </View>
                          <Text style={styles.purchaseProducts}>
                            {purchase.products.join(', ')}
                          </Text>
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
  header: {
    backgroundColor: '#9C27B0',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
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