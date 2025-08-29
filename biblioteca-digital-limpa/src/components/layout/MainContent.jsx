import React, { useState } from 'react'
import FileCard from '../cards/FileCard'
import AddFileDialog from '../forms/AddFileDialog'
import EditFileDialog from '../forms/EditFileDialog'
import { Button } from '@/components/ui/button.jsx'
import { Plus, Download, Upload } from 'lucide-react'
import { exportAllData, importAllData } from '../../utils/storage-debug'

const MainContent = ({ 
  files = [], 
  currentCategory = 'todos', 
  searchTerm = '', 
  sortBy = 'nome', 
  viewMode = 'grid', 
  addFile = () => {}, 
  deleteFile = () => {},
  updateFile = () => {} 
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingFile, setEditingFile] = useState(null)
  // Função segura para filtrar arquivos
  const getFilteredFiles = () => {
    try {
      if (!Array.isArray(files)) return []
      
      // Filtrar por categoria
      let filtered = currentCategory === 'todos' 
        ? files 
        : files.filter(file => file && file.tipo === currentCategory)

      // Filtrar por busca
      if (searchTerm && searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase()
        filtered = filtered.filter(file => {
          if (!file) return false
          return (
            (file.nome && file.nome.toLowerCase().includes(searchLower)) ||
            (file.descricao && file.descricao.toLowerCase().includes(searchLower)) ||
            (file.tags && Array.isArray(file.tags) && file.tags.some(tag => 
              tag && tag.toLowerCase().includes(searchLower)
            ))
          )
        })
      }

      // Ordenar
      if (sortBy === 'nome') {
        filtered.sort((a, b) => {
          const nameA = a && a.nome ? a.nome : ''
          const nameB = b && b.nome ? b.nome : ''
          return nameA.localeCompare(nameB)
        })
      } else if (sortBy === 'data') {
        filtered.sort((a, b) => {
          const dateA = a && a.dataCriacao ? new Date(a.dataCriacao) : new Date(0)
          const dateB = b && b.dataCriacao ? new Date(b.dataCriacao) : new Date(0)
          return dateB - dateA
        })
      }

      return filtered
    } catch (error) {
      console.error('Erro ao filtrar arquivos:', error)
      return []
    }
  }

  const handleDeleteFile = (fileId) => {
    try {
      if (deleteFile && typeof deleteFile === 'function') {
        deleteFile(fileId)
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
    }
  }

  const handleEditFile = (file) => {
    try {
      setEditingFile(file)
      setShowEditDialog(true)
    } catch (error) {
      console.error('Erro ao editar arquivo:', error)
    }
  }

  const handleAddFile = (fileData) => {
    try {
      if (addFile && typeof addFile === 'function') {
        addFile(fileData)
        setShowAddDialog(false)
      }
    } catch (error) {
      console.error('Erro ao adicionar arquivo:', error)
    }
  }

  const handleUpdateFile = (fileData) => {
    try {
      if (updateFile && typeof updateFile === 'function') {
        updateFile(fileData)
        setShowEditDialog(false)
        setEditingFile(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar arquivo:', error)
    }
  }

  const getCategoryTitle = () => {
    const categoryNames = {
      'todos': 'Todos os Arquivos',
      'quadrinhos': 'Quadrinhos',
      'imagens': 'Imagens',
      'videos': 'Vídeos',
      'musicas': 'Músicas',
      'outros': 'Outros'
    }
    return categoryNames[currentCategory] || 'Arquivos'
  }

  const handleAddClick = () => {
    try {
      setShowAddDialog(true)
    } catch (error) {
      console.error("Erro ao abrir dialog:", error)
    }
  }

  const handleImport = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (file) {
          const text = await file.text()
          const data = JSON.parse(text)
          await importAllData(data)
          window.location.reload()
        }
      }
      input.click()
    } catch (error) {
      console.error('Erro ao importar:', error)
    }
  }

  const handleExport = async () => {
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `biblioteca-digital-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao exportar:', error)
    }
  }

  const renderFileCard = (file) => {
    try {
      if (!file || !file.id) {
        return <div key={Math.random()}>Arquivo inválido</div>
      }

      return (
        <FileCard
          key={file.id}
          file={file}
          viewMode={viewMode}
          onDelete={handleDeleteFile}
          onEdit={handleEditFile}
        />
      )
    } catch (error) {
      console.error('Erro ao renderizar card:', error)
      return <div key={file.id || Math.random()}>Erro ao carregar arquivo</div>
    }
  }

  const sortedFiles = getFilteredFiles()

  return (
    <main className="flex-1 p-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{getCategoryTitle()}</h1>
          <p className="text-gray-600">
            {sortedFiles.length} {sortedFiles.length === 1 ? 'item encontrado' : 'itens encontrados'}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleImport}
            className="flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Importar</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Backup</span>
          </Button>
          
          <Button
            onClick={handleAddClick}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Arquivo</span>
          </Button>
        </div>
      </div>

      {/* Lista de arquivos */}
      {sortedFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-6xl mb-4">
            📁
          </div>
          <p className="text-lg text-gray-600 mb-2">
            Nenhum arquivo nesta categoria.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Clique no botão acima para adicionar o primeiro.
          </p>
          <Button
            onClick={handleAddClick}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Primeiro Arquivo</span>
          </Button>
        </div>
      ) : (
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
          {sortedFiles.map(renderFileCard)}
        </div>
      )}

      <AddFileDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddFile={handleAddFile}
        currentCategory={currentCategory}
      />

      <EditFileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        file={editingFile}
        onUpdateFile={handleUpdateFile}
      />
    </main>
  )
}

export default MainContent