import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Image as ImageIcon, AlertTriangle } from 'lucide-react'
import { processTags } from '../../utils/fileUtils'

const EditFileDialog = ({ open, onOpenChange, file, onSaveFile }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: '',
    tags: '',
    miniatura: null
  })
  
  const [customThumbnail, setCustomThumbnail] = useState(null)
  const [errors, setErrors] = useState([])

  // Preencher formulário quando o arquivo mudar
  useEffect(() => {
    if (file) {
      setFormData({
        nome: file.nome || '',
        descricao: file.descricao || '',
        tipo: file.tipo || '',
        tags: file.tags ? file.tags.join(', ') : '',
        miniatura: file.miniatura || null
      })
      setCustomThumbnail(null)
      setErrors([])
    }
  }, [file])

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: '',
      tags: '',
      miniatura: null
    })
    setCustomThumbnail(null)
    setErrors([])
  }

  const handleThumbnailSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar se é imagem
    if (!file.type.startsWith('image/')) {
      setErrors(['A miniatura deve ser uma imagem'])
      return
    }

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const thumbnail = e.target.result
        setCustomThumbnail(thumbnail)
        setFormData(prev => ({
          ...prev,
          miniatura: thumbnail
        }))
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Erro ao processar miniatura:', error)
      setErrors(['Erro ao processar miniatura'])
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!formData.nome.trim()) {
      setErrors(['Nome do projeto é obrigatório'])
      return
    }

    try {
      // Processar tags
      const processedTags = processTags(formData.tags)

      // Criar objeto atualizado
      const updatedFile = {
        ...file,
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        tipo: formData.tipo,
        tags: processedTags,
        miniatura: formData.miniatura,
        dataModificacao: new Date().toISOString()
      }

      // Salvar arquivo
      onSaveFile(updatedFile)
      
      // Fechar dialog
      onOpenChange(false)
      resetForm()

    } catch (error) {
      console.error('Erro ao salvar arquivo:', error)
      setErrors(['Erro ao salvar arquivo. Tente novamente.'])
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    resetForm()
  }

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Arquivo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome do projeto */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Projeto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome do projeto"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              placeholder="Descreva o arquivo (opcional)"
              rows={3}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Categoria</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quadrinhos">Quadrinhos</SelectItem>
                <SelectItem value="imagens">Imagens</SelectItem>
                <SelectItem value="videos">Vídeos</SelectItem>
                <SelectItem value="musicas">Músicas</SelectItem>
                <SelectItem value="emails">E-mails</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Digite as tags separadas por vírgula"
            />
            <p className="text-xs text-muted-foreground">
              Exemplo: ação, aventura, ficção científica
            </p>
          </div>

          {/* Miniatura personalizada */}
          <div className="space-y-2">
            <Label htmlFor="thumbnail-upload">Miniatura Personalizada (opcional)</Label>
            <div className="flex items-center space-x-4">
              <input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                onChange={handleThumbnailSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('thumbnail-upload').click()}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Alterar Imagem
              </Button>
              
              {formData.miniatura && (
                <div className="w-16 h-16 border rounded overflow-hidden">
                  <img
                    src={formData.miniatura}
                    alt="Miniatura"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Informações do arquivo original */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Informações do Arquivo</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><strong>Arquivo original:</strong> {file.nomeArquivoOriginal}</p>
              <p><strong>Tipo:</strong> {file.tipoArquivo}</p>
              {file.tamanhoOriginal && (
                <p><strong>Tamanho:</strong> {(file.tamanhoOriginal / (1024 * 1024)).toFixed(2)} MB</p>
              )}
              <p><strong>Criado em:</strong> {new Date(file.dataCriacao).toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Erros */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {errors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!formData.nome.trim()}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditFileDialog

