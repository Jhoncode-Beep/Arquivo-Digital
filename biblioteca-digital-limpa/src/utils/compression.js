// Utilitários para compressão e descompressão de dados - VERSÃO CORRIGIDA

// Função para comprimir string usando LZ-string (implementação simples)
export const compressString = (str) => {
  try {
    // Implementação básica de compressão usando btoa
    return btoa(unescape(encodeURIComponent(str)))
  } catch (error) {
    console.error('Erro ao comprimir string:', error)
    return str
  }
}

// Função para descomprimir string
export const decompressString = (compressedStr) => {
  try {
    return decodeURIComponent(escape(atob(compressedStr)))
  } catch (error) {
    console.error('Erro ao descomprimir string:', error)
    return compressedStr
  }
}

// Função para comprimir arquivo para base64 - VERSÃO MELHORADA
export const compressFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    // Timeout para evitar travamentos
    const timeout = setTimeout(() => {
      reject(new Error('Timeout ao processar arquivo'))
    }, 30000) // 30 segundos
    
    reader.onload = (event) => {
      try {
        clearTimeout(timeout)
        const base64 = event.target.result
        
        // Para arquivos muito grandes (>50MB), não comprimir
        const isLargeFile = file.size > 50 * 1024 * 1024
        
        let compressed
        if (isLargeFile) {
          console.warn('Arquivo grande detectado, pulando compressão adicional')
          compressed = base64
        } else {
          compressed = compressString(base64)
        }
        
        resolve({
          data: compressed,
          originalSize: file.size,
          compressedSize: compressed.length,
          type: file.type,
          name: file.name,
          isCompressed: !isLargeFile
        })
      } catch (error) {
        clearTimeout(timeout)
        console.error('Erro ao processar arquivo:', error)
        reject(error)
      }
    }
    
    reader.onerror = () => {
      clearTimeout(timeout)
      reject(new Error('Erro ao ler arquivo'))
    }
    
    // Para arquivos muito grandes, usar readAsDataURL que é mais eficiente
    reader.readAsDataURL(file)
  })
}

// Função para descomprimir arquivo de base64 - VERSÃO MELHORADA
export const decompressFile = (compressedData) => {
  try {
    if (!compressedData.isCompressed) {
      // Arquivo não foi comprimido, retornar como está
      return compressedData
    }
    
    const decompressed = decompressString(compressedData.data)
    return {
      ...compressedData,
      data: decompressed
    }
  } catch (error) {
    console.error('Erro ao descomprimir arquivo:', error)
    return compressedData
  }
}

// Função para criar miniatura de imagem
export const createImageThumbnail = (file, maxWidth = 300, maxHeight = 300) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    // Timeout para miniaturas
    const timeout = setTimeout(() => {
      resolve(null)
    }, 10000) // 10 segundos
    
    img.onload = () => {
      try {
        clearTimeout(timeout)
        
        // Calcular dimensões mantendo proporção
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height)
        
        // Converter para base64 com qualidade reduzida para economizar espaço
        const thumbnail = canvas.toDataURL('image/jpeg', 0.6)
        resolve(thumbnail)
      } catch (error) {
        clearTimeout(timeout)
        console.error('Erro ao criar miniatura:', error)
        resolve(null)
      }
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(null)
    }
    
    img.src = URL.createObjectURL(file)
  })
}

// Função para criar miniatura de vídeo - NOVA FUNCIONALIDADE
export const createVideoThumbnail = (file) => {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Timeout para vídeos
    const timeout = setTimeout(() => {
      resolve(createTextThumbnail('🎬', file.name))
    }, 15000) // 15 segundos
    
    video.onloadedmetadata = () => {
      try {
        // Ir para o meio do vídeo para capturar um frame
        video.currentTime = Math.min(video.duration / 2, 5) // Máximo 5 segundos
      } catch (error) {
        clearTimeout(timeout)
        resolve(createTextThumbnail('🎬', file.name))
      }
    }
    
    video.onseeked = () => {
      try {
        clearTimeout(timeout)
        
        const maxWidth = 300
        const maxHeight = 300
        
        let { videoWidth: width, videoHeight: height } = video
        
        // Calcular dimensões mantendo proporção
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        // Desenhar frame do vídeo
        ctx.drawImage(video, 0, 0, width, height)
        
        // Converter para base64
        const thumbnail = canvas.toDataURL('image/jpeg', 0.6)
        
        // Limpar recursos
        URL.revokeObjectURL(video.src)
        
        resolve(thumbnail)
      } catch (error) {
        clearTimeout(timeout)
        console.error('Erro ao capturar frame do vídeo:', error)
        resolve(createTextThumbnail('🎬', file.name))
      }
    }
    
    video.onerror = () => {
      clearTimeout(timeout)
      resolve(createTextThumbnail('🎬', file.name))
    }
    
    // Configurar vídeo
    video.muted = true
    video.preload = 'metadata'
    video.src = URL.createObjectURL(file)
  })
}

// Função para gerar miniatura baseada no tipo de arquivo - VERSÃO MELHORADA
export const generateThumbnail = async (file) => {
  const fileType = file.type.toLowerCase()
  
  try {
    if (fileType.startsWith('image/')) {
      return await createImageThumbnail(file)
    }
    
    if (fileType.startsWith('video/')) {
      return await createVideoThumbnail(file)
    }
    
    // Para outros tipos de arquivo, retornar ícone baseado no tipo
    const iconMap = {
      'application/pdf': '📄',
      'audio/': '🎵',
      'text/': '📝',
      'application/zip': '📦',
      'application/rar': '📦'
    }
    
    for (const [type, icon] of Object.entries(iconMap)) {
      if (fileType.includes(type)) {
        return createTextThumbnail(icon, file.name)
      }
    }
    
    return createTextThumbnail('📁', file.name)
  } catch (error) {
    console.error('Erro ao gerar miniatura:', error)
    return createTextThumbnail('📁', file.name)
  }
}

// Função para criar miniatura de texto/ícone
const createTextThumbnail = (icon, fileName) => {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = 300
    canvas.height = 300
    
    // Fundo
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, 300, 300)
    
    // Ícone
    ctx.font = '80px Arial'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#6b7280'
    ctx.fillText(icon, 150, 150)
    
    // Nome do arquivo (truncado)
    ctx.font = '16px Arial'
    ctx.fillStyle = '#374151'
    const truncatedName = fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName
    ctx.fillText(truncatedName, 150, 250)
    
    return canvas.toDataURL('image/jpeg', 0.8)
  } catch (error) {
    console.error('Erro ao criar miniatura de texto:', error)
    return null
  }
}

