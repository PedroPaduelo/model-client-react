import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { WS_URL } from '@/lib/api';
import { WebSocketMessage, WebSocketEvent } from '@/types/api';
import { toast } from 'sonner';

interface WebSocketOptions {
  projectId?: number;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  messages: WebSocketMessage[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (type: string, data: any, projectId?: number) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: (roomId: string) => void;
  reconnect: () => void;
  disconnect: () => void;
}

export function useWebSocket(options: WebSocketOptions = {}): UseWebSocketReturn {
  const { isAuthenticated, token } = useAuth();
  const {
    projectId,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  const socketRef = useRef<any>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Limpa timeout de reconexão
  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }
  }, []);

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (!isAuthenticated || !token) {
      return;
    }

    setConnectionStatus('connecting');

    try {
      // Importa o socket.io-client dinamicamente
      import('socket.io-client').then(({ io }) => {
        const socket = io(WS_URL, {
          auth: {
            token,
          },
          transports: ['websocket'],
          upgrade: false,
          rememberUpgrade: false,
          timeout: 10000,
        });

        socketRef.current = socket;

        // Event listeners
        socket.on('connect', () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setConnectionStatus('connected');
          reconnectAttempts.current = 0;

          // Entra na sala do projeto se especificado
          if (projectId) {
            socket.emit('join-room', { projectId });
          }

          toast.success('Conectado em tempo real', {
            description: 'Você receberá atualizações instantâneas',
            duration: 2000,
          });
        });

        socket.on('disconnect', (reason: string) => {
          console.log('WebSocket disconnected:', reason);
          setIsConnected(false);
          setConnectionStatus('disconnected');

          if (reason === 'io server disconnect') {
            // Desconexão manual do servidor
            toast.error('Conexão encerrada pelo servidor');
          } else {
            // Tenta reconectar automaticamente
            if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
              reconnectAttempts.current++;
              reconnectTimeoutRef.current = setTimeout(() => {
                connect();
              }, reconnectInterval);
            } else {
              toast.error('Falha ao reconectar', {
                description: 'Verifique sua conexão com a internet',
              });
            }
          }
        });

        socket.on('connect_error', (error: Error) => {
          console.error('WebSocket connection error:', error);
          setIsConnected(false);
          setConnectionStatus('error');

          if (autoReconnect && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectInterval);
          }
        });

        // Mensagens personalizadas do backend
        socket.on('message', (message: WebSocketMessage) => {
          console.log('WebSocket message received:', message);
          setMessages((prev) => [...prev, message]);

          // Processa diferentes tipos de mensagens
          handleWebSocketMessage(message);
        });

        // Eventos específicos do projeto
        socket.on('project-updated', (data: any) => {
          handleWebSocketMessage({
            type: WebSocketEvent.PROJECT_UPDATED,
            data,
            timestamp: new Date().toISOString(),
          });
        });

        socket.on('task-created', (data: any) => {
          handleWebSocketMessage({
            type: WebSocketEvent.TASK_CREATED,
            data,
            timestamp: new Date().toISOString(),
          });
        });

        socket.on('task-updated', (data: any) => {
          handleWebSocketMessage({
            type: WebSocketEvent.TASK_UPDATED,
            data,
            timestamp: new Date().toISOString(),
          });
        });

        socket.on('requirement-created', (data: any) => {
          handleWebSocketMessage({
            type: WebSocketEvent.REQUIREMENT_CREATED,
            data,
            timestamp: new Date().toISOString(),
          });
        });

        socket.on('notification', (data: any) => {
          handleWebSocketMessage({
            type: WebSocketEvent.NOTIFICATION_CREATED,
            data,
            timestamp: new Date().toISOString(),
          });
        });

      }).catch((error) => {
        console.error('Failed to load socket.io-client:', error);
        setConnectionStatus('error');
      });
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setConnectionStatus('error');
    }
  }, [isAuthenticated, token, projectId, autoReconnect, reconnectInterval, maxReconnectAttempts]);

  // Desconectar do WebSocket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    clearReconnectTimeout();
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [clearReconnectTimeout]);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttempts.current = 0;
    setTimeout(() => {
      connect();
    }, 1000);
  }, [disconnect, connect]);

  // Enviar mensagem
  const sendMessage = useCallback((type: string, data: any, targetProjectId?: number) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('message', {
        type,
        data,
        projectId: targetProjectId || projectId,
        timestamp: new Date().toISOString(),
      });
    }
  }, [isConnected, projectId]);

  // Entrar em sala
  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-room', { roomId });
    }
  }, [isConnected]);

  // Sair de sala
  const leaveRoom = useCallback((roomId: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave-room', { roomId });
    }
  }, [isConnected]);

  // Tratar mensagens recebidas
  const handleWebSocketMessage = useCallback((message: WebSocketMessage) => {
    // Adiciona à lista de mensagens
    setMessages((prev) => {
      // Mantém apenas as últimas 100 mensagens para evitar vazamento de memória
      const updated = [...prev, message];
      return updated.length > 100 ? updated.slice(-100) : updated;
    });

    // Mostra notificações baseadas no tipo de mensagem
    switch (message.type) {
      case WebSocketEvent.PROJECT_UPDATED:
        toast.info('Projeto atualizado', {
          description: 'O projeto foi atualizado por outro usuário',
          duration: 3000,
        });
        break;

      case WebSocketEvent.TASK_CREATED:
        toast.success('Nova tarefa criada', {
          description: `Tarefa: ${message.data.title || 'Sem título'}`,
          duration: 3000,
        });
        break;

      case WebSocketEvent.TASK_UPDATED:
        toast.info('Tarefa atualizada', {
          description: `Tarefa: ${message.data.title || 'Sem título'}`,
          duration: 3000,
        });
        break;

      case WebSocketEvent.REQUIREMENT_CREATED:
        toast.success('Novo requisito criado', {
          description: `Requisito: ${message.data.titulo || 'Sem título'}`,
          duration: 3000,
        });
        break;

      case WebSocketEvent.NOTIFICATION_CREATED:
        toast(message.data.title, {
          description: message.data.message,
          duration: 5000,
        });
        break;
    }

    // Dispara evento customizado para components ouvirem
    window.dispatchEvent(new CustomEvent('websocket-message', { detail: message }));
  }, []);

  // Conectar quando autenticado
  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, token, connect, disconnect]);

  // Entrar/sair da sala do projeto quando muda
  useEffect(() => {
    if (socketRef.current && isConnected) {
      if (projectId) {
        socketRef.current.emit('join-room', { projectId });
      }
    }
  }, [projectId, isConnected]);

  return {
    isConnected,
    messages,
    connectionStatus,
    sendMessage,
    joinRoom,
    leaveRoom,
    reconnect,
    disconnect,
  };
}

