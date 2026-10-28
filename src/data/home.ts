import { photo } from './images'

export type HomeCategory =
  | 'para-ti'
  | 'politica'
  | 'tendencias'
  | 'noticias'
  | 'territorio'
  | 'economia'

export interface Topic {
  id: string
  category: Exclude<HomeCategory, 'para-ti' | 'tendencias'>
  title: string
  image: string
  likes: number
  comments: number
  shares: number
  liked: boolean
  kind: 'image' | 'video' | 'text'
  duration?: string
  href?: string
  source?: 'debate' | 'news' | 'poll'
}

export const homeTabs: { id: HomeCategory; label: string }[] = [
  { id: 'para-ti', label: 'Para ti' },
  { id: 'politica', label: 'Política' },
  { id: 'tendencias', label: 'Tendencias' },
  { id: 'noticias', label: 'Noticias' },
  { id: 'territorio', label: 'Territorio' },
  { id: 'economia', label: 'Economía' },
]

export const topics: Topic[] = [
  {
    id: 't1',
    category: 'politica',
    title: 'El concejo vota el martes si el transporte del centro pasa a ser público.',
    image: photo('photo-1449824913935-59a10b8d2000'),
    likes: 56,
    comments: 12,
    shares: 13,
    liked: false,
    kind: 'image',
  },
  {
    id: 't1b',
    category: 'politica',
    title: 'El borrador del transporte nocturno ya se puede comentar antes de la votación del martes.',
    image: '',
    likes: 23,
    comments: 10,
    shares: 2,
    liked: false,
    kind: 'text',
  },
  {
    id: 't2',
    category: 'territorio',
    title: 'Tres barrios piden adelantar la obra de agua antes de la temporada de lluvia.',
    image: photo('photo-1464226184884-fa280b87c399'),
    likes: 23,
    comments: 10,
    shares: 2,
    liked: false,
    kind: 'image',
  },
  {
    id: 't3',
    category: 'noticias',
    title: 'La feria de empleo público abre cupos para oficios y cuidado.',
    image: photo('photo-1480714378408-67cf0d13bc1b'),
    likes: 102,
    comments: 65,
    shares: 140,
    liked: false,
    kind: 'image',
  },
  {
    id: 't4',
    category: 'politica',
    title: 'Así se vio la audiencia abierta sobre el presupuesto participativo.',
    image: photo('photo-1469474968028-56623f02e42e'),
    likes: 89,
    comments: 56,
    shares: 30,
    liked: false,
    kind: 'video',
    duration: '10:20',
  },
  {
    id: 't5',
    category: 'economia',
    title: 'Comerciantes del mercado piden un horario común de carga y descarga.',
    image: photo('photo-1497366216548-37526070297c'),
    likes: 78,
    comments: 32,
    shares: 23,
    liked: false,
    kind: 'image',
  },
  {
    id: 't6',
    category: 'noticias',
    title: 'El informe de calidad del aire ya está disponible para comentarse.',
    image: photo('photo-1470071459604-3b5ec3a7fe05'),
    likes: 68,
    comments: 56,
    shares: 12,
    liked: false,
    kind: 'video',
    duration: '03:40',
  },
  {
    id: 't7',
    category: 'territorio',
    title: 'Vecinos del norte proponen un parque en el lote que iba a ser estacionamiento.',
    image: photo('photo-1500530855697-b586d89ba3ee'),
    likes: 78,
    comments: 35,
    shares: 40,
    liked: false,
    kind: 'image',
  },
  {
    id: 't8',
    category: 'politica',
    title: 'La mesa de movilidad publica el borrador de ciclovías para observaciones.',
    image: photo('photo-1477959858617-67f85cf4f1df'),
    likes: 89,
    comments: 20,
    shares: 23,
    liked: false,
    kind: 'video',
    duration: '00:10',
  },
  {
    id: 't9',
    category: 'economia',
    title: 'Cooperativas de alimentos buscan sede compartida en el centro.',
    image: photo('photo-1414235077428-338989a2e8c0', 900),
    likes: 78,
    comments: 23,
    shares: 12,
    liked: false,
    kind: 'image',
  },
]
