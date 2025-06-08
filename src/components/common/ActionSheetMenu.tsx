import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ActionSheetMenuProps {
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  itemName?: string;
}

export const ActionSheetMenu: React.FC<ActionSheetMenuProps> = ({
  onView,
  onEdit,
  onDelete,
  itemName = 'elemento'
}) => {
  const actionSheetRef = useRef<ActionSheetRef>(null);

  const showOptions = () => {
    actionSheetRef.current?.show();
  };

  const handleAction = (action: 'view' | 'edit' | 'delete') => {
    actionSheetRef.current?.hide();
    setTimeout(() => {
      switch (action) {
        case 'view':
          onView();
          break;
        case 'edit':
          onEdit();
          break;
        case 'delete':
          onDelete();
          break;
      }
    }, 200);
  };

  return (
    <>
      <TouchableOpacity style={styles.menuButton} onPress={showOptions}>
        <Icon name="ellipsis-v" size={18} color="#666" />
      </TouchableOpacity>

      <ActionSheet
        ref={actionSheetRef}
        containerStyle={styles.actionSheetContainer}
        gestureEnabled={true}
        headerAlwaysVisible={true}
        CustomHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Opciones</Text>
            {/* <Text style={styles.headerSubtitle}>{itemName}</Text> */}
          </View>
        }
      >
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => handleAction('view')}
          >
            <View style={[styles.actionIcon, styles.viewIcon]}>
              <Icon name="eye" size={20} color="#2196F3" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver detalles</Text>
              <Text style={styles.actionSubtitle}>Mostrar información completa</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => handleAction('edit')}
          >
            <View style={[styles.actionIcon, styles.editIcon]}>
              <Icon name="pencil" size={20} color="#FF9800" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Editar</Text>
              <Text style={styles.actionSubtitle}>Modificar información</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => handleAction('delete')}
          >
            <View style={[styles.actionIcon, styles.deleteIcon]}>
              <Icon name="trash" size={20} color="#F44336" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Eliminar</Text>
              <Text style={styles.actionSubtitle}>Remover permanentemente</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ActionSheet>
    </>
  );
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionSheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  viewIcon: {
    backgroundColor: '#e3f2fd',
  },
  editIcon: {
    backgroundColor: '#fff3e0',
  },
  deleteIcon: {
    backgroundColor: '#ffebee',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});