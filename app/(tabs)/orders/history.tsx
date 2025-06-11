import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ActionSheetMenu } from '../../../src/components/common/ActionSheetMenu';
import { Order } from '../../../src/models/Order';
import { OrdersService } from '../../../src/services/OrdersService';

export default function HistoryScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [showFullImage, setShowFullImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [])
  );

  const cargarPedidos = async () => {
    try {
      const data = await OrdersService.getAll();
      setPedidos(data);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'delivered': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'pending': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'delivered': return 'Entregado';
      case 'in_progress': return 'En Proceso';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return estado;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES');
  };

  const isImageContent = (content: string) => {
    return content.startsWith('Pedido con imagen:');
  };

  const extractImageUri = (content: string) => {
    if (content.startsWith('Pedido con imagen:')) {
      return content.replace('Pedido con imagen: ', '').trim();
    }
    return null;
  };

  const openImageViewer = (imageUri: string) => {
    setShowFullImage(true);
  };

  const filteredPedidos = pedidos.filter(pedido => 
    filterStatus === 'todos' || pedido.status === filterStatus
  );

  // Funciones para el ActionSheet
  const handleViewPedido = (pedido: Order) => {
    setSelectedOrder(pedido);
    setShowFullImage(false); // Reset imagen completa
    setModalVisible(true);
  };

  const handleEditPedido = (pedido: Order) => {
    Alert.alert('Editar', `Editar pedido #${pedido.id}`);
  };

  const handleDeletePedido = async (pedido: Order) => {
    Alert.alert(
      'Eliminar Pedido',
      '¿Estás seguro de eliminar este pedido del historial?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await OrdersService.delete(pedido.id);
              await cargarPedidos();
              Alert.alert('Éxito', 'Pedido eliminado del historial');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el pedido');
            }
          }
        }
      ]
    );
  };

  const renderPedidoItem = ({ item }: { item: Order }) => (
    <View style={styles.pedidoCard}>
      <View style={styles.pedidoHeader}>
        <View style={styles.pedidoInfo}>
          <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
          <Text style={styles.pedidoProveedor}>{item.vendor}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.status) }]}>
            <Text style={styles.statusText}>{getEstadoText(item.status)}</Text>
          </View>
          <ActionSheetMenu
            onView={() => handleViewPedido(item)}
            onEdit={() => handleEditPedido(item)}
            onDelete={() => handleDeletePedido(item)}
            itemName={`Pedido #${item.id}`}
          />
        </View>
      </View>

      <View style={styles.pedidoDetails}>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.infoText}>Pedido: {formatDate(item.date_order)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#666" />
          <Text style={styles.infoText}>
            Entrega: {formatDate(item.date_start)} - {formatDate(item.date_end)}
          </Text>
        </View>
        {item.total && (
          <View style={styles.infoRow}>
            <Ionicons name="cash-outline" size={16} color="#666" />
            <Text style={styles.infoText}>Total: ${item.total.toLocaleString()}</Text>
          </View>
        )}
        {isImageContent(item.content) && (
          <View style={styles.infoRow}>
            <Ionicons name="image-outline" size={16} color="#007AFF" />
            <Text style={[styles.infoText, styles.imageIndicator]}>Incluye imagen</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['todos', 'pending', 'in_progress', 'delivered', 'cancelled'].map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.filterButton,
                filterStatus === estado && styles.activeFilter
              ]}
              onPress={() => setFilterStatus(estado)}
            >
              <Text style={[
                styles.filterText,
                filterStatus === estado && styles.activeFilterText
              ]}>
                {estado === 'todos' ? 'Todos' : getEstadoText(estado)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de pedidos */}
      <FlatList
        data={filteredPedidos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderPedidoItem}
        style={styles.pedidosList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No hay pedidos en el historial</Text>
          </View>
        }
      />

      {/* Modal de detalle */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {selectedOrder && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Pedido #{selectedOrder.id}</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalContent}>
                    {showFullImage ? (
                      <View style={styles.fullImageView}>
                        <TouchableOpacity 
                          style={styles.backButton}
                          onPress={() => setShowFullImage(false)}
                        >
                          <Ionicons name="arrow-back" size={24} color="#333" />
                          <Text style={styles.backText}>Volver</Text>
                        </TouchableOpacity>
                        <Image 
                          source={{ uri: extractImageUri(selectedOrder.content)! }} 
                          style={styles.fullModalImage}
                          resizeMode="contain"
                          onError={(error) => console.log('Error imagen completa:', error)}
                          onLoad={() => console.log('Imagen cargada exitosamente')}
                        />
                      </View>
                    ) : (
                      <>
                        <View style={styles.detailSection}>
                          <Text style={styles.sectionTitle}>Información General</Text>
                          <Text style={styles.detailText}>Proveedor: {selectedOrder.vendor}</Text>
                          <Text style={styles.detailText}>Fecha de pedido: {formatDate(selectedOrder.date_order)}</Text>
                          <Text style={styles.detailText}>
                            Entrega estimada: {formatDate(selectedOrder.date_start)} - {formatDate(selectedOrder.date_end)}
                          </Text>
                          <View style={styles.statusContainer}>
                            <Text style={styles.detailText}>Estado: </Text>
                            <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(selectedOrder.status) }]}>
                              <Text style={styles.statusText}>{getEstadoText(selectedOrder.status)}</Text>
                            </View>
                          </View>
                          {selectedOrder.total && (
                            <Text style={styles.totalText}>Total: ${selectedOrder.total.toLocaleString()}</Text>
                          )}
                        </View>

                        <View style={styles.detailSection}>
                          <Text style={styles.sectionTitle}>Contenido del Pedido</Text>
                          {isImageContent(selectedOrder.content) ? (
                            <View style={styles.imageContainer}>
                              <Text style={styles.imageLabel}>Imagen del pedido:</Text>
                              {extractImageUri(selectedOrder.content) && (
                                <TouchableOpacity 
                                  onPress={() => openImageViewer(extractImageUri(selectedOrder.content)!)}
                                >
                                  <Image 
                                    source={{ uri: extractImageUri(selectedOrder.content)! }} 
                                    style={styles.contentImage}
                                    resizeMode="contain"
                                    onError={() => console.log('Error cargando imagen')}
                                  />
                                </TouchableOpacity>
                              )}
                            </View>
                          ) : (
                            <Text style={styles.contentText}>{selectedOrder.content}</Text>
                          )}
                        </View>
                      </>
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
  filtersContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 5,
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterText: {
    color: 'white',
    fontWeight: '500',
  },
  pedidosList: {
    flex: 1,
    padding: 15,
  },
  pedidoCard: {
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
  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  pedidoInfo: {
    flex: 1,
  },
  pedidoId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  pedidoProveedor: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  pedidoDetails: {
    gap: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  imageIndicator: {
    color: '#007AFF',
    fontWeight: '500',
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
    marginTop: 10,
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    gap: 20,
  },
  detailSection: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  imageContainer: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  imageLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    fontWeight: '500',
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  fullModalImage: {
    width: '100%',
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  fullImageView: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
});