import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Upload, X, FileText, Image as ImageIcon, AlertTriangle } from 'lucide-react'
import { detectFileType, validateFile, processTags, generateUniqueId } from '../../utils/fileUtils-fixed'
import { compressFile, generateThumbnail } from '../../utils/compression-fixed'

const AddFileDialog = ({ open, onOpenChange, onAddFile }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: '',
    tags: '',
    arquivo: null,
    miniatura: null
  })
  
  const [selectedFile, setSelectedFile] = useState(null)
  const [customThumbnail, setCustomThumbnail] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState([])
  const [warnings, setWarnings] = useState([])
  const [currentStep, setCurrentStep] = useState('')

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: '',
      tags: '',
      arquivo: null,
      miniatura: null
    })
    setSelectedFile(null)
    setCustomThumbnail(null)
    setIsProcessing(false)
    setProgress(0)
    setErrors([])
    setWarnings([])
    setCurrentStep('')
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validar arquivo
    const validation = validateFile(file)
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setErrors([])
    setWarnings(validation.warnings || [])
    setSelectedFile(file)
    
    // Auto-detectar tipo
    const detectedType = detectFileType(file)
    
    // Preencher nome automaticamente se estiver vazio
    const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extensão
    
    setFormData(prev => ({
      ...prev,
      nome: prev.nome || fileName,
      tipo: detectedType
    }))

    // Gerar miniatura automaticamente (sem bloquear a UI)
    try {
      setCurrentStep('Gerando miniatura...')
      const thumbnail = await generateThumbnail(file)
      setFormData(prev => ({
        ...prev,
        miniatura: thumbnail
      }))
      setCurrentStep('')
    } catch (error) {
      console.error('Erro ao gerar miniatura:', error)
      setCurrentStep('')
      // Não é um erro crítico, continuar sem miniatura
    }
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
    
    if (!selectedFile) {
      setErrors(['Selecione um arquivo'])
      return
    }

    if (!formData.nome.trim()) {
      setErrors(['Nome do projeto é obrigatório'])
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setErrors([])

    try {
      // Etapa 1: Validação final
      setCurrentStep('Validando arquivo...')
      setProgress(10)
      
      const finalValidation = validateFile(selectedFile)
      if (!finalValidation.isValid) {
        throw new Error(finalValidation.errors.join(', '))
      }

      // Etapa 2: Compressão do arquivo
      setCurrentStep('Processando arquivo...')
      setProgress(30)
      
      const compressedFile = await compressFile(selectedFile)
      setProgress(70)

      // Etapa 3: Processamento de tags
      setCurrentStep('Processando tags...')
      const processedTags = processTags(formData.tags)
      setProgress(85)

      // Etapa 4: Criação do objeto final
      setCurrentStep('Finalizando...')
      const newFile = {
        id: generateUniqueId(),
        nome: formData.nome.trim(),
        descricao: formData.descricao.trim(),
        tipo: formData.tipo || detectFileType(selectedFile),
        tags: processedTags,
        arquivo: compressedFile.data,
        miniatura: formData.miniatura,
        dataCriacao: new Date().toISOString(),
        tamanhoOriginal: selectedFile.size,
        tamanhoComprimido: compressedFile.compressedSize,
        tipoArquivo: selectedFile.type,
        nomeArquivoOriginal: selectedFile.name,
        isCompressed: compressedFile.isCompressed
      }

      setProgress(100)
      setCurrentStep('Concluído!')

      // Adicionar arquivo
      onAddFile(newFile)
      
      // Fechar dialog e resetar form
      setTimeout(() => {
        onOpenChange(false)
        resetForm()
      }, 500)

    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      setErrors([error.message || 'Erro ao processar arquivo. Tente novamente.'])
      setCurrentStep('')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (!isProcessing) {
      onOpenChange(false)
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Arquivo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção de arquivo */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Arquivo *</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Clique para selecionar um arquivo
                </p>
                <p className="text-xs text-muted-foreground">
                  Suporta: Imagens (50MB), Vídeos (500MB), Áudios (200MB), PDFs, Quadrinhos, etc.
                </p>
              </label>
            </div>
            
            {selectedFile && (
              <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                <FileText className="h-4 w-4" />
                <span className="text-sm flex-1">{selectedFile.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)}MB
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    setFormData(prev => ({ ...prev, arquivo: null, miniatura: null }))
                  }}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Avisos */}
          {warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {warnings.map((warning, index) => (
                  <div key={index}>• {warning}</div>
                ))}
              </AlertDescription>
            </Alert>
          )}

          {/* Nome do projeto */}
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Projeto *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              placeholder="Digite o nome do projeto"
              disabled={isProcessing}
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
              disabled={isProcessing}
            />
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="tipo">Categoria</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
              disabled={isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quadrinhos">Quadrinhos</SelectItem>
                <SelectItem value="imagens">Imagens</SelectItem>
                <SelectItem value="videos">Vídeos</SelectItem>
                <SelectItem value="musicas">Músicas</SelectItem>
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
              disabled={isProcessing}
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
                disabled={isProcessing}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('thumbnail-upload').click()}
                disabled={isProcessing}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Selecionar Imagem
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

          {/* Progresso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentStep}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isProcessing || !selectedFile || !formData.nome.trim()}
            >
              {isProcessing ? 'Processando...' : 'Adicionar Arquivo'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default AddFileDialog

