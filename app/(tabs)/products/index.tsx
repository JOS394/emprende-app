import { ProductsService } from '@/src/services/ProductsService';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { ActionSheetMenu } from '../../../src/components/common/ActionSheetMenu';
import { useRequireAuth } from '../../../src/contexts/AuthContext';
import { useNotifications } from '../../../src/contexts/NotificationContext';
import { Validators } from '../../../src/utils/validators';
import { useSearchPagination } from '../../../src/hooks/usePagination';
import { OptimizedImage } from '../../../src/components/common/OptimizedImage';


interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  cost?: number;
  stock: number;
  image?: string;
  category: string;
  isActive: boolean;
  createdAt: Date;
}

export default function ProductosScreen() {
  const { user } = useRequireAuth();
  const { checkAndNotifyLowStock } = useNotifications();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    cost: '',
    stock: '',
    image: '',
    category: '',
  });

  // Hook de paginación con búsqueda
  const {
    items: productos,
    isLoading,
    isLoadingMore,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
  } = useSearchPagination<Product>(
    async (query, page, limit) => {
      const result = await ProductsService.searchProductsPaginated(query, page, limit);
      return {
        items: result.items || [],
        totalItems: result.totalItems || 0,
      };
    },
    300 // Debounce de 300ms
  );

  // Verificar stock bajo cuando se cargan productos
  useEffect(() => {
    if (productos.length > 0) {
      const productsWithStock = productos.map(p => ({
        id: p.id,
        name: p.name,
        stock_quantity: p.stock,
      }));
      checkAndNotifyLowStock(productsWithStock);
    }
  }, [productos]);

  // Reemplazar la función saveProduct
  const saveProduct = async () => {
    // Validar usando las utilidades centralizadas
    const validation = Validators.product({
      name: formData.name,
      price: formData.price,
      cost: formData.cost,
      stock: formData.stock,
    });

    if (!validation.isValid) {
      Alert.alert('Error', validation.error);
      return;
    }

    // Subir imagen a Supabase Storage si es una imagen nueva (local)
    let imageUrl = formData.image;
    if (formData.image && (formData.image.startsWith('file://') || formData.image.startsWith('content://'))) {
      setLoading(true);
      const uploadResult = await ProductsService.uploadImage(formData.image);
      setLoading(false);

      if (uploadResult.success) {
        imageUrl = uploadResult.imageUrl;
      } else {
        Alert.alert('Advertencia', 'No se pudo subir la imagen, se usará una versión local');
      }
    }

    if (editingProduct) {
      // Actualizar producto existente
      const result = await ProductsService.updateProduct(editingProduct.id.toString(), {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        cost: formData.cost ? Number(formData.cost) : null,
        stock: Number(formData.stock) || 0,
        image: imageUrl,
        category: formData.category || 'Otros',
      });

      if (result.success) {
        Alert.alert('Éxito', 'Producto actualizado');
        await refresh(); // Recargar productos
      } else {
        Alert.alert('Error', result.error);
      }
    } else {
      // Crear nuevo producto
      const result = await ProductsService.createProduct({
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        cost: formData.cost ? Number(formData.cost) : null,
        stock: Number(formData.stock) || 0,
        image: imageUrl,
        category: formData.category || 'Otros',
      });

      if (result.success) {
        Alert.alert('Éxito', 'Producto creado');
        await refresh(); // Recargar productos
      } else {
        Alert.alert('Error', result.error);
      }
    }

    setModalVisible(false);
    clearForm();
  };

  const categories = ['todos', 'Ropa', 'Accesorios', 'Electrónicos', 'Hogar', 'Otros'];

  const filteredProducts = productos.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'todos' || product.category === filterCategory;
    return matchesSearch && matchesCategory && product.isActive;
  });

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      cost: '',
      stock: '',
      image: '',
      category: '',
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    clearForm();
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      cost: product.cost?.toString() || '',
      stock: product.stock.toString(),
      image: product.image || '',
      category: product.category,
    });
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setDetailModalVisible(true);
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      'Eliminar Producto',
      `¿Estás seguro de eliminar "${product.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setProductos(prev => prev.map(p =>
              p.id === product.id ? { ...p, isActive: false } : p
            ));
            Alert.alert('Éxito', 'Producto eliminado');
          }
        }
      ]
    );
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Error', 'Se necesitan permisos de cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setFormData(prev => ({ ...prev, image: result.assets[0].uri }));
    }
  };

  const openImageModal = (imageUri: string) => {
    setSelectedImageUri(imageUri);
    setImageModalVisible(true);
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString()}`;
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return '#F44336';
    if (stock < 10) return '#FF9800';
    return '#4CAF50';
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        <View style={styles.productImageContainer}>
          <TouchableOpacity onPress={() => item.image && openImageModal(item.image)}>
            <OptimizedImage
              uri={item.image}
              style={styles.productImage}
              fallbackIcon="image-outline"
              fallbackIconSize={32}
              showLoader
              loaderSize="small"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <View style={styles.stockContainer}>
            <View style={[styles.stockBadge, { backgroundColor: getStockColor(item.stock) }]}>
              <Text style={styles.stockText}>Stock: {item.stock}</Text>
            </View>
          </View>
        </View>

        <ActionSheetMenu
          onView={() => handleViewProduct(item)}
          onEdit={() => openEditModal(item)}
          onDelete={() => handleDeleteProduct(item)}
          itemName={item.name}
        />
      </View>

      {item.description && (
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Filtros y búsqueda */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                filterCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => setFilterCategory(category)}
            >
              <Text style={[
                styles.categoryButtonText,
                filterCategory === category && styles.activeCategoryButtonText
              ]}>
                {category === 'todos' ? 'Todos' : category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Lista de productos */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProductItem}
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
        // Pull to refresh
        refreshControl={
          <RefreshControl
            refreshing={isLoading && productos.length > 0}
            onRefresh={refresh}
            colors={['#4CAF50']}
            tintColor="#4CAF50"
          />
        }
        // Infinite scroll
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color="#4CAF50" />
              <Text style={styles.loadingMoreText}>Cargando más productos...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.loadingText}>Cargando productos...</Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No hay productos disponibles</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={openAddModal}>
                <Text style={styles.emptyButtonText}>Agregar primer producto</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />

      {/* Modal para agregar/editar producto */}
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
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </Text>

              <View style={styles.imageSection}>
                {formData.image ? (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity onPress={() => openImageModal(formData.image)}>
                      <Image source={{ uri: formData.image }} style={styles.formImage} />
                    </TouchableOpacity>

                    {/* ✅ Botón para eliminar imagen */}
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => setFormData(prev => ({ ...prev, image: '' }))}
                    >
                      <Ionicons name="trash" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.formImagePlaceholder}>
                    <Ionicons name="image-outline" size={48} color="#ccc" />
                    <Text style={styles.imageHint}>Toca para agregar imagen</Text>
                  </View>
                )}

                <View style={styles.imageButtons}>
                  <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color="white" />
                    <Text style={styles.imageButtonText}>Cámara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                    <Ionicons name="images" size={20} color="white" />
                    <Text style={styles.imageButtonText}>Galería</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Nombre del producto *"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Descripción"
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Precio de venta *"
                  value={formData.price}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Costo (opcional)"
                  value={formData.cost}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, cost: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Stock inicial"
                  value={formData.stock}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Categoría"
                  value={formData.category}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, category: text }))}
                />
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
                  onPress={saveProduct}
                >
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal para imagen completa */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalCloseButton}
            onPress={() => setImageModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="white" />
          </TouchableOpacity>

          <Image
            source={{ uri: selectedImageUri }}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />

          <TouchableOpacity
            style={styles.imageModalBackground}
            onPress={() => setImageModalVisible(false)}
          />
        </View>
      </Modal>

      {/* Modal de detalles del producto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView>
              {selectedProduct && (
                <>
                  <View style={styles.detailHeader}>
                    <Text style={styles.modalTitle}>{selectedProduct.name}</Text>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setDetailModalVisible(false)}
                    >
                      <Ionicons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                  </View>

                  {selectedProduct.image && (
                    <View style={styles.detailImageContainer}>
                      <Image source={{ uri: selectedProduct.image }} style={styles.detailImage} />
                    </View>
                  )}

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Información del Producto</Text>
                    <Text style={styles.detailText}>Categoría: {selectedProduct.category}</Text>
                    <Text style={styles.detailText}>Precio: {formatPrice(selectedProduct.price)}</Text>
                    {selectedProduct.cost && (
                      <Text style={styles.detailText}>Costo: {formatPrice(selectedProduct.cost)}</Text>
                    )}
                    <Text style={styles.detailText}>Stock: {selectedProduct.stock} unidades</Text>
                    <Text style={styles.detailText}>
                      Fecha de creación: {selectedProduct.createdAt.toLocaleDateString()}
                    </Text>
                  </View>

                  {selectedProduct.description && (
                    <View style={styles.detailSection}>
                      <Text style={styles.sectionTitle}>Descripción</Text>
                      <Text style={styles.detailText}>{selectedProduct.description}</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
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
  categoryFilters: {
    flexDirection: 'row',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 10,
  },
  activeCategoryButton: {
    backgroundColor: '#2196F3',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeCategoryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  productsList: {
    flex: 1,
    padding: 15,
  },
  productCard: {
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
  productHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  productImageContainer: {
    marginRight: 15,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  stockContainer: {
    flexDirection: 'row',
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    lineHeight: 20,
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
    backgroundColor: '#2196F3',
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  formImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 15,
  },
  formImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  imageHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  imageButton: {
    flexDirection: 'row',
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    gap: 5,
  },
  imageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  halfInput: {
    flex: 1,
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
    backgroundColor: '#2196F3',
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
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalCloseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 2,
    padding: 10,
  },
  fullScreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
  imageModalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right:0,
    zIndex: 2,
    padding: 0,
  },
  detailImageContainer: {
    marginBottom: 15,
  },
  detailImage: {
    alignSelf: 'center',
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  detailButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  detailButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  detailModal: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  removeImageButton: {
    position: 'absolute',
    bottom: 17,
    right: 2,
    backgroundColor: '#f44336',
    padding: 5,
    borderRadius: 15,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});