// Hook para mensagens específicas de um projeto
export function useProjectWebSockets(projectId: number) {
  const ws = useWebSocket({ projectId });
  const [projectMessages, setProjectMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    // Filtra mensagens do projeto específico
    const filtered = ws.messages.filter(
      message => message.projectId === projectId || !message.projectId
    );
    setProjectMessages(filtered);
  }, [ws.messages, projectId]);

  // Hook customizado para ouvir mensagens específicas
  const useProjectMessage = useCallback(
    (eventType: string, callback: (data: any) => void) => {
      const handleCustomEvent = (event: CustomEvent) => {
        const message = event.detail as WebSocketMessage;
        if (
          message.type === eventType &&
          (message.projectId === projectId || !message.projectId)
        ) {
          callback(message.data);
        }
      };

      window.addEventListener('websocket-message', handleCustomEvent as EventListener);

      return () => {
        window.removeEventListener('websocket-message', handleCustomEvent as EventListener);
      };
    },
    [projectId]
  );

  return {
    ...ws,
    projectMessages,
    useProjectMessage,
  };
}

// Hook para notificações via WebSocket
export function useWebSocketNotifications() {
  const ws = useWebSocket();
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    // Filtra apenas mensagens de notificação
    const filtered = ws.messages.filter(
      message => message.type === WebSocketEvent.NOTIFICATION_CREATED
    );
    setNotifications(filtered);
  }, [ws.messages]);

  return {
    ...ws,
    notifications,
  };
}

export default useWebSocket;