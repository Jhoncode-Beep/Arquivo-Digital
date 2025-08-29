import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { BookOpen, Image, Video, Music, FolderOpen, Plus } from 'lucide-react'

const Sidebar = ({ currentCategory, setCurrentCategory, files }) => {
  const categories = [
    { id: 'todos', label: 'Todos os Arquivos', icon: FolderOpen },
    { id: 'quadrinhos', label: 'Quadrinhos', icon: BookOpen },
    { id: 'imagens', label: 'Imagens', icon: Image },
    { id: 'videos', label: 'Vídeos', icon: Video },
    { id: 'musicas', label: 'Músicas', icon: Music },
    { id: 'outros', label: 'Outros', icon: FolderOpen }
  ]

  const getFileCount = (categoryId) => {
    if (categoryId === 'todos') return files.length
    return files.filter(file => file.tipo === categoryId).length
  }

  return (
    <aside className="w-64 border-r border-border bg-card h-[calc(100vh-73px)]">
      <div className="p-4">
        <Button className="w-full mb-4" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Arquivo
        </Button>
        
        <nav className="space-y-2">
          {categories.map((category) => {
            const Icon = category.icon
            const count = getFileCount(category.id)
            
            return (
              <Button
                key={category.id}
                variant={currentCategory === category.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setCurrentCategory(category.id)}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left">{category.label}</span>
                {count > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                )}
              </Button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar

