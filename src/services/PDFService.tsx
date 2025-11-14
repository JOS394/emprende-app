import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { logger } from '../utils/logger';

export interface InvoiceData {
  orderNumber: string;
  orderDate: Date;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  total: number;
  paymentMethod: string;
  isPaid: boolean;
  notes?: string;
  businessInfo?: {
    name: string;
    phone: string;
    email: string;
    address?: string;
    logo?: string;
  };
}

export class PDFService {
  /**
   * Genera el HTML para la factura con diseño profesional
   */
  private static generateInvoiceHTML(data: InvoiceData): string {
    const formatPrice = (price: number) => `$${price.toLocaleString('es-ES')}`;
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    };

    const paymentMethodText = {
      cash: 'Efectivo',
      transfer: 'Transferencia',
      card: 'Tarjeta',
    }[data.paymentMethod] || data.paymentMethod;

    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura #${data.orderNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #333;
      padding: 40px;
      line-height: 1.6;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 3px solid #2196F3;
      padding-bottom: 20px;
    }

    .business-info {
      flex: 1;
    }

    .business-name {
      font-size: 28px;
      font-weight: bold;
      color: #2196F3;
      margin-bottom: 10px;
    }

    .business-details {
      font-size: 12px;
      color: #666;
      line-height: 1.8;
    }

    .invoice-info {
      text-align: right;
    }

    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .invoice-number {
      font-size: 16px;
      color: #666;
      margin-bottom: 5px;
    }

    .invoice-date {
      font-size: 14px;
      color: #666;
    }

    .customer-section {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #2196F3;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .customer-details {
      font-size: 14px;
      line-height: 1.8;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    .items-table thead {
      background-color: #2196F3;
      color: white;
    }

    .items-table th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }

    .items-table tbody tr {
      border-bottom: 1px solid #e0e0e0;
    }

    .items-table tbody tr:hover {
      background-color: #f8f9fa;
    }

    .items-table td {
      padding: 12px;
      font-size: 13px;
    }

    .quantity-col {
      text-align: center !important;
    }

    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 30px;
    }

    .totals-table {
      width: 300px;
    }

    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .totals-row.total {
      border-top: 2px solid #2196F3;
      padding-top: 12px;
      margin-top: 8px;
      font-size: 18px;
      font-weight: bold;
      color: #2196F3;
    }

    .payment-info {
      background-color: #e8f5e9;
      padding: 15px 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .payment-method {
      font-size: 14px;
      color: #2e7d32;
    }

    .payment-status {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
    }

    .payment-status.paid {
      background-color: #4caf50;
      color: white;
    }

    .payment-status.pending {
      background-color: #ff9800;
      color: white;
    }

    .notes-section {
      background-color: #fff3e0;
      padding: 15px 20px;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      margin-bottom: 30px;
    }

    .notes-title {
      font-weight: bold;
      color: #e65100;
      margin-bottom: 5px;
    }

    .notes-text {
      font-size: 13px;
      color: #666;
      line-height: 1.6;
    }

    .footer {
      text-align: center;
      font-size: 11px;
      color: #999;
      border-top: 1px solid #e0e0e0;
      padding-top: 20px;
      margin-top: 40px;
    }

    @media print {
      body {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="business-info">
      <div class="business-name">${data.businessInfo?.name || 'Mi Negocio'}</div>
      <div class="business-details">
        ${data.businessInfo?.phone ? `📞 ${data.businessInfo.phone}<br>` : ''}
        ${data.businessInfo?.email ? `📧 ${data.businessInfo.email}<br>` : ''}
        ${data.businessInfo?.address ? `📍 ${data.businessInfo.address}` : ''}
      </div>
    </div>
    <div class="invoice-info">
      <div class="invoice-title">FACTURA</div>
      <div class="invoice-number">#${data.orderNumber}</div>
      <div class="invoice-date">${formatDate(data.orderDate)}</div>
    </div>
  </div>

  <div class="customer-section">
    <div class="section-title">Cliente</div>
    <div class="customer-details">
      <strong>${data.customerName}</strong><br>
      📞 ${data.customerPhone}<br>
      ${data.customerAddress ? `📍 ${data.customerAddress}` : ''}
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Producto</th>
        <th class="quantity-col">Cantidad</th>
        <th>Precio Unit.</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map(item => `
        <tr>
          <td>${item.productName}</td>
          <td class="quantity-col">${item.quantity}</td>
          <td>${formatPrice(item.unitPrice)}</td>
          <td>${formatPrice(item.subtotal)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals-section">
    <div class="totals-table">
      <div class="totals-row total">
        <span>TOTAL:</span>
        <span>${formatPrice(data.total)}</span>
      </div>
    </div>
  </div>

  <div class="payment-info">
    <div class="payment-method">
      <strong>Método de pago:</strong> ${paymentMethodText}
    </div>
    <span class="payment-status ${data.isPaid ? 'paid' : 'pending'}">
      ${data.isPaid ? '✓ PAGADO' : '⏳ PENDIENTE'}
    </span>
  </div>

  ${data.notes ? `
    <div class="notes-section">
      <div class="notes-title">Notas:</div>
      <div class="notes-text">${data.notes}</div>
    </div>
  ` : ''}

  <div class="footer">
    Factura generada electrónicamente - ${formatDate(new Date())}<br>
    Gracias por su preferencia
  </div>
</body>
</html>
    `;
  }

  /**
   * Genera un PDF de factura y lo guarda temporalmente
   */
  static async generateInvoicePDF(data: InvoiceData): Promise<{
    success: boolean;
    uri?: string;
    error?: string;
  }> {
    try {
      const html = this.generateInvoiceHTML(data);

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      logger.log('PDF generado exitosamente:', uri);

      return {
        success: true,
        uri,
      };
    } catch (error: any) {
      logger.error('Error generando PDF:', error);
      return {
        success: false,
        error: error.message || 'Error al generar el PDF',
      };
    }
  }

  /**
   * Comparte un PDF usando el share sheet nativo
   */
  static async sharePDF(uri: string, filename: string = 'factura.pdf'): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const isAvailable = await Sharing.isAvailableAsync();

      if (!isAvailable) {
        logger.error('Sharing no está disponible en este dispositivo');
        return {
          success: false,
          error: 'Compartir no está disponible en este dispositivo',
        };
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir factura',
        UTI: 'com.adobe.pdf',
      });

      return { success: true };
    } catch (error: any) {
      logger.error('Error compartiendo PDF:', error);
      return {
        success: false,
        error: error.message || 'Error al compartir el PDF',
      };
    }
  }

  /**
   * Guarda el PDF en el directorio de documentos del dispositivo
   */
  static async savePDF(uri: string, filename: string = 'factura.pdf'): Promise<{
    success: boolean;
    savedUri?: string;
    error?: string;
  }> {
    try {
      const documentDirectory = FileSystem.documentDirectory;
      if (!documentDirectory) {
        throw new Error('No se pudo acceder al directorio de documentos');
      }

      const savedUri = `${documentDirectory}${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: savedUri,
      });

      logger.log('PDF guardado en:', savedUri);

      return {
        success: true,
        savedUri,
      };
    } catch (error: any) {
      logger.error('Error guardando PDF:', error);
      return {
        success: false,
        error: error.message || 'Error al guardar el PDF',
      };
    }
  }

  /**
   * Imprime directamente el PDF (si el dispositivo tiene impresora configurada)
   */
  static async printPDF(data: InvoiceData): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const html = this.generateInvoiceHTML(data);

      await Print.printAsync({
        html,
      });

      return { success: true };
    } catch (error: any) {
      logger.error('Error imprimiendo PDF:', error);
      return {
        success: false,
        error: error.message || 'Error al imprimir el PDF',
      };
    }
  }
}
