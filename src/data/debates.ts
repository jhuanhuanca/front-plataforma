import { photo } from './images'

export interface Person {
  id: string
  name: string
  role: string
  avatar: string
}

export interface DebateComment {
  id: string
  author: string
  avatar: string
  time: string
  body: string
  likes: number
  liked: boolean
  favor: number
  contra: number
  stance: 'favor' | 'contra' | null
  replies: DebateComment[]
}

export interface DebatePost {
  id: string
  author: string
  role: string
  avatar: string
  time: string
  body: string
  image: string
  kind: 'image' | 'video'
  likes: number
  shares: number
  liked: boolean
  closed?: boolean
  featured?: boolean
  comments: DebateComment[]
}

export const voices: Person[] = [
  {
    id: 'v1',
    name: 'Marta Quispe',
    role: 'Mesa de agua',
    avatar: photo('photo-1544005313-94ddf0286df2', 160),
  },
  {
    id: 'v2',
    name: 'Andrés Palma',
    role: 'Ciclistas del centro',
    avatar: photo('photo-1500648767791-00dcc994a43e', 160),
  },
  {
    id: 'v3',
    name: 'Elena Cruz',
    role: 'Comercio de barrio',
    avatar: photo('photo-1531123897727-8f129e1688ce', 160),
  },
  {
    id: 'v4',
    name: 'Luis Navarro',
    role: 'Junta vecinal norte',
    avatar: photo('photo-1507003211169-0a1dd7228f2d', 160),
  },
  {
    id: 'v5',
    name: 'Rosa Aguilar',
    role: 'Cuidados comunitarios',
    avatar: photo('photo-1438761681033-6461ffad8d80', 160),
  },
]

export const activeTopics: Person[] = [
  {
    id: 'a1',
    name: 'Clara Rivas',
    role: 'Movilidad',
    avatar: photo('photo-1494790108377-be9c29b29330', 200),
  },
  {
    id: 'a2',
    name: 'Iván Paredes',
    role: 'Presupuesto',
    avatar: photo('photo-1506794778202-cad84cf45f1d', 200),
  },
  {
    id: 'a3',
    name: 'Nora Beltrán',
    role: 'Parques',
    avatar: photo('photo-1524504388940-b1c1722653e1', 200),
  },
]

export const sideNews = [
  { id: 'n1', title: 'Diez preguntas para la audiencia del presupuesto.', time: '2 horas' },
  { id: 'n2', title: 'Cinco datos del informe de empleo local.', time: '3 horas' },
  { id: 'n3', title: 'Cómo leer una propuesta antes de votarla.', time: '4 horas' },
  { id: 'n4', title: 'Qué cambia si el mercado unifica su horario.', time: '6 horas' },
]

export const posts: DebatePost[] = [
  {
    id: 'd1',
    author: 'Clara Rivas',
    role: 'Mesa de movilidad',
    avatar: photo('photo-1494790108377-be9c29b29330', 160),
    time: '2 horas',
    body: 'El borrador deja fuera a los barrios del norte después de las 21:00. Si el transporte se recorta, la gente que sale del turno noche se queda sin opción segura.',
    image: photo('photo-1551836022-d5d88e9218df'),
    kind: 'image',
    likes: 56,
    shares: 3,
    liked: false,
    comments: [
      {
        id: 'c1',
        author: 'Elena Cruz',
        avatar: photo('photo-1531123897727-8f129e1688ce', 120),
        time: '5 horas',
        body: 'En el mercado el último bus pasa a las 20:10. Habría que publicar el horario real, no el del mapa.',
        likes: 3,
        liked: false,
        favor: 0,
        contra: 0,
        stance: null,
        replies: [
          {
            id: 'c1r1',
            author: 'Luis Navarro',
            avatar: photo('photo-1507003211169-0a1dd7228f2d', 120),
            time: '4 horas',
            body: 'Puedo llevar el conteo de la parada de la avenida durante una semana.',
            likes: 1,
            liked: false,
            favor: 0,
            contra: 0,
            stance: null,
            replies: [],
          },
        ],
      },
      {
        id: 'c2',
        author: 'Andrés Palma',
        avatar: photo('photo-1500648767791-00dcc994a43e', 120),
        time: '2 horas',
        body: 'La ciclovía no reemplaza el bus de noche. Son dos necesidades distintas y las dos tienen que quedar escritas.',
        likes: 5,
        liked: false,
        favor: 0,
        contra: 0,
        stance: null,
        replies: [],
      },
    ],
  },
  {
    id: 'd2',
    author: 'Iván Paredes',
    role: 'Presupuesto participativo',
    avatar: photo('photo-1506794778202-cad84cf45f1d', 160),
    time: '6 horas',
    body: 'Si el orden de las obras se decide solo por likes, los barrios con menos gente conectada quedan últimos. Propongo un tope por zona.',
    image: photo('photo-1469474968028-56623f02e42e'),
    kind: 'video',
    likes: 58,
    shares: 3,
    liked: false,
    comments: [
      {
        id: 'c3',
        author: 'Rosa Aguilar',
        avatar: photo('photo-1438761681033-6461ffad8d80', 120),
        time: '5 horas',
        body: 'De acuerdo con el tope. En cuidados siempre quedamos debajo de las obras grandes.',
        likes: 3,
        liked: false,
        favor: 0,
        contra: 0,
        stance: null,
        replies: [],
      },
      {
        id: 'c4',
        author: 'Marta Quispe',
        avatar: photo('photo-1544005313-94ddf0286df2', 120),
        time: '2 horas',
        body: 'El agua no puede competir en la misma lista que un evento. Hay que separar lo urgente de lo deseable.',
        likes: 5,
        liked: false,
        favor: 0,
        contra: 0,
        stance: null,
        replies: [],
      },
    ],
  },
]
