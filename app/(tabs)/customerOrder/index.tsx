import { useRequireAuth } from '@/src/contexts/AuthContext';
import { useNotifications } from '@/src/contexts/NotificationContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActionSheetMenu } from '../../../src/components/common/ActionSheetMenu';
import { CustomerOrdersService } from '../../../src/services/CustomerOrderService';
import { Validators } from '../../../src/utils/validators';
import { PDFService } from '../../../src/services/PDFService';
import { BusinessSettingsService } from '../../../src/services/BusinessSettingsService';
import { useSearchPagination } from '../../../src/hooks/usePagination';


interface OrderItem {
  productId: string; // Cambiar de number a string
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface CustomerOrder {
  id: string;
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
  const { checkAndNotifyPendingOrders } = useNotifications();
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);
  const [productPickerVisible, setProductPickerVisible] = useState(false);
  const [localQuantityInputs, setLocalQuantityInputs] = useState<{ [index: number]: string }>({});
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Hook de paginación con búsqueda
  const {
    items: pedidos,
    isLoading,
    isLoadingMore,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
  } = useSearchPagination<CustomerOrder>(
    async (query, page, limit) => {
      const result = await CustomerOrdersService.searchOrdersPaginated(query, page, limit);
      return {
        items: result.items || [],
        totalItems: result.totalItems || 0,
      };
    },
    300 // Debounce de 300ms
  );

