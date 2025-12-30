import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Check, X, Clock, MessageSquare, Heart } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function SharedReadingList({ childProfile, parentAccount, isParentView = false }) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [requestReason, setRequestReason] = useState('');
  const [respondingRequest, setRespondingRequest] = useState(null);
  const [parentResponse, setParentResponse] = useState('');

  const queryClient = useQueryClient();

  // Fetch books
  const { data: books = [] } = useQuery({
    queryKey: ['books'],
    queryFn: () => base44.entities.Book.list(),
  });

  // Fetch book requests
  const { data: requests = [] } = useQuery({
    queryKey: ['bookRequests', childProfile?.id],
    queryFn: () => base44.entities.BookRequest.filter({
      child_profile_id: childProfile.id
    }),
    enabled: !!childProfile,
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.BookRequest.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['bookRequests']);
      toast.success('Pedido enviado para seus pais!');
      setShowRequestDialog(false);
      setSelectedBook(null);
      setRequestReason('');
    },
    onError: (error) => {
      toast.error('Erro ao enviar pedido: ' + error.message);
    }
  });

  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, status, response, respondedBy }) => {
      return base44.entities.BookRequest.update(requestId, {
        status,
        parent_response: response,
        responded_by: respondedBy,
        responded_at: new Date().toISOString()
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['bookRequests']);
      toast.success(variables.status === 'approved' ? 'Livro aprovado!' : 'Pedido recusado');
      setRespondingRequest(null);
      setParentResponse('');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    }
  });

  const handleRequestBook = (book) => {
    setSelectedBook(book);
    setShowRequestDialog(true);
  };

  const handleSubmitRequest = async () => {
    if (!requestReason.trim()) {
      toast.error('Por favor, explique por que quer ler este livro');
      return;
    }

    await createRequestMutation.mutateAsync({
      child_profile_id: childProfile.id,
      parent_account_id: parentAccount.id,
      book_id: selectedBook.id,
      reason: requestReason,
      status: 'pending'
    });
  };

  const handleRespond = async (status) => {
    const user = await base44.auth.me();
    await respondToRequestMutation.mutateAsync({
      requestId: respondingRequest.id,
      status,
      response: parentResponse || (status === 'approved' ? 'Aprovado!' : 'Não aprovado desta vez.'),
      respondedBy: user.id
    });
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const respondedRequests = requests.filter(r => r.status !== 'pending');

  if (isParentView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Lista de Leitura de {childProfile.child_name}</h3>
            <p className="text-sm text-gray-600">Pedidos de livros para aprovação</p>
          </div>
          {pendingRequests.length > 0 && (
            <Badge className="bg-orange-100 text-orange-700">
              {pendingRequests.length} {pendingRequests.length === 1 ? 'Pendente' : 'Pendentes'}
            </Badge>
          )}
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Aguardando Aprovação</h4>
            {pendingRequests.map((request) => {
              const book = books.find(b => b.id === request.book_id);
              if (!book) return null;

              return (
                <Card key={request.id} className="p-4 border-orange-200">
                  <div className="flex gap-4">
                    <img
                      src={book.cover_image_url}
                      alt={book.title_pt}
                      className="w-20 h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{book.title_pt}</h4>
                      <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                      <div className="bg-blue-50 rounded p-2 mb-3">
                        <p className="text-xs text-gray-600 mb-1">Por que quero ler:</p>
                        <p className="text-sm text-gray-800">{request.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setRespondingRequest(request)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setRespondingRequest(request);
                            setParentResponse('');
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Recusar
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Responded Requests */}
        {respondedRequests.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">Histórico</h4>
            {respondedRequests.slice(0, 5).map((request) => {
              const book = books.find(b => b.id === request.book_id);
              if (!book) return null;

              return (
                <Card key={request.id} className="p-3 opacity-75">
                  <div className="flex items-center gap-3">
                    <img
                      src={book.cover_image_url}
                      alt={book.title_pt}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h5 className="font-medium text-sm text-gray-800">{book.title_pt}</h5>
                      <Badge className={request.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {request.status === 'approved' ? 'Aprovado' : 'Recusado'}
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {requests.length === 0 && (
          <Card className="p-8 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum pedido de livro ainda</p>
          </Card>
        )}

        {/* Response Dialog */}
        {respondingRequest && (
          <Dialog open={!!respondingRequest} onOpenChange={() => setRespondingRequest(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Responder Pedido</DialogTitle>
                <DialogDescription>
                  Envie uma mensagem para {childProfile.child_name}
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={parentResponse}
                onChange={(e) => setParentResponse(e.target.value)}
                placeholder="Escreva uma mensagem de incentivo..."
                rows={4}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setRespondingRequest(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleRespond('declined')}
                  variant="outline"
                  className="text-red-600"
                >
                  Recusar
                </Button>
                <Button onClick={() => handleRespond('approved')} className="bg-green-600">
                  Aprovar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Child View
  const availableBooks = books.filter(b => b.is_locked);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">📚 Peça Livros para Seus Pais</h3>
        <p className="text-sm text-gray-600">
          Escolha livros que gostaria de ler e explique por quê!
        </p>
      </div>

      {/* My Requests Status */}
      {requests.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <h4 className="font-semibold text-gray-800 mb-3">Meus Pedidos</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
              <div className="text-xs text-gray-600">Aguardando</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {requests.filter(r => r.status === 'approved').length}
              </div>
              <div className="text-xs text-gray-600">Aprovados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{requests.length}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </Card>
      )}

      {/* Available Books */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">Livros Disponíveis</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {availableBooks.slice(0, 8).map((book) => {
            const existingRequest = requests.find(r => r.book_id === book.id);

            return (
              <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img
                  src={book.cover_image_url}
                  alt={book.title_pt}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <h5 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-2">
                    {book.title_pt}
                  </h5>
                  {existingRequest ? (
                    <Badge className={
                      existingRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      existingRequest.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {existingRequest.status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> : null}
                      {existingRequest.status === 'pending' ? 'Aguardando' :
                       existingRequest.status === 'approved' ? 'Aprovado!' : 'Recusado'}
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleRequestBook(book)}
                      className="w-full"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Pedir
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Request Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pedir Livro aos Pais</DialogTitle>
            <DialogDescription>
              {selectedBook?.title_pt}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              placeholder="Por que você quer ler este livro? O que te deixa empolgado(a)?"
              rows={5}
            />
            <p className="text-xs text-gray-500">
              💡 Dica: Explique o que você espera aprender ou o que achou interessante!
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!requestReason.trim() || createRequestMutation.isPending}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {createRequestMutation.isPending ? 'Enviando...' : 'Enviar Pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}