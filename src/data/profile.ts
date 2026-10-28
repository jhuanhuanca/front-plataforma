import { photo } from './images'

export type AccountTab =
  | 'publicaciones'
  | 'acerca'
  | 'conexiones'
  | 'medios'
  | 'videos'
  | 'convocatorias'
  | 'actividad'

export interface ProfileConnection {
  id: string
  name: string
  nick: string
  role: string
  note: string
  avatar: string
}

export interface ProfileFriend {
  id: string
  name: string
  nick: string
  mutual: string
  avatar: string
}

export interface ProfileExperience {
  id: string
  place: string
  detail: string
  tone: 'emerald' | 'rose' | 'amber'
}

export interface ProfilePhoto {
  id: string
  image: string
  label: string
}

export const accountTabs: { id: AccountTab; label: string }[] = [
  { id: 'publicaciones', label: 'Publicaciones' },
  { id: 'acerca', label: 'Acerca de' },
  { id: 'conexiones', label: 'Conexiones' },
  { id: 'medios', label: 'Medios' },
  { id: 'videos', label: 'Videos' },
  { id: 'convocatorias', label: 'Convocatorias' },
  { id: 'actividad', label: 'Actividad' },
]

export const profileCover = photo('photo-1509316785289-025f5b846b35', 1400)
export const profileAvatar = photo('photo-1535713875002-d1d0cf377fde', 240)

export const profileConnections: ProfileConnection[] = [
  {
    id: 'c1',
    name: 'Elena Cruz',
    nick: 'elena_cruz',
    role: 'Comercio de barrio',
    note: 'Clara Rivas, Andrés Palma y otras 8 voces comparten mesas.',
    avatar: photo('photo-1531123897727-8f129e1688ce', 120),
  },
  {
    id: 'c2',
    name: 'Andrés Palma',
    nick: 'andres_palma',
    role: 'Ciclistas del centro',
    note: 'Marta Quispe y otras 6 voces coinciden en movilidad.',
    avatar: photo('photo-1500648767791-00dcc994a43e', 120),
  },
  {
    id: 'c3',
    name: 'Marta Quispe',
    nick: 'marta_quispe',
    role: 'Mesa de agua',
    note: 'Luis Navarro y otras 4 voces siguen el mismo barrio.',
    avatar: photo('photo-1544005313-94ddf0286df2', 120),
  },
  {
    id: 'c4',
    name: 'Rosa Aguilar',
    nick: 'rosa_aguilar',
    role: 'Cuidados comunitarios',
    note: 'Comparte la mesa de cuidados del norte.',
    avatar: photo('photo-1438761681033-6461ffad8d80', 120),
  },
  {
    id: 'c5',
    name: 'Luis Navarro',
    nick: 'luis_navarro',
    role: 'Junta vecinal norte',
    note: 'Clara Rivas y otras 3 voces van a la audiencia del martes.',
    avatar: photo('photo-1507003211169-0a1dd7228f2d', 120),
  },
  {
    id: 'c6',
    name: 'Clara Rivas',
    nick: 'clara_rivas',
    role: 'Mesa de movilidad',
    note: 'Publicó el borrador del transporte nocturno.',
    avatar: photo('photo-1494790108377-be9c29b29330', 120),
  },
]

export const profileFriends: ProfileFriend[] = [
  {
    id: 'f1',
    name: 'Elena Cruz',
    nick: 'elena_cruz',
    mutual: '16 voces en común',
    avatar: photo('photo-1531123897727-8f129e1688ce', 200),
  },
  {
    id: 'f2',
    name: 'Andrés Palma',
    nick: 'andres_palma',
    mutual: '22 voces en común',
    avatar: photo('photo-1500648767791-00dcc994a43e', 200),
  },
  {
    id: 'f3',
    name: 'Luis Navarro',
    nick: 'luis_navarro',
    mutual: '1 voz en común',
    avatar: photo('photo-1507003211169-0a1dd7228f2d', 200),
  },
  {
    id: 'f4',
    name: 'Rosa Aguilar',
    nick: 'rosa_aguilar',
    mutual: '15 voces en común',
    avatar: photo('photo-1438761681033-6461ffad8d80', 200),
  },
]

export const profileExperience: ProfileExperience[] = [
  {
    id: 'e1',
    place: 'Mesa de movilidad',
    detail: 'Desde 2024 · Coordina el borrador del transporte nocturno.',
    tone: 'emerald',
  },
  {
    id: 'e2',
    place: 'Presupuesto participativo',
    detail: 'Desde 2025 · Sigue el orden de las obras por barrio.',
    tone: 'rose',
  },
  {
    id: 'e3',
    place: 'Cuidados del norte',
    detail: 'Desde 2023 · Propone el punto de cuidado nocturno.',
    tone: 'amber',
  },
]

export const profilePhotos: ProfilePhoto[] = [
  { id: 'p1', image: photo('photo-1449824913935-59a10b8d2000', 600), label: 'Centro' },
  { id: 'p2', image: photo('photo-1507525428034-b723cf961d3e', 600), label: 'Costa' },
  { id: 'p3', image: photo('photo-1529107386315-e1a2ed48a620', 600), label: 'Audiencia' },
  { id: 'p4', image: photo('photo-1464226184884-fa280b87c399', 600), label: 'Barrio' },
  { id: 'p5', image: photo('photo-1470229722913-7c0e2dbbafd3', 600), label: 'Convocatoria' },
  { id: 'p6', image: photo('photo-1480714378408-67cf0d13bc1b', 600), label: 'Empleo' },
]
