// components/events/manage/ticket-types-tab.tsx
'use client'

import { useState } from 'react'
import { EventWithRelations, TicketTypeWithRelations } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Edit, Trash2, DollarSign, Users, TrendingUp } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface TicketTypesTabProps {
  event: EventWithRelations
}

export function TicketTypesTab({ event }: TicketTypesTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<TicketTypeWithRelations | null>(null)
  const queryClient = useQueryClient()

  // Fetch ticket types
  const { data: ticketTypes, isLoading } = useQuery<TicketTypeWithRelations[]>({
    queryKey: ['ticket-types', event.id],
    queryFn: async () => {
      const response = await fetch(`/api/events/${event.id}/tickets`)
      if (!response.ok) throw new Error('Failed to fetch ticket types')
      return response.json()
    },
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    quantity: 100,
    earlyBirdPrice: 0,
    earlyBirdEndDate: '',
    minQuantity: 1,
    maxQuantity: 10,
    status: 'ACTIVE' as const,
  })

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`/api/events/${event.id}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Failed to create ticket type')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-types', event.id] })
      queryClient.invalidateQueries({ queryKey: ['event', event.id] })
      toast.success('Ticket type created!')
      setIsCreateOpen(false)
      resetForm()
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      quantity: 100,
      earlyBirdPrice: 0,
      earlyBirdEndDate: '',
      minQuantity: 1,
      maxQuantity: 10,
      status: 'ACTIVE',
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-gray-500">Loading ticket types...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ticket Types</p>
                <p className="text-2xl font-bold">{ticketTypes?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Types</p>
                <p className="text-2xl font-bold">
                  {ticketTypes?.filter(t => t.status === 'ACTIVE').length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold">
                  {ticketTypes?.reduce((sum, t) => sum + t.quantity, 0) || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Types List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Ticket Types</CardTitle>
              <CardDescription>
                Manage different ticket tiers for your event
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Ticket Type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!ticketTypes || ticketTypes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No ticket types yet</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Ticket Type
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketTypes.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.name}</p>
                        {ticket.description && (
                          <p className="text-xs text-gray-500">{ticket.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">${ticket.price}</p>
                        {ticket.isEarlyBird && ticket.earlyBirdPrice && (
                          <p className="text-xs text-green-600">
                            Early: ${ticket.earlyBirdPrice}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.quantity}</TableCell>
                    <TableCell>{ticket.quantitySold}</TableCell>
                    <TableCell>{ticket.available}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ticket.status === 'ACTIVE'
                            ? 'default'
                            : ticket.status === 'SOLD_OUT'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Create Ticket Type</DialogTitle>
              <DialogDescription>
                Add a new ticket tier for your event
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Ticket Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., VIP, General Admission"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe this ticket type..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="price">Regular Price ($) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="earlyBirdPrice">Early Bird Price ($)</Label>
                  <Input
                    id="earlyBirdPrice"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.earlyBirdPrice}
                    onChange={(e) => setFormData({ ...formData, earlyBirdPrice: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="earlyBirdEndDate">Early Bird End Date</Label>
                  <Input
                    id="earlyBirdEndDate"
                    type="datetime-local"
                    value={formData.earlyBirdEndDate}
                    onChange={(e) => setFormData({ ...formData, earlyBirdEndDate: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="minQuantity">Min Per Purchase</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    min="1"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="maxQuantity">Max Per Purchase</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    min="1"
                    value={formData.maxQuantity}
                    onChange={(e) => setFormData({ ...formData, maxQuantity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Ticket Type'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}