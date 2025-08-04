import { useRequireAuth } from '@/src/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import { ActionSheetMenu } from '../../../src/components/common/ActionSheetMenu';
import { CustomerOrdersService } from '../../../src/services/CustomerOrderService';


interface OrderItem {
  productId: string; // Cambiar de number a string
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface CustomerOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  orderDate: Date;
  deliveryDate?: Date;
  notes?: string;
  paymentMethod: 'cash' | 'transfer' | 'card';
  isPaid: boolean;
}


export default function PedidosClientesScreen() {
  const [pedidos, setPedidos] = useState<CustomerOrder[]>([]);
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  // Estados para el formulario
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'card',
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { user, loading } = useRequireAuth();
  if (loading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;

  // Datos de ejemplo
  useEffect(() => {
    loadOrders();
    loadProducts();
  }, []);

  const loadOrders = async () => {
    const result: any = await CustomerOrdersService.getOrders();
    if (result.success) {
      setPedidos(result.orders || []);
    }
  };

  // Cargar productos
  const loadProducts = async () => {
    const result: any = await CustomerOrdersService.getAvailableProducts();
    if (result.success) {
      setAvailableProducts(result.products || []);
    }
  };


  const statusOptions = ['todos', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  const getStatusText = (status: string) => {
    const statusMap = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap = {
      pending: '#FF9800',
      confirmed: '#2196F3',
      preparing: '#9C27B0',
      ready: '#4CAF50',
      delivered: '#4CAF50',
      cancelled: '#F44336',
    };
    return colorMap[status as keyof typeof colorMap] || '#666';
  };

  const filteredOrders = pedidos.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      order.customerPhone.includes(searchText);
    const matchesStatus = filterStatus === 'todos' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const clearForm = () => {
    setFormData({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      notes: '',
      paymentMethod: 'cash',
    });
    setOrderItems([]);
  };

  const addProduct = () => {
    const newItem: OrderItem = {
      productId: '', // String vacío en lugar de 0
      productName: '',
      quantity: 1,
      price: 0,
      subtotal: 0,
    };
    setOrderItems([...orderItems, newItem]);
  };

  const updateOrderItem = (index: number, field: keyof OrderItem, value: any) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'quantity' || field === 'price') {
      updatedItems[index].subtotal = updatedItems[index].quantity * updatedItems[index].price;
    }

    setOrderItems(updatedItems);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const selectProduct = (index: number, product: any) => {
    updateOrderItem(index, 'productId', product.id);
    updateOrderItem(index, 'productName', product.name);
    updateOrderItem(index, 'price', product.price);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const saveOrder = async () => {
    if (!formData.customerName.trim()) {
      Alert.alert('Error', 'El nombre del cliente es requerido');
      return;
    }

    if (!formData.customerPhone.trim()) {
      Alert.alert('Error', 'El teléfono del cliente es requerido');
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un producto');
      return;
    }

    const invalidItems = orderItems.filter(item => 
      !item.productId || 
      item.productId === '' || 
      !item.productName || 
      item.quantity <= 0

    );

    const itemsWithoutProduct = orderItems.filter(item => item.productId === '0');
    if (itemsWithoutProduct.length > 0) {
      Alert.alert('Error', 'Debe seleccionar todos los productos');
      return;
    }

    const result = await CustomerOrdersService.createOrder({
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      totalAmount: calculateTotal(),
      paymentMethod: formData.paymentMethod,
      paymentStatus: 'pending',
      notes: formData.notes,
      items: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price
      }))
    });

    if (result.success) {
      Alert.alert('Éxito', 'Pedido creado');
      loadOrders();
      setModalVisible(false);
      clearForm();
    } else {
      Alert.alert('Error', result.error || 'Error al crear el pedido');
    }


    const updateOrderStatus = async (orderId: number, newStatus: string) => {
      const result = await CustomerOrdersService.updateOrderStatus(orderId, newStatus);
      if (result.success) {
        loadOrders();
      }
    };

    // Toggle pago
    const togglePaymentStatus = async (orderId: number, currentPaid: boolean) => {
      const result = await CustomerOrdersService.updateOrder(orderId, { isPaid: !currentPaid } as any);
      if (result.success) {
        loadOrders();
      }
    };

    setModalVisible(false);
    clearForm();
    loadOrders();
  };

  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setPedidos(prev => prev.map(order =>
      order.id === orderId
        ? {
          ...order,
          status: newStatus as any,
          deliveryDate: newStatus === 'delivered' ? new Date() : order.deliveryDate
        }
        : order
    ));
    Alert.alert('Éxito', `Pedido marcado como ${getStatusText(newStatus)}`);
  };

  const togglePaymentStatus = (orderId: number) => {
    setPedidos(prev => prev.map(order =>
      order.id === orderId ? { ...order, isPaid: !order.isPaid } : order
    ));
  };

  const handleViewOrder = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleEditOrder = (order: CustomerOrder) => {
    Alert.alert('Información', 'Función de edición pendiente de implementar');
  };

  const handleDeleteOrder = (order: CustomerOrder) => {
    Alert.alert(
      'Eliminar Pedido',
      `¿Estás seguro de eliminar el pedido de ${order.customerName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setPedidos(prev => prev.filter(p => p.id !== order.id));
            Alert.alert('Éxito', 'Pedido eliminado');
          }
        }
      ]
    );
  };
  
  const formatPrice = (price: number) => {
    return `$${(price || 0).toLocaleString()}`;
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Fecha no disponible';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderOrderItem = ({ item }: { item: CustomerOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Pedido #{item.id}</Text>
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.customerPhone}>{item.customerPhone}</Text>
        </View>

        <View style={styles.orderMeta}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <ActionSheetMenu
            onView={() => handleViewOrder(item)}
            onEdit={() => handleEditOrder(item)}
            onDelete={() => handleDeleteOrder(item)}
            itemName={`Pedido #${item.id}`}
          />
        </View>
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.orderDetailText}>Fecha: {formatDate(item.orderDate)}</Text>
        </View>

        <View style={styles.orderRow}>
          <Ionicons name="bag-outline" size={16} color="#666" />
          <Text style={styles.orderDetailText}>
            {item.items.length} producto{item.items.length !== 1 ? 's' : ''}
          </Text>
        </View>

        <View style={styles.orderRow}>
          <Ionicons name="cash-outline" size={16} color="#666" />
          <Text style={styles.orderDetailText}>Total: {formatPrice(item.total)}</Text>
          {item.isPaid && (
            <View style={styles.paidBadge}>
              <Text style={styles.paidText}>PAGADO</Text>
            </View>
          )}
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.quickActions}>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => updateOrderStatus(item.id, 'confirmed')}
          >
            <Text style={styles.actionButtonText}>Confirmar</Text>
          </TouchableOpacity>
        )}

        {item.status === 'confirmed' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.preparingButton]}
            onPress={() => updateOrderStatus(item.id, 'preparing')}
          >
            <Text style={styles.actionButtonText}>Preparando</Text>
          </TouchableOpacity>
        )}

        {item.status === 'preparing' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.readyButton]}
            onPress={() => updateOrderStatus(item.id, 'ready')}
          >
            <Text style={styles.actionButtonText}>Listo</Text>
          </TouchableOpacity>
        )}

        {item.status === 'ready' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deliveredButton]}
            onPress={() => updateOrderStatus(item.id, 'delivered')}
          >
            <Text style={styles.actionButtonText}>Entregar</Text>
          </TouchableOpacity>
        )}

        {!item.isPaid && (
          <TouchableOpacity
            style={[styles.actionButton, styles.paymentButton]}
            onPress={() => togglePaymentStatus(item.id)}
          >
            <Text style={styles.actionButtonText}>Marcar Pagado</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Filtros y búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por cliente o teléfono..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusButton,
                filterStatus === status && styles.activeStatusButton
              ]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[
                styles.statusButtonText,
                filterStatus === status && styles.activeStatusButtonText
              ]}>
                {status === 'todos' ? 'Todos' : getStatusText(status)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderItem}
        style={styles.ordersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay pedidos disponibles</Text>
            <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.emptyButtonText}>Crear primer pedido</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Modal para crear pedido */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              <Text style={styles.modalTitle}>Nuevo Pedido</Text>

              {/* Información del cliente */}
              <Text style={styles.sectionTitle}>Información del Cliente</Text>

              <TextInput
                style={styles.input}
                placeholder="Nombre del cliente *"
                value={formData.customerName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, customerName: text }))}
              />

              <TextInput
                style={styles.input}
                placeholder="Teléfono *"
                value={formData.customerPhone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, customerPhone: text }))}
                keyboardType="phone-pad"
              />

              <TextInput
                style={styles.input}
                placeholder="Dirección"
                value={formData.customerAddress}
                onChangeText={(text) => setFormData(prev => ({ ...prev, customerAddress: text }))}
                multiline
              />

              {/* Productos */}
              <View style={styles.productsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Productos</Text>
                  <TouchableOpacity style={styles.addProductButton} onPress={addProduct}>
                    <Ionicons name="add-circle" size={24} color="#2196F3" />
                  </TouchableOpacity>
                </View>

                {orderItems.map((item: any, index: number) => (
                  <View key={index} style={styles.productItem}>
                    <View style={styles.productRow}>
                      <View style={styles.productSelector}>
                        {availableProducts.map((product) => (
                          <TouchableOpacity
                            key={product.id}
                            style={[
                              styles.productOption,
                              item.productId === product.id && styles.selectedProduct
                            ]}
                            onPress={() => selectProduct(index, product)}
                          >
                            <Text style={[
                              styles.productOptionText,
                              item.productId === product.id && styles.selectedProductText
                            ]}>
                              {product.name} - {formatPrice(product.price)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => removeOrderItem(index)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#F44336" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.quantityRow}>
                      <Text style={styles.quantityLabel}>Cantidad:</Text>
                      <TextInput
                        style={styles.quantityInput}
                        value={item.quantity.toString()}
                        onChangeText={(text) => updateOrderItem(index, 'quantity', parseInt(text) || 0)}
                        keyboardType="numeric"
                      />
                      <Text style={styles.subtotalText}>
                        Subtotal: {formatPrice(item.subtotal)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Total */}
              {orderItems.length > 0 && (
                <View style={styles.totalSection}>
                  <Text style={styles.totalText}>Total: {formatPrice(calculateTotal())}</Text>
                </View>
              )}

              {/* Notas y método de pago */}
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Notas adicionales"
                value={formData.notes}
                onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Método de Pago:</Text>
              <View style={styles.paymentMethods}>
                {['cash', 'transfer', 'card'].map((method) => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.paymentButton,
                      formData.paymentMethod === method && styles.selectedPayment
                    ]}
                    onPress={() => setFormData(prev => ({ ...prev, paymentMethod: method as any }))}
                  >
                    <Text style={[
                      styles.paymentButtonText,
                      formData.paymentMethod === method && styles.selectedPaymentText
                    ]}>
                      {method === 'cash' ? 'Efectivo' : method === 'transfer' ? 'Transferencia' : 'Tarjeta'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveOrder}
                >
                  <Text style={styles.saveButtonText}>Crear Pedido</Text>
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
              {selectedOrder && (
                <>
                  <View style={styles.detailHeader}>
                    <Text style={styles.modalTitle}>Pedido #{selectedOrder.id}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setDetailModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Cliente</Text>
                    <Text style={styles.detailText}>Nombre: {selectedOrder.customerName}</Text>
                    <Text style={styles.detailText}>Teléfono: {selectedOrder.customerPhone}</Text>
                    {selectedOrder.customerAddress && (
                      <Text style={styles.detailText}>Dirección: {selectedOrder.customerAddress}</Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Productos</Text>
                    {selectedOrder.items.map((item, index) => (
                      <View key={index} style={styles.itemDetail}>
                        <Text style={styles.itemName}>{item.productName}</Text>
                        <Text style={styles.itemQuantity}>Cantidad: {item.quantity}</Text>
                        <Text style={styles.itemPrice}>Precio: {formatPrice(item.price)}</Text>
                        <Text style={styles.itemSubtotal}>Subtotal: {formatPrice(item.subtotal)}</Text>
                      </View>
                    ))}
                    <Text style={styles.totalDetail}>Total: {formatPrice(selectedOrder.total)}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Información del Pedido</Text>
                    <Text style={styles.detailText}>Fecha: {formatDate(selectedOrder.orderDate)}</Text>
                    <Text style={styles.detailText}>Estado: {getStatusText(selectedOrder.status)}</Text>
                    <Text style={styles.detailText}>
                      Pago: {selectedOrder.paymentMethod === 'cash' ? 'Efectivo' :
                        selectedOrder.paymentMethod === 'transfer' ? 'Transferencia' : 'Tarjeta'}
                    </Text>
                    <Text style={styles.detailText}>
                      Estado de pago: {selectedOrder.isPaid ? 'Pagado' : 'Pendiente'}
                    </Text>
                    {selectedOrder.notes && (
                      <Text style={styles.detailText}>Notas: {selectedOrder.notes}</Text>
                    )}
                  </View>
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
  },
  statusFilters: {
    flexDirection: 'row',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeStatusButton: {
    backgroundColor: '#4CAF50',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeStatusButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  ordersList: {
    flex: 1,
    padding: 15,
  },
  orderCard: {
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
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  customerPhone: {
    fontSize: 14,
    color: '#666',
  },
  orderMeta: {
    alignItems: 'flex-end',
    gap: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  orderDetails: {
    marginBottom: 15,
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  orderDetailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  paidBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paidText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
  },
  confirmButton: {
    backgroundColor: '#2196F3',
  },
  preparingButton: {
    backgroundColor: '#9C27B0',
  },
  readyButton: {
    backgroundColor: '#FF9800',
  },
  deliveredButton: {
    backgroundColor: '#4CAF50',
  },
  paymentButton: {
    backgroundColor: '#607D8B',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
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
    backgroundColor: '#4CAF50',
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
    width: '95%',
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginTop: 10,
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
  productsSection: {
    marginVertical: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addProductButton: {
    padding: 5,
  },
  productItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  productSelector: {
    flex: 1,
    marginRight: 10,
  },
  productOption: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 5,
    backgroundColor: 'white',
  },
  selectedProduct: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  productOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedProductText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  quantityLabel: {
    fontSize: 14,
    color: '#333',
  },
  quantityInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    width: 60,
    textAlign: 'center',
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
    flex: 1,
    textAlign: 'right',
  },
  totalSection: {
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  paymentMethods: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  // paymentButton: {   
  //   flex: 1,
  //   padding: 12,
  //   borderWidth: 1,
  //   borderColor: '#ddd',
  //   borderRadius: 8,
  //   alignItems: 'center',
  // },
  selectedPayment: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  paymentButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPaymentText: {
    color: '#2196F3',
    fontWeight: '500',
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
    backgroundColor: '#4CAF50',
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
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  itemDetail: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    color: '#666',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  totalDetail: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'right',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});