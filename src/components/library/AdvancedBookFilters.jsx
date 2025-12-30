import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, SlidersHorizontal, X, Calendar, 
  Star, BookOpen, Filter 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedBookFilters({ onFilterChange, books = [] }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    collection: 'all',
    ageMin: '',
    ageMax: '',
    culturalTags: [],
    completionStatus: 'all',
    sortBy: 'order_index',
    sortOrder: 'asc'
  });

  // Extract unique tags from books
  const allTags = [...new Set(books.flatMap(b => b.cultural_tags || []))];

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleTag = (tag) => {
    const newTags = filters.culturalTags.includes(tag)
      ? filters.culturalTags.filter(t => t !== tag)
      : [...filters.culturalTags, tag];
    updateFilter('culturalTags', newTags);
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      collection: 'all',
      ageMin: '',
      ageMax: '',
      culturalTags: [],
      completionStatus: 'all',
      sortBy: 'order_index',
      sortOrder: 'asc'
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters = filters.search || 
    filters.collection !== 'all' || 
    filters.ageMin || 
    filters.ageMax || 
    filters.culturalTags.length > 0 || 
    filters.completionStatus !== 'all';

  return (
    <Card className="p-4 mb-6">
      {/* Quick Search */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar livros por título, autor..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showAdvanced ? 'default' : 'outline'}
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros Avançados
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={filters.collection} onValueChange={(v) => updateFilter('collection', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Coleção" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="amazon">🌿 Amazônia</SelectItem>
            <SelectItem value="culture">🎨 Cultura</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="order_index">Ordem Padrão</SelectItem>
            <SelectItem value="title_pt">Título (A-Z)</SelectItem>
            <SelectItem value="created_date">Mais Recentes</SelectItem>
            <SelectItem value="page_count">Número de Páginas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t pt-4 space-y-4"
          >
            {/* Age Range */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Faixa Etária Recomendada
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.ageMin}
                  onChange={(e) => updateFilter('ageMin', e.target.value)}
                  className="w-24"
                  min="0"
                  max="18"
                />
                <span className="text-gray-500">até</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.ageMax}
                  onChange={(e) => updateFilter('ageMax', e.target.value)}
                  className="w-24"
                  min="0"
                  max="18"
                />
                <span className="text-sm text-gray-500">anos</span>
              </div>
            </div>

            {/* Cultural Tags */}
            {allTags.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Tags Culturais
                </label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={filters.culturalTags.includes(tag) ? 'default' : 'outline'}
                      className="cursor-pointer hover:bg-orange-100"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Completion Status */}
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Status de Leitura
              </label>
              <Select 
                value={filters.completionStatus} 
                onValueChange={(v) => updateFilter('completionStatus', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="not_started">Não Iniciado</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filtros ativos:</span>
            {filters.search && (
              <Badge variant="secondary">Busca: "{filters.search}"</Badge>
            )}
            {filters.collection !== 'all' && (
              <Badge variant="secondary">
                {filters.collection === 'amazon' ? '🌿 Amazônia' : '🎨 Cultura'}
              </Badge>
            )}
            {filters.ageMin && (
              <Badge variant="secondary">Idade: {filters.ageMin}+ anos</Badge>
            )}
            {filters.culturalTags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}