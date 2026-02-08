import { useEffect, useMemo, useState } from 'react'
import {
  BookMarked,
  Copy,
  ExternalLink,
  FolderPlus,
  Globe,
  Link2,
  MoreVertical,
  Plus,
  Search,
  X,
} from 'lucide-react'
import './App.css'

const STORAGE_KEY = 'linkvault_links'

const initialLinks = [
  {
    id: '1',
    title: 'ALUNO QUIETO NA AULA DE MATEMÁTICA - YouTube',
    url: 'https://youtube.com/shorts/v2FXk5D6srE?si=9kR-Wy9SqulEtd62',
    domain: 'youtube.com',
    image:
      'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1300&q=80',
    group: 'YouTube',
    tags: ['YouTube'],
    notes: '',
    createdAt: new Date().toISOString(),
    favorite: false,
  },
]

const allGroups = ['Estudos', 'Inspirações', 'Projetos', 'YouTube']

const formatDate = (date) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date))

function App() {
  const [links, setLinks] = useState([])
  const [query, setQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('Todos os Links')
  const [showAdd, setShowAdd] = useState(false)
  const [selectedLink, setSelectedLink] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [newLink, setNewLink] = useState({ url: '', title: '', group: '', tags: '', notes: '', image: '' })

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    setLinks(saved ? JSON.parse(saved) : initialLinks)
  }, [])

  useEffect(() => {
    if (links.length || links.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links))
    }
  }, [links])

  const groupCount = useMemo(
    () =>
      allGroups.reduce((acc, item) => {
        acc[item] = links.filter((link) => link.group === item).length
        return acc
      }, {}),
    [links],
  )

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const inGroup = selectedGroup === 'Todos os Links' || link.group === selectedGroup
      const inSearch =
        !query ||
        link.title.toLowerCase().includes(query.toLowerCase()) ||
        link.url.toLowerCase().includes(query.toLowerCase())
      return inGroup && inSearch
    })
  }, [links, query, selectedGroup])

  const handleAdd = () => {
    if (!newLink.url || !newLink.title) return
    const domain = new URL(newLink.url).hostname.replace('www.', '')

    setLinks((prev) => [
      {
        id: crypto.randomUUID(),
        title: newLink.title,
        url: newLink.url,
        domain,
        image:
          newLink.image ||
          'https://images.unsplash.com/photo-1611162616805-6d50f8e0d7dd?auto=format&fit=crop&w=1300&q=80',
        group: newLink.group || 'Inspirações',
        tags: newLink.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        notes: newLink.notes,
        createdAt: new Date().toISOString(),
        favorite: false,
      },
      ...prev,
    ])

    setNewLink({ url: '', title: '', group: '', tags: '', notes: '', image: '' })
    setShowAdd(false)
  }

  const copyText = async (text) => {
    await navigator.clipboard.writeText(text)
  }

  const removeLink = (id) => {
    setLinks((prev) => prev.filter((link) => link.id !== id))
    setMenuOpenId(null)
    if (selectedLink?.id === id) setSelectedLink(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Link2 size={18} />
          </div>
          <div>
            <p className="brand-title">LinkVault</p>
            <p className="brand-subtitle">Organizador de Links</p>
          </div>
        </div>

        <section className="menu-block">
          <p className="section-title">Menu</p>
          <button className="nav-item">Painel</button>
          <button className="nav-item active" onClick={() => setSelectedGroup('Todos os Links')}>
            Todos os Links
          </button>
          <button className="nav-item">Favoritos</button>
        </section>

        <section className="menu-block">
          <p className="section-title">Grupos</p>
          {allGroups.map((group) => (
            <button key={group} className="group-item" onClick={() => setSelectedGroup(group)}>
              <span>{group}</span>
              <span>{groupCount[group] ?? 0}</span>
            </button>
          ))}
          <button className="group-item muted">
            <FolderPlus size={16} /> Novo Grupo
          </button>
        </section>

        <div className="sidebar-footer">usuario@email.com</div>
      </aside>

      <main className="content">
        <div className="topbar">
          <div>
            <p className="breadcrumbs">Painel &gt; Grupos</p>
            <h1>Todos os Links</h1>
            <p className="count">{filteredLinks.length} link</p>
          </div>
          <button className="primary-btn" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Adicionar Link
          </button>
        </div>

        <div className="search-wrap">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar links..."
          />
        </div>

        <section className="links-list">
          {filteredLinks.map((link) => (
            <article key={link.id} className="link-row">
              <div className="link-content" onClick={() => setSelectedLink(link)}>
                <div className="avatar">
                  <Globe size={16} />
                </div>
                <div>
                  <h3>{link.title}</h3>
                  <p className="domain">{link.domain}</p>
                  <div className="tags-line">
                    {link.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                    <small>agora</small>
                  </div>
                </div>
              </div>

              <div className="actions">
                <button onClick={() => setMenuOpenId(menuOpenId === link.id ? null : link.id)}>
                  <MoreVertical size={18} />
                </button>
                {menuOpenId === link.id && (
                  <div className="dropdown">
                    <button onClick={() => window.open(link.url, '_blank')}>Visualizar</button>
                    <button onClick={() => copyText(link.title)}>Copiar Título</button>
                    <button onClick={() => copyText(link.image)}>Baixar Imagem</button>
                    <button onClick={() => setSelectedLink(link)}>Editar</button>
                    <button className="danger" onClick={() => removeLink(link.id)}>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>
      </main>

      {showAdd && (
        <div className="modal-overlay" onClick={() => setShowAdd(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>Adicionar Novo Link</h2>
              <button onClick={() => setShowAdd(false)}>
                <X size={18} />
              </button>
            </header>
            <input
              className="field"
              placeholder="https://..."
              value={newLink.url}
              onChange={(event) => setNewLink({ ...newLink, url: event.target.value })}
            />
            <label>Título *</label>
            <input
              className="field"
              value={newLink.title}
              onChange={(event) => setNewLink({ ...newLink, title: event.target.value })}
            />
            <img
              src={newLink.image || 'https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=1300&q=80'}
              alt="preview"
              className="preview"
            />
            <label>Grupo</label>
            <select
              className="field"
              value={newLink.group}
              onChange={(event) => setNewLink({ ...newLink, group: event.target.value })}
            >
              <option value="">Selecione (opcional)</option>
              {allGroups.map((group) => (
                <option key={group}>{group}</option>
              ))}
            </select>
            <label>Anotações</label>
            <textarea
              className="field"
              placeholder="Observações..."
              value={newLink.notes}
              onChange={(event) => setNewLink({ ...newLink, notes: event.target.value })}
            />
            <label>Tags</label>
            <input
              className="field"
              placeholder="tag1, tag2, tag3"
              value={newLink.tags}
              onChange={(event) => setNewLink({ ...newLink, tags: event.target.value })}
            />
            <footer>
              <button className="secondary-btn" onClick={() => setShowAdd(false)}>
                Cancelar
              </button>
              <button className="primary-btn" onClick={handleAdd}>
                Salvar
              </button>
            </footer>
          </div>
        </div>
      )}

      {selectedLink && (
        <div className="modal-overlay" onClick={() => setSelectedLink(null)}>
          <div className="modal detail" onClick={(event) => event.stopPropagation()}>
            <header>
              <h2>Detalhes do Link</h2>
              <button onClick={() => setSelectedLink(null)}>
                <X size={18} />
              </button>
            </header>
            <img src={selectedLink.image} alt={selectedLink.title} className="preview" />
            <h3 className="detail-title">{selectedLink.title}</h3>
            <p className="domain">{selectedLink.domain}</p>
            <div className="detail-link">
              <a href={selectedLink.url} target="_blank" rel="noreferrer">
                {selectedLink.url}
              </a>
              <button onClick={() => copyText(selectedLink.url)}>
                <Copy size={16} />
              </button>
              <button onClick={() => window.open(selectedLink.url, '_blank')}>
                <ExternalLink size={16} />
              </button>
            </div>
            <p className="date">{formatDate(selectedLink.createdAt)}</p>
            <footer>
              <button className="secondary-btn" onClick={() => copyText(selectedLink.image)}>
                <BookMarked size={16} /> Baixar Imagem
              </button>
              <button className="secondary-btn" onClick={() => setSelectedLink(null)}>
                Fechar
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
