import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Moon, Sun } from 'lucide-react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import MainContent from './components/layout/MainContent'
import { saveFiles, loadFiles, saveDarkMode, loadDarkMode, checkStorageSpace } from './utils/storage-debug'
import './App.css'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [currentCategory, setCurrentCategory] = useState('todos')
  const [files, setFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('nome')
  const [viewMode, setViewMode] = useState('grid') // grid ou list

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    console.log('🔍 App Debug - Carregando dados iniciais...')
    checkStorageSpace()
    
    const savedFiles = loadFiles()
    const savedDarkMode = loadDarkMode()
    
    console.log('🔍 App Debug - Arquivos carregados:', savedFiles)
    console.log('🔍 App Debug - Dark mode carregado:', savedDarkMode)
    
    setFiles(savedFiles)
    setDarkMode(savedDarkMode)
  }, [])

  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    if (files.length > 0 || files.length === 0) { // Sempre salvar, mesmo array vazio
      console.log('🔍 App Debug - Salvando arquivos...', files.length, 'itens')
      const success = saveFiles(files)
      if (!success) {
        console.error('❌ App Debug - Falha ao salvar arquivos!')
        alert('Erro ao salvar arquivos. Verifique o espaço disponível.')
      }
    }
  }, [files])

  useEffect(() => {
    console.log('🔍 App Debug - Salvando dark mode:', darkMode)
    saveDarkMode(darkMode)
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  const addFile = (newFile) => {
    console.log('🔍 App Debug - Adicionando arquivo:', newFile)
    
    const fileWithId = {
      ...newFile,
      id: newFile.id || Date.now().toString(),
      dataCriacao: newFile.dataCriacao || new Date().toISOString()
    }
    
    console.log('🔍 App Debug - Arquivo com ID:', fileWithId)
    
    setFiles(prevFiles => {
      const newFiles = [...prevFiles, fileWithId]
      console.log('🔍 App Debug - Total de arquivos após adicionar:', newFiles.length)
      return newFiles
    })
  }

  const updateFile = (updatedFile) => {
    console.log('🔍 App Debug - Atualizando arquivo:', updatedFile)
    
    setFiles(prevFiles => {
      const newFiles = prevFiles.map(file => 
        file.id === updatedFile.id ? updatedFile : file
      )
      console.log('🔍 App Debug - Total de arquivos após atualizar:', newFiles.length)
      return newFiles
    })
  }

  const deleteFile = (fileId) => {
    console.log('🔍 App Debug - Deletando arquivo:', fileId)
    
    setFiles(prevFiles => {
      const newFiles = prevFiles.filter(file => file.id !== fileId)
      console.log('🔍 App Debug - Total de arquivos após deletar:', newFiles.length)
      return newFiles
    })
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
      <div className="flex">
        <Sidebar 
          currentCategory={currentCategory}
          setCurrentCategory={setCurrentCategory}
          files={files}
        />
        
        <MainContent 
          files={files}
          currentCategory={currentCategory}
          searchTerm={searchTerm}
          sortBy={sortBy}
          viewMode={viewMode}
          addFile={addFile}
          updateFile={updateFile}
          deleteFile={deleteFile}
        />
      </div>
    </div>
  )
}

export default App
