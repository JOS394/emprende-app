import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Order } from '../../../src/models/Order';
import { OrdersService } from '../../../src/services/OrdersService';

export default function HistoryScreen() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [pedidos, setPedidos] = useState<Order[]>([]);

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

  const filteredPedidos = pedidos.filter(pedido => 
    filterStatus === 'todos' || pedido.status === filterStatus
  );

  const viewPedido = (pedido: Order) => {
    setSelectedOrder(pedido);
    setModalVisible(true);
  };

  const deletePedido = async (id: number) => {
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
              await OrdersService.delete(id);
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
        <View>
          <Text style={styles.pedidoId}>Pedido #{item.id}</Text>
          <Text style={styles.pedidoProveedor}>{item.vendor}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getEstadoColor(item.status) }]}>
          <Text style={styles.statusText}>{getEstadoText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.pedidoInfo}>
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
      </View>

      <View style={styles.pedidoActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => viewPedido(item)}
        >
          <Ionicons name="eye-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>Ver</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => deletePedido(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="white" />
          <Text style={styles.actionButtonText}>Eliminar</Text>
        </TouchableOpacity>
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
                      <Text style={styles.contentText}>{selectedOrder.content}</Text>
                    </View>
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
    alignItems: 'center',
    marginBottom: 10,
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
  pedidoInfo: {
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  pedidoActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 5,
  },
  viewButton: {
    backgroundColor: '#007AFF',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
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
});