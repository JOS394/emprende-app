import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, year
  const [reportData, setReportData] = useState({
    sales: {
      total: 15750,
      growth: 12.5,
      transactions: 89,
    },
    products: {
      topSelling: [
        { name: 'Camiseta Azul', sales: 45, revenue: 1350 },
        { name: 'Jeans Negro', sales: 32, revenue: 1920 },
        { name: 'Zapatos Sport', sales: 28, revenue: 2240 },
        { name: 'Sudadera Gris', sales: 23, revenue: 1150 },
        { name: 'Gorra Roja', sales: 18, revenue: 540 },
      ],
      lowStock: [
        { name: 'Camiseta Azul', stock: 2 },
        { name: 'Zapatos Sport', stock: 1 },
        { name: 'Gorra Roja', stock: 3 },
      ],
    },
    customers: {
      total: 156,
      new: 23,
      returning: 67,
      topBuyers: [
        { name: 'María García', orders: 8, total: 2400 },
        { name: 'Juan López', orders: 6, total: 1800 },
        { name: 'Ana Martínez', orders: 5, total: 1500 },
      ],
    },
  });

  // Datos para gráficos
  const salesChartData = {
    labels: selectedPeriod === 'week' 
      ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
      : selectedPeriod === 'month'
      ? ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
      : ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [{
      data: selectedPeriod === 'week'
        ? [1200, 1800, 1500, 2200, 1900, 2500, 1650]
        : selectedPeriod === 'month'
        ? [8500, 9200, 7800, 10500]
        : [25000, 28000, 32000, 29000, 35000, 38000],
      strokeWidth: 3,
    }],
  };

  const productSalesData = {
    labels: ['Camisetas', 'Jeans', 'Zapatos', 'Accesorios'],
    datasets: [{
      data: [45, 32, 28, 35],
    }],
  };

  const customerTypeData = [
    {
      name: 'Nuevos',
      population: 23,
      color: '#3B82F6',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Recurrentes',
      population: 67,
      color: '#10B981',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
    {
      name: 'Inactivos',
      population: 66,
      color: '#F59E0B',
      legendFontColor: '#374151',
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    backgroundColor: '#FFF',
    backgroundGradientFrom: '#FFF',
    backgroundGradientTo: '#FFF',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#3B82F6',
    },
  };

  const generateReport = async () => {
    Alert.alert(
      'Generar Reporte',
      '¿Quieres generar un reporte completo en PDF?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Generar', onPress: () => {
          Alert.alert('Éxito', 'Reporte generado y guardado en tus archivos');
        }},
      ]
    );
  };

  const shareReport = () => {
    Alert.alert(
      'Compartir Reporte',
      'Selecciona cómo quieres compartir:',
      [
        { text: 'WhatsApp', onPress: () => console.log('Compartir por WhatsApp') },
        { text: 'Email', onPress: () => console.log('Compartir por Email') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const PeriodButton = ({ period, title, isActive, onPress }: { period: string, title: string, isActive: boolean, onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.periodButton, isActive && styles.periodButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.periodButtonText, isActive && styles.periodButtonTextActive]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const MetricCard = ({ icon, title, value, subtitle, color, growth }: { icon: string, title: string, value: string, subtitle: string, color: string, growth: number }) => (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        {growth && (
          <View style={[styles.growthBadge, { backgroundColor: growth > 0 ? '#10B98120' : '#EF444420' }]}>
            <Ionicons 
              name={growth > 0 ? 'trending-up' : 'trending-down'} 
              size={12} 
              color={growth > 0 ? '#10B981' : '#EF4444'} 
            />
            <Text style={[styles.growthText, { color: growth > 0 ? '#10B981' : '#EF4444' }]}>
              {Math.abs(growth)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );

  const TopProductItem = ({ product, index }: { product: any, index: number }) => (
    <View style={styles.topProductItem}>
      <View style={styles.productRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productStats}>{product.sales} ventas • ${product.revenue}</Text>
      </View>
      <View style={styles.productSalesBar}>
        <View 
          style={[
            styles.salesBarFill, 
            { width: `${(product.sales / 50) * 100}%` }
          ]} 
        />
      </View>
    </View>
  );

  const CustomerItem = ({ customer, index }: { customer: any, index: number }) => (
    <View style={styles.customerItem}>
      <View style={styles.customerAvatar}>
        <Text style={styles.customerInitial}>
          {customer.name.split(' ').map((n: string) => n[0]).join('')}
        </Text>
      </View>
      <View style={styles.customerInfo}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.customerStats}>{customer.orders} pedidos • ${customer.total}</Text>
      </View>
      <TouchableOpacity style={styles.contactButton}>
        <Ionicons name="chatbubble-outline" size={16} color="#3B82F6" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes Básicos</Text>
        <TouchableOpacity 
          onPress={shareReport}
          style={styles.shareButton}
        >
          <Ionicons name="share-outline" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Selector de período */}
        <View style={styles.periodSelector}>
          <Text style={styles.sectionTitle}>Período</Text>
          <View style={styles.periodButtons}>
            <PeriodButton
              period="week"
              title="Semana"
              isActive={selectedPeriod === 'week'}
              onPress={() => setSelectedPeriod('week')}
            />
            <PeriodButton
              period="month"
              title="Mes"
              isActive={selectedPeriod === 'month'}
              onPress={() => setSelectedPeriod('month')}
            />
            <PeriodButton
              period="year"
              title="Año"
              isActive={selectedPeriod === 'year'}
              onPress={() => setSelectedPeriod('year')}
            />
          </View>
        </View>

        {/* Métricas principales */}
        <View style={styles.metricsSection}>
          <Text style={styles.sectionTitle}>Resumen General</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              icon="cash"
              title="Ventas Totales"
              value={`$${reportData.sales.total.toLocaleString()}`}
              subtitle={`${reportData.sales.transactions} transacciones`}
              color="#10B981"
              growth={reportData.sales.growth}
            />
            <MetricCard
              icon="cube"
              title="Productos Vendidos"
              value="146"
              subtitle="8 categorías"
              color="#3B82F6"
              growth={0}
            />
            <MetricCard
              icon="people"
              title="Clientes Activos"
              value={reportData.customers.total.toString()}
              subtitle={`${reportData.customers.new} nuevos`}
              color="#8B5CF6"
              growth={8.2}
            />
            <MetricCard
              icon="trending-up"
              title="Crecimiento"
              value="12.5%"
              subtitle="vs período anterior"
              color="#F59E0B"
              growth={12.5}
            />
          </View>
        </View>

        {/* Gráfico de ventas */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Tendencia de Ventas</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={salesChartData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Productos más vendidos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {reportData.products.topSelling.map((product, index) => (
            <TopProductItem key={index} product={product} index={index} />
          ))}
        </View>

        {/* Gráfico de ventas por categoría */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Ventas por Categoría</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={productSalesData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              showValuesOnTopOfBars={true}
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        </View>

        {/* Análisis de clientes */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Tipos de Clientes</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={customerTypeData}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Top clientes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mejores Clientes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todos</Text>
            </TouchableOpacity>
          </View>
          {reportData.customers.topBuyers.map((customer, index) => (
            <CustomerItem key={index} customer={customer} index={index} />
          ))}
        </View>

        {/* Alertas y recomendaciones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alertas y Recomendaciones</Text>
          
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Ionicons name="warning" size={20} color="#F59E0B" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Stock Bajo</Text>
              <Text style={styles.alertText}>
                {reportData.products.lowStock.length} productos necesitan reabastecimiento
              </Text>
            </View>
          </View>

          <View style={[styles.alertCard, { backgroundColor: '#EBF4FF' }]}>
            <View style={[styles.alertIcon, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="bulb" size={20} color="#3B82F6" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Recomendación</Text>
              <Text style={styles.alertText}>
                Considera promocionar "Camiseta Azul" que está en alta demanda
              </Text>
            </View>
          </View>

          <View style={[styles.alertCard, { backgroundColor: '#F0FDF4' }]}>
            <View style={[styles.alertIcon, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="trending-up" size={20} color="#10B981" />
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>Oportunidad</Text>
              <Text style={styles.alertText}>
                Los fines de semana generan 30% más ventas que días normales
              </Text>
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={generateReport}>
            <Ionicons name="document-text" size={20} color="#FFF" />
            <Text style={styles.primaryButtonText}>Generar Reporte PDF</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.secondaryButton}>
            <Ionicons name="settings" size={20} color="#3B82F6" />
            <Text style={styles.secondaryButtonText}>Configurar Reportes</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  periodSelector: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  periodButtonActive: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#3B82F6',
  },
  metricsSection: {
    marginBottom: 25,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    width: (screenWidth - 55) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  metricSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  chartSection: {
    marginBottom: 25,
  },
  chartContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chart: {
    borderRadius: 8,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  topProductItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productRank: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EBF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  productStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  productSalesBar: {
    width: 60,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  salesBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  customerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  customerInitial: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  customerStats: {
    fontSize: 14,
    color: '#6B7280',
  },
  contactButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#EBF4FF',
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 18,
  },
  actionButtons: {
    marginTop: 20,
    gap: 15,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EBF4FF',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 10,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  bottomSpace: {
    height: 20,
  },
});