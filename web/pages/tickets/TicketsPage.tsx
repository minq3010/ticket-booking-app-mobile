
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import WebLayout from '../../layouts/WebLayout';
import { VStack } from '@/components/VStack';
import { HStack } from '@/components/HStack';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { ticketService } from '@/services/tickets';
import type { Ticket } from '@/types/ticket';
type TicketWithQr = Ticket & { qrcode?: string };

export default function WebTicketsPage() {
  const [tickets, setTickets] = useState<TicketWithQr[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchTickets() {
      setIsLoading(true);
      try {
        const response = await ticketService.getAll();
        // Gọi API chi tiết cho từng vé để lấy mã QR
        const ticketsRaw = response.data;
        const ticketsWithQr: TicketWithQr[] = await Promise.all(
          ticketsRaw.map(async (ticket: Ticket) => {
            try {
              const detail = await ticketService.getOne(ticket.id);
              return { ...ticket, qrcode: detail.data.qrcode };
            } catch {
              return { ...ticket };
            }
          })
        );
        setTickets(ticketsWithQr);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    }
    fetchTickets();
  }, []);

  const enteredTickets = tickets.filter((t) => t.entered).length;
  const notEnteredTickets = tickets.filter((t) => !t.entered).length;
  const totalPaid = tickets.reduce((sum, ticket) => sum + (ticket.event.price || 0), 0);

  if (Platform.OS !== 'web') return null;

  return (
        <WebLayout title="Vé của tôi">
          <div style={{ height: '100vh', overflowY: 'auto', paddingRight: 8, boxSizing: 'border-box' }}>
            <VStack gap={24}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <Button
                  variant="outlined"
                  onPress={() => window.location.reload()}
                  style={{ minWidth: 100 }}
                >
                  Tải lại trang
                </Button>
              </div>
        {/* Header */}
        <VStack gap={8}>
          <Text fontSize={28} bold color="#1c1e21">
            Vé của tôi
          </Text>
          <Text fontSize={14} color="#606770">
            Quản lý và theo dõi các vé đã đặt
          </Text>
          </VStack>

        {/* Stats Cards */}
        <HStack gap={16}>
          <div style={{
            flex: 1,
            padding: 20,
            backgroundColor: '#e7f3ff',
            borderRadius: 12,
            border: '1px solid #1877f2',
          }}>
            <VStack gap={8} alignItems="center">
              <TabBarIcon name="ticket" size={32} color="#1877f2" />
              <Text fontSize={24} bold color="#1877f2">{tickets.length}</Text>
              <Text fontSize={12} color="#606770">Tổng vé</Text>
            </VStack>
          </div>
          <div style={{
            flex: 1,
            padding: 20,
            backgroundColor: '#e8f8f5',
            borderRadius: 12,
            border: '1px solid #42b72a',
          }}>
            <VStack gap={8} alignItems="center">
              <TabBarIcon name="checkmark-circle" size={32} color="#42b72a" />
              <Text fontSize={24} bold color="#42b72a">{enteredTickets}</Text>
              <Text fontSize={12} color="#606770">Đã sử dụng</Text>
            </VStack>
          </div>
          <div style={{
            flex: 1,
            padding: 20,
            backgroundColor: '#fff3cd',
            borderRadius: 12,
            border: '1px solid #ffc107',
          }}>
            <VStack gap={8} alignItems="center">
              <TabBarIcon name="time" size={32} color="#ffc107" />
              <Text fontSize={24} bold color="#ffc107">{notEnteredTickets}</Text>
              <Text fontSize={12} color="#606770">Chưa sử dụng</Text>
            </VStack>
          </div>
        </HStack>

        {/* Tickets List */}
        <VStack gap={16}>
          <HStack justifyContent="flex-start" alignItems="center">
            <Text fontSize={20} bold color="#1c1e21">
              Danh sách vé
            </Text>
          </HStack>

          {isLoading ? (
            <Text fontSize={16} color="#606770">Đang tải dữ liệu...</Text>
          ) : (
            tickets.length === 0 ? (
              <Text fontSize={16} color="#606770">Không có vé nào.</Text>
            ) : (
              tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  style={{
                    padding: 20,
                    backgroundColor: 'white',
                    borderRadius: 12,
                    border: '1px solid #e4e6ea',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                >
                  <HStack gap={20} alignItems="center">
                    {/* QR Code thực từ backend */}
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: '#f0f2f5',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed #ccc',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (ticket.qrcode) {
                          const link = document.createElement('a');
                          link.href = `data:image/png;base64,${ticket.qrcode}`;
                          link.download = `ticket-${ticket.id}-qr.png`;
                          link.click();
                        }
                      }}
                      title="Tải mã QR về"
                    >
                      {ticket.qrcode ? (
                        <img
                          src={`data:image/png;base64,${ticket.qrcode}`}
                          alt="QR Code"
                          style={{ width: 64, height: 64, borderRadius: 8 }}
                        />
                      ) : (
                        <TabBarIcon name="qr-code" size={32} color="#606770" />
                      )}
                    </div>

                    {/* Ticket Info */}
                    <VStack gap={8} style={{ flex: 1 }}>
                      <Text fontSize={18} bold color="#1c1e21">
                        {ticket.event.name}
                      </Text>
                      <HStack gap={16}>
                        <HStack gap={6} alignItems="center">
                          <TabBarIcon name="calendar" size={14} color="#606770" />
                          <Text fontSize={12} color="#606770">{new Date(ticket.event.date).toLocaleDateString('vi-VN')}</Text>
                        </HStack>
                        <HStack gap={6} alignItems="center">
                          <TabBarIcon name="time" size={14} color="#606770" />
                          <Text fontSize={12} color="#606770">{new Date(ticket.event.date).toLocaleTimeString('vi-VN')}</Text>
                        </HStack>
                        <HStack gap={6} alignItems="center">
                          <TabBarIcon name="location" size={14} color="#606770" />
                          <Text fontSize={12} color="#606770">{ticket.event.location}</Text>
                        </HStack>
                      </HStack>
                      <Text fontSize={12} color="#424242">
                        Mã vé: {ticket.id}
                      </Text>
                    </VStack>

                    {/* Status & Price */}
                    <VStack gap={8} alignItems="flex-end">
                      <Text fontSize={16} bold color="#1877f2">
                        {ticket.event.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Text>
                      <div style={{
                        backgroundColor: ticket.entered ? '#e8f8f5' : '#fff3cd',
                        paddingLeft: 12,
                        paddingRight: 12,
                        paddingTop: 4,
                        paddingBottom: 4,
                        borderRadius: 16,
                      }}>
                        <Text 
                          fontSize={11} 
                          bold 
                          color={ticket.entered ? '#42b72a' : '#ffc107'}
                        >
                          {ticket.entered ? 'Đã sử dụng' : 'Chưa sử dụng'}
                        </Text>
                      </div>
                    </VStack>

                  </HStack>
                </div>
              ))
            )
          )}
        </VStack>
    </VStack>
  </div>
    </WebLayout>
  );
}
