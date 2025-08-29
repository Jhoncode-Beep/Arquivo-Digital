// Utilitários para manipulação de arquivos

// Função para detectar tipo de arquivo baseado na extensão e MIME type
export const detectFileType = (file) => {
  const fileName = file.name.toLowerCase()
  const mimeType = file.type.toLowerCase()
  
  // Quadrinhos
  if (fileName.includes('.cbr') || fileName.includes('.cbz') || 
      fileName.includes('.cb7') || fileName.includes('.cbt') ||
      (mimeType.includes('application/') && (fileName.includes('comic') || fileName.includes('cbr') || fileName.includes('cbz')))) {
    return 'quadrinhos'
  }
  
  // Imagens
  if (mimeType.startsWith('image/')) {
    return 'imagens'
  }
  
  // Vídeos
  if (mimeType.startsWith('video/')) {
    return 'videos'
  }
  
  // Músicas/Áudio
  if (mimeType.startsWith('audio/')) {
    return 'musicas'
  }
  
  // Outros tipos específicos que podem ser considerados quadrinhos
  if (fileName.endsWith('.pdf') && fileName.toLowerCase().includes('comic')) {
    return 'quadrinhos'
  }
  
  // Padrão: outros
  return 'outros'
}

// Função para validar arquivo - VERSÃO MELHORADA
export const validateFile = (file, maxSizeInMB = null) => {
  const errors = []
  
  // Verificar se é um arquivo válido
  if (!file || !file.name) {
    errors.push('Arquivo inválido')
    return { isValid: false, errors }
  }
  
  // Definir limite de tamanho baseado no tipo de arquivo
  let maxSize = maxSizeInMB
  if (!maxSize) {
    const fileType = file.type.toLowerCase()
    if (fileType.startsWith('video/')) {
      maxSize = 500 // 500MB para vídeos
    } else if (fileType.startsWith('audio/')) {
      maxSize = 200 // 200MB para áudios
    } else if (fileType.startsWith('image/')) {
      maxSize = 50 // 50MB para imagens
    } else {
      maxSize = 100 // 100MB para outros
    }
  }
  
  // Verificar tamanho
  const maxSizeInBytes = maxSize * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    errors.push(`Arquivo muito grande. Máximo permitido: ${maxSize}MB`)
  }
  
  // Verificar se o tipo é suportado
  const supportedTypes = [
    'image/', 'video/', 'audio/', 'application/pdf', 
    'text/', 'application/zip', 'application/rar',
    'application/x-rar-compressed', 'application/x-zip-compressed'
  ]
  
  const isSupported = supportedTypes.some(type => 
    file.type.toLowerCase().includes(type.toLowerCase())
  )
  
  if (!isSupported && file.type !== '') {
    // Permitir arquivos sem MIME type (como .cbr, .cbz)
    const allowedExtensions = ['.cbr', '.cbz', '.cb7', '.cbt', '.epub', '.mobi']
    const hasAllowedExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    )
    
    if (!hasAllowedExtension) {
      errors.push('Tipo de arquivo não suportado')
    }
  }
  
  // Verificação adicional para vídeos muito grandes
  const warnings = []
  if (file.size > 100 * 1024 * 1024) {
    warnings.push('Arquivo grande, processamento pode demorar')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

// Função para formatar tamanho de arquivo
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Função para gerar ID único
export const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Função para baixar arquivo
export const downloadFile = (fileData, fileName) => {
  try {
    // Se fileData é uma string base64, converter para blob
    let blob
    
    if (typeof fileData === 'string' && fileData.startsWith('data:')) {
      // É um data URL
      const byteCharacters = atob(fileData.split(',')[1])
      const byteNumbers = new Array(byteCharacters.length)
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      const mimeType = fileData.split(',')[0].split(':')[1].split(';')[0]
      blob = new Blob([byteArray], { type: mimeType })
    } else {
      // Assumir que é um blob ou dados binários
      blob = new Blob([fileData])
    }
    
    // Criar URL temporária e fazer download
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Erro ao fazer download:', error)
    return false
  }
}

// Função para processar tags
export const processTags = (tagsString) => {
  if (!tagsString || typeof tagsString !== 'string') return []
  
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .map(tag => tag.toLowerCase())
}

// Função para formatar data
export const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Data inválida'
  }
}

// Função para criar arquivo de exemplo (para demonstração)
export const createSampleFile = (type = 'outros') => {
  const sampleFiles = {
    quadrinhos: {
      nome: 'Exemplo Quadrinho',
      descricao: 'Um quadrinho de exemplo para demonstração',
      tipo: 'quadrinhos',
      tags: ['exemplo', 'demo', 'quadrinho'],
      arquivo: null,
      miniatura: null
    },
    imagens: {
      nome: 'Exemplo Imagem',
      descricao: 'Uma imagem de exemplo para demonstração',
      tipo: 'imagens',
      tags: ['exemplo', 'demo', 'imagem'],
      arquivo: null,
      miniatura: null
    },
    videos: {
      nome: 'Exemplo Vídeo',
      descricao: 'Um vídeo de exemplo para demonstração',
      tipo: 'videos',
      tags: ['exemplo', 'demo', 'video'],
      arquivo: null,
      miniatura: null
    },
    musicas: {
      nome: 'Exemplo Música',
      descricao: 'Uma música de exemplo para demonstração',
      tipo: 'musicas',
      tags: ['exemplo', 'demo', 'musica'],
      arquivo: null,
      miniatura: null
    },
    outros: {
      nome: 'Exemplo Arquivo',
      descricao: 'Um arquivo de exemplo para demonstração',
      tipo: 'outros',
      tags: ['exemplo', 'demo', 'arquivo'],
      arquivo: null,
      miniatura: null
    }
  }
  
  return {
    ...sampleFiles[type],
    id: generateUniqueId(),
    dataCriacao: new Date().toISOString()
  }
}

