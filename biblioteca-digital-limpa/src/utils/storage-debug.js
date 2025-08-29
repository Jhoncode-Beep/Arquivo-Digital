const STORAGE_KEYS = {
  FILES: 'biblioteca-digital-files',
  SETTINGS: 'biblioteca-digital-settings',
  DARK_MODE: 'biblioteca-digital-dark-mode'
}

// Função para salvar dados no localStorage com compressão e debug
export const saveToStorage = (key, data) => {
  console.log('🔍 Storage Debug - Tentando salvar:', key)
  console.log('🔍 Storage Debug - Dados para salvar:', data)
  console.log('🔍 Storage Debug - Número de itens:', Array.isArray(data) ? data.length : 'não é array')
  
  try {
    const jsonString = JSON.stringify(data)
    const sizeInBytes = new Blob([jsonString]).size
    const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2)
    
    console.log('🔍 Storage Debug - Tamanho dos dados:', sizeInMB, 'MB')
    console.log('🔍 Storage Debug - Limite típico localStorage:', '5-10 MB')
    
    // Verificar se excede limite típico
    if (sizeInBytes > 5 * 1024 * 1024) { // 5MB
      console.warn('⚠️ Storage Debug - Dados muito grandes, pode falhar!')
    }
    
    localStorage.setItem(key, jsonString)
    console.log('✅ Storage Debug - Dados salvos com sucesso!')
    
    // Verificar se realmente foi salvo
    const verification = localStorage.getItem(key)
    if (verification) {
      console.log('✅ Storage Debug - Verificação: dados encontrados no localStorage')
    } else {
      console.error('❌ Storage Debug - Verificação: dados NÃO encontrados no localStorage')
    }
    
    return true
  } catch (error) {
    console.error('❌ Storage Debug - Erro ao salvar:', error)
    console.error('❌ Storage Debug - Tipo do erro:', error.name)
    console.error('❌ Storage Debug - Mensagem:', error.message)
    
    // Se der erro de quota, tentar limpar dados antigos
    if (error.name === 'QuotaExceededError') {
      console.warn('⚠️ Storage Debug - Quota excedida, tentando limpar...')
      clearOldData()
      
      // Tentar salvar novamente
      try {
        localStorage.setItem(key, JSON.stringify(data))
        console.log('✅ Storage Debug - Dados salvos após limpeza!')
        return true
      } catch (retryError) {
        console.error('❌ Storage Debug - Erro após limpeza:', retryError)
        return false
      }
    }
    
    return false
  }
}

// Função para carregar dados do localStorage com debug
export const loadFromStorage = (key, defaultValue = null) => {
  console.log('🔍 Storage Debug - Tentando carregar:', key)
  
  try {
    const item = localStorage.getItem(key)
    console.log('🔍 Storage Debug - Item encontrado:', item ? 'SIM' : 'NÃO')
    
    if (item === null) {
      console.log('🔍 Storage Debug - Retornando valor padrão:', defaultValue)
      return defaultValue
    }
    
    const parsed = JSON.parse(item)
    console.log('🔍 Storage Debug - Dados carregados:', parsed)
    console.log('🔍 Storage Debug - Número de itens carregados:', Array.isArray(parsed) ? parsed.length : 'não é array')
    
    return parsed
  } catch (error) {
    console.error('❌ Storage Debug - Erro ao carregar:', error)
    console.log('🔍 Storage Debug - Retornando valor padrão por erro:', defaultValue)
    return defaultValue
  }
}

// Função para remover item do localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key)
    console.log('🔍 Storage Debug - Item removido:', key)
    return true
  } catch (error) {
    console.error('❌ Storage Debug - Erro ao remover:', error)
    return false
  }
}

// Função para limpar dados antigos
const clearOldData = () => {
  try {
    // Limpar apenas dados específicos da aplicação
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
    console.log('🔍 Storage Debug - Dados antigos limpos')
  } catch (error) {
    console.error('❌ Storage Debug - Erro ao limpar dados antigos:', error)
  }
}

// Funções específicas para arquivos
export const saveFiles = (files) => {
  console.log('🔍 Storage Debug - Salvando arquivos...')
  return saveToStorage(STORAGE_KEYS.FILES, files)
}

export const loadFiles = () => {
  console.log('🔍 Storage Debug - Carregando arquivos...')
  return loadFromStorage(STORAGE_KEYS.FILES, [])
}

// Funções para configurações
export const saveSettings = (settings) => {
  return saveToStorage(STORAGE_KEYS.SETTINGS, settings)
}

export const loadSettings = () => {
  return loadFromStorage(STORAGE_KEYS.SETTINGS, {})
}

// Funções para tema
export const saveDarkMode = (isDark) => {
  return saveToStorage(STORAGE_KEYS.DARK_MODE, isDark)
}

export const loadDarkMode = () => {
  return loadFromStorage(STORAGE_KEYS.DARK_MODE, false)
}

// Função para exportar todos os dados
export const exportAllData = () => {
  const allData = {
    files: loadFiles(),
    settings: loadSettings(),
    darkMode: loadDarkMode(),
    exportDate: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(allData, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const link = document.createElement('a')
  link.href = URL.createObjectURL(dataBlob)
  link.download = `biblioteca-digital-backup-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(link.href)
}

// Função para importar todos os dados
export const importAllData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (data.files) saveFiles(data.files)
        if (data.settings) saveSettings(data.settings)
        if (data.darkMode !== undefined) saveDarkMode(data.darkMode)
        
        resolve(data)
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
    reader.readAsText(file)
  })
}

// Função para verificar espaço disponível
export const checkStorageSpace = () => {
  try {
    const testKey = 'storage-test'
    const testData = 'x'.repeat(1024) // 1KB
    
    let usedSpace = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        usedSpace += localStorage[key].length
      }
    }
    
    console.log('🔍 Storage Debug - Espaço usado:', (usedSpace / 1024).toFixed(2), 'KB')
    
    // Tentar adicionar dados de teste para verificar espaço disponível
    try {
      localStorage.setItem(testKey, testData)
      localStorage.removeItem(testKey)
      console.log('✅ Storage Debug - Espaço disponível suficiente')
      return true
    } catch (error) {
      console.warn('⚠️ Storage Debug - Pouco espaço disponível')
      return false
    }
  } catch (error) {
    console.error('❌ Storage Debug - Erro ao verificar espaço:', error)
    return false
  }
}

