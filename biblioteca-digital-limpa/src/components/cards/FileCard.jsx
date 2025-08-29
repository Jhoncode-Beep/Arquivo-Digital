import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card.jsx'
import { 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  Tag,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  BookOpen,
  FolderOpen,
  Edit,
  EyeOff
} from 'lucide-react'
import { formatDate, formatFileSize } from '../../utils/fileUtils'
import { decompressFile } from '../../utils/compression'

const FileCard = ({ file, viewMode, onDelete, onEdit }) => {
  const [imageError, setImageError] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const getTypeIcon = (type) => {
    const icons = {
      'quadrinhos': BookOpen,
      'imagens': ImageIcon,
      'videos': Video,
      'musicas': Music,
      'emails': FileText,
      'outros': FolderOpen
    }
    return icons[type] || FolderOpen
  }

  const getTypeColor = (type) => {
    const colors = {
      'quadrinhos': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'imagens': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'videos': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'musicas': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'emails': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'outros': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    return colors[type] || colors['outros']
  }

  const handleDownload = async () => {
    console.log('🔍 Debug Download - Iniciando download para:', file.nome)
    console.log('🔍 Debug Download - Arquivo completo:', file)
    
    if (!file.arquivo) {
      console.error('❌ Debug Download - file.arquivo está vazio ou undefined')
      alert('Arquivo não disponível para download - dados não encontrados')
      return
    }

    console.log('🔍 Debug Download - file.arquivo existe, tipo:', typeof file.arquivo)
    console.log('🔍 Debug Download - Primeiros 100 chars:', file.arquivo.substring(0, 100))

    setIsDownloading(true)
    
    try {
      // Descomprimir arquivo se necessário
      let fileData = file.arquivo
      console.log('🔍 Debug Download - isCompressed:', file.isCompressed)
      
      if (file.isCompressed) {
        console.log('🔍 Debug Download - Descomprimindo arquivo...')
        const decompressed = decompressFile({
          data: file.arquivo,
          isCompressed: file.isCompressed
        })
        fileData = decompressed.data
        console.log('🔍 Debug Download - Arquivo descomprimido, novo tamanho:', fileData.length)
      }

      // Criar blob e fazer download
      let blob
      
      if (typeof fileData === 'string' && fileData.startsWith('data:')) {
        console.log('🔍 Debug Download - Arquivo é data URL, convertendo...')
        // É um data URL
        const response = await fetch(fileData)
        blob = await response.blob()
        console.log('🔍 Debug Download - Blob criado via fetch, tamanho:', blob.size)
      } else {
        console.log('🔍 Debug Download - Arquivo não é data URL, tentando base64...')
        // Tentar converter base64 para blob
        try {
          // Verificar se tem prefixo data:
          const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData
          console.log('🔍 Debug Download - Base64 data (primeiros 50 chars):', base64Data.substring(0, 50))
          
          const byteCharacters = atob(base64Data)
          const byteNumbers = new Array(byteCharacters.length)
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i)
          }
          
          const byteArray = new Uint8Array(byteNumbers)
          const mimeType = file.tipoArquivo || 'application/octet-stream'
          blob = new Blob([byteArray], { type: mimeType })
          console.log('🔍 Debug Download - Blob criado via base64, tamanho:', blob.size, 'tipo:', mimeType)
        } catch (error) {
          console.error('❌ Debug Download - Erro ao converter base64:', error)
          // Fallback: criar blob direto com os dados
          blob = new Blob([fileData], { type: file.tipoArquivo || 'application/octet-stream' })
          console.log('🔍 Debug Download - Blob criado via fallback, tamanho:', blob.size)
        }
      }
      
      if (blob.size === 0) {
        throw new Error('Arquivo vazio após processamento')
      }
      
      // Criar URL temporária e fazer download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = file.nomeArquivoOriginal || file.nome
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ Debug Download - Download iniciado com sucesso')
      
      // Limpar URL após um tempo
      setTimeout(() => {
        URL.revokeObjectURL(url)
        console.log('🔍 Debug Download - URL temporária limpa')
      }, 1000)
      
    } catch (error) {
      console.error('❌ Debug Download - Erro completo:', error)
      alert(`Erro ao fazer download do arquivo: ${error.message}`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(file)
    }
  }

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir "${file.nome}"?`)) {
      onDelete(file.id)
    }
  }

  const TypeIcon = getTypeIcon(file.tipo)

  if (viewMode === 'list') {
    return (
      <Card className="mb-2">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Miniatura */}
              <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                {file.miniatura && !imageError ? (
                  <img
                    src={file.miniatura}
                    alt={file.nome}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <TypeIcon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              {/* Informações */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate">{file.nome}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className={`text-xs ${getTypeColor(file.tipo)}`}>
                    {file.tipo}
                  </Badge>
                  {file.tamanhoOriginal && (
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.tamanhoOriginal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Tags */}
              {file.tags && file.tags.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1 max-w-xs">
                  {file.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {file.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{file.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                disabled={isDownloading}
                title="Download"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                title="Editar"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                title="Excluir"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Visualização em grade
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        {/* Miniatura */}
        <div className="aspect-video bg-muted flex items-center justify-center relative">
          {file.miniatura && !imageError ? (
            <img
              src={file.miniatura}
              alt={file.nome}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <TypeIcon className="h-12 w-12 text-muted-foreground" />
          )}
          
          {/* Badge do tipo */}
          <Badge 
            variant="secondary" 
            className={`absolute top-2 right-2 text-xs ${getTypeColor(file.tipo)}`}
          >
            {file.tipo}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Título */}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{file.nome}</h3>

        {/* Descrição */}
        {file.descricao && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {file.descricao}
          </p>
        )}

        {/* Tags */}
        {file.tags && file.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {file.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {file.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{file.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Informações do arquivo */}
        <div className="space-y-1 text-xs text-muted-foreground">
          {file.dataCriacao && (
            <div className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {formatDate(file.dataCriacao)}
            </div>
          )}
          {file.tamanhoOriginal && (
            <div className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              {formatFileSize(file.tamanhoOriginal)}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex w-full space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-1" />
            {isDownloading ? 'Baixando...' : 'Download'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="flex-1"
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default FileCard

