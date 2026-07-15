'use client';

import { useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import { Modal } from '@/src/components/ui/Modal';
import { ReceiptTemplate } from '@/src/components/features/ReceiptTemplate';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  tableNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    modifiers: string[];
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  roundingAmount: number;
  total: number;
  paymentMethod: string;
  cashierName?: string;
  notes?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
}

export const ReceiptModal = ({
  isOpen,
  onClose,
  orderId,
  tableNumber,
  items,
  subtotal,
  tax,
  discount,
  roundingAmount,
  total,
  paymentMethod,
  cashierName = 'Kasir',
  notes,
  storeName,
  storeAddress,
  storePhone,
}: ReceiptModalProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!receiptRef.current) return;

    try {
      // Capture receipt as canvas using html2canvas-pro
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2, // Higher resolution for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      // Convert canvas to image data
      const imgData = canvas.toDataURL('image/png', 1.0);

      // Create PDF with 80mm width (thermal printer format)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, canvas.height * 0.264583], // 80mm width, auto height
      });

      // Calculate dimensions to fit 80mm width
      const pdfWidth = 80;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Generate filename with order ID and timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `receipt-${orderId.slice(0, 8)}-${timestamp}.pdf`;

      // Download PDF
      pdf.save(filename);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    }
  };

  const handlePrint = () => {
    generatePDF();
  };

  const handleDownloadPDF = () => {
    generatePDF();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Preview Struk"
      size="sm"
      footer={
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Cetak Struk
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      }
    >
      <div className="flex justify-center">
        <ReceiptTemplate
          ref={receiptRef}
          orderId={orderId}
          tableNumber={tableNumber}
          items={items}
          subtotal={subtotal}
          tax={tax}
          discount={discount}
          roundingAmount={roundingAmount}
          total={total}
          paymentMethod={paymentMethod}
          cashierName={cashierName}
          notes={notes}
          storeName={storeName}
          storeAddress={storeAddress}
          storePhone={storePhone}
        />
      </div>
    </Modal>
  );
};
