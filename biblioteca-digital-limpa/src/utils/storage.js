// Utilitários para gerenciamento do localStorage

const STORAGE_KEYS = {
  FILES: 'biblioteca-digital-files',
  SETTINGS: 'biblioteca-digital-settings',
  DARK_MODE: 'biblioteca-digital-dark-mode'
}

// Função para salvar dados no localStorage com compressão
export const saveToStorage = (key, data) => {
  try {
    const jsonString = JSON.stringify(data)
    localStorage.setItem(key, jsonString)
    return true
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
    
    // Se der erro de quota, tentar limpar dados antigos
    if (error.name === 'QuotaExceededError') {
      console.warn('Quota do localStorage excedida, tentando limpar dados antigos...')
      clearOldData()
      
      // Tentar salvar novamente
      try {
        localStorage.setItem(key, JSON.stringify(data))
        return true
      } catch (retryError) {
        console.error('Erro ao salvar após limpeza:', retryError)
        return false
      }
    }
    
    return false
  }
}

// Função para carregar dados do localStorage
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    
    return JSON.parse(item)
  } catch (error) {
    console.error('Erro ao carregar do localStorage:', error)
    return defaultValue
  }
}

// Função para remover item do localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error)
    return false
  }
}

// Função para limpar dados antigos (implementação básica)
const clearOldData = () => {
  try {
    // Remover dados de cache antigos se existirem
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('biblioteca-digital-cache-') && 
          isOlderThan(key, 7)) { // 7 dias
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Erro ao limpar dados antigos:', error)
  }
}

// Função para verificar se um item é mais antigo que X dias
const isOlderThan = (key, days) => {
  try {
    const timestamp = localStorage.getItem(key + '-timestamp')
    if (!timestamp) return true
    
    const itemDate = new Date(parseInt(timestamp))
    const now = new Date()
    const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24)
    
    return diffDays > days
  } catch (error) {
    return true
  }
}

// Função para obter informações de uso do storage
export const getStorageInfo = () => {
  try {
    let totalSize = 0
    let itemCount = 0
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length
        itemCount++
      }
    }
    
    // Estimar tamanho em MB (aproximado)
    const sizeInMB = (totalSize * 2) / (1024 * 1024) // *2 porque cada char = 2 bytes em UTF-16
    
    return {
      totalSize: sizeInMB.toFixed(2) + ' MB',
      itemCount,
      available: '~' + (5 - sizeInMB).toFixed(2) + ' MB' // localStorage geralmente tem ~5MB
    }
  } catch (error) {
    console.error('Erro ao obter informações do storage:', error)
    return {
      totalSize: 'Desconhecido',
      itemCount: 0,
      available: 'Desconhecido'
    }
  }
}

// Função para exportar todos os dados
export const exportAllData = () => {
  try {
    const files = loadFromStorage(STORAGE_KEYS.FILES, [])
    const settings = loadFromStorage(STORAGE_KEYS.SETTINGS, {})
    const darkMode = loadFromStorage(STORAGE_KEYS.DARK_MODE, false)
    
    return {
      files,
      settings,
      darkMode,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return null
  }
}

// Função para importar dados
export const importAllData = (data) => {
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Dados inválidos')
    }
    
    // Validar estrutura básica
    if (!Array.isArray(data.files)) {
      throw new Error('Estrutura de arquivos inválida')
    }
    
    // Salvar dados
    if (data.files) saveToStorage(STORAGE_KEYS.FILES, data.files)
    if (data.settings) saveToStorage(STORAGE_KEYS.SETTINGS, data.settings)
    if (typeof data.darkMode === 'boolean') saveToStorage(STORAGE_KEYS.DARK_MODE, data.darkMode)
    
    return true
  } catch (error) {
    console.error('Erro ao importar dados:', error)
    return false
  }
}

// Função para limpar todos os dados
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    return true
  } catch (error) {
    console.error('Erro ao limpar dados:', error)
    return false
  }
}

export { STORAGE_KEYS }