  // Estados para el formulario
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    notes: '',
    paymentMethod: 'cash' as 'cash' | 'transfer' | 'card',
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const { user, loading: authLoading } = useRequireAuth();
  if (authLoading) return <ActivityIndicator style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }} />;

  // Cargar productos
  useEffect(() => {
    loadProducts();
  }, []);

  // Verificar órdenes pendientes cuando se cargan
  useEffect(() => {
    if (pedidos.length > 0) {
      checkAndNotifyPendingOrders(pedidos);
    }
  }, [pedidos]);

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
    const matchesStatus = filterStatus === 'todos' || order.status === filterStatus;
    return matchesStatus;
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
    setEditingOrder(null);
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
    updateOrderItem(index, 'subtotal', product.price * orderItems[index].quantity);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + item.subtotal, 0);
  };

  const saveOrder = async () => {
    // Validar nombre del cliente
    const nameValidation = Validators.required(formData.customerName, 'El nombre del cliente');
    if (!nameValidation.isValid) {
      Alert.alert('Error', nameValidation.error);
      return;
    }

    // Validar teléfono del cliente
    const phoneValidation = Validators.required(formData.customerPhone, 'El teléfono del cliente');
    if (!phoneValidation.isValid) {
      Alert.alert('Error', phoneValidation.error);
      return;
    }

    if (orderItems.length === 0) {
      Alert.alert('Error', 'Debe agregar al menos un producto');
      return;
    }

    // Validar cada item de la orden
    for (const item of orderItems) {
      const itemValidation = Validators.orderItem({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      });

      if (!itemValidation.isValid) {
        Alert.alert('Error', itemValidation.error);
        return;
      }
    }

    // Validar stock disponible para cada producto
    const stockErrors: string[] = [];
    for (const item of orderItems) {
      const product = availableProducts.find(p => p.id.toString() === item.productId.toString());
      if (product) {
        const stockValidation = Validators.stockAvailability(
          item.quantity,
          product.stock,
          item.productName
        );

        if (!stockValidation.isValid) {
          stockErrors.push(stockValidation.error!);
        }
      }
    }

    if (stockErrors.length > 0) {
      Alert.alert(
        'Stock Insuficiente',
        stockErrors.join('\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    let result;

    if (editingOrder) {
      // ✅ Actualizar pedido existente con items
      result = await CustomerOrdersService.updateOrder(editingOrder.id, {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        totalAmount: calculateTotal(),
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      });

      if (result.success) {
        Alert.alert('Éxito', 'Pedido actualizado');
      } else {
        Alert.alert('Error', result.error || 'Error al actualizar el pedido');
      }
    } else {
      // ✅ Crear nuevo pedido
      result = await CustomerOrdersService.createOrder({
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
      } else {
        Alert.alert('Error', result.error || 'Error al crear el pedido');
      }
    }

    // ✅ Solo continuar si fue exitoso
    if (result.success) {
      await refresh();
      setModalVisible(false);
      clearForm();
    }
  };

  const togglePaymentStatus = async (orderId: string, currentPaid: boolean) => {
    const result = await CustomerOrdersService.updateOrder(orderId, {
      paymentStatus: currentPaid ? 'pending' : 'paid'
    });

    if (result.success) {
      Alert.alert('Éxito', currentPaid ? 'Pago marcado como pendiente' : 'Pago marcado como pagado');
      await refresh(); // Recarga los datos desde Supabase
    } else {
      Alert.alert('Error', result.error || 'No se pudo actualizar el estado del pago');
    }
  };


  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const result = await CustomerOrdersService.updateOrderStatus(orderId, newStatus);
    if (result.success) {
      Alert.alert('Éxito', `Pedido marcado como ${getStatusText(newStatus)}`);
      await refresh(); // Recarga los datos desde Supabase
    } else {
      Alert.alert('Error', result.error || 'No se pudo actualizar el pedido');
    }
  };

  const handleViewOrder = (order: CustomerOrder) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleEditOrder = (order: CustomerOrder) => {
    setFormData({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress || '',
      notes: order.notes || '',
      paymentMethod: order.paymentMethod,
    });

    setOrderItems(order.items.map(item => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    })));

    setEditingOrder(order);
    setModalVisible(true);
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

  const handleExportPDF = async (order: CustomerOrder) => {
    try {
      // Obtener información del negocio
      const businessResult = await BusinessSettingsService.getSettings();
      const businessInfo = businessResult.success && businessResult.settings ? {
        name: businessResult.settings.business_name,
        phone: businessResult.settings.phone,
        email: businessResult.settings.email,
      } : undefined;

      // Preparar datos de la factura
      const invoiceData = {
        orderNumber: order.id,
        orderDate: order.orderDate,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        items: order.items.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.subtotal,
        })),
        total: order.total,
        paymentMethod: order.paymentMethod,
        isPaid: order.isPaid,
        notes: order.notes,
        businessInfo,
      };

      // Generar PDF
      Alert.alert('Generando PDF...', 'Por favor espera un momento');
      const result = await PDFService.generateInvoicePDF(invoiceData);

      if (result.success && result.uri) {
        // Mostrar opciones de qué hacer con el PDF
        Alert.alert(
          'PDF Generado',
          '¿Qué deseas hacer con la factura?',
          [
            {
              text: 'Compartir',
              onPress: async () => {
                const shareResult = await PDFService.sharePDF(
                  result.uri!,
                  `factura-${order.id}.pdf`
                );
                if (!shareResult.success) {
                  Alert.alert('Error', shareResult.error);
                }
              },
            },
            {
              text: 'Imprimir',
              onPress: async () => {
                const printResult = await PDFService.printPDF(invoiceData);
                if (!printResult.success) {
                  Alert.alert('Error', printResult.error);
                }
              },
            },
            { text: 'Cancelar', style: 'cancel' },
          ]
        );
      } else {
        Alert.alert('Error', result.error || 'No se pudo generar el PDF');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al exportar PDF');
    }
  };

  const openProductSelector = (index: number) => {
    setSelectedProductIndex(index);
    setProductPickerVisible(true);
  };

  const closeProductSelector = () => {
    setProductPickerVisible(false);
    setSelectedProductIndex(null);
  };

  const handleProductSelect = (product: any) => {
    if (selectedProductIndex !== null) {
      selectProduct(selectedProductIndex, product); // tu función ya existente
    }
    closeProductSelector();
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
            onPress={() => togglePaymentStatus(item.id, item.isPaid)}
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
            value={searchQuery}
            onChangeText={setSearchQuery}
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
        refreshControl={
          <RefreshControl
            refreshing={isLoading && pedidos.length > 0}
            onRefresh={refresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingMoreText}>Cargando más pedidos...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Cargando pedidos...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay pedidos disponibles</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setModalVisible(true)}>
                <Text style={styles.emptyButtonText}>Crear primer pedido</Text>
              </TouchableOpacity>
            </View>
          )
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
              <Text style={styles.modalTitle}>
                {editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}
              </Text>

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

              {/* Buscador de productos */}
              <Text style={styles.sectionTitle}>Buscar Productos</Text>
              <TextInput
                style={styles.input}
                placeholder="Escribe para buscar..."
                value={productSearch}
                onChangeText={setProductSearch}
              />

              {/* Lista de productos disponibles */}
              {productSearch.trim().length > 0 &&
                availableProducts
                  .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                  .map((product) => (
                    <View key={product.id} style={styles.availableProductCard}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>
                      <TouchableOpacity
                        style={styles.addProductButton}
                        onPress={() => {
                          const alreadyAdded = orderItems.find(i => i.productId === product.id);
                          if (!alreadyAdded) {
                            const newItem: OrderItem = {
                              productId: product.id,
                              productName: product.name,
                              quantity: 1,
                              price: product.price,
                              subtotal: product.price,
                            };
                            setOrderItems([...orderItems, newItem]);
                            setProductSearch(''); // Limpia la búsqueda
                          }
                        }}
                      >
                        <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
                      </TouchableOpacity>
                    </View>
                  ))}


              {/* Lista de productos seleccionados */}
              <Text style={styles.sectionTitle}>Productos Seleccionados</Text>
              {orderItems.length === 0 && (
                <Text style={{ color: '#888', fontStyle: 'italic' }}>No hay productos agregados</Text>
              )}
              {orderItems.map((item, index) => (
                <View key={index} style={styles.selectedProductCard}>
                  <View style={styles.selectedProductInfo}>
                    <Text style={styles.productName}>{item.productName}</Text>
                    <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                  </View>

                  <View style={styles.inlineRow}>
                    <Text>Cantidad:</Text>
                    <TextInput
                      style={styles.quantityInput}
                      keyboardType="numeric"
                      value={localQuantityInputs[index] ?? item.quantity.toString()}
                      onChangeText={(text) => {
                        // Solo permitir números (vacío también)
                        if (/^\d*$/.test(text)) {
                          setLocalQuantityInputs(prev => ({ ...prev, [index]: text }));

                          const qty = parseInt(text) || 0;
                          updateOrderItem(index, 'quantity', qty);
                          updateOrderItem(index, 'subtotal', qty * item.price);
                        }
                      }}
                    />

                    <Text style={styles.subtotalText}>Subtotal: {formatPrice(item.subtotal)}</Text>
                    <TouchableOpacity onPress={() => removeOrderItem(index)}>
                      <Ionicons name="trash-outline" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

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

              {/* Botones */}
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
                  <Text style={styles.saveButtonText}>
                    {editingOrder ? 'Actualizar Pedido' : 'Crear Pedido'}
                  </Text>
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

                  {/* Botón de exportar PDF */}
                  <View style={styles.pdfButtonContainer}>
                    <TouchableOpacity
                      style={styles.pdfButton}
                      onPress={() => handleExportPDF(selectedOrder)}
                    >
                      <Ionicons name="document-text" size={20} color="white" />
                      <Text style={styles.pdfButtonText}>Generar Factura PDF</Text>
                    </TouchableOpacity>
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
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  loadingMore: {
    padding: 20,
    alignItems: 'center',
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
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

  productsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },


  productCard: {
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
  },

  productTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },

  productName: {
    fontWeight: 'bold',
    fontSize: 16,
  },

  productSelector: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },

  productSelectorText: {
    color: '#333',
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  quantityInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 5,
    width: 60,
    textAlign: 'center',
  },

  availableProductCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  addProductButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },

  selectedProductCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  selectedProductInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

  productPrice: {
    color: '#888',
    fontSize: 14,
  },

  subtotalText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },

  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },

  pdfButtonContainer: {
    marginTop: 20,
    marginBottom: 10,
  },

  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  pdfButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